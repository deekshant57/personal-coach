// Day progress strip — P1: what's left for the selected date (saved data only)
import { state, getCurrentMealSlots, isViewingFuture, isViewingPast, isMonday, getToday } from './app.js';
import { isRunLogComplete } from './run-log.js';
import { isWorkoutLogComplete } from './workout-log.js';
import {
  getSupplementTasks,
} from './supplements-data.js';
import { expandVitalsCard } from './vitals-ui.js';
import { focusFoodSlot } from './food.js';
import { scrollToDebriefExport } from './debrief.js';
import { getAthleteProfile } from './athlete-profile.js';

function isVitalsComplete() {
  const v = state.vitals;
  if (!v) return false;
  // Morning weigh-in is the primary vital; sleep alone is not "done".
  return v.weight_kg != null;
}

function isTrainingRequired() {
  const plan = state.currentPlan;
  return !!(plan?.run_type || plan?.workout_plan);
}

function isTrainingComplete() {
  const plan = state.currentPlan;
  if (plan?.run_type) {
    return isRunLogComplete(state.runLog);
  }
  if (plan.workout_plan) return isWorkoutLogComplete(state.workoutLog);
  return false;
}

function getMealProgress() {
  const slots = getCurrentMealSlots();
  let filled = 0;
  for (const slot of slots) {
    const data = state.foodLogs[slot];
    if (!data) continue;
    const items = data.items || [];
    const text = (data.customText || '').trim();
    if (items.length > 0 || text) filled++;
  }
  return {
    filled,
    total: slots.length,
    complete: slots.length > 0 && filled >= slots.length,
  };
}

function getSupplementProgressTasks() {
  if (!getAthleteProfile().showSupplementsCard) return [];
  const dateIso = state.currentDate || getToday();
  return getSupplementTasks(state.currentPlan, state.supplementLog, dateIso);
}

function formatSupplementChipLabel(task) {
  if (task.done) return task.label;
  return `${task.label} · ${task.hint}`;
}

export function focusSupplementToggle(focusKey) {
  document.querySelector('.nav-tab[data-tab="coach"]')?.click();

  requestAnimationFrame(() => {
    const card = document.getElementById('supplements-card');
    card?.scrollIntoView({ behavior: 'auto', block: 'start' });

    const btnId = focusKey === 'uprise_d3_60k' ? 'supp-d3' : `supp-${focusKey}`;
    const btn = document.getElementById(btnId);
    if (!btn) return;

    btn.classList.add('supp-focus-pulse');
    btn.focus({ preventScroll: true });
    window.setTimeout(() => btn.classList.remove('supp-focus-pulse'), 2000);
  });
}

export function computeDayProgress() {
  const tasks = [
    { id: 'vitals', label: 'Vitals', done: isVitalsComplete(), action: 'vitals' },
  ];

  if (isTrainingRequired()) {
    const label = state.currentPlan.run_type ? 'Run' : 'Workout';
    const done = isTrainingComplete();
    tasks.push({
      id: 'training',
      label: state.currentPlan.run_type && state.runLog?.done && !done ? 'Run (incomplete)' :
        (state.currentPlan.workout_plan && state.workoutLog?.done && !done ? 'Workout (incomplete)' : label),
      done,
      action: 'training',
    });
  }

  const meals = getMealProgress();
  tasks.push({
    id: 'meals',
    label: meals.complete ? 'Meals' : `Meals ${meals.filled}/${meals.total}`,
    done: meals.complete,
    action: 'meals',
  });

  for (const suppTask of getSupplementProgressTasks()) {
    tasks.push({
      id: suppTask.id,
      label: formatSupplementChipLabel(suppTask),
      done: suppTask.done,
      action: 'supplements',
      focusKey: suppTask.focusKey,
    });
  }

  const doneCount = tasks.filter((t) => t.done).length;
  return {
    tasks,
    doneCount,
    totalCount: tasks.length,
    allDone: doneCount === tasks.length,
  };
}

/** Debrief gate — same rules as day progress; Monday also requires waist (S2). */
export function computeDebriefReadiness() {
  const tasks = computeDayProgress().tasks.map((t) => ({ ...t }));

  if (isMonday(state.currentDate)) {
    const vitals = tasks.find((t) => t.id === 'vitals');
    if (vitals) {
      vitals.label = 'Vitals (+ waist)';
      if (vitals.done && state.vitals?.waist_inches == null) {
        vitals.done = false;
      }
    }
  }

  const doneCount = tasks.filter((t) => t.done).length;
  return {
    tasks,
    doneCount,
    totalCount: tasks.length,
    ready: doneCount === tasks.length,
  };
}

function computeCoachNext() {
  if (isViewingFuture()) return null;

  const readiness = computeDebriefReadiness();
  if (readiness.ready) {
    return {
      text: isViewingPast()
        ? 'All sections recorded — open day log'
        : 'All logged — copy day log for coach review',
      action: 'debrief',
    };
  }

  const foodIssues = state.foodIssues || [];
  if (foodIssues.length) {
    const issue = foodIssues[0];
    return {
      text: issue.message,
      action: 'meals',
      focusSlot: issue.slot,
    };
  }

  const next = readiness.tasks.find((t) => !t.done);
  if (!next) return null;

  /* Past dates: navigational, not "complete today's tasks". Today keeps action copy. */
  const past = isViewingPast();
  const hints = past
    ? {
      vitals: 'Open vitals',
      training: next.label === 'Run' || next.label === 'Workout'
        ? `Open ${next.label.toLowerCase()}`
        : `Open ${next.label.toLowerCase()}`,
      meals: 'Open meals',
      supplements: 'Open supplements',
    }
    : {
      vitals: 'Log morning weight and sleep first',
      training: next.label === 'Run' || next.label === 'Workout'
        ? `Log ${next.label.toLowerCase()} — km, pace, RPE, knee`
        : `${next.label} — finish required fields before marking done`,
      meals: 'Log each meal slot on the Food tab',
      supplements: 'Toggle supplements taken today',
    };

  return {
    text: hints[next.id] || (past ? `Open ${next.label}` : `Complete: ${next.label}`),
    action: next.action,
    focusKey: next.focusKey,
    focusSlot: next.focusSlot,
  };
}

function navigateToTask(action, focusKey, focusSlot) {
  if (action === 'meals') {
    focusFoodSlot(focusSlot || null);
    return;
  }

  if (action === 'debrief') {
    document.querySelector('.nav-tab[data-tab="coach"]')?.click();
    requestAnimationFrame(() => scrollToDebriefExport());
    return;
  }

  if (action === 'supplements' && focusKey) {
    focusSupplementToggle(focusKey);
    return;
  }

  document.querySelector('.nav-tab[data-tab="coach"]')?.click();

  requestAnimationFrame(() => {
    if (action === 'vitals') {
      expandVitalsCard();
      document.getElementById('vitals-card')?.scrollIntoView({ behavior: 'auto', block: 'start' });
    } else if (action === 'training') {
      document.getElementById('training-card')?.scrollIntoView({ behavior: 'auto', block: 'start' });
    } else if (action === 'supplements') {
      document.getElementById('supplements-card')?.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  });
}

function renderCoachNext() {
  const root = document.getElementById('coach-next');
  const textEl = document.getElementById('coach-next-text');
  const labelEl = root?.querySelector('.coach-next-label');
  const btn = document.getElementById('coach-next-btn');
  if (!root || !textEl || !btn) return;

  const next = computeCoachNext();
  if (!next) {
    root.classList.add('hidden');
    return;
  }

  const observationEl = document.getElementById('coach-observation-block');
  const hasObservation = observationEl
    && !observationEl.classList.contains('hidden')
    && observationEl.textContent.trim();
  if (hasObservation && next.action !== 'debrief') {
    root.classList.add('hidden');
    return;
  }

  root.classList.remove('hidden');
  if (labelEl) {
    labelEl.textContent = isViewingPast() ? 'On this day' : 'Next step';
  }
  textEl.textContent = next.text;
  btn.dataset.action = next.action;
  btn.dataset.focusKey = next.focusKey || '';
  btn.dataset.focusSlot = next.focusSlot || '';
}

export function updateDayProgress() {
  const root = document.getElementById('day-progress');
  const summaryEl = document.getElementById('day-progress-summary');
  const chipsEl = document.getElementById('day-progress-chips');
  if (!root || !summaryEl || !chipsEl) return;

  if (isViewingFuture()) {
    root.classList.add('hidden');
    root.classList.remove('day-progress--historical');
    return;
  }
  root.classList.remove('hidden');
  root.classList.toggle('day-progress--historical', isViewingPast());

  const { tasks, doneCount, totalCount, allDone } = computeDayProgress();
  const past = isViewingPast();

  if (past) {
    summaryEl.textContent = `On this day · ${doneCount} of ${totalCount}`;
  } else {
    summaryEl.textContent = allDone
      ? `${doneCount} of ${totalCount} complete`
      : `${doneCount} of ${totalCount} done`;
  }
  summaryEl.classList.toggle('complete', allDone);

  chipsEl.innerHTML = tasks.map((task) => `
    <button type="button" class="progress-chip${task.done ? ' done' : ''}" data-action="${task.action}"${task.focusKey ? ` data-focus-key="${task.focusKey}"` : ''}>
      <span class="progress-chip-mark" aria-hidden="true">${task.done ? '✓' : '○'}</span>
      <span class="progress-chip-label">${task.label}</span>
    </button>
  `).join('');

  renderCoachNext();
}

export function initDayProgress() {
  document.getElementById('day-progress-chips')?.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-action]');
    if (!chip) return;
    navigateToTask(chip.dataset.action, chip.dataset.focusKey || null, chip.dataset.focusSlot || null);
  });

  document.getElementById('coach-next-btn')?.addEventListener('click', () => {
    const btn = document.getElementById('coach-next-btn');
    if (!btn) return;
    navigateToTask(btn.dataset.action, btn.dataset.focusKey || null, btn.dataset.focusSlot || null);
  });

  updateDayProgress();
}
