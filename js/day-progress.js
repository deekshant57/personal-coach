// Day progress strip — P1: what's left for the selected date (saved data only)
import { state, getCurrentMealSlots, isViewingFuture, isMonday } from './app.js';
import { isRunLogComplete } from './run-log.js';
import { isSupplementsComplete } from './supplements.js';
import { expandVitalsCard } from './vitals-ui.js';

function isVitalsComplete() {
  const v = state.vitals;
  if (!v) return false;
  return v.weight_kg != null || v.sleep_hours != null;
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
  if (plan?.workout_plan) return state.workoutLog?.done === true;
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

export function computeDayProgress() {
  const tasks = [
    { id: 'vitals', label: 'Vitals', done: isVitalsComplete(), action: 'vitals' },
  ];

  if (isTrainingRequired()) {
    const label = state.currentPlan.run_type ? 'Run' : 'Workout';
    const done = isTrainingComplete();
    tasks.push({
      id: 'training',
      label: state.currentPlan.run_type && state.runLog?.done && !done ? 'Run (incomplete)' : label,
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

  tasks.push({
    id: 'supplements',
    label: 'Supplements',
    done: isSupplementsComplete(),
    action: 'supplements',
  });

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

function navigateToTask(action) {
  if (action === 'meals') {
    document.querySelector('.nav-tab[data-tab="food"]')?.click();
    return;
  }

  document.querySelector('.nav-tab[data-tab="today"]')?.click();

  requestAnimationFrame(() => {
    if (action === 'vitals') {
      expandVitalsCard();
      document.getElementById('vitals-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (action === 'training') {
      document.getElementById('training-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (action === 'supplements') {
      document.getElementById('supplements-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

export function updateDayProgress() {
  const root = document.getElementById('day-progress');
  const summaryEl = document.getElementById('day-progress-summary');
  const chipsEl = document.getElementById('day-progress-chips');
  if (!root || !summaryEl || !chipsEl) return;

  if (isViewingFuture()) {
    root.classList.add('hidden');
    return;
  }
  root.classList.remove('hidden');

  const { tasks, doneCount, totalCount, allDone } = computeDayProgress();

  summaryEl.textContent = allDone
    ? `${doneCount} of ${totalCount} complete`
    : `${doneCount} of ${totalCount} done`;
  summaryEl.classList.toggle('complete', allDone);

  chipsEl.innerHTML = tasks.map((task) => `
    <button type="button" class="progress-chip${task.done ? ' done' : ''}" data-action="${task.action}">
      <span class="progress-chip-mark" aria-hidden="true">${task.done ? '✓' : '○'}</span>
      <span class="progress-chip-label">${task.label}</span>
    </button>
  `).join('');
}

export function initDayProgress() {
  document.getElementById('day-progress-chips')?.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-action]');
    if (!chip) return;
    navigateToTask(chip.dataset.action);
  });
  updateDayProgress();
}
