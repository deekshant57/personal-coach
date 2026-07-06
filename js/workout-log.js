// Workout log — structured per-set logging (P14)
import { parseWorkoutExercises, formatWorkoutSummary } from './plan-templates.js';
import { readRpeFromSlider } from './run-log.js';

function normalizeName(name) {
  return (name || '').trim().toLowerCase();
}

function canonicalName(name) {
  return normalizeName(name).replace(/[^a-z0-9]+/g, '');
}

function normalizeSavedExercises(savedExercises) {
  if (!savedExercises) return [];
  if (Array.isArray(savedExercises)) return savedExercises;
  if (typeof savedExercises === 'string') {
    try {
      const parsed = JSON.parse(savedExercises);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function copySavedSetIntoPlanSet(planSet, savedSet) {
  if (!savedSet) return { ...planSet };
  return {
    ...planSet,
    done: !!savedSet.done,
    reps: savedSet.reps ?? planSet.reps,
    durationSec: savedSet.durationSec ?? planSet.durationSec,
  };
}

export function mergePlanWithSavedExercises(planDetail, savedExercises) {
  const planned = parseWorkoutExercises(planDetail);
  const savedRows = normalizeSavedExercises(savedExercises);
  if (!savedRows.length) return planned;

  const savedByExactName = new Map();
  const savedByCanonicalName = new Map();
  savedRows.forEach((ex, idx) => {
    const exact = normalizeName(ex?.name);
    const canonical = canonicalName(ex?.name);
    if (exact && !savedByExactName.has(exact)) savedByExactName.set(exact, idx);
    if (canonical && !savedByCanonicalName.has(canonical)) savedByCanonicalName.set(canonical, idx);
  });

  const consumedSavedIndexes = new Set();

  return planned.map((planEx, planIdx) => {
    const exact = normalizeName(planEx.name);
    const canonical = canonicalName(planEx.name);
    const candidateIndexes = [
      savedByExactName.get(exact),
      savedByCanonicalName.get(canonical),
      planIdx,
    ];
    const savedIdx = candidateIndexes.find((i) => Number.isInteger(i) && !consumedSavedIndexes.has(i));
    const savedEx = Number.isInteger(savedIdx) ? savedRows[savedIdx] : null;
    if (Number.isInteger(savedIdx)) consumedSavedIndexes.add(savedIdx);
    if (!savedEx) return planEx;

    const sets = planEx.sets.map((planSet, i) => {
      const savedSet = savedEx.sets?.[i];
      return copySavedSetIntoPlanSet(planSet, savedSet);
    });

    return {
      ...planEx,
      sets,
      skipped: !!savedEx.skipped,
    };
  });
}

function setLabel(exercise, set, index) {
  if (exercise.perSide) {
    return `${set.round || Math.floor(index / 2) + 1}${set.side || (index % 2 === 0 ? 'L' : 'R')}`;
  }
  return String(set.round || index + 1);
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderSetPill(exercise, set, index) {
  const label = setLabel(exercise, set, index);
  const done = !!set.done;
  return `
    <button type="button"
      class="workout-set-pill${done ? ' done' : ''}"
      data-set-index="${index}"
      aria-pressed="${done}">
      ${done ? '✓' : label}
    </button>`;
}

function renderSetStepper(exercise, set, index) {
  if (exercise.type === 'timed' || exercise.type === 'simple') return '';
  const reps = set.reps ?? '';
  const hidden = exercise.type === 'reps' || exercise.type === 'max' ? '' : ' hidden';
  return `
    <div class="food-item-stepper workout-set-stepper${hidden}" data-set-index="${index}">
      <button type="button" class="stepper-btn workout-rep-minus" aria-label="Fewer reps">−</button>
      <span class="stepper-qty workout-rep-qty">${reps === '' ? '—' : reps}</span>
      <button type="button" class="stepper-btn workout-rep-plus" aria-label="More reps">+</button>
    </div>`;
}

function renderSetRow(exercise, set, index) {
  const stepper = renderSetStepper(exercise, set, index);
  if (!stepper) {
    return `<div class="workout-set-row">${renderSetPill(exercise, set, index)}</div>`;
  }
  return `
    <div class="workout-set-row">
      ${renderSetPill(exercise, set, index)}
      ${stepper}
    </div>`;
}

function renderExerciseCard(exercise, index) {
  const note = exercise.note ? `<span class="workout-exercise-note">${escapeHtml(exercise.note)}</span>` : '';
  const target = exercise.target
    ? `<span class="workout-target-badge">Target: ${escapeHtml(exercise.target)}</span>`
    : '';

  if (exercise.type === 'simple') {
    const done = exercise.sets?.[0]?.done;
    return `
      <div class="workout-exercise-card${exercise.skipped ? ' skipped' : ''}" data-exercise-index="${index}">
        <div class="workout-exercise-header">
          <span class="workout-exercise-name">${escapeHtml(exercise.name)}</span>
        </div>
        <button type="button" class="workout-simple-done${done ? ' done' : ''}" data-simple-toggle>
          ${done ? '✓ Done' : 'Mark done'}
        </button>
      </div>`;
  }

  let setRows;
  if (exercise.perSide) {
    const rounds = [];
    for (let i = 0; i < exercise.sets.length; i += 2) {
      const lSet = exercise.sets[i];
      const rSet = exercise.sets[i + 1];
      const bothDone = lSet?.done && rSet?.done;
      const label = `${lSet?.round || Math.floor(i / 2) + 1} L+R`;
      const stepper = renderSetStepper(exercise, exercise.sets[i], i);
      rounds.push(`
        <div class="workout-set-row">
          <button type="button"
            class="workout-set-pill${bothDone ? ' done' : ''}"
            data-set-index="${i}"
            aria-pressed="${bothDone}">
            ${bothDone ? '✓' : label}
          </button>
          ${stepper}
        </div>`);
    }
    setRows = rounds.join('');
  } else {
    setRows = (exercise.sets || []).map((set, i) => renderSetRow(exercise, set, i)).join('');
  }

  return `
    <div class="workout-exercise-card${exercise.skipped ? ' skipped' : ''}" data-exercise-index="${index}">
      <div class="workout-exercise-header">
        <span class="workout-exercise-name">${escapeHtml(exercise.name)}</span>
        ${target}
        ${note}
      </div>
      <div class="workout-set-rows">${setRows}</div>
    </div>`;
}

export function renderWorkoutExerciseList(plan, savedLog, container, { force = false } = {}) {
  const el = container || document.getElementById('workout-exercise-list');
  if (!el) return;

  const planDetail = plan?.workout_detail || '';
  const savedKey = JSON.stringify(normalizeSavedExercises(savedLog?.exercises_json));

  if (!force && el._userInteracted && el.dataset.planDetail === planDetail) {
    return;
  }
  if (!force && el.dataset.planDetail === planDetail && el.dataset.savedKey === savedKey && el._workoutExercises?.length) {
    return;
  }

  const exercises = mergePlanWithSavedExercises(
    plan?.workout_detail,
    savedLog?.exercises_json,
  );

  if (!exercises.length) {
    el.innerHTML = '<p class="text-muted workout-empty-hint">No exercises parsed from today\'s plan.</p>';
    el._workoutExercises = [];
    el.dataset.planDetail = planDetail;
    el.dataset.savedKey = savedKey;
    return;
  }

  el.innerHTML = exercises.map(renderExerciseCard).join('');
  el._workoutExercises = exercises;
  el._userInteracted = false;
  el.dataset.planDetail = planDetail;
  el.dataset.savedKey = savedKey;
  syncWorkoutSteppersFromState(el);
}

function getExercisesFromContainer(container) {
  return container?._workoutExercises || [];
}

function syncWorkoutSteppersFromState(container) {
  const exercises = getExercisesFromContainer(container);
  exercises.forEach((exercise, exIdx) => {
    const card = container.querySelector(`[data-exercise-index="${exIdx}"]`);
    if (!card || exercise.type === 'simple') return;

    if (exercise.perSide) {
      for (let i = 0; i < exercise.sets.length; i += 2) {
        const lSet = exercise.sets[i];
        const rSet = exercise.sets[i + 1];
        const row = card.querySelector(`.workout-set-row .workout-set-pill[data-set-index="${i}"]`)?.closest('.workout-set-row');
        const pill = row?.querySelector('.workout-set-pill');
        const stepper = row?.querySelector('.workout-set-stepper');
        if (!pill) continue;

        const bothDone = lSet?.done && rSet?.done;
        const label = `${lSet?.round || Math.floor(i / 2) + 1} L+R`;
        pill.classList.toggle('done', bothDone);
        pill.textContent = bothDone ? '✓' : label;
        pill.setAttribute('aria-pressed', String(bothDone));

        if (stepper) {
          const qty = stepper.querySelector('.workout-rep-qty');
          if (qty) qty.textContent = lSet.reps == null ? '—' : String(lSet.reps);
        }
      }
    } else {
      (exercise.sets || []).forEach((set, setIdx) => {
        const pill = card.querySelector(`.workout-set-pill[data-set-index="${setIdx}"]`);
        const stepper = card.querySelector(`.workout-set-stepper[data-set-index="${setIdx}"]`);
        if (!pill) return;

        pill.classList.toggle('done', !!set.done);
        pill.textContent = set.done ? '✓' : setLabel(exercise, set, setIdx);
        pill.setAttribute('aria-pressed', String(!!set.done));

        if (stepper) {
          const qty = stepper.querySelector('.workout-rep-qty');
          if (qty) qty.textContent = set.reps == null ? '—' : String(set.reps);
        }
      });
    }
  });
}

function updateSetReps(exercise, setIndex, delta) {
  const set = exercise.sets[setIndex];
  const current = set.reps ?? (exercise.type === 'reps' ? exercise.targetReps : 0);
  const next = Math.max(0, current + delta);
  set.reps = next === 0 && exercise.type === 'max' ? null : next;
}

/** For perSide exercises, find the partner set (same round, opposite side). */
function findPartnerSetIndex(exercise, setIdx) {
  if (!exercise.perSide) return -1;
  const set = exercise.sets[setIdx];
  if (!set?.side) return -1;
  const partnerSide = set.side === 'L' ? 'R' : 'L';
  return exercise.sets.findIndex(
    (s, i) => i !== setIdx && s.round === set.round && s.side === partnerSide
  );
}

function ensureSetRepsForDone(exercise, set) {
  if (exercise.type === 'reps' && set.reps == null) {
    set.reps = exercise.targetReps;
  }
  if (exercise.type === 'max' && (set.reps == null || set.reps <= 0)) {
    set.reps = 1;
  }
}

function markSetDone(exercise, setIdx, done) {
  const set = exercise.sets[setIdx];
  if (!set) return;
  if (done) {
    ensureSetRepsForDone(exercise, set);
    set.done = true;
    const partner = findPartnerSetIndex(exercise, setIdx);
    if (partner !== -1) {
      const ps = exercise.sets[partner];
      ensureSetRepsForDone(exercise, ps);
      ps.done = true;
      if (ps.reps == null && set.reps != null) ps.reps = set.reps;
    }
  } else {
    set.done = false;
    const partner = findPartnerSetIndex(exercise, setIdx);
    if (partner !== -1) exercise.sets[partner].done = false;
  }
}

function handleSetPillClick(container, exIdx, setIdx) {
  const exercises = getExercisesFromContainer(container);
  const exercise = exercises[exIdx];
  const set = exercise?.sets?.[setIdx];
  if (!exercise || !set) return;

  if (exercise.perSide) {
    const lSet = exercise.sets[setIdx];
    const rSet = exercise.sets[setIdx + 1];
    const bothDone = lSet?.done && rSet?.done;
    markSetDone(exercise, setIdx, !bothDone);
    syncWorkoutSteppersFromState(container);
    return;
  }

  markSetDone(exercise, setIdx, !set.done);
  syncWorkoutSteppersFromState(container);
}

function handleRepStep(container, exIdx, setIdx, delta) {
  const exercises = getExercisesFromContainer(container);
  const exercise = exercises[exIdx];
  if (!exercise) return;

  updateSetReps(exercise, setIdx, delta);
  syncWorkoutSteppersFromState(container);
}

export function setupWorkoutExerciseHandlers(container, onChange) {
  const el = container || document.getElementById('workout-exercise-list');
  if (!el || el._workoutHandlersBound) return;
  el._workoutHandlersBound = true;

  el.addEventListener('click', (e) => {
    const card = e.target.closest('[data-exercise-index]');
    if (!card) return;
    el._userInteracted = true;
    const exIdx = parseInt(card.dataset.exerciseIndex, 10);

    if (e.target.closest('[data-simple-toggle]')) {
      const exercises = getExercisesFromContainer(el);
      const set = exercises[exIdx]?.sets?.[0];
      if (set) {
        set.done = !set.done;
        const btn = card.querySelector('[data-simple-toggle]');
        btn.classList.toggle('done', set.done);
        btn.textContent = set.done ? '✓ Done' : 'Mark done';
      }
      onChange?.();
      return;
    }

    const minus = e.target.closest('.workout-rep-minus');
    const plus = e.target.closest('.workout-rep-plus');
    if (minus || plus) {
      const stepper = e.target.closest('.workout-set-stepper');
      const setIdx = parseInt(stepper?.dataset.setIndex, 10);
      if (!Number.isNaN(setIdx)) {
        handleRepStep(el, exIdx, setIdx, minus ? -1 : 1);
        onChange?.();
      }
      return;
    }

    const pill = e.target.closest('.workout-set-pill');
    if (pill) {
      const setIdx = parseInt(pill.dataset.setIndex, 10);
      if (!Number.isNaN(setIdx)) {
        handleSetPillClick(el, exIdx, setIdx);
        onChange?.();
      }
    }
  });
}

export function collectExercisesFromDOM(container) {
  const el = container || document.getElementById('workout-exercise-list');
  return getExercisesFromContainer(el).map((ex) => ({
    name: ex.name,
    target: ex.target,
    type: ex.type,
    setCount: ex.setCount,
    perSide: ex.perSide,
    note: ex.note,
    targetReps: ex.targetReps ?? null,
    durationSec: ex.durationSec ?? null,
    skipped: !!ex.skipped,
    sets: (ex.sets || []).map((s) => ({
      done: !!s.done,
      reps: s.reps ?? null,
      durationSec: s.durationSec ?? null,
      side: s.side ?? null,
      round: s.round ?? null,
    })),
  }));
}

export function collectWorkoutLogFromForm() {
  const exercises = collectExercisesFromDOM();
  const fallbackWhat = document.getElementById('input-workout-what')?.value?.trim() || '';
  const summary = formatWorkoutSummary(exercises);
  const parts = [summary, fallbackWhat].filter(Boolean);
  const what_i_did = parts.length ? parts.join(' · ') : null;

  return {
    done: document.getElementById('training-done-btn').classList.contains('done'),
    exercises_json: exercises.length ? exercises : null,
    what_i_did,
    rpe: readRpeFromSlider('input-workout-rpe'),
    notes: document.getElementById('input-workout-notes').value || null,
  };
}

export function workoutLogHasLoggedWork(log, { fallbackText = '' } = {}) {
  if (!log) return false;
  if (log.notes?.trim()) return true;
  if (fallbackText?.trim()) return true;
  if (log.what_i_did?.trim() && !log.exercises_json) return true;

  const exercises = log.exercises_json;
  if (!exercises?.length) return false;

  return exercises.some((ex) => {
    if (ex.skipped) return false;
    if (ex.type === 'simple') return ex.sets?.[0]?.done;
    // Save if any set is done OR if user has entered reps (partial progress)
    return ex.sets?.some((s) => s.done || (s.reps != null && s.reps !== ex.targetReps));
  });
}

/** Check if user has interacted with workout exercises at all. */
export function workoutExercisesInteracted() {
  const el = document.getElementById('workout-exercise-list');
  return !!el?._userInteracted;
}

export function validateWorkoutLogForDone(log) {
  const errors = [];
  const warnings = [];

  if (!log?.done) {
    return { valid: false, errors: ['Mark workout as done'], warnings: [] };
  }

  const rpe = Number(log.rpe);
  if (!rpe || rpe < 1 || rpe > 10) errors.push('RPE not set');

  const fallbackText = document.getElementById('input-workout-what')?.value?.trim() || '';
  if (!workoutLogHasLoggedWork(log, { fallbackText })) {
    errors.push('Log at least one set or add a note');
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function isWorkoutLogComplete(log) {
  if (!log?.done) return false;
  return validateWorkoutLogForDone(log).valid;
}

export function resetWorkoutExerciseList(plan) {
  const el = document.getElementById('workout-exercise-list');
  if (!el) return;
  el._userInteracted = false;
  renderWorkoutExerciseList(plan, null, el, { force: true });
}
