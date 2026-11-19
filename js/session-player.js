// Session UX — Floor / Close / Memory (tracker surface, memory substrate)
import { state, isViewingFuture, showToast } from './app.js';
import { formatRunPlanLabel } from './plan-seed.js';
import { formatWorkoutSessionSummary } from './workout-log.js';
import { completeThenExitSession } from './session-complete.js';

const CLOSE_CHIPS = [
  { id: 'elbows', label: 'Elbows' },
  { id: 'knees', label: 'Knees' },
  { id: 'energy_low', label: 'Low energy' },
  { id: 'cut_short', label: 'Cut short' },
  { id: 'felt_easy', label: 'Felt easy' },
  { id: 'skipped_accessories', label: 'Skipped accessories' },
];

const DEFAULT_REST_SEC = 90;

let sessionActive = false;
let sessionKind = null; // 'run' | 'gym'
let restSecondsLeft = 0;
let restTimerId = null;
let wakeLock = null;
let onExitCallback = null;
let completeSessionCallback = null;
let closeInFlight = false;
let directiveCollapsed = false;

export function isSessionActive() {
  return sessionActive;
}

/** Exit Floor → Memory after authoritative completion (including persist retry). */
export function exitActiveSession() {
  if (!sessionActive) return;
  exitSession({ keepOpen: false });
}

export function initSessionPlayer({ onExit, completeSession } = {}) {
  onExitCallback = onExit || null;
  completeSessionCallback = completeSession || null;

  document.getElementById('session-start-btn')?.addEventListener('click', () => {
    startSession();
  });
  document.getElementById('session-resume-btn')?.addEventListener('click', () => {
    startSession();
  });
  document.getElementById('session-exit-btn')?.addEventListener('click', () => {
    exitSession({ keepOpen: false });
  });
  document.getElementById('session-finish-btn')?.addEventListener('click', () => {
    openCloseMode();
  });
  document.getElementById('session-close-cancel')?.addEventListener('click', () => {
    hideCloseMode();
  });
  document.getElementById('session-close-confirm')?.addEventListener('click', () => {
    confirmCloseMode();
  });

  document.getElementById('session-rest-skip')?.addEventListener('click', () => {
    stopRestTimer();
  });
  document.getElementById('session-rest-plus')?.addEventListener('click', () => {
    restSecondsLeft += 15;
    renderRestTimer();
  });

  document.getElementById('session-close-chips')?.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-close-chip]');
    if (!chip) return;
    chip.classList.toggle('is-active');
  });

  // Rest timer: after marking a set done in Floor Mode
  document.getElementById('workout-exercise-list')?.addEventListener('click', (e) => {
    if (!sessionActive || sessionKind !== 'gym') return;
    const markBtn = e.target.closest('.workout-set-pill, .workout-simple-done');
    if (!markBtn) return;
    // Start rest after a short tick so done state flips first
    setTimeout(() => {
      if (markBtn.classList.contains('done') || markBtn.getAttribute('aria-pressed') === 'true'
        || /✓|done/i.test(markBtn.textContent || '')) {
        startRestTimer(DEFAULT_REST_SEC);
        collapseDirective();
      }
    }, 30);
  });

  renderCloseChips();
}

function renderCloseChips() {
  const host = document.getElementById('session-close-chips');
  if (!host || host.dataset.ready === '1') return;
  host.innerHTML = CLOSE_CHIPS.map((c) => `
    <button type="button" class="session-close-chip" data-close-chip="${c.id}">${c.label}</button>
  `).join('');
  host.dataset.ready = '1';
}

/**
 * Memory-surface entry controls for today's training card.
 */
export function refreshSessionEntry({ plan, isRun } = {}) {
  const entry = document.getElementById('session-entry');
  const startBtn = document.getElementById('session-start-btn');
  const resumeBtn = document.getElementById('session-resume-btn');
  const hint = document.getElementById('session-entry-hint');
  const memory = document.getElementById('session-memory-summary');
  const runFields = document.getElementById('run-fields');
  const workoutFields = document.getElementById('workout-fields');
  const footer = document.querySelector('#training-card .training-footer');

  if (!entry || !plan) return;

  if (sessionActive) {
    entry.classList.add('hidden');
    memory?.classList.add('hidden');
    return;
  }

  if (isViewingFuture()) {
    entry.classList.add('hidden');
    memory?.classList.add('hidden');
    runFields?.classList.remove('session-floor-fields');
    workoutFields?.classList.remove('session-floor-fields');
    return;
  }

  entry.classList.remove('hidden');
  const hasLog = isRun
    ? !!(state.runLog?.done || state.runLog?.actual_km)
    : !!(state.workoutLog?.done || (state.workoutLog?.exercises_json?.length));

  if (hasLog && (state.runLog?.done || state.workoutLog?.done)) {
    startBtn?.classList.add('hidden');
    resumeBtn?.classList.remove('hidden');
    if (resumeBtn) resumeBtn.textContent = 'Edit session';
    if (hint) {
      hint.textContent = isRun
        ? 'Session logged. Edit if something changed.'
        : 'Session logged. Open to adjust sets.';
    }
    if (memory) {
      memory.classList.remove('hidden');
      memory.textContent = isRun
        ? formatRunMemoryLine(state.runLog, plan)
        : (formatWorkoutSessionSummary(state.workoutLog, plan) || 'Workout logged');
    }
    // Memory mode: hide live set grid / run form until Edit
    runFields?.classList.add('hidden');
    workoutFields?.classList.add('hidden');
    footer?.classList.add('hidden');
  } else if (hasLog) {
    startBtn?.classList.add('hidden');
    resumeBtn?.classList.remove('hidden');
    if (resumeBtn) resumeBtn.textContent = 'Resume session';
    if (hint) hint.textContent = 'You have a session in progress.';
    memory?.classList.add('hidden');
    runFields?.classList.add('hidden');
    workoutFields?.classList.add('hidden');
    footer?.classList.add('hidden');
  } else {
    startBtn?.classList.remove('hidden');
    resumeBtn?.classList.add('hidden');
    if (hint) {
      hint.textContent = isRun
        ? 'Start a focused run log — distance, time, how it felt.'
        : 'Start a focused gym session — sets, rest, last weights.';
    }
    memory?.classList.add('hidden');
    runFields?.classList.add('hidden');
    workoutFields?.classList.add('hidden');
    footer?.classList.add('hidden');
  }
}

function formatRunMemoryLine(log, plan) {
  const bits = [formatRunPlanLabel(plan) || plan?.run_type || 'Run'];
  if (log?.actual_km != null) bits.push(`${log.actual_km} km`);
  if (log?.time_display) bits.push(log.time_display);
  if (log?.avg_pace) bits.push(log.avg_pace);
  return bits.join(' · ');
}

function startSession() {
  const plan = state.currentPlan;
  if (!plan || isViewingFuture()) return;

  sessionKind = plan.run_type ? 'run' : 'gym';
  sessionActive = true;
  directiveCollapsed = false;

  document.body.classList.add('session-floor-active');
  document.getElementById('session-entry')?.classList.add('hidden');
  document.getElementById('session-memory-summary')?.classList.add('hidden');
  document.getElementById('session-floor-bar')?.classList.remove('hidden');
  document.getElementById('session-close-panel')?.classList.add('hidden');

  const title = document.getElementById('session-floor-title');
  if (title) {
    title.textContent = sessionKind === 'run'
      ? (formatRunPlanLabel(plan) || 'Run')
      : (plan.workout_plan || plan.day_type || 'Workout');
  }

  const directive = document.getElementById('session-directive');
  if (directive) {
    const text = (plan.directive || '').trim();
    directive.textContent = text;
    directive.classList.toggle('hidden', !text);
    directive.classList.remove('is-collapsed');
  }

  const runFields = document.getElementById('run-fields');
  const workoutFields = document.getElementById('workout-fields');
  const footer = document.querySelector('#training-card .training-footer');
  runFields?.classList.toggle('hidden', sessionKind !== 'run');
  workoutFields?.classList.toggle('hidden', sessionKind !== 'gym');
  runFields?.classList.add('session-floor-fields');
  workoutFields?.classList.add('session-floor-fields');
  footer?.classList.remove('hidden');

  requestWakeLock();
  showToast(sessionKind === 'run' ? 'Run session open' : 'Gym floor open', { variant: 'saved' });
}

function collapseDirective() {
  if (directiveCollapsed) return;
  directiveCollapsed = true;
  document.getElementById('session-directive')?.classList.add('is-collapsed');
}

function openCloseMode() {
  document.getElementById('session-close-panel')?.classList.remove('hidden');
  document.getElementById('session-floor-bar')?.classList.add('hidden');
  stopRestTimer();
  // Reset chips
  document.querySelectorAll('#session-close-chips .session-close-chip').forEach((c) => {
    c.classList.remove('is-active');
  });
  const note = document.getElementById('session-close-note');
  if (note) note.value = '';
}

function hideCloseMode() {
  document.getElementById('session-close-panel')?.classList.add('hidden');
  document.getElementById('session-floor-bar')?.classList.remove('hidden');
}

async function confirmCloseMode() {
  if (closeInFlight) return;

  const chips = [...document.querySelectorAll('#session-close-chips .session-close-chip.is-active')]
    .map((el) => el.textContent.trim())
    .filter(Boolean);
  const extra = document.getElementById('session-close-note')?.value?.trim() || '';
  const hinge = [
    chips.length ? `Coach notes: ${chips.join(', ')}` : '',
    extra,
  ].filter(Boolean).join(' · ');

  if (hinge) {
    const notesId = sessionKind === 'run' ? 'input-run-notes' : 'input-workout-notes';
    const notesEl = document.getElementById(notesId);
    if (notesEl) {
      const prev = notesEl.value.trim();
      notesEl.value = prev ? `${prev}\n${hinge}` : hinge;
      notesEl.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  closeInFlight = true;
  try {
    await completeThenExitSession({
      complete: () => {
        if (!completeSessionCallback) return Promise.resolve({ ok: false, reason: 'unavailable' });
        return completeSessionCallback();
      },
      exit: () => exitSession({ keepOpen: false }),
      onFail: () => {
        hideCloseMode();
        document.getElementById('session-floor-bar')?.classList.remove('hidden');
      },
    });
  } finally {
    closeInFlight = false;
  }
}

function exitSession({ keepOpen }) {
  sessionActive = false;
  stopRestTimer();
  releaseWakeLock();
  hideCloseMode();
  document.body.classList.remove('session-floor-active');
  document.getElementById('session-floor-bar')?.classList.add('hidden');
  document.getElementById('session-close-panel')?.classList.add('hidden');
  document.getElementById('run-fields')?.classList.remove('session-floor-fields');
  document.getElementById('workout-fields')?.classList.remove('session-floor-fields');

  if (!keepOpen) {
    onExitCallback?.();
  }
}

function startRestTimer(seconds) {
  stopRestTimer();
  restSecondsLeft = seconds;
  const bar = document.getElementById('session-rest');
  bar?.classList.remove('hidden');
  renderRestTimer();
  restTimerId = setInterval(() => {
    restSecondsLeft -= 1;
    if (restSecondsLeft <= 0) {
      stopRestTimer();
      showToast('Rest done', { variant: 'saved' });
      return;
    }
    renderRestTimer();
  }, 1000);
}

function stopRestTimer() {
  if (restTimerId) {
    clearInterval(restTimerId);
    restTimerId = null;
  }
  restSecondsLeft = 0;
  document.getElementById('session-rest')?.classList.add('hidden');
}

function renderRestTimer() {
  const el = document.getElementById('session-rest-value');
  if (!el) return;
  const m = Math.floor(restSecondsLeft / 60);
  const s = String(restSecondsLeft % 60).padStart(2, '0');
  el.textContent = `${m}:${s}`;
}

async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
    }
  } catch {
    wakeLock = null;
  }
}

async function releaseWakeLock() {
  try {
    await wakeLock?.release();
  } catch {
    /* ignore */
  }
  wakeLock = null;
}
