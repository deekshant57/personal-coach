// Today tab — vitals, plan display, training log
import { state, getToday, isMonday, showToast, formatDate } from './app.js';
import {
  fetchVitals, upsertVitals,
  fetchRunLog, upsertRunLog,
  fetchWorkoutLog, upsertWorkoutLog,
  fetchFoodLogs, getLocalFoodLogs, isConfigured,
} from './supabase.js';
import { updateProteinBar } from './food.js';

// ── Init ─────────────────────────────────────────────────────
export function initToday() {
  setupVitals();
  setupTrainingLog();
  setupCollapsibles();
  setupNotesCard();

  // "Log Food →" button
  document.getElementById('go-to-food').addEventListener('click', () => {
    document.querySelector('.nav-tab[data-tab="food"]').click();
  });
}

// ── Load all data for current date ───────────────────────────
export async function loadTodayData() {
  await Promise.all([
    loadVitals(),
    loadTrainingLog(),
    loadMealsSummary(),
  ]);
  renderPlanCard();
  renderTrainingCard();
  loadNotes();

  // Monday waist field
  const waistRow = document.getElementById('waist-row');
  waistRow.classList.toggle('hidden', !isMonday(state.currentDate));
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
  const vitals = {
    weight_kg: parseFloat(document.getElementById('input-weight').value) || null,
    sleep_hours: parseFloat(document.getElementById('input-sleep').value) || null,
    cigarettes: parseInt(document.getElementById('input-cigs').value) ?? null,
    waist_inches: isMonday(state.currentDate) ? (parseFloat(document.getElementById('input-waist').value) || null) : null,
  };

  await upsertVitals(getToday(), vitals);
  state.vitals = vitals;
  collapseVitals(vitals);
  showToast('Vitals saved');
}

function collapseVitals(data) {
  const card = document.getElementById('vitals-card');
  const summary = document.getElementById('vitals-summary');
  const parts = [];
  if (data.weight_kg) parts.push(`${data.weight_kg} kg`);
  if (data.sleep_hours) parts.push(`${data.sleep_hours}h sleep`);
  if (data.cigarettes != null) parts.push(`${data.cigarettes} cigs`);
  if (data.waist_inches) parts.push(`${data.waist_inches}" waist`);
  summary.textContent = parts.join(' | ') || 'Not filled';
  card.classList.add('collapsed');
}

function expandVitals() {
  document.getElementById('vitals-card').classList.remove('collapsed');
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
    document.getElementById('plan-training-summary').textContent = '';
    document.getElementById('plan-warmup-content').textContent = '';
    document.getElementById('plan-meals-content').textContent = '';
    return;
  }

  document.getElementById('plan-directive').textContent = plan.directive || '';

  // Training summary
  let summary = '';
  if (plan.run_type) {
    summary = `${plan.run_type} ${plan.run_km} km @ ${plan.run_pace}`;
  } else if (plan.workout_plan) {
    summary = plan.workout_plan;
  } else {
    summary = 'Rest day';
  }
  document.getElementById('plan-training-summary').textContent = summary;

  // Warm-up / cool-down
  const warmup = plan.run_cue || plan.workout_detail || '';
  document.getElementById('plan-warmup-content').textContent = warmup;
  document.getElementById('plan-warmup-toggle').classList.toggle('hidden', !warmup);

  // Meals
  document.getElementById('plan-meals-content').textContent = plan.meals_plan || '';

  // Update protein target
  const target = plan.protein_target || 145;
  document.getElementById('protein-target').textContent = `/ ${target}g protein`;
}

// ── Training Log Card ────────────────────────────────────────
function setupTrainingLog() {
  const doneBtn = document.getElementById('training-done-btn');
  doneBtn.addEventListener('click', () => {
    doneBtn.classList.toggle('done');
    // Show fields when done
    const isDone = doneBtn.classList.contains('done');
    const plan = state.currentPlan;
    if (plan?.run_type) {
      document.getElementById('run-fields').classList.toggle('hidden', !isDone);
    } else if (plan?.workout_plan) {
      document.getElementById('workout-fields').classList.toggle('hidden', !isDone);
    }
  });

  // RPE sliders
  document.getElementById('input-run-rpe').addEventListener('input', (e) => {
    document.getElementById('run-rpe-value').textContent = e.target.value;
  });
  document.getElementById('input-workout-rpe').addEventListener('input', (e) => {
    document.getElementById('workout-rpe-value').textContent = e.target.value;
  });

  // Knee segmented control
  document.querySelectorAll('#knee-segmented .segment').forEach(seg => {
    seg.addEventListener('click', () => {
      document.querySelectorAll('#knee-segmented .segment').forEach(s => s.classList.remove('active'));
      seg.classList.add('active');
    });
  });

  // Save training
  document.getElementById('save-training').addEventListener('click', saveTraining);
}

function renderTrainingCard() {
  const plan = state.currentPlan;
  const card = document.getElementById('training-card');
  const runFields = document.getElementById('run-fields');
  const workoutFields = document.getElementById('workout-fields');
  const title = document.getElementById('training-title');

  runFields.classList.add('hidden');
  workoutFields.classList.add('hidden');

  if (!plan || (!plan.run_type && !plan.workout_plan)) {
    card.classList.add('hidden');
    return;
  }

  card.classList.remove('hidden');

  if (plan.run_type) {
    title.textContent = `Run Log — ${plan.run_type} ${plan.run_km} km`;
  } else {
    title.textContent = `Workout Log — ${plan.workout_plan}`;
  }
}

async function loadTrainingLog() {
  const plan = state.currentPlan;
  if (!plan) return;

  const doneBtn = document.getElementById('training-done-btn');

  if (plan.run_type) {
    const log = await fetchRunLog(getToday());
    state.runLog = log;
    if (log) {
      doneBtn.classList.toggle('done', log.done);
      if (log.done) document.getElementById('run-fields').classList.remove('hidden');
      document.getElementById('input-run-km').value = log.actual_km || '';
      document.getElementById('input-run-time').value = log.time_display || '';
      document.getElementById('input-run-pace').value = log.avg_pace || '';
      document.getElementById('input-run-cadence').value = log.cadence || '';
      document.getElementById('input-run-rpe').value = log.rpe || 5;
      document.getElementById('run-rpe-value').textContent = log.rpe || 5;
      if (log.knee_status) {
        document.querySelectorAll('#knee-segmented .segment').forEach(s => {
          s.classList.toggle('active', s.dataset.value === log.knee_status);
        });
      }
      document.getElementById('input-run-notes').value = log.notes || '';
    } else {
      doneBtn.classList.remove('done');
      resetRunFields();
    }
  } else if (plan.workout_plan) {
    const log = await fetchWorkoutLog(getToday());
    state.workoutLog = log;
    if (log) {
      doneBtn.classList.toggle('done', log.done);
      if (log.done) document.getElementById('workout-fields').classList.remove('hidden');
      document.getElementById('input-workout-what').value = log.what_i_did || '';
      document.getElementById('input-workout-rpe').value = log.rpe || 5;
      document.getElementById('workout-rpe-value').textContent = log.rpe || 5;
      document.getElementById('input-workout-notes').value = log.notes || '';
    } else {
      doneBtn.classList.remove('done');
      resetWorkoutFields();
    }
  }
}

function resetRunFields() {
  document.getElementById('input-run-km').value = '';
  document.getElementById('input-run-time').value = '';
  document.getElementById('input-run-pace').value = '';
  document.getElementById('input-run-cadence').value = '';
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

async function saveTraining() {
  const plan = state.currentPlan;
  const done = document.getElementById('training-done-btn').classList.contains('done');

  if (plan?.run_type) {
    const kneeEl = document.querySelector('#knee-segmented .segment.active');
    const log = {
      done,
      actual_km: parseFloat(document.getElementById('input-run-km').value) || null,
      time_display: document.getElementById('input-run-time').value || null,
      avg_pace: document.getElementById('input-run-pace').value || null,
      cadence: parseInt(document.getElementById('input-run-cadence').value) || null,
      rpe: parseInt(document.getElementById('input-run-rpe').value) || null,
      knee_status: kneeEl?.dataset.value || 'Pain-free',
      notes: document.getElementById('input-run-notes').value || null,
    };
    await upsertRunLog(getToday(), log);
    state.runLog = log;
    showToast('Run log saved');
  } else if (plan?.workout_plan) {
    const log = {
      done,
      what_i_did: document.getElementById('input-workout-what').value || null,
      rpe: parseInt(document.getElementById('input-workout-rpe').value) || null,
      notes: document.getElementById('input-workout-notes').value || null,
    };
    await upsertWorkoutLog(getToday(), log);
    state.workoutLog = log;
    showToast('Workout log saved');
  }
}

// ── Meals Summary ────────────────────────────────────────────
export async function loadMealsSummary() {
  const date = getToday();
  let logs;
  if (isConfigured()) {
    logs = await fetchFoodLogs(date);
  } else {
    logs = getLocalFoodLogs(date);
  }

  const list = document.getElementById('meals-summary-list');
  if (!logs || logs.length === 0) {
    list.innerHTML = '<span class="text-muted">No meals logged yet</span>';
    return;
  }

  let totalProtein = 0;
  let totalCalories = 0;
  let html = '';

  for (const log of logs) {
    const items = typeof log.items === 'string' ? JSON.parse(log.items) : (log.items || []);
    const protein = log.total_protein || items.reduce((s, i) => s + (i.protein || 0) * (i.qty || 1), 0);
    const slot = log.meal_slot;
    const names = items.map(i => `${i.qty}x ${i.name}`).join(', ');
    totalProtein += protein;
    totalCalories += log.total_calories || 0;

    html += `<div class="meal-summary-item">
      <span class="name">${slot}: ${names || log.custom_text || ''}</span>
      <span class="protein">${Math.round(protein)}g</span>
    </div>`;
  }

  list.innerHTML = html;

  // Update global food logs in state
  state.foodLogs = {};
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
}

// ── Notes Card ───────────────────────────────────────────────
function setupNotesCard() {
  document.getElementById('save-notes').addEventListener('click', async () => {
    const notes = document.getElementById('input-notes').value;
    // Save notes as part of vitals
    const current = state.vitals || {};
    await upsertVitals(getToday(), { ...current, notes });
    showToast('Notes saved');
  });
}

function loadNotes() {
  document.getElementById('input-notes').value = state.vitals?.notes || '';
}

// ── Collapsibles ─────────────────────────────────────────────
function setupCollapsibles() {
  document.querySelectorAll('.collapsible-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      const content = toggle.nextElementSibling;
      content.classList.toggle('open');
    });
  });
}
