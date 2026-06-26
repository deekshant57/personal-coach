// Today tab — vitals, plan display, training log
import {
  extractWarmupCooldown,
  extractRunCues,
} from './plan-templates.js';
import { state, getToday, isMonday, isViewingFuture, showToast, formatDate } from './app.js';
import { SLOT_LABELS, formatFoodLabel } from './data.js';
import {
  fetchVitals, upsertVitals,
  fetchRunLog, upsertRunLog,
  fetchWorkoutLog, upsertWorkoutLog,
  fetchFoodLogs,
} from './supabase.js';
import { loadSupplements, initSupplements, resetSupplementsForFuture } from './supplements.js';
import { updateProteinBar, deleteMealSlot } from './food.js';
import { updateDayProgress } from './day-progress.js';
import { refreshDebriefIfActive } from './debrief.js';
import { invalidateWeekStatsCache } from './week-stats.js';
import { trackSave } from './save-state.js';
import {
  applyAutoPaceToForm,
  updateCadenceHint,
  validateRunLogForDone,
} from './run-log.js';
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

let trainingAutosaveSuspended = false;

function trainingAutosaveKey() {
  return `training:${getToday()}`;
}

function syncDayStatus() {
  invalidateWeekStatsCache();
  updateDayProgress();
  refreshDebriefIfActive();
}

// ── Init ─────────────────────────────────────────────────────
export function initToday() {
  setupVitals();
  setupTrainingLog();
  setupTrainingAutosave();
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
    await Promise.all([
      loadVitals(),
      loadTrainingLog(),
      loadMealsSummary(),
      loadSupplements(),
    ]);
    loadNotes();
  } else {
    state.vitals = null;
    state.runLog = null;
    state.workoutLog = null;
    state.foodLogs = {};
    resetSupplementsForFuture();
    updateProteinBar(0);
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

// ── Plan Card ────────────────────────────────────────────────
function renderPlanCard() {
  const plan = state.currentPlan;
  if (!plan) {
    document.getElementById('plan-directive').textContent = 'No plan for this date';
    document.getElementById('plan-card')?.classList.remove('is-loading');
    document.getElementById('plan-training-summary').textContent = '';
    document.getElementById('plan-warmup-content').textContent = '';
    document.getElementById('plan-meals-content').textContent = '';
    return;
  }

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
  if (!warmup) {
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
  return !!log.what_i_did || !!log.notes;
}

function setDoneToggle(done) {
  document.getElementById('training-done-btn').classList.toggle('done', done);
}

function collectRunLogFromForm() {
  const kneeEl = document.querySelector('#knee-segmented .segment.active');
  return {
    done: document.getElementById('training-done-btn').classList.contains('done'),
    actual_km: parseFloat(document.getElementById('input-run-km').value) || null,
    time_display: document.getElementById('input-run-time').value || null,
    avg_pace: document.getElementById('input-run-pace').value || null,
    cadence: parseInt(document.getElementById('input-run-cadence').value, 10) || null,
    rpe: parseInt(document.getElementById('input-run-rpe').value, 10) || null,
    knee_status: kneeEl?.dataset.value || 'Pain-free',
    notes: document.getElementById('input-run-notes').value || null,
  };
}

function collectWorkoutLogFromForm() {
  return {
    done: document.getElementById('training-done-btn').classList.contains('done'),
    what_i_did: document.getElementById('input-workout-what').value || null,
    rpe: parseInt(document.getElementById('input-workout-rpe').value, 10) || null,
    notes: document.getElementById('input-workout-notes').value || null,
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
  const hasContent = workoutLogHasContent(log) || state.workoutLog;
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

    if (!wasDone && state.currentPlan?.run_type) {
      tryAutoPace();
      const log = { ...collectRunLogFromForm(), done: true };
      const { valid, errors, warnings } = validateRunLogForDone(log);
      if (!valid) {
        showToast(errors[0], { variant: 'error' });
        document.getElementById('training-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      if (warnings.length) showToast(warnings[0]);
    }

    btn.classList.toggle('done');
    scheduleTrainingAutosave();
    syncDayStatus();
  });

  document.getElementById('input-run-rpe').addEventListener('input', (e) => {
    document.getElementById('run-rpe-value').textContent = e.target.value;
  });
  document.getElementById('input-workout-rpe').addEventListener('input', (e) => {
    document.getElementById('workout-rpe-value').textContent = e.target.value;
  });
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
        document.getElementById('input-run-km').value = log.actual_km ?? '';
        document.getElementById('input-run-time').value = log.time_display || '';
        document.getElementById('input-run-pace').value = log.avg_pace || '';
        document.getElementById('input-run-cadence').value = log.cadence ?? '';
        updateCadenceHint(log.cadence);
        document.getElementById('input-run-rpe').value = log.rpe || 5;
        document.getElementById('run-rpe-value').textContent = log.rpe || 5;
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
      if (log) {
        setDoneToggle(log.done);
        document.getElementById('input-workout-what').value = log.what_i_did || '';
        document.getElementById('input-workout-rpe').value = log.rpe || 5;
        document.getElementById('workout-rpe-value').textContent = log.rpe || 5;
        document.getElementById('input-workout-notes').value = log.notes || '';
      } else {
        setDoneToggle(false);
        resetWorkoutFields();
      }
    }
  } finally {
    trainingAutosaveSuspended = false;
  }
}

function resetRunFields() {
  document.getElementById('input-run-km').value = '';
  document.getElementById('input-run-time').value = '';
  document.getElementById('input-run-pace').value = '';
  document.getElementById('input-run-cadence').value = '';
  updateCadenceHint('');
  document.getElementById('input-run-rpe').value = 5;
  document.getElementById('run-rpe-value').textContent = '5';
  document.getElementById('input-run-notes').value = '';
  document.querySelectorAll('#knee-segmented .segment').forEach((s, i) => {
    s.classList.toggle('active', i === 0);
  });
}

function resetWorkoutFields() {
  document.getElementById('input-workout-what').value = '';
  document.getElementById('input-workout-rpe').value = 5;
  document.getElementById('workout-rpe-value').textContent = '5';
  document.getElementById('input-workout-notes').value = '';
}

// ── Meals Summary ────────────────────────────────────────────
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
  const logs = await fetchFoodLogs(date);

  const list = document.getElementById('meals-summary-list');
  state.foodLogs = {};

  if (!logs || logs.length === 0) {
    list.innerHTML = '<span class="text-muted">No meals logged yet</span>';
    updateProteinBar(0);
    updateMealsDayTotal(0, 0);
    syncDayStatus();
    return;
  }

  let totalProtein = 0;
  let totalCalories = 0;
  let html = '';

  for (const log of logs) {
    const items = typeof log.items === 'string' ? JSON.parse(log.items) : (log.items || []);
    const protein = log.total_protein || items.reduce((s, i) => s + (i.protein || 0) * (i.qty || 1), 0);
    const slot = log.meal_slot;
    const label = SLOT_LABELS[slot] || slot;
    const names = items.map(i => formatFoodLabel(i, i.qty || 1)).join(', ');
    totalProtein += protein;
    totalCalories += log.total_calories || 0;

    html += `<div class="meal-summary-item">
      <span class="name">${label}: ${names || log.custom_text || ''}</span>
      <span class="protein">${Math.round(protein)}g</span>
      <button class="remove-btn" data-slot="${slot}" aria-label="Remove ${slot}">&times;</button>
    </div>`;
  }

  list.innerHTML = html;

  // Wire up delete buttons
  list.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const slot = e.currentTarget.dataset.slot;
      await deleteMealSlot(slot);
      showToast(`${slot} removed`);
      await loadMealsSummary();
    });
  });

  // Update global food logs in state
  for (const log of logs) {
    const items = typeof log.items === 'string' ? JSON.parse(log.items) : (log.items || []);
    state.foodLogs[log.meal_slot] = {
      items,
      customText: log.custom_text,
      totalProtein: log.total_protein || 0,
      totalCalories: log.total_calories || 0,
    };
  }

  updateProteinBar(totalProtein);
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
      toggle.classList.add('collapsible-animate');
      content.classList.add('collapsible-animate');
      toggle.classList.toggle('open');
      content.classList.toggle('open');
    });
  });
}
