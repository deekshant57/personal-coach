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
import { collapseVitalsCard, expandVitalsCard } from './vitals-ui.js';
import { layoutCoachObservations } from './observation-coach.js';

let coachEditMode = false;

const SECTION_BASE = {
  vitals: 10,
  training: 20,
  meals: 30,
  supplements: 40,
  plan: 50,
  recovery: 45,
  notes: 60,
  debrief: 70,
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

function sectionPending(section) {
  switch (section) {
    case 'vitals':
      return !isVitalsComplete();
    case 'training':
      return isTrainingRequired() && !isTrainingComplete();
    case 'meals': {
      const meals = computeDayProgress().tasks.find((t) => t.id === 'meals');
      return meals ? !meals.done : false;
    }
    case 'supplements':
      return !isSupplementsComplete();
    default:
      return false;
  }
}

function sectionSortKey(section) {
  const pending = sectionPending(section);
  const base = SECTION_BASE[section] ?? 99;
  return (pending ? 0 : 1000) + base;
}

export function reorderCoachSections() {
  const root = document.getElementById('coach-sections');
  if (!root) return;

  const cards = [...root.querySelectorAll('[data-coach-section]')];
  cards.sort((a, b) => {
    const sa = sectionSortKey(a.dataset.coachSection);
    const sb = sectionSortKey(b.dataset.coachSection);
    return sa - sb;
  });

  for (const card of cards) {
    root.appendChild(card);
  }
}

export function updateBlockContextChip() {
  const chip = document.getElementById('block-context-chip');
  if (!chip) return;
  chip.textContent = formatBlockChip(new Date(getToday() + 'T12:00:00'));
  chip.classList.toggle('hidden', isViewingFuture());
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

function setCardCollapsed(cardId, collapsed, { summary = '' } = {}) {
  const card = document.getElementById(cardId);
  if (!card) return;
  const summaryEl = card.querySelector('.card-summary-inline');
  if (summaryEl && summary) summaryEl.textContent = summary;
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

  if (isVitalsComplete()) {
    setCardCollapsed('vitals-card', true);
  }

  if (isTrainingRequired()) {
    const done = isTrainingComplete();
    setCardCollapsed('training-card', done, { summary: formatTrainingSummary() });
  }

  const mealsTask = computeDayProgress().tasks.find((t) => t.id === 'meals');
  if (mealsTask?.done) {
    const totalP = Object.values(state.foodLogs || {}).reduce((s, f) => s + (f.totalProtein || 0), 0);
    setCardCollapsed('meals-summary-card', true, {
      summary: `${mealsTask.label} · ${Math.round(totalP)}g P`,
    });
  } else {
    setCardCollapsed('meals-summary-card', false);
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
    setCardCollapsed('notes-card', false);
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
  const readonly = isCoachReadOnly();

  root?.classList.toggle('coach-readonly', readonly);
  bar?.classList.toggle('hidden', !isViewingPast() || coachEditMode);

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

  document.querySelectorAll('#coach-sections .card-collapse-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.card');
      if (!card) return;
      const collapsed = card.classList.toggle('collapsed');
      btn.setAttribute('aria-expanded', String(!collapsed));
      if (card.id === 'vitals-card' && !collapsed) {
        expandVitalsCard();
      } else if (card.id === 'vitals-card') {
        collapseVitalsCard();
      }
    });
  });
}
