// Week tab — 7 day cards with expand/collapse
import { state, formatDate } from './app.js';
import { fetchWeekPlans, isConfigured } from './supabase.js';
import { DAY_TYPES, SLOT_LABELS } from './data.js';

export function initWeek() {
  loadWeekView();
}

export async function loadWeekView() {
  const container = document.getElementById('week-cards');
  const today = formatDate(state.currentDate);

  // Find the Monday of current week
  const d = new Date(state.currentDate);
  const dayOfWeek = d.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const startDate = formatDate(monday);
  const endDate = formatDate(sunday);

  let plans = [];
  if (isConfigured()) {
    plans = await fetchWeekPlans(startDate, endDate);
  }

  // Fallback to hardcoded week 1
  if (plans.length === 0) {
    plans = getFallbackWeekPlans();
  }

  container.innerHTML = '';

  if (plans.length === 0) {
    container.innerHTML = '<p class="text-muted text-center" style="padding:40px 0;">No plan available for this week</p>';
    return;
  }

  plans.forEach(plan => {
    const isToday = plan.date === today;
    const info = DAY_TYPES[plan.day_type] || DAY_TYPES.Rest;

    // Summary line
    let summary = '';
    if (plan.run_type) {
      summary = `${plan.run_type} ${plan.run_km} km @ ${plan.run_pace}`;
    } else if (plan.workout_plan) {
      summary = plan.workout_plan;
    } else {
      summary = plan.workout_detail || 'Rest';
    }

    const card = document.createElement('div');
    card.className = `week-card${isToday ? ' today' : ''}`;
    card.innerHTML = `
      <div class="week-card-header">
        <div>
          <span class="week-card-date">${plan.day_name} ${plan.date.slice(5)}</span>
          <span class="day-badge" style="background:${info.color};color:#0a0a0a;margin-left:8px;font-size:10px;padding:2px 8px;">${info.label}</span>
        </div>
        <span class="text-muted" style="font-size:12px;">${plan.protein_target || 145}g P</span>
      </div>
      <div class="week-card-summary">${summary}</div>
      <div class="week-card-detail">
${plan.directive ? `Coach: ${plan.directive}\n\n` : ''}${plan.meals_plan || ''}${plan.run_cue ? `\n\nRun cue: ${plan.run_cue}` : ''}${plan.workout_detail ? `\n\nWorkout: ${plan.workout_detail}` : ''}
      </div>
    `;

    card.addEventListener('click', () => {
      card.classList.toggle('expanded');
    });

    container.appendChild(card);
  });
}

function getFallbackWeekPlans() {
  return [
    { date: '2026-06-22', day_name: 'Mon', day_type: 'Bodyweight', protein_target: 150, run_type: null, run_km: null, run_pace: null, run_cue: null, workout_plan: 'Upper + core + light knee activation', workout_detail: 'Pull-ups 4xmax · Push-ups 3x15 · Rows 3x10 · Dead hang 3x20s · Plank 3x40s · Side plank 2x30s · Glute bridges 2x12', meals_plan: '6:30 Pre-workout — Water + black coffee\n7:45 Post-workout — 4 eggs + 1 chapati + 1 whey\n1:00 Lunch — 2 chapati + dal + 100g paneer + salad\n4:30 Snack — 1 whey + 10 walnuts\n8:30 Dinner — 3 eggs + curd + veggies', directive: 'Upper body only — NO squats/lunges. Legs fresh for tomorrow\'s run.' },
    { date: '2026-06-23', day_name: 'Tue', day_type: 'Run', protein_target: 148, run_type: 'Easy', run_km: 3, run_pace: '8:00–8:30/km', run_cue: 'Cadence 150 BPM · RPE 5–6 · Oxygen Park', workout_plan: null, workout_detail: null, meals_plan: '6:20 Pre-run — 1 banana + 250ml water\n~7:30 Post-run — 4 eggs + 2 toast + curd\n1:00 Lunch — 2 chapati + dal + 100g paneer + salad\n4:00 Snack — 1 whey + peanuts\n8:30 Dinner — 3 eggs + dal + veggies', directive: 'Easy means easy. Warm-up mandatory.' },
    { date: '2026-06-24', day_name: 'Wed', day_type: 'Active Recovery', protein_target: 149, run_type: null, run_km: null, run_pace: null, run_cue: null, workout_plan: 'Knee prep + mobility', workout_detail: 'Squats 3x15 · Lunges 2x10/leg · Glute bridges 3x15 · Calf raises 3x20 · Foam roll 5 min', meals_plan: '8:00 Breakfast — 4 eggs + 1 whey\n1:00 Lunch — 1.5 chapati + dal + 150g curd + salad\n4:30 Snack — 1 whey + 10 walnuts\n8:30 Dinner — 3 eggs + 80g paneer + veggies', directive: 'Knee prep — not strength. Slow, controlled reps.' },
    { date: '2026-06-25', day_name: 'Thu', day_type: 'Run', protein_target: 148, run_type: 'Easy', run_km: 4, run_pace: '8:00–8:30/km', run_cue: 'Cadence 150 BPM · RPE 5–6 · Knee check at 2 km', workout_plan: null, workout_detail: null, meals_plan: '6:20 Pre-run — 1 banana + 250ml water\n~7:40 Post-run — 4 eggs + 2 chapati + curd\n1:00 Lunch — 2 chapati + dal + 100g paneer\n4:00 Snack — 1 whey + flaxseed + peanuts\n8:30 Dinner — 3 eggs + dal + salad', directive: 'Longest mid-week run. Hold pace ceiling.' },
    { date: '2026-06-26', day_name: 'Fri', day_type: 'Bodyweight', protein_target: 150, run_type: null, run_km: null, run_pace: null, run_cue: null, workout_plan: 'Upper + core', workout_detail: 'Pull-ups 4xmax · Push-ups 3xmax · Rows 3x10 · Dead hang 3x20s · Plank 3x40s · Side plank 2x30s · Calf raises 2x15', meals_plan: '6:30 Pre-workout — Water + coffee\n7:45 Post-workout — 4 eggs + 1 chapati + 1 whey\n1:00 Lunch — 2 chapati + chana + 100g paneer\n4:30 Snack — 1 whey + 10 walnuts\n8:30 Dinner — 3 eggs + curd + veggies', directive: 'Upper body only. Keep legs fresh for long run. Sleep 7h+.' },
    { date: '2026-06-27', day_name: 'Sat', day_type: 'Run', protein_target: 150, run_type: 'Long Easy', run_km: 5, run_pace: '8:00–8:45/km', run_cue: 'Cadence 150 BPM · RPE 6 max · Walk at 2.5 km if needed', workout_plan: null, workout_detail: null, meals_plan: '6:20 Pre-run — banana + 2 dates + 250ml water\n~7:50 Post-run — 4 eggs + 2 chapati + curd\n1:00 Lunch — 2-3 chapati + dal + 100g paneer\n4:00 Snack — 1 whey + peanuts\n8:30 Dinner — 3 eggs + dal + veggies', directive: 'Week\'s key run. Full warm-up, full cool-down.' },
    { date: '2026-06-28', day_name: 'Sun', day_type: 'Rest', protein_target: 149, run_type: null, run_km: null, run_pace: null, run_cue: null, workout_plan: null, workout_detail: 'Optional: 20 min walk + foam roll', meals_plan: '8:00 Breakfast — 4 eggs + 1 whey\n1:00 Lunch — 2 chapati + dal + 100g paneer + salad\n4:30 Snack — 1 whey + 10 walnuts\n8:30 Dinner — 3 eggs + curd + veggies', directive: 'Close week clean. Weigh Monday AM before food.' },
  ];
}
