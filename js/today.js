// Today tab — vitals, plan display, training log
import {
  extractWarmupCooldown,
  extractRunCues,
} from './plan-templates.js';
import { state, getToday, isMonday, isViewingFuture, isViewingPast, showToast, showConfirm, formatDate, getFallbackPlan } from './app.js';
import { SLOT_LABELS, formatFoodLabel } from './data.js';
import {
  macrosFromResolvedLog,
  analyzeDayFoodLogs,
  escapeHtml,
  needsMacroResolve,
  formatMealMacroLabel,
} from './food-macros.js';
import { autoResolveFoodLogsForDate } from './food-resolve.js';
import {
  fetchVitals, upsertVitals,
  fetchRunLog, upsertRunLog,
  fetchWorkoutLog, upsertWorkoutLog,
} from './supabase.js';
import { loadSupplements, initSupplements, resetSupplementsForFuture, refreshSupplementHints } from './supplements.js';
import { updateProteinBar, deleteMealSlot, fetchFoodLogsForDate, invalidateFoodLogsCache } from './food.js';
import { syncMeaningfulEvents } from './meaningful-events.js';
import { updateDayProgress } from './day-progress.js';
import { refreshDebriefIfActive } from './debrief.js';
import { invalidateWeekStatsCache } from './week-stats.js';
import { trackSave } from './save-state.js';
import {
  applyAutoPaceToForm,
  resetPaceAutoState,
  setupPaceManualTracking,
  setupRpeSlider,
  setRpeFromSaved,
  resetRpeSlider,
  readRpeFromSlider,
  updateCadenceHint,
  validateRunLogForDone,
} from './run-log.js';
import {
  formatRestDayPlanTitle,
  summarizePlanSession,
} from './block-context.js';
import {
  renderWorkoutExerciseList,
  setupWorkoutExerciseHandlers,
  collectWorkoutLogFromForm,
  workoutLogHasLoggedWork,
  workoutExercisesInteracted,
  validateWorkoutLogForDone,
  resetWorkoutExerciseList,
} from './workout-log.js';
import {
  scheduleAutosave,
  cancelAutosave,
  cancelAutosavesByPrefix,
  flushAutosave,
  registerAutosaveFlush,
  hasPendingAutosave,
} from './auto-save.js';
import { setButtonLoading } from './spinner.js';
import { collapseVitalsCard, expandVitalsCard } from './vitals-ui.js';
import {
  layoutCoachScreen,
  updateSectionCompression,
} from './coach-layout.js';

let trainingAutosaveSuspended = false;

function trainingAutosaveKey() {
  return `training:${getToday()}`;
}

function syncDayStatus() {
  invalidateWeekStatsCache();
  updateDayProgress();
  refreshDebriefIfActive();
  updateSectionCompression();
}

// ── Init ─────────────────────────────────────────────────────
export function initToday() {
  setupVitals();
  setupTrainingLog();
  setupTrainingAutosave();
  setupWorkoutExerciseHandlers(null, scheduleTrainingAutosave);
  setupCollapsibles();
  setupNotesCard();
  initSupplements();
  registerAutosaveFlush({ training: flushTrainingAutosave });

  // "Log Food →" button
  document.getElementById('go-to-food').addEventListener('click', () => {
    document.querySelector('.nav-tab[data-tab="food"]').click();
  });
}

// ── Load all data for current date ───────────────────────────
export async function loadTodayData() {
  const future = isViewingFuture();

  if (!future) {
    const results = await Promise.allSettled([
      loadVitals(),
      loadTrainingLog(),
      loadMealsSummary(),
      loadSupplements(),
    ]);
    for (const result of results) {
      if (result.status === 'rejected') {
        console.error('loadTodayData:', result.reason);
      }
    }
    loadNotes();
  } else {
    state.vitals = null;
    state.runLog = null;
    state.workoutLog = null;
    state.foodLogs = {};
    resetSupplementsForFuture();
    updateProteinBar(0, 0);
    updateMealsDayTotal(0, 0);
  }

  renderPlanCard();
  if (!future) {
    renderTrainingCard();
  } else {
    document.getElementById('training-card')?.classList.add('hidden');
  }

  // Monday waist field
  const waistRow = document.getElementById('waist-row');
  waistRow.classList.toggle('hidden', !isMonday(state.currentDate));

  syncDayStatus();
  layoutCoachScreen();

  if (!future) {
    syncMeaningfulEvents().catch((err) => console.error('syncMeaningfulEvents:', err));
  }
}

// ── Vitals ───────────────────────────────────────────────────
function setupVitals() {
  document.getElementById('save-vitals').addEventListener('click', saveVitals);
  document.getElementById('vitals-collapse').addEventListener('click', toggleVitalsCollapse);
}

async function loadVitals() {
  const data = await fetchVitals(getToday());
  state.vitals = data;
  if (data) {
    document.getElementById('input-weight').value = data.weight_kg || '';
    document.getElementById('input-sleep').value = data.sleep_hours || '';
    document.getElementById('input-cigs').value = data.cigarettes ?? '';
    document.getElementById('input-waist').value = data.waist_inches || '';

    // Auto-collapse if filled
    if (data.weight_kg || data.sleep_hours) {
      collapseVitals(data);
    }
  } else {
    document.getElementById('input-weight').value = '';
    document.getElementById('input-sleep').value = '';
    document.getElementById('input-cigs').value = '';
    document.getElementById('input-waist').value = '';
    expandVitals();
  }
}

async function saveVitals() {
  const btn = document.getElementById('save-vitals');
  if (btn.disabled) return;
  setButtonLoading(btn, true, 'Save Vitals');

  try {
    const vitals = {
      ...(state.vitals || {}),
      weight_kg: parseFloat(document.getElementById('input-weight').value) || null,
      sleep_hours: parseFloat(document.getElementById('input-sleep').value) || null,
      cigarettes: parseInt(document.getElementById('input-cigs').value) ?? null,
      waist_inches: isMonday(state.currentDate) ? (parseFloat(document.getElementById('input-waist').value) || null) : null,
    };

    const ok = await trackSave('vitals', 'Vitals', async () => {
      const saved = await upsertVitals(getToday(), vitals);
      if (!saved) return false;
      state.vitals = vitals;
      collapseVitals(vitals);
      syncDayStatus();
      return true;
    });
    if (!ok) return;
  } finally {
    setButtonLoading(btn, false, 'Save Vitals');
  }
}

function collapseVitals(data) {
  const summary = document.getElementById('vitals-summary');
  const parts = [];
  if (data.weight_kg) parts.push(`${data.weight_kg} kg`);
  if (data.sleep_hours) parts.push(`${data.sleep_hours}h sleep`);
  if (data.cigarettes != null) parts.push(`${data.cigarettes} cigs`);
  if (data.waist_inches) parts.push(`${data.waist_inches}" waist`);
  summary.textContent = parts.join(' | ') || 'Not filled';
  collapseVitalsCard();
}

function expandVitals() {
  expandVitalsCard();
}

function toggleVitalsCollapse() {
  const card = document.getElementById('vitals-card');
  if (card.classList.contains('collapsed')) {
    expandVitals();
  } else if (state.vitals) {
    collapseVitals(state.vitals);
  }
}

function tomorrowIso(dateIso) {
  const d = new Date(`${dateIso}T12:00:00`);
  d.setDate(d.getDate() + 1);
  return formatDate(d);
}

function isRestPlan(plan) {
  return plan && !plan.run_type && !plan.workout_plan;
}

function updateNotesPlaceholders(plan) {
  const notesEl = document.getElementById('input-notes');
  if (notesEl) {
    notesEl.placeholder = isRestPlan(plan)
      ? 'How are you recovering?'
      : 'How did the session feel?';
  }
  const runNotes = document.getElementById('input-run-notes');
  if (runNotes) {
    runNotes.placeholder = 'How did the session feel?';
  }
  const workoutNotes = document.getElementById('input-workout-notes');
  if (workoutNotes) {
    workoutNotes.placeholder = isRestPlan(plan)
      ? 'How are you recovering?'
      : 'Any issues or deviations?';
  }
}

// ── Plan Card ────────────────────────────────────────────────
function renderPlanCard() {
  const plan = state.currentPlan;
  const titleEl = document.getElementById('plan-card-title');
  if (!plan) {
    if (titleEl) titleEl.textContent = "Today's Plan";
    document.getElementById('plan-directive').textContent = 'No plan for this date';
    document.getElementById('plan-card')?.classList.remove('is-loading');
    document.getElementById('plan-training-summary').textContent = '';
    document.getElementById('plan-warmup-content').textContent = '';
    document.getElementById('plan-meals-content').textContent = '';
    return;
  }

  if (titleEl) {
    if (isRestPlan(plan)) {
      const nextPlan = getFallbackPlan(tomorrowIso(getToday()));
      titleEl.textContent = formatRestDayPlanTitle(summarizePlanSession(nextPlan));
    } else if (isViewingFuture()) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const viewing = new Date(state.currentDate);
      viewing.setHours(0, 0, 0, 0);
      tomorrow.setHours(0, 0, 0, 0);
      titleEl.textContent = viewing.getTime() === tomorrow.getTime() ? "Tomorrow's Plan" : 'Upcoming Plan';
    } else if (isViewingPast()) {
      titleEl.textContent = 'Plan';
    } else {
      titleEl.textContent = "Today's Plan";
    }
  }

  updateNotesPlaceholders(plan);

  document.getElementById('plan-directive').textContent = plan.directive || '';
  document.getElementById('plan-card')?.classList.remove('is-loading');

  // Training summary (+ run cues when separate from warm-up / cool-down)
  let summary = '';
  if (plan.run_type) {
    summary = `${plan.run_type} ${plan.run_km} km @ ${plan.run_pace}`;
    const cues = extractRunCues(plan.run_cue);
    if (cues) summary += `\n${cues}`;
  } else if (plan.workout_plan) {
    summary = plan.workout_plan;
  } else {
    summary = 'Rest day';
  }
  document.getElementById('plan-training-summary').textContent = summary;

  // Warm-up / cool-down (exercises only — not cadence cues or main workout sets)
  let warmup = '';
  if (plan.run_type && plan.run_cue) {
    warmup = extractWarmupCooldown(plan.run_cue);
  } else if (plan.workout_detail) {
    warmup = extractWarmupCooldown(plan.workout_detail);
  }
  const warmupToggle = document.getElementById('plan-warmup-toggle');
  const warmupContent = document.getElementById('plan-warmup-content');
  warmupContent.textContent = warmup;
  warmupToggle.classList.toggle('hidden', !warmup);
  const hasTraining = !!(plan.run_type || plan.workout_plan);
  if (hasTraining && warmup) {
    warmupToggle.classList.add('open');
    warmupContent.classList.add('open');
  } else if (!warmup) {
    warmupToggle.classList.remove('open');
    warmupContent.classList.remove('open');
  }

  // Meals
  document.getElementById('plan-meals-content').textContent = plan.meals_plan || '';
  const expandMeals = isViewingFuture() && !!plan.meals_plan;
  const mealsToggle = document.getElementById('plan-meals-toggle');
  const mealsContent = document.getElementById('plan-meals-content');
  mealsToggle.classList.toggle('open', expandMeals);
  mealsContent.classList.toggle('open', expandMeals);
  mealsToggle.classList.toggle('hidden', !plan.meals_plan);

  // Update protein target
  const target = plan.protein_target || 145;
  document.getElementById('protein-target').textContent = `/ ${target}g protein`;

  refreshSupplementHints();
  updateDayProgress();
  layoutCoachScreen();
}

function tryAutoPace() {
  if (applyAutoPaceToForm()) scheduleTrainingAutosave();
}

function runLogHasContent(log) {
  return log.actual_km != null
    || !!log.time_display
    || !!log.avg_pace
    || log.cadence != null
    || !!log.notes;
}

function workoutLogHasContent(log) {
  const fallback = document.getElementById('input-workout-what')?.value?.trim() || '';
  return workoutLogHasLoggedWork(log, { fallbackText: fallback }) || !!log?.notes;
}

function setDoneToggle(done) {
  const btn = document.getElementById('training-done-btn');
  btn.classList.toggle('done', done);
  const label = btn.querySelector('.toggle-circle')?.nextElementSibling;
  if (label) label.textContent = done ? 'Done' : 'Mark as Done';
}

function collectRunLogFromForm() {
  const kneeEl = document.querySelector('#knee-segmented .segment.active');
  return {
    done: document.getElementById('training-done-btn').classList.contains('done'),
    actual_km: parseFloat(document.getElementById('input-run-km').value) || null,
    time_display: document.getElementById('input-run-time').value || null,
    avg_pace: document.getElementById('input-run-pace').value || null,
    cadence: parseInt(document.getElementById('input-run-cadence').value, 10) || null,
    rpe: readRpeFromSlider('input-run-rpe'),
    knee_status: kneeEl?.dataset.value || 'Pain-free',
    notes: document.getElementById('input-run-notes').value || null,
  };
}


async function persistTraining({ silent = true } = {}) {
  const plan = state.currentPlan;
  if (!plan || isViewingFuture() || trainingAutosaveSuspended) return true;
  if (!plan.run_type && !plan.workout_plan) return true;

  if (plan.run_type) {
    const log = collectRunLogFromForm();
    const hasContent = runLogHasContent(log) || state.runLog;
    if (!hasContent) return true;

    return trackSave(trainingAutosaveKey(), 'Training', async () => {
      const ok = await upsertRunLog(getToday(), log);
      if (!ok) return false;
      state.runLog = log;
      syncDayStatus();
      return true;
    }, { toastOnSuccess: !silent });
  }

  const log = collectWorkoutLogFromForm();
  const hasContent = workoutLogHasContent(log) || state.workoutLog || workoutExercisesInteracted();
  if (!hasContent) return true;

  return trackSave(trainingAutosaveKey(), 'Training', async () => {
    const ok = await upsertWorkoutLog(getToday(), log);
    if (!ok) return false;
    state.workoutLog = log;
    syncDayStatus();
    return true;
  }, { toastOnSuccess: !silent });
}

function scheduleTrainingAutosave() {
  if (isViewingFuture() || trainingAutosaveSuspended) return;
  const plan = state.currentPlan;
  if (!plan?.run_type && !plan?.workout_plan) return;

  scheduleAutosave(trainingAutosaveKey(), async () => {
    await persistTraining({ silent: true });
  });
}

export async function flushTrainingAutosave() {
  const key = trainingAutosaveKey();
  if (hasPendingAutosave(key)) {
    await flushAutosave(key);
    return;
  }
  await persistTraining({ silent: true });
}

function setupTrainingAutosave() {
  const runIds = [
    'input-run-km', 'input-run-time', 'input-run-pace', 'input-run-cadence',
    'input-run-rpe', 'input-run-notes',
  ];
  const workoutIds = ['input-workout-what', 'input-workout-rpe', 'input-workout-notes'];

  [...runIds, ...workoutIds].forEach((id) => {
    const el = document.getElementById(id);
    el?.addEventListener('input', scheduleTrainingAutosave);
    el?.addEventListener('change', scheduleTrainingAutosave);
  });
}

function setupTrainingLog() {
  document.getElementById('training-done-btn').addEventListener('click', () => {
    const btn = document.getElementById('training-done-btn');
    const wasDone = btn.classList.contains('done');

    if (!wasDone && state.currentPlan?.workout_plan) {
      const log = { ...collectWorkoutLogFromForm(), done: true };
      const { valid, errors } = validateWorkoutLogForDone(log);
      if (!valid) {
        showToast(errors[0], { variant: 'error' });
        document.getElementById('training-card')?.scrollIntoView({ behavior: 'auto', block: 'start' });
        return;
      }
    }

    if (!wasDone && state.currentPlan?.run_type) {
      tryAutoPace();
      const log = { ...collectRunLogFromForm(), done: true };
      const { valid, errors, warnings } = validateRunLogForDone(log);
      if (!valid) {
        showToast(errors[0], { variant: 'error' });
        document.getElementById('training-card')?.scrollIntoView({ behavior: 'auto', block: 'start' });
        return;
      }
      if (warnings.length) showToast(warnings[0]);
    }

    btn.classList.toggle('done');
    scheduleTrainingAutosave();
    syncDayStatus();
  });

  setupRpeSlider('input-run-rpe', 'run-rpe-value', scheduleTrainingAutosave);
  setupRpeSlider('input-workout-rpe', 'workout-rpe-value', scheduleTrainingAutosave);
  setupPaceManualTracking();
  document.getElementById('input-run-time').addEventListener('blur', tryAutoPace);
  document.getElementById('input-run-km').addEventListener('blur', tryAutoPace);
  document.getElementById('input-run-time').addEventListener('input', tryAutoPace);
  document.getElementById('input-run-km').addEventListener('input', tryAutoPace);
  document.getElementById('input-run-cadence')?.addEventListener('input', (e) => {
    updateCadenceHint(e.target.value);
  });

  document.querySelectorAll('#knee-segmented .segment').forEach(seg => {
    seg.addEventListener('click', () => {
      document.querySelectorAll('#knee-segmented .segment').forEach(s => s.classList.remove('active'));
      seg.classList.add('active');
      scheduleTrainingAutosave();
    });
  });
}

function renderTrainingCard() {
  const plan = state.currentPlan;
  const card = document.getElementById('training-card');
  const runFields = document.getElementById('run-fields');
  const workoutFields = document.getElementById('workout-fields');
  const title = document.getElementById('training-title');

  if (!plan || (!plan.run_type && !plan.workout_plan)) {
    card.classList.add('hidden');
    return;
  }

  card.classList.remove('hidden');
  const isRun = !!plan.run_type;

  runFields.classList.toggle('hidden', !isRun);
  workoutFields.classList.toggle('hidden', isRun);

  if (isRun) {
    title.textContent = `Run Log — ${plan.run_type} ${plan.run_km} km`;
    document.getElementById('run-planned-hint').textContent =
      `Planned: ${plan.run_type} ${plan.run_km} km @ ${plan.run_pace || '—'}`;
  } else {
    title.textContent = `Workout Log — ${plan.workout_plan}`;
    document.getElementById('workout-planned-hint').textContent =
      `Planned: ${plan.workout_plan}`;
    renderWorkoutExerciseList(plan, state.workoutLog);

    // Restore saved workout form state
    const log = state.workoutLog;
    if (log) {
      setDoneToggle(log.done);
      setRpeFromSaved('input-workout-rpe', 'workout-rpe-value', log.rpe);
      document.getElementById('input-workout-notes').value = log.notes || '';
      const fallback = document.getElementById('workout-fallback-details');
      if (!log.exercises_json && log.what_i_did) {
        fallback?.setAttribute('open', '');
        document.getElementById('input-workout-what').value = log.what_i_did;
      } else {
        fallback?.removeAttribute('open');
        document.getElementById('input-workout-what').value = '';
      }
    } else if (!isViewingFuture()) {
      setDoneToggle(false);
      resetWorkoutFields();
    }
  }
}

async function loadTrainingLog() {
  const plan = state.currentPlan;
  if (!plan) return;

  cancelAutosavesByPrefix(`training:${getToday()}`);
  trainingAutosaveSuspended = true;

  try {
    if (plan.run_type) {
      const log = await fetchRunLog(getToday());
      state.runLog = log;
      if (log) {
        setDoneToggle(log.done);
        resetPaceAutoState();
        document.getElementById('input-run-km').value = log.actual_km ?? '';
        document.getElementById('input-run-time').value = log.time_display || '';
        document.getElementById('input-run-pace').value = log.avg_pace || '';
        document.getElementById('input-run-cadence').value = log.cadence ?? '';
        updateCadenceHint(log.cadence);
        setRpeFromSaved('input-run-rpe', 'run-rpe-value', log.rpe);
        if (log.knee_status) {
          document.querySelectorAll('#knee-segmented .segment').forEach(s => {
            s.classList.toggle('active', s.dataset.value === log.knee_status);
          });
        }
        document.getElementById('input-run-notes').value = log.notes || '';
      } else {
        setDoneToggle(false);
        resetRunFields();
      }
    } else if (plan.workout_plan) {
      const log = await fetchWorkoutLog(getToday());
      state.workoutLog = log;
      const listEl = document.getElementById('workout-exercise-list');
      if (listEl) listEl._userInteracted = false;
    }
  } finally {
    trainingAutosaveSuspended = false;
  }
}

function resetRunFields() {
  resetPaceAutoState();
  document.getElementById('input-run-km').value = '';
  document.getElementById('input-run-time').value = '';
  document.getElementById('input-run-pace').value = '';
  document.getElementById('input-run-cadence').value = '';
  updateCadenceHint('');
  resetRpeSlider('input-run-rpe', 'run-rpe-value');
  document.getElementById('input-run-notes').value = '';
  document.querySelectorAll('#knee-segmented .segment').forEach((s, i) => {
    s.classList.toggle('active', i === 0);
  });
}

function resetWorkoutFields() {
  document.getElementById('input-workout-what').value = '';
  resetRpeSlider('input-workout-rpe', 'workout-rpe-value');
  document.getElementById('input-workout-notes').value = '';
  document.getElementById('workout-fallback-details')?.removeAttribute('open');
  if (state.currentPlan?.workout_plan) {
    resetWorkoutExerciseList(state.currentPlan);
  }
}

// ── Meals Summary ────────────────────────────────────────────
function renderMealsCoachAlerts(issues) {
  const root = document.getElementById('meals-coach-alerts');
  if (!root) return;
  if (!issues?.length) {
    root.classList.add('hidden');
    root.innerHTML = '';
    return;
  }
  root.classList.remove('hidden');
  root.innerHTML = issues.map((issue) => `
    <div class="coach-alert coach-alert--${issue.type === 'notes-only' ? 'warn' : 'action'}">
      <span>${escapeHtml(issue.message)}</span>
    </div>
  `).join('');
}

function updateMealsDayTotal(protein, calories) {
  const row = document.getElementById('meals-day-total');
  const macros = document.getElementById('meals-day-total-macros');
  if (!row || !macros) return;

  if (!protein && !calories) {
    row.classList.add('hidden');
    return;
  }

  row.classList.remove('hidden');
  macros.textContent = `${Math.round(protein)}g P · ~${Math.round(calories).toLocaleString()} kcal`;
}

export async function loadMealsSummary() {
  const date = getToday();
  let logs = await fetchFoodLogsForDate(date, { force: true });

  const { logs: resolvedLogs, patchedSlots, resolvedCount } = await autoResolveFoodLogsForDate(date, logs);
  if (patchedSlots.length) {
    invalidateFoodLogsCache();
    logs = resolvedLogs;
    if (resolvedCount > 0) {
      showToast(`Filled macros for ${resolvedCount} custom food${resolvedCount === 1 ? '' : 's'}`, { variant: 'saved' });
    }
  } else {
    logs = resolvedLogs;
  }

  state.foodIssues = analyzeDayFoodLogs(logs, SLOT_LABELS);
  renderMealsCoachAlerts(state.foodIssues);

  const list = document.getElementById('meals-summary-list');
  state.foodLogs = {};

  if (!logs || logs.length === 0) {
    state.foodIssues = [];
    renderMealsCoachAlerts([]);
    list.innerHTML = '<span class="text-muted">No meals logged yet</span>';
    updateProteinBar(0, 0);
    updateMealsDayTotal(0, 0);
    syncDayStatus();
    return;
  }

  let totalProtein = 0;
  let totalCalories = 0;
  let html = '';

  for (const log of logs) {
    const { items, protein, calories } = macrosFromResolvedLog(log);
    const slot = log.meal_slot;
    const label = SLOT_LABELS[slot] || slot;
    const names = items.map((i) => formatFoodLabel(i, i.qty || 1)).join(', ');
    const noteText = (log.custom_text || '').trim();
    const hasUnresolved = items.some(needsMacroResolve);
    totalProtein += protein;
    totalCalories += calories;

    const macroLabel = formatMealMacroLabel(protein, calories, items);

    html += `<div class="meal-summary-item${hasUnresolved ? ' meal-summary-item--warn' : ''}">
      <div class="meal-summary-item-main">
        <span class="name">${label}: ${escapeHtml(names || noteText || '—')}</span>
        ${names && noteText ? `<span class="meal-slot-notes">${escapeHtml(noteText)}</span>` : ''}
      </div>
      <span class="protein">${macroLabel}</span>
      <button class="remove-btn" data-slot="${slot}" aria-label="Remove ${slot}">&times;</button>
    </div>`;
  }

  list.innerHTML = html;

  // Wire up delete buttons
  list.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const slot = e.currentTarget.dataset.slot;
      const label = SLOT_LABELS[slot] || slot;
      const ok = await showConfirm(`Remove ${label} from today's log?`, {
        title: 'Remove meal',
        okLabel: 'Remove',
        danger: true,
      });
      if (!ok) return;
      await deleteMealSlot(slot);
      showToast(`${label} removed`);
      await loadMealsSummary();
    });
  });

  // Update global food logs in state
  for (const log of logs) {
    const { items, protein, calories } = macrosFromResolvedLog(log);
    state.foodLogs[log.meal_slot] = {
      items,
      customText: log.custom_text,
      totalProtein: protein,
      totalCalories: calories,
    };
  }

  updateProteinBar(totalProtein, totalCalories);
  updateMealsDayTotal(totalProtein, totalCalories);
  syncDayStatus();
}

// ── Notes Card ───────────────────────────────────────────────
function setupNotesCard() {
  document.getElementById('save-notes').addEventListener('click', async () => {
    const btn = document.getElementById('save-notes');
    if (btn.disabled) return;
    setButtonLoading(btn, true, 'Save Notes');

    try {
      const notes = document.getElementById('input-notes').value;
      const current = state.vitals || {};
      const merged = { ...current, notes };
      await trackSave('notes', 'Notes', async () => {
        const ok = await upsertVitals(getToday(), merged);
        if (!ok) return false;
        state.vitals = merged;
        syncDayStatus();
        return true;
      });
    } finally {
      setButtonLoading(btn, false, 'Save Notes');
    }
  });
}

function loadNotes() {
  document.getElementById('input-notes').value = state.vitals?.notes || '';
}

// ── Collapsibles ─────────────────────────────────────────────
function setupCollapsibles() {
  document.querySelectorAll('.collapsible-toggle:not(#scan-form-toggle)').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const content = toggle.nextElementSibling;
      if (!content?.classList.contains('collapsible-content')) return;
      toggle.classList.toggle('open');
      content.classList.toggle('open');
    });
  });
}
