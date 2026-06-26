// Main app — tab routing, date state, initialization
import { MEAL_SLOTS, renderDayBadge } from './data.js';
import { initSupabase, fetchDailyPlan, setCurrentUserId } from './supabase.js';
import {
  RUN_WARMUP,
  RUN_COOLDOWN,
  WKT_WARMUP,
  WKT_COOLDOWN,
  MOBILITY_COOLDOWN,
} from './plan-templates.js';
import { loadSession, initAuthListeners, signIn, signUp, signOut, getProfile } from './auth.js';
import { initToday, loadTodayData } from './today.js';
import { initFood, loadFoodData } from './food.js';
import { initWeek, loadWeekView, syncWeekViewMonday } from './week.js';
import { initDebrief, refreshDebrief, refreshDebriefIfActive } from './debrief.js';
import { initProgress, loadProgressView, loadBodyCompForDate } from './progress.js';
import { initDayProgress, updateDayProgress } from './day-progress.js';
import { initSupplements } from './supplements.js';
import { loadingInlineHtml, setButtonLoading, setOverlayLoading } from './spinner.js';
import { flushAllAutosaves, setupAutosaveLifecycle } from './auto-save.js';
import { invalidateWeekStatsCache } from './week-stats.js';
import { initSaveState, clearSaveState } from './save-state.js';
import { mergePlanWithFallback } from './plan-merge.js';

// ── App State ────────────────────────────────────────────────
export const state = {
  currentDate: new Date(),
  currentPlan: null,
  foodLogs: {},      // { slotName: { items: [...], customText, totalProtein, totalCalories } }
  vitals: null,
  runLog: null,
  workoutLog: null,
  bodyCompScans: [],
  bodyCompScanForDate: null,
  supplementLog: null,
  supplementHistory: [],
};

// ── Date Helpers ─────────────────────────────────────────────
const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** ISO key for storage/API — never show in UI. */
export function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatToday() {
  return formatDate(new Date());
}

/** User-facing date: DD MMM,YY (e.g. 24 Jun,26). */
export function formatDayDisplay(d) {
  const day = String(d.getDate()).padStart(2, '0');
  const month = MONTH_ABBR[d.getMonth()];
  const year = String(d.getFullYear()).slice(-2);
  return `${day} ${month},${year}`;
}

export function formatDayDisplayFromIso(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  return formatDayDisplay(new Date(year, month - 1, day));
}

export function isMonday(d) {
  return d.getDay() === 1;
}

export function getToday() {
  return formatDate(state.currentDate);
}

function calendarDate(d) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function isViewingToday() {
  const now = calendarDate(new Date());
  const viewing = calendarDate(state.currentDate);
  return viewing.getTime() === now.getTime();
}

export function isViewingPast() {
  const now = calendarDate(new Date());
  const viewing = calendarDate(state.currentDate);
  return viewing.getTime() < now.getTime();
}

export function isViewingFuture() {
  const now = calendarDate(new Date());
  const viewing = calendarDate(state.currentDate);
  return viewing.getTime() > now.getTime();
}

function isViewingTomorrow() {
  const tomorrow = calendarDate(new Date());
  tomorrow.setDate(tomorrow.getDate() + 1);
  return calendarDate(state.currentDate).getTime() === tomorrow.getTime();
}

function getWeekSunday(d) {
  const copy = calendarDate(d);
  const dayOfWeek = copy.getDay();
  const diff = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

function canGoNextDay() {
  const next = calendarDate(state.currentDate);
  next.setDate(next.getDate() + 1);
  return next.getTime() <= getWeekSunday(state.currentDate).getTime();
}

// ── Toast ────────────────────────────────────────────────────
let toastHideTimer = null;

export function showToast(msg, { variant = 'default' } = {}) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast';
  if (variant === 'saved') el.classList.add('toast--saved');
  if (variant === 'error') el.classList.add('toast--error');
  el.classList.add('show');
  if (toastHideTimer) clearTimeout(toastHideTimer);
  toastHideTimer = setTimeout(() => el.classList.remove('show'), 2000);
}

export function showSavedToast() {
  showToast('Saved', { variant: 'saved' });
}

// ── Tab Routing ──────────────────────────────────────────────
function updateTabChrome(activeTab) {
  const isProgress = activeTab === 'progress';
  document.querySelector('.app-sticky-header')?.classList.toggle('header--progress', isProgress);
}

function setupTabs() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', async () => {
      await flushAllAutosaves();

      // Deactivate all
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      // Activate clicked
      tab.classList.add('active');
      const tabName = tab.dataset.tab;
      document.getElementById(`tab-${tabName}`).classList.add('active');
      updateTabChrome(tabName);

      // Refresh data on tab switch
      if (tabName === 'food') loadFoodData();
      if (tabName === 'week') loadWeekView();
      if (tabName === 'progress') loadProgressView();
      if (tabName === 'debrief') refreshDebrief();
    });
  });
}

// ── Date Navigation ──────────────────────────────────────────
function setupDateNav() {
  document.getElementById('date-prev').addEventListener('click', async () => {
    await flushAllAutosaves();
    const d = new Date(state.currentDate);
    d.setDate(d.getDate() - 1);
    state.currentDate = d;
    onDateChange();
  });
  document.getElementById('date-next').addEventListener('click', async () => {
    if (!canGoNextDay()) return;
    await flushAllAutosaves();
    const d = new Date(state.currentDate);
    d.setDate(d.getDate() + 1);
    state.currentDate = d;
    onDateChange();
  });
  document.getElementById('date-today-btn').addEventListener('click', async () => {
    await flushAllAutosaves();
    state.currentDate = new Date();
    onDateChange();
  });
}

async function onDateChange() {
  invalidateWeekStatsCache();
  clearSaveState();
  setContentLoading(true);
  try {
    updateDateDisplay();
    await loadPlan();
    await loadTodayData();
    await loadBodyCompForDate(getToday());
    await loadFoodData();
    syncWeekViewMonday();
    await loadWeekView();
    updatePreviewMode();
  } finally {
    setContentLoading(false);
    updateDateDisplay();
  }
}

function setContentLoading(loading) {
  document.querySelector('.app-container')?.classList.toggle('is-content-loading', loading);
  document.getElementById('plan-card')?.classList.toggle('is-loading', loading);
  document.getElementById('date-prev')?.classList.toggle('is-loading', loading);
  document.getElementById('date-next')?.classList.toggle('is-loading', loading);
  setOverlayLoading('content-loading-overlay', loading);

  if (loading) {
    const directive = document.getElementById('plan-directive');
    if (directive) directive.innerHTML = loadingInlineHtml('Loading plan…');
    const summary = document.getElementById('plan-training-summary');
    if (summary) summary.textContent = '';
  }
}

async function openDayFromWeek(dateStr) {
  await flushAllAutosaves();
  const [year, month, day] = dateStr.split('-').map(Number);
  state.currentDate = new Date(year, month - 1, day);
  await onDateChange();
  document.querySelector('.nav-tab[data-tab="today"]')?.click();
}

function updateDateDisplay() {
  const viewingToday = isViewingToday();
  const viewingFuture = isViewingFuture();
  const offTodayBar = document.getElementById('date-off-today-bar');
  const hintEl = document.getElementById('date-off-today-hint');
  const nextBtn = document.getElementById('date-next');
  const planTitle = document.getElementById('plan-card-title');

  document.getElementById('date-display').textContent = formatDayDisplay(state.currentDate);
  offTodayBar?.classList.toggle('hidden', viewingToday);
  nextBtn.disabled = !canGoNextDay();

  if (hintEl) {
    if (viewingFuture) {
      hintEl.textContent = 'Preview — log on the day';
    } else if (isViewingPast()) {
      hintEl.textContent = 'Viewing a past day';
    }
  }

  if (planTitle) {
    if (viewingToday) {
      planTitle.textContent = "Today's Plan";
    } else if (isViewingTomorrow()) {
      planTitle.textContent = "Tomorrow's Plan";
    } else if (viewingFuture) {
      planTitle.textContent = 'Upcoming Plan';
    } else {
      planTitle.textContent = 'Plan';
    }
  }
}

function updatePreviewMode() {
  const future = isViewingFuture();
  const loggingIds = ['vitals-card', 'training-card', 'meals-summary-card', 'supplements-card', 'notes-card', 'day-progress'];
  loggingIds.forEach((id) => {
    document.getElementById(id)?.classList.toggle('hidden', future);
  });
}

// ── Load Plan for Current Date ───────────────────────────────
async function loadPlan() {
  const date = getToday();
  const plan = await fetchDailyPlan(date);

  if (plan) {
    state.currentPlan = mergePlanWithFallback(plan, date);
  } else {
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
  el.innerHTML = renderDayBadge(state.currentPlan.day_type);
}

// ── Fallback plan from embedded Week 1 data ──────────────────
// Synced with generate-tracker.py — used when Supabase row is missing or stale
export function getFallbackPlan(date) {
  const monWorkout =
    `${WKT_WARMUP} · Pull-ups 4×max · Push-ups 3×15 · ` +
    'Rows 3×10 (park bench) · Dead hang 3×20s · Plank 3×40s · Side plank 2×30s · ' +
    'Glute bridges 2×12 (light activation) · 25–30 min · RPE 5 · ' +
    WKT_COOLDOWN;
  const friWorkout =
    `${WKT_WARMUP} · Pull-ups 4×max · Push-ups 3×max · ` +
    'Rows 3×10 (park bench) · Dead hang 3×20s · Plank 3×40s · Side plank 2×30s · ' +
    'Calf raises 2×15 (light) · 25–30 min · RPE 5–6 · ' +
    WKT_COOLDOWN;
  const wedWorkout =
    'WARM-UP (5 min): 5 min brisk walk · Squats 3×15 (slow) · Lunges 2×10/leg · ' +
    'Glute bridges 3×15 · Calf raises 3×20 · Foam roll quads + calves + IT band 5 min · ' +
    '20–25 min · RPE 4–5 · ' +
    MOBILITY_COOLDOWN;

  const plans = {
    '2026-06-22': { day_name: 'Mon', day_type: 'Bodyweight', protein_target: 150, water_target: '2L', run_type: null, run_km: null, run_pace: null, run_cue: null, workout_plan: 'Bodyweight — upper + core + light knee activation', workout_detail: monWorkout, meals_plan: '6:30 Pre-workout — Water + black coffee\n7:45 Post-workout — 4 eggs bhurji + 1 chapati + 1 scoop whey\n1:00 Lunch — 2 chapati + 1 bowl moong dal + 100g paneer + salad\n4:30 Snack — 1 scoop whey + 10 walnuts\n8:30 Dinner — 3 eggs omelette + 1 bowl curd + sautéed veggies', directive: 'First day. Upper body only — NO squats/lunges today. Legs must be fresh for tomorrow\'s run.' },
    '2026-06-23': { day_name: 'Tue', day_type: 'Run', protein_target: 148, water_target: '2.5L', run_type: 'Easy', run_km: 3, run_pace: '8:00–8:30/km', run_cue: `${RUN_WARMUP} · Cadence: use 150 BPM metronome · RPE 5–6 · Oxygen Park · ${RUN_COOLDOWN}`, workout_plan: null, workout_detail: null, meals_plan: '6:20 Pre-run — 1 banana + 250ml water\n~7:30 Post-run — 4 eggs + 2 whole wheat toast + 1 bowl curd\n1:00 Lunch — 2 chapati + 1 bowl dal + 100g paneer + salad\n4:00 Snack — 1 scoop whey + small handful peanuts\n8:30 Dinner — 3 eggs bhurji + 1 bowl dal + veggies', directive: 'Easy means easy — slower than your 5 km pace. Warm-up is mandatory.' },
    '2026-06-24': { day_name: 'Wed', day_type: 'Active Recovery', protein_target: 149, water_target: '2L', run_type: null, run_km: null, run_pace: null, run_cue: null, workout_plan: 'Knee prep + mobility', workout_detail: wedWorkout, meals_plan: '8:00 Breakfast — 4 eggs + 1 scoop whey\n1:00 Lunch — 1.5 chapati + 1 bowl dal + 150g curd + salad\n4:30 Snack — 1 scoop whey + 10 walnuts\n8:30 Dinner — 3 eggs + 80g paneer + veggies', directive: 'Knee prep day — not a leg strength session. Slow, controlled reps.' },
    '2026-06-25': { day_name: 'Thu', day_type: 'Run', protein_target: 148, water_target: '2.5L', run_type: 'Easy', run_km: 4, run_pace: '8:00–8:30/km', run_cue: `${RUN_WARMUP} · Cadence: 150 BPM metronome · RPE 5–6 · Knee check at 2 km — if pain, walk home · ${RUN_COOLDOWN}`, workout_plan: null, workout_detail: null, meals_plan: '6:20 Pre-run — 1 banana + 250ml water\n~7:40 Post-run — 4 eggs + 2 chapati + 1 bowl curd\n1:00 Lunch — 2 chapati + 1 bowl dal + 100g paneer\n4:00 Snack — 1 scoop whey + 1 tbsp flaxseed + handful peanuts\n8:30 Dinner — 3 eggs + 1 bowl dal + salad', directive: 'Longest mid-week run. Hold the pace ceiling. Warm-up is non-negotiable.' },
    '2026-06-26': { day_name: 'Fri', day_type: 'Bodyweight', protein_target: 150, water_target: '2L', run_type: null, run_km: null, run_pace: null, run_cue: null, workout_plan: 'Bodyweight — upper + core', workout_detail: friWorkout, meals_plan: '6:30 Pre-workout — Water + black coffee\n7:45 Post-workout — 4 eggs + 1 chapati + 1 scoop whey\n1:00 Lunch — 2 chapati + 1 bowl chana/rajma + 100g paneer\n4:30 Snack — 1 scoop whey + 10 walnuts\n8:30 Dinner — 3 eggs + curd + veggies', directive: 'Upper body only — keep legs fresh for tomorrow\'s long run. Sleep early — 7h minimum.' },
    '2026-06-27': { day_name: 'Sat', day_type: 'Run', protein_target: 150, water_target: '2.5L+', run_type: 'Long Easy', run_km: 5, run_pace: '8:00–8:45/km', run_cue: `${RUN_WARMUP} · Cadence: 150 BPM metronome · RPE 6 max · Walk 1 min at 2.5 km if needed · ${RUN_COOLDOWN} · Extra: foam roll quads + calves post-shower if available`, workout_plan: null, workout_detail: null, meals_plan: '6:20 Pre-run — 1 banana + 2 dates + 250ml water\n~7:50 Post-run — 4 eggs + 2 chapati + curd\n1:00 Lunch — 2-3 chapati + dal + 100g paneer\n4:00 Snack — 1 scoop whey + handful peanuts\n8:30 Dinner — 3 eggs + dal + veggies', directive: 'Week\'s key run. Consolidate 5 km. Finish feeling you could do 1 more km.' },
    '2026-06-28': { day_name: 'Sun', day_type: 'Rest', protein_target: 149, water_target: '2L', run_type: null, run_km: null, run_pace: null, run_cue: null, workout_plan: null, workout_detail: 'Optional: 20 min gentle walk + foam roll legs', meals_plan: '8:00 Breakfast — 4 eggs + 1 scoop whey\n1:00 Lunch — 2 chapati + dal + 100g paneer + salad\n4:30 Snack — 1 scoop whey + 10 walnuts\n8:30 Dinner — 3 eggs + curd + veggies', directive: 'Close the week clean. Weigh Monday AM before food.' },
  };
  return plans[date] || null;
}

/** Backfill warm-up / cool-down when Supabase has cadence-only run_cue. */
export function patchPlanWarmup(plan, date) {
  if (!plan) return null;
  const fb = getFallbackPlan(date);
  if (!fb) return plan;
  const patched = { ...plan };
  if (patched.run_type && (!patched.run_cue || !/WARM-UP/i.test(patched.run_cue)) && fb.run_cue) {
    patched.run_cue = fb.run_cue;
  }
  if (patched.workout_plan && (!patched.workout_detail || !/WARM-UP/i.test(patched.workout_detail)) && fb.workout_detail) {
    patched.workout_detail = fb.workout_detail;
  }
  return patched;
}

// ── Get meal slots for current day ───────────────────────────
export function getCurrentMealSlots() {
  if (!state.currentPlan) return MEAL_SLOTS.Rest;
  return MEAL_SLOTS[state.currentPlan.day_type] || MEAL_SLOTS.Rest;
}

// ── Auth gate ────────────────────────────────────────────────
function showAuth(message = '') {
  const errorEl = document.getElementById('auth-error');
  if (errorEl) errorEl.textContent = message;
  document.getElementById('auth-screen').classList.add('show');
  document.querySelector('.app-container')?.classList.add('hidden');
  document.querySelector('.bottom-nav')?.classList.add('hidden');
}

function hideAuth() {
  document.getElementById('auth-screen').classList.remove('show');
  document.querySelector('.app-container')?.classList.remove('hidden');
  document.querySelector('.bottom-nav')?.classList.remove('hidden');
}

function setAuthLoading(loading) {
  setOverlayLoading('auth-loading-overlay', loading);
  const isSignUp = document.getElementById('auth-title')?.textContent === 'Sign up';
  setButtonLoading(
    document.getElementById('auth-submit'),
    loading,
    isSignUp ? 'Sign up' : 'Sign in'
  );
}

function setupAuth() {
  const form = document.getElementById('auth-form');
  const errorEl = document.getElementById('auth-error');
  const submitBtn = document.getElementById('auth-submit');
  const toggleBtn = document.getElementById('auth-toggle');
  const titleEl = document.getElementById('auth-title');
  const nameGroup = document.getElementById('auth-name-group');
  let isSignUp = false;

  toggleBtn.addEventListener('click', () => {
    isSignUp = !isSignUp;
    titleEl.textContent = isSignUp ? 'Sign up' : 'Sign in';
    submitBtn.textContent = isSignUp ? 'Sign up' : 'Sign in';
    toggleBtn.textContent = isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up';
    nameGroup.classList.toggle('hidden', !isSignUp);
    errorEl.textContent = '';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.textContent = '';
    const idleLabel = isSignUp ? 'Sign up' : 'Sign in';
    setButtonLoading(submitBtn, true, idleLabel);
    try {
      let session = null;
      if (isSignUp) {
        const data = await signUp(
          document.getElementById('auth-email').value.trim(),
          document.getElementById('auth-password').value,
          document.getElementById('auth-name').value.trim()
        );
        session = data.session;
        if (!session) {
          errorEl.textContent = 'Check your email to confirm, then sign in.';
          return;
        }
      } else {
        const data = await signIn(
          document.getElementById('auth-email').value.trim(),
          document.getElementById('auth-password').value
        );
        session = data.session;
      }
      await enterApp(session);
    } catch (err) {
      errorEl.textContent = err.message || 'Failed';
    } finally {
      setButtonLoading(submitBtn, false, idleLabel);
    }
  });

  document.getElementById('sign-out-btn').addEventListener('click', async () => {
    await signOut();
    setCurrentUserId(null);
    showAuth();
  });
}

async function enterApp(session) {
  const active = session || (await loadSession());
  if (!active?.user) {
    showAuth('Sign-in succeeded but session did not start. Try again.');
    return;
  }
  setCurrentUserId(active.user.id);
  const profile = getProfile();
  document.getElementById('user-display').textContent =
    profile?.display_name || active.user.email;
  hideAuth();
  setContentLoading(true);
  try {
    await bootApp();
  } finally {
    setContentLoading(false);
  }
}

let booted = false;

async function bootApp() {
  if (booted) {
    await onDateChange();
    return;
  }
  booted = true;
  setupTabs();
  setupDateNav();
  initSaveState();
  setupAutosaveLifecycle();
  updateDateDisplay();
  await loadPlan();
  initToday();
  initFood();
  initWeek(openDayFromWeek);
  initProgress();
  initDebrief();
  initDayProgress();
  await loadTodayData();
  updatePreviewMode();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

// ── Init ─────────────────────────────────────────────────────
async function init() {
  showAuth();
  setAuthLoading(true);

  try {
    await initSupabase();
  } catch (err) {
    console.error('initSupabase:', err);
    showAuth('Could not load app. Check your connection and refresh.');
    return;
  } finally {
    setAuthLoading(false);
  }

  setupAuth();

  initAuthListeners(
    async (session) => {
      setCurrentUserId(session.user.id);
      const profile = getProfile();
      document.getElementById('user-display').textContent =
        profile?.display_name || session.user.email;
      hideAuth();
      setContentLoading(true);
      try {
        await bootApp();
      } finally {
        setContentLoading(false);
      }
    },
    () => {
      setCurrentUserId(null);
      booted = false;
      showAuth();
    }
  );

  const session = await loadSession();
  if (session?.user) {
    await enterApp(session);
  }
}

document.addEventListener('DOMContentLoaded', init);
