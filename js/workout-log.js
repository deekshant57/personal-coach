// Workout log — structured per-set logging (P14)
import { parseWorkoutExercises, formatWorkoutSummary } from './plan-templates.js';

function normalizeName(name) {
  return (name || '').trim().toLowerCase();
}

export function mergePlanWithSavedExercises(planDetail, savedExercises) {
  const planned = parseWorkoutExercises(planDetail);
  if (!savedExercises?.length) return planned;

  const savedByName = new Map(
    savedExercises.map((ex) => [normalizeName(ex.name), ex]),
  );

  return planned.map((planEx) => {
    const saved = savedByName.get(normalizeName(planEx.name));
    if (!saved) return planEx;

    const sets = planEx.sets.map((planSet, i) => {
      const savedSet = saved.sets?.[i];
      if (!savedSet) return { ...planSet };
      return {
        ...planSet,
        done: !!savedSet.done,
        reps: savedSet.reps ?? planSet.reps,
        durationSec: savedSet.durationSec ?? planSet.durationSec,
      };
    });

    return {
      ...planEx,
      sets,
      skipped: !!saved.skipped,
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
  const active = !done && exercise.type !== 'simple';
  return `
    <button type="button"
      class="workout-set-pill${done ? ' done' : ''}${active ? ' active' : ''}"
      data-set-index="${index}"
      aria-pressed="${done}">
      ${done ? '✓' : label}
    </button>`;
}

function renderSetStepper(exercise, set, index) {
  if (exercise.type === 'timed' || exercise.type === 'simple') return '';
  const reps = set.reps ?? '';
  return `
    <div class="food-item-stepper workout-set-stepper hidden" data-set-index="${index}">
      <button type="button" class="stepper-btn workout-rep-minus" aria-label="Fewer reps">−</button>
      <span class="stepper-qty workout-rep-qty">${reps === '' ? '—' : reps}</span>
      <button type="button" class="stepper-btn workout-rep-plus" aria-label="More reps">+</button>
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

  let pills, steppers;
  if (exercise.perSide) {
    // Group per-side sets by round: show one pill per round (L+R together)
    const rounds = [];
    for (let i = 0; i < exercise.sets.length; i += 2) {
      const lSet = exercise.sets[i];
      const rSet = exercise.sets[i + 1];
      const bothDone = lSet?.done && rSet?.done;
      const label = `${lSet?.round || Math.floor(i / 2) + 1} L+R`;
      rounds.push(`
        <button type="button"
          class="workout-set-pill${bothDone ? ' done' : ''}${!bothDone && exercise.type !== 'simple' ? ' active' : ''}"
          data-set-index="${i}"
          aria-pressed="${bothDone}">
          ${bothDone ? '✓' : label}
        </button>`);
    }
    pills = rounds.join('');
    // Only show one stepper per round (for the L set, shared reps)
    steppers = [];
    for (let i = 0; i < exercise.sets.length; i += 2) {
      steppers.push(renderSetStepper(exercise, exercise.sets[i], i));
    }
    steppers = steppers.join('');
  } else {
    pills = (exercise.sets || []).map((set, i) => renderSetPill(exercise, set, i)).join('');
    steppers = (exercise.sets || []).map((set, i) => renderSetStepper(exercise, set, i)).join('');
  }

  return `
    <div class="workout-exercise-card${exercise.skipped ? ' skipped' : ''}" data-exercise-index="${index}">
      <div class="workout-exercise-header">
        <span class="workout-exercise-name">${escapeHtml(exercise.name)}</span>
        ${target}
        ${note}
      </div>
      <div class="workout-set-pills">${pills}</div>
      <div class="workout-set-steppers">${steppers}</div>
    </div>`;
}

export function renderWorkoutExerciseList(plan, savedLog, container) {
  const el = container || document.getElementById('workout-exercise-list');
  if (!el) return;

  const exercises = mergePlanWithSavedExercises(
    plan?.workout_detail,
    savedLog?.exercises_json,
  );

  if (!exercises.length) {
    el.innerHTML = '<p class="text-muted workout-empty-hint">No exercises parsed from today\'s plan.</p>';
    return;
  }

  el.innerHTML = exercises.map(renderExerciseCard).join('');
  el._workoutExercises = exercises;
  el.dataset.planDetail = plan?.workout_detail || '';
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
      // Per-side: one pill per round (L+R grouped)
      for (let i = 0; i < exercise.sets.length; i += 2) {
        const lSet = exercise.sets[i];
        const rSet = exercise.sets[i + 1];
        const pill = card.querySelector(`.workout-set-pill[data-set-index="${i}"]`);
        const stepper = card.querySelector(`.workout-set-stepper[data-set-index="${i}"]`);
        if (!pill) continue;

        const bothDone = lSet?.done && rSet?.done;
        const isActive = exercise._activeSetIndex === i && !bothDone;
        const label = `${lSet?.round || Math.floor(i / 2) + 1} L+R`;
        pill.classList.toggle('done', bothDone);
        pill.classList.toggle('active', isActive);
        pill.textContent = bothDone ? '✓' : label;
        pill.setAttribute('aria-pressed', String(bothDone));

        if (stepper) {
          const showStepper = bothDone || isActive;
          stepper.classList.toggle('hidden', !showStepper);
          const qty = stepper.querySelector('.workout-rep-qty');
          if (qty) qty.textContent = lSet.reps == null ? '—' : String(lSet.reps);
        }
      }
    } else {
      (exercise.sets || []).forEach((set, setIdx) => {
        const pill = card.querySelector(`.workout-set-pill[data-set-index="${setIdx}"]`);
        const stepper = card.querySelector(`.workout-set-stepper[data-set-index="${setIdx}"]`);
        if (!pill) return;

        const isActive = exercise._activeSetIndex === setIdx && !set.done;
        pill.classList.toggle('done', !!set.done);
        pill.classList.toggle('active', isActive);
        pill.textContent = set.done ? '✓' : setLabel(exercise, set, setIdx);
        pill.setAttribute('aria-pressed', String(!!set.done));

        if (stepper) {
          const showStepper = set.done || isActive;
          stepper.classList.toggle('hidden', !showStepper);
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

function canMarkSetDone(exercise, set) {
  if (exercise.type === 'timed') return true;
  if (exercise.type === 'reps' || exercise.type === 'max') {
    return set.reps != null && set.reps > 0;
  }
  return false;
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

function handleSetPillClick(container, exIdx, setIdx) {
  const exercises = getExercisesFromContainer(container);
  const exercise = exercises[exIdx];
  const set = exercise?.sets?.[setIdx];
  if (!exercise || !set) return;

  if (exercise.type === 'timed') {
    const newDone = !set.done;
    set.done = newDone;
    // Per-side: toggle partner too
    const partner = findPartnerSetIndex(exercise, setIdx);
    if (partner !== -1) exercise.sets[partner].done = newDone;
    exercise._activeSetIndex = null;
    syncWorkoutSteppersFromState(container);
    return;
  }

  if (set.done) {
    set.done = false;
    // Per-side: undo partner too
    const partner = findPartnerSetIndex(exercise, setIdx);
    if (partner !== -1) exercise.sets[partner].done = false;
    exercise._activeSetIndex = setIdx;
    syncWorkoutSteppersFromState(container);
    return;
  }

  if (exercise._activeSetIndex === setIdx && canMarkSetDone(exercise, set)) {
    set.done = true;
    // Per-side: mark partner done too (copy reps)
    const partner = findPartnerSetIndex(exercise, setIdx);
    if (partner !== -1) {
      const ps = exercise.sets[partner];
      ps.done = true;
      if (ps.reps == null && set.reps != null) ps.reps = set.reps;
    }
    exercise._activeSetIndex = null;
    syncWorkoutSteppersFromState(container);
    return;
  }

  if (exercise.type === 'reps' && set.reps == null) {
    set.reps = exercise.targetReps;
  }
  exercise._activeSetIndex = setIdx;
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
    rpe: parseInt(document.getElementById('input-workout-rpe').value, 10) || null,
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
  if (!rpe || rpe < 1 || rpe > 10) errors.push('Set RPE before marking done');

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
  renderWorkoutExerciseList(plan, null, el);
  el.dataset.planDetail = plan?.workout_detail || '';
}
