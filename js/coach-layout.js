// Coach screen layout — section order, compression, read-only past days, block chip
import {
  state,
  getToday,
  isViewingFuture,
  isViewingPast,
  getFallbackPlan,
  formatDate,
} from './app.js';
import { computeDayProgress } from './day-progress.js';
import { isRunLogComplete } from './run-log.js';
import { isWorkoutLogComplete } from './workout-log.js';
import { isSupplementsComplete } from './supplements.js';
import {
  formatBlockChip,
  formatRecoveryTodayHtml,
  summarizePlanSession,
} from './block-context.js';
import { expandVitalsCard } from './vitals-ui.js';
import { layoutCoachObservations } from './observation-coach.js';

let coachEditMode = false;

/* Context-first bands (Phase 3.1.C). Fixed base order — completion must not
   float logging sections above Plan / Recovery. Visibility stays conditional. */
const SECTION_BASE = {
  plan: 10,
  recovery: 20,
  vitals: 30,
  training: 40,
  meals: 50,
  supplements: 60,
  notes: 70,
  monday: 80,
  observation: 90,
  coach_note: 100,
  debrief: 110,
};

function tomorrowIso(fromIso) {
  const d = new Date(`${fromIso}T12:00:00`);
  d.setDate(d.getDate() + 1);
  return formatDate(d);
}

function isRestPlan(plan) {
  return plan && !plan.run_type && !plan.workout_plan;
}

function isTrainingRequired() {
  const plan = state.currentPlan;
  return !!(plan?.run_type || plan?.workout_plan);
}

function isVitalsComplete() {
  const v = state.vitals;
  return !!(v && (v.weight_kg != null || v.sleep_hours != null));
}

function isTrainingComplete() {
  const plan = state.currentPlan;
  if (plan?.run_type) return isRunLogComplete(state.runLog);
  if (plan?.workout_plan) return isWorkoutLogComplete(state.workoutLog);
  return false;
}

function sectionSortKey(section) {
  return SECTION_BASE[section] ?? 999;
}

export function reorderCoachSections() {
  const root = document.getElementById('coach-sections');
  if (!root) return;

  const cards = [...root.querySelectorAll(':scope > [data-coach-section]')];
  cards.sort((a, b) => {
    const sa = sectionSortKey(a.dataset.coachSection);
    const sb = sectionSortKey(b.dataset.coachSection);
    return sa - sb;
  });

  for (const card of cards) {
    root.appendChild(card);
  }

  /* Floor / Close live in #coach-sections without data-coach-section. Keep them
     immediately after Training so session lifecycle DOM adjacency stays intact. */
  const training = document.getElementById('training-card');
  const floor = document.getElementById('session-floor-bar');
  const close = document.getElementById('session-close-panel');
  if (training && floor && floor.parentElement === root) {
    training.after(floor);
    if (close && close.parentElement === root) floor.after(close);
  }
}

export function updateBlockContextChip() {
  const chip = document.getElementById('block-context-chip');
  if (!chip) return;
  chip.textContent = formatBlockChip(new Date(getToday() + 'T12:00:00'));
  chip.classList.toggle('hidden', isViewingFuture());
}

/* Phase 3.1.D — factual summaries from live state (no mocked copy). */

function formatVitalsSummary(data = state.vitals) {
  if (!data) return '';
  const parts = [];
  if (data.weight_kg != null && data.weight_kg !== '') parts.push(`${data.weight_kg} kg`);
  if (data.sleep_hours != null && data.sleep_hours !== '') parts.push(`${data.sleep_hours}h sleep`);
  if (data.cigarettes != null && data.cigarettes !== '') parts.push(`${data.cigarettes} cigs`);
  if (data.waist_inches != null && data.waist_inches !== '') parts.push(`${data.waist_inches}" waist`);
  return parts.join(' · ');
}

function syncVitalsSummaryText() {
  const el = document.getElementById('vitals-summary');
  if (!el) return;
  const text = formatVitalsSummary();
  if (text) el.textContent = text;
}

function formatTrainingSummary() {
  const plan = state.currentPlan;
  if (plan?.run_type && state.runLog?.done) {
    const log = state.runLog;
    const parts = [];
    if (log.actual_km) parts.push(`${log.actual_km} km`);
    if (log.avg_pace) parts.push(log.avg_pace);
    if (log.cadence) parts.push(`cadence ${log.cadence}`);
    if (log.rpe) parts.push(`RPE ${log.rpe}`);
    if (log.knee_status) parts.push(log.knee_status);
    return parts.join(' · ') || 'Run logged';
  }
  if (plan?.workout_plan && state.workoutLog?.done) {
    const log = state.workoutLog;
    const rpe = log.rpe ? `RPE ${log.rpe}` : '';
    const summary = log.what_i_did ? log.what_i_did.split('·')[0].trim() : 'Workout logged';
    return [summary, rpe].filter(Boolean).join(' · ');
  }
  return '';
}

function formatMealsSummary(mealsTask) {
  const logs = Object.values(state.foodLogs || {});
  const totalP = logs.reduce((s, f) => s + (f.totalProtein || 0), 0);
  const totalKcal = logs.reduce((s, f) => s + (f.totalCalories || 0), 0);
  const parts = [];
  if (mealsTask?.label) parts.push(mealsTask.label);
  if (totalP) parts.push(`${Math.round(totalP)}g P`);
  if (totalKcal) parts.push(`~${Math.round(totalKcal)} kcal`);
  return parts.join(' · ');
}

function isSectionActivelyEdited(cardId) {
  const card = document.getElementById(cardId);
  const active = document.activeElement;
  if (!card || !active || active === document.body) return false;
  return card.contains(active);
}

function setCardCollapsed(cardId, collapsed, { summary = '' } = {}) {
  const card = document.getElementById(cardId);
  if (!card) return;
  const summaryEl = card.querySelector('.card-summary-inline');
  if (summaryEl && summary) summaryEl.textContent = summary;

  // Keep an open section open while the athlete is interacting with it.
  if (collapsed && isSectionActivelyEdited(cardId)) {
    const collapseBtn = card.querySelector('.card-collapse-btn');
    if (collapseBtn) collapseBtn.setAttribute('aria-expanded', 'true');
    return;
  }

  card.classList.toggle('collapsed', collapsed);
  const collapseBtn = card.querySelector('.card-collapse-btn');
  if (collapseBtn) {
    collapseBtn.setAttribute('aria-expanded', String(!collapsed));
  }
}

export function updateSectionCompression() {
  if (isViewingFuture() || (isViewingPast() && !coachEditMode)) {
    return;
  }

  // Past-day edit mode: keep cards expanded while the user is correcting logs.
  if (isViewingPast() && coachEditMode) {
    return;
  }

  // Plan + Recovery stay open as context — never auto-collapsed here.

  if (isVitalsComplete()) {
    syncVitalsSummaryText();
    setCardCollapsed('vitals-card', true);
  }

  if (isTrainingRequired()) {
    const done = isTrainingComplete();
    setCardCollapsed('training-card', done, { summary: formatTrainingSummary() });
  }

  const mealsTask = computeDayProgress().tasks.find((t) => t.id === 'meals');
  if (mealsTask?.done) {
    setCardCollapsed('meals-summary-card', true, {
      summary: formatMealsSummary(mealsTask),
    });
  } else {
    // Incomplete: stay expanded; show factual macros only when something is logged.
    const logs = Object.values(state.foodLogs || {});
    const hasLogged = logs.some((f) => (f.totalProtein || 0) > 0 || (f.totalCalories || 0) > 0);
    setCardCollapsed('meals-summary-card', false, {
      summary: hasLogged ? formatMealsSummary(mealsTask) : '',
    });
  }

  if (isSupplementsComplete()) {
    const summary = document.getElementById('supplements-summary')?.textContent || '';
    setCardCollapsed('supplements-card', true, { summary });
  } else {
    setCardCollapsed('supplements-card', false);
  }

  const notes = state.vitals?.notes?.trim();
  if (notes) {
    const preview = notes.length > 48 ? `${notes.slice(0, 48)}…` : notes;
    setCardCollapsed('notes-card', true, { summary: preview });
  } else {
    // Optional empty notes — expanded but not treated as an urgent task (CSS).
    setCardCollapsed('notes-card', false, { summary: '' });
  }
}

export function renderRecoveryCard() {
  const card = document.getElementById('recovery-card');
  const body = document.getElementById('recovery-content');
  if (!card || !body) return;

  const plan = state.currentPlan;
  const show = plan && isRestPlan(plan) && !isViewingFuture();
  card.classList.toggle('hidden', !show);
  if (!show) return;

  const nextPlan = getFallbackPlan(tomorrowIso(getToday()));
  body.innerHTML = formatRecoveryTodayHtml({
    plan,
    nextPlan,
    nextLabel: summarizePlanSession(nextPlan),
  });
}

export function isCoachReadOnly() {
  return isViewingPast() && !coachEditMode;
}

export function applyCoachReadOnlyMode() {
  const root = document.getElementById('tab-coach');
  const bar = document.getElementById('coach-past-edit-bar');
  const label = bar?.querySelector('.coach-past-edit-label');
  const editBtn = document.getElementById('coach-past-edit-btn');
  const readonly = isCoachReadOnly();
  const past = isViewingPast();

  root?.classList.toggle('coach-readonly', readonly);
  /* Keep bar visible for all past dates — read-only vs editing copy (no new state). */
  bar?.classList.toggle('hidden', !past);
  bar?.classList.toggle('coach-past-edit-bar--readonly', past && !coachEditMode);
  bar?.classList.toggle('coach-past-edit-bar--editing', past && coachEditMode);

  if (past && label) {
    label.textContent = coachEditMode ? 'Editing past day' : 'Today view is read-only';
  }
  editBtn?.classList.toggle('hidden', !past || coachEditMode);

  const disable = readonly;
  root?.querySelectorAll('input, textarea, select, button').forEach((el) => {
    if (el.id === 'coach-past-edit-btn') return;
    if (el.closest('#coach-debrief-export-card')) return;
    if (el.classList.contains('card-collapse-btn')) return;
    if (el.classList.contains('date-nav-btn')) return;
    if (el.id === 'date-today-btn') return;
    if (disable) el.setAttribute('disabled', '');
    else el.removeAttribute('disabled');
  });

  root?.querySelectorAll('.remove-btn').forEach((btn) => {
    btn.classList.toggle('hidden', readonly);
  });
}

export function resetCoachEditModeForDate() {
  coachEditMode = !isViewingPast();
}

export function enableCoachEditMode() {
  coachEditMode = true;
  applyCoachReadOnlyMode();
  if (isTrainingRequired()) {
    setCardCollapsed('training-card', false);
  }
  updateSectionCompression();
}

export function layoutCoachScreen() {
  if (isViewingFuture()) {
    document.getElementById('recovery-card')?.classList.add('hidden');
    document.getElementById('coach-debrief-export-card')?.classList.add('hidden');
    return;
  }

  document.getElementById('coach-debrief-export-card')?.classList.remove('hidden');
  updateBlockContextChip();
  renderRecoveryCard();
  reorderCoachSections();
  updateSectionCompression();
  applyCoachReadOnlyMode();
  layoutCoachObservations();
}

export function setupCoachLayout() {
  document.getElementById('coach-past-edit-btn')?.addEventListener('click', () => {
    enableCoachEditMode();
    expandVitalsCard();
  });

  /*
    Vitals collapse is owned solely by today.js → setupVitals()
    (toggleVitalsCollapse + summary sync). Registering a second listener here
    on #vitals-collapse caused expand/collapse to cancel each other.
  */
  document.querySelectorAll('#coach-sections .card-collapse-btn').forEach((btn) => {
    if (btn.id === 'vitals-collapse') return;
    btn.addEventListener('click', () => {
      const card = btn.closest('.card');
      if (!card || card.id === 'vitals-card') return;
      const collapsed = card.classList.toggle('collapsed');
      btn.setAttribute('aria-expanded', String(!collapsed));
    });
  });
}
