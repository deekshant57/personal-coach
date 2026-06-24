// Main app — tab routing, date state, initialization
import { MEAL_SLOTS, DAY_TYPES } from './data.js';
import { initSupabase, isConfigured, fetchDailyPlan } from './supabase.js';
import { initToday, loadTodayData } from './today.js';
import { initFood, loadFoodData } from './food.js';
import { initWeek } from './week.js';
import { initDebrief } from './debrief.js';

// ── App State ────────────────────────────────────────────────
export const state = {
  currentDate: new Date(),
  currentPlan: null,
  foodLogs: {},      // { slotName: { items: [...], customText, totalProtein, totalCalories } }
  vitals: null,
  runLog: null,
  workoutLog: null,
};

// ── Date Helpers ─────────────────────────────────────────────
export function formatDate(d) {
  return d.toISOString().split('T')[0];
}

export function formatDisplay(d) {
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export function isMonday(d) {
  return d.getDay() === 1;
}

export function getToday() {
  return formatDate(state.currentDate);
}

// ── Toast ────────────────────────────────────────────────────
export function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2000);
}

// ── Tab Routing ──────────────────────────────────────────────
function setupTabs() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Deactivate all
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      // Activate clicked
      tab.classList.add('active');
      const id = `tab-${tab.dataset.tab}`;
      document.getElementById(id).classList.add('active');

      // Refresh data on tab switch
      if (tab.dataset.tab === 'food') loadFoodData();
      if (tab.dataset.tab === 'debrief') {
        // Debrief auto-generates on tab visit could be optional
      }
    });
  });
}

// ── Date Navigation ──────────────────────────────────────────
function setupDateNav() {
  document.getElementById('date-prev').addEventListener('click', () => {
    state.currentDate.setDate(state.currentDate.getDate() - 1);
    onDateChange();
  });
  document.getElementById('date-next').addEventListener('click', () => {
    state.currentDate.setDate(state.currentDate.getDate() + 1);
    onDateChange();
  });
}

async function onDateChange() {
  updateDateDisplay();
  await loadPlan();
  await loadTodayData();
  loadFoodData();
}

function updateDateDisplay() {
  document.getElementById('date-display').textContent = formatDisplay(state.currentDate);
}

// ── Load Plan for Current Date ───────────────────────────────
async function loadPlan() {
  const date = getToday();
  const plan = await fetchDailyPlan(date);

  if (plan) {
    state.currentPlan = plan;
  } else {
    // Fallback: try to find plan from the hardcoded week 1 data
    state.currentPlan = getFallbackPlan(date);
  }

  updateDayTypeBadge();
}

function updateDayTypeBadge() {
  const el = document.getElementById('date-day-type');
  if (!state.currentPlan) {
    el.textContent = 'No plan for this date';
    el.innerHTML = '';
    return;
  }
  const type = state.currentPlan.day_type;
  const info = DAY_TYPES[type] || DAY_TYPES.Rest;
  el.innerHTML = `<span class="day-badge" style="background: ${info.color}; color: #0a0a0a;">${info.label}</span>`;
}

// ── Fallback plan from embedded Week 1 data ──────────────────
// This allows the app to work before Supabase is seeded
function getFallbackPlan(date) {
  const plans = {
    '2026-06-22': { day_name: 'Mon', day_type: 'Bodyweight', protein_target: 150, water_target: '2L', run_type: null, run_km: null, run_pace: null, run_cue: null, workout_plan: 'Bodyweight — upper + core + light knee activation', workout_detail: 'Pull-ups 4xmax · Push-ups 3x15 · Rows 3x10 · Dead hang 3x20s · Plank 3x40s · Side plank 2x30s · Glute bridges 2x12 (light activation)', meals_plan: '6:30 Pre-workout — Water + black coffee\n7:45 Post-workout — 4 eggs bhurji + 1 chapati + 1 scoop whey\n1:00 Lunch — 2 chapati + 1 bowl moong dal + 100g paneer + salad\n4:30 Snack — 1 scoop whey + 10 walnuts\n8:30 Dinner — 3 eggs omelette + 1 bowl curd + sautéed veggies', directive: 'First day. Upper body only — NO squats/lunges today. Legs must be fresh for tomorrow\'s run.' },
    '2026-06-23': { day_name: 'Tue', day_type: 'Run', protein_target: 148, water_target: '2.5L', run_type: 'Easy', run_km: 3, run_pace: '8:00–8:30/km', run_cue: 'Cadence: use 150 BPM metronome · RPE 5–6 · Oxygen Park', workout_plan: null, workout_detail: null, meals_plan: '6:20 Pre-run — 1 banana + 250ml water\n~7:30 Post-run — 4 eggs + 2 whole wheat toast + 1 bowl curd\n1:00 Lunch — 2 chapati + 1 bowl dal + 100g paneer + salad\n4:00 Snack — 1 scoop whey + small handful peanuts\n8:30 Dinner — 3 eggs bhurji + 1 bowl dal + veggies', directive: 'Easy means easy — slower than your 5 km pace. Warm-up is mandatory.' },
    '2026-06-24': { day_name: 'Wed', day_type: 'Active Recovery', protein_target: 149, water_target: '2L', run_type: null, run_km: null, run_pace: null, run_cue: null, workout_plan: 'Knee prep + mobility', workout_detail: 'Squats 3x15 (slow) · Lunges 2x10/leg · Glute bridges 3x15 · Calf raises 3x20 · Foam roll 5 min · Stretches', meals_plan: '8:00 Breakfast — 4 eggs + 1 scoop whey\n1:00 Lunch — 1.5 chapati + 1 bowl dal + 150g curd + salad\n4:30 Snack — 1 scoop whey + 10 walnuts\n8:30 Dinner — 3 eggs + 80g paneer + veggies', directive: 'Knee prep day — not a leg strength session. Slow, controlled reps.' },
    '2026-06-25': { day_name: 'Thu', day_type: 'Run', protein_target: 148, water_target: '2.5L', run_type: 'Easy', run_km: 4, run_pace: '8:00–8:30/km', run_cue: 'Cadence: 150 BPM metronome · RPE 5–6 · Knee check at 2 km', workout_plan: null, workout_detail: null, meals_plan: '6:20 Pre-run — 1 banana + 250ml water\n~7:40 Post-run — 4 eggs + 2 chapati + 1 bowl curd\n1:00 Lunch — 2 chapati + 1 bowl dal + 100g paneer\n4:00 Snack — 1 scoop whey + 1 tbsp flaxseed + handful peanuts\n8:30 Dinner — 3 eggs + 1 bowl dal + salad', directive: 'Longest mid-week run. Hold the pace ceiling. Warm-up is non-negotiable.' },
    '2026-06-26': { day_name: 'Fri', day_type: 'Bodyweight', protein_target: 150, water_target: '2L', run_type: null, run_km: null, run_pace: null, run_cue: null, workout_plan: 'Bodyweight — upper + core', workout_detail: 'Pull-ups 4xmax · Push-ups 3xmax · Rows 3x10 · Dead hang 3x20s · Plank 3x40s · Side plank 2x30s · Calf raises 2x15 (light)', meals_plan: '6:30 Pre-workout — Water + black coffee\n7:45 Post-workout — 4 eggs + 1 chapati + 1 scoop whey\n1:00 Lunch — 2 chapati + 1 bowl chana/rajma + 100g paneer\n4:30 Snack — 1 scoop whey + 10 walnuts\n8:30 Dinner — 3 eggs + curd + veggies', directive: 'Upper body only — keep legs fresh for tomorrow\'s long run. Sleep early — 7h minimum.' },
    '2026-06-27': { day_name: 'Sat', day_type: 'Run', protein_target: 150, water_target: '2.5L+', run_type: 'Long Easy', run_km: 5, run_pace: '8:00–8:45/km', run_cue: 'Cadence: 150 BPM metronome · RPE 6 max · Walk 1 min at 2.5 km if needed', workout_plan: null, workout_detail: null, meals_plan: '6:20 Pre-run — 1 banana + 2 dates + 250ml water\n~7:50 Post-run — 4 eggs + 2 chapati + curd\n1:00 Lunch — 2-3 chapati + dal + 100g paneer\n4:00 Snack — 1 scoop whey + handful peanuts\n8:30 Dinner — 3 eggs + dal + veggies', directive: 'Week\'s key run. Consolidate 5 km. Finish feeling you could do 1 more km.' },
    '2026-06-28': { day_name: 'Sun', day_type: 'Rest', protein_target: 149, water_target: '2L', run_type: null, run_km: null, run_pace: null, run_cue: null, workout_plan: null, workout_detail: 'Optional: 20 min gentle walk + foam roll legs', meals_plan: '8:00 Breakfast — 4 eggs + 1 scoop whey\n1:00 Lunch — 2 chapati + dal + 100g paneer + salad\n4:30 Snack — 1 scoop whey + 10 walnuts\n8:30 Dinner — 3 eggs + curd + veggies', directive: 'Close the week clean. Weigh Monday AM before food.' },
  };
  return plans[date] || null;
}

// ── Get meal slots for current day ───────────────────────────
export function getCurrentMealSlots() {
  if (!state.currentPlan) return MEAL_SLOTS.Rest;
  return MEAL_SLOTS[state.currentPlan.day_type] || MEAL_SLOTS.Rest;
}

// ── Init ─────────────────────────────────────────────────────
async function init() {
  setupTabs();
  setupDateNav();
  updateDateDisplay();

  // Try Supabase, fallback to local
  if (isConfigured()) {
    await initSupabase();
  }

  await loadPlan();
  initToday();
  initFood();
  initWeek();
  initDebrief();

  await loadTodayData();

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

document.addEventListener('DOMContentLoaded', init);
