// Workout log — structured per-set logging (P14) + Phase B weighted / free-add
import { parseWorkoutExercises, formatWorkoutSummary } from './plan-templates.js';
import { readRpeFromSlider } from './run-log.js';
import {
  createWeightedExercise,
  searchExercises,
  findExerciseById,
  bestCompletedSet,
  formatSetLabel,
} from './exercise-library.js';
import { fetchWeekWorkoutLogs } from './supabase.js';

let lastPerfCache = null; // { loaded: bool, byId: Map, byName: Map }

function isoDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

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

  if (exercise.type === 'weighted') {
    const kg = set.kg ?? '';
    const reps = set.reps ?? '';
    return `
      <div class="workout-weighted-inputs" data-set-index="${index}">
        <label class="workout-kg-wrap">
          <input type="number" class="form-input workout-kg-input" inputmode="decimal" step="0.5" min="0"
            value="${kg === '' ? '' : kg}" placeholder="kg" aria-label="Weight kg">
          <span class="workout-input-suffix">kg</span>
        </label>
        <span class="workout-set-x" aria-hidden="true">×</span>
        <label class="workout-reps-wrap">
          <input type="number" class="form-input workout-reps-input" inputmode="numeric" min="0"
            value="${reps === '' ? '' : reps}" placeholder="reps" aria-label="Reps">
        </label>
      </div>`;
  }

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
  const last = exercise._lastPerf
    ? `<span class="workout-last-perf">Last: ${escapeHtml(formatSetLabel(exercise._lastPerf))} · ${escapeHtml(exercise._lastPerf.date || '')}</span>`
    : '';

  if (exercise.type === 'simple') {
    const done = exercise.sets?.[0]?.done;
    return `
      <div class="workout-exercise-card${exercise.skipped ? ' skipped' : ''}" data-exercise-index="${index}">
        <div class="workout-exercise-header">
          <span class="workout-exercise-name">${escapeHtml(exercise.name)}</span>
          <button type="button" class="workout-remove-ex" data-remove-exercise aria-label="Remove exercise">×</button>
        </div>
        ${last}
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
        <button type="button" class="workout-remove-ex" data-remove-exercise aria-label="Remove exercise">×</button>
      </div>
      ${last}
      <div class="workout-set-rows">${setRows}</div>
      <button type="button" class="btn btn-secondary btn-sm workout-add-set" data-add-set>+ Set</button>
    </div>`;
}

async function ensureLastPerfCache() {
  if (lastPerfCache?.loaded) return lastPerfCache;
  const start = isoDaysAgo(90);
  const end = isoDaysAgo(0);
  const logs = await fetchWeekWorkoutLogs(start, end);
  const byId = new Map();
  const byName = new Map();
  const sorted = [...(logs || [])].sort((a, b) => (a.date < b.date ? 1 : -1));
  for (const log of sorted) {
    const exercises = normalizeSavedExercises(log.exercises_json);
    for (const ex of exercises) {
      const best = bestCompletedSet(ex);
      if (!best || (!best.kg && !best.reps)) continue;
      const perf = { ...best, date: log.date };
      if (ex.exercise_id && !byId.has(ex.exercise_id)) byId.set(ex.exercise_id, perf);
      const n = normalizeName(ex.name);
      if (n && !byName.has(n)) byName.set(n, perf);
    }
  }
  lastPerfCache = { loaded: true, byId, byName };
  return lastPerfCache;
}

export function invalidateLastPerfCache() {
  lastPerfCache = null;
}

function attachLastPerf(exercises, cache) {
  if (!cache) return exercises;
  return exercises.map((ex) => {
    const perf = (ex.exercise_id && cache.byId.get(ex.exercise_id))
      || cache.byName.get(normalizeName(ex.name))
      || null;
    return perf ? { ...ex, _lastPerf: perf } : ex;
  });
}

function normalizeLoadedExercises(savedExercises) {
  return normalizeSavedExercises(savedExercises).map((ex) => {
    if (ex.type === 'weighted' || ex.exercise_id || ex.sets?.some((s) => s.kg != null)) {
      return {
        ...ex,
        type: ex.type || 'weighted',
        exercise_id: ex.exercise_id || null,
        sets: (ex.sets || []).map((s) => ({
          done: !!s.done,
          reps: s.reps ?? null,
          kg: s.kg ?? null,
        })),
      };
    }
    return ex;
  });
}

function renderAddExercisePanel() {
  return `
    <div class="gym-add-panel" id="gym-add-panel">
      <p class="gym-add-label">Add exercise</p>
      <input type="search" class="form-input" id="gym-exercise-search" placeholder="Search library…" autocomplete="off">
      <div class="gym-exercise-results" id="gym-exercise-results"></div>
      <div class="gym-custom-row">
        <input type="text" class="form-input" id="gym-custom-name" placeholder="Or custom name" maxlength="60">
        <button type="button" class="btn btn-secondary btn-sm" id="gym-custom-add">Add</button>
      </div>
    </div>`;
}

function paintExerciseResults(container, query) {
  const results = container?.querySelector('#gym-exercise-results');
  if (!results) return;
  const items = searchExercises(query, { limit: 8 });
  results.innerHTML = items.map((e) => `
    <button type="button" class="gym-exercise-option" data-exercise-id="${e.id}">
      <span>${escapeHtml(e.name)}</span>
      <span class="text-muted">${escapeHtml(e.muscle)}</span>
    </button>`).join('') || '<p class="text-muted">No matches</p>';
}

function rerenderExerciseList(container, onChange) {
  const exercises = getExercisesFromContainer(container);
  container.innerHTML = exercises.map(renderExerciseCard).join('') + renderAddExercisePanel();
  container._workoutExercises = exercises;
  paintExerciseResults(container, '');
  syncWorkoutSteppersFromState(container);
  onChange?.();
}

export function renderWorkoutExerciseList(plan, savedLog, container, { force = false } = {}) {
  const el = container || document.getElementById('workout-exercise-list');
  if (!el) return;

  const planDetail = plan?.workout_detail || '';
  const savedKey = JSON.stringify(normalizeSavedExercises(savedLog?.exercises_json));
  const allowFreeAdd = plan?.day_type === 'Gym'
    || plan?.day_type === 'Bodyweight'
    || !!plan?.workout_plan;

  if (!force && el._userInteracted && el.dataset.planDetail === planDetail) {
    return;
  }
  if (!force && el.dataset.planDetail === planDetail && el.dataset.savedKey === savedKey && el._workoutExercises?.length) {
    return;
  }

  let exercises = mergePlanWithSavedExercises(
    plan?.workout_detail,
    savedLog?.exercises_json,
  );

  // Free-logged / library exercises when plan has no parseable detail
  if (!exercises.length && savedLog?.exercises_json) {
    exercises = normalizeLoadedExercises(savedLog.exercises_json);
  }

  const finish = (withPerf) => {
    const list = withPerf || exercises;
    if (!list.length) {
      el.innerHTML = allowFreeAdd
        ? `<p class="text-muted workout-empty-hint">Add exercises to log sets (kg × reps).</p>${renderAddExercisePanel()}`
        : '<p class="text-muted workout-empty-hint">No exercises parsed from today\'s plan.</p>';
      el._workoutExercises = [];
    } else {
      el.innerHTML = list.map(renderExerciseCard).join('')
        + (allowFreeAdd ? renderAddExercisePanel() : '');
      el._workoutExercises = list;
      if (allowFreeAdd) paintExerciseResults(el, '');
    }
    el._userInteracted = false;
    el.dataset.planDetail = planDetail;
    el.dataset.savedKey = savedKey;
    el.dataset.allowFreeAdd = allowFreeAdd ? '1' : '0';
    syncWorkoutSteppersFromState(el);
  };

  finish(exercises);
  ensureLastPerfCache().then((cache) => {
    if (el.dataset.planDetail !== planDetail) return;
    const attached = attachLastPerf(getExercisesFromContainer(el).length
      ? getExercisesFromContainer(el)
      : exercises, cache);
    if (!attached.length && !allowFreeAdd) return;
    el._workoutExercises = attached;
    if (attached.length) {
      el.innerHTML = attached.map(renderExerciseCard).join('')
        + (allowFreeAdd ? renderAddExercisePanel() : '');
      if (allowFreeAdd) paintExerciseResults(el, '');
      syncWorkoutSteppersFromState(el);
    }
  }).catch(() => {});
}

export function addExerciseToWorkout(exercise, container, onChange) {
  const el = container || document.getElementById('workout-exercise-list');
  if (!el) return;
  const list = getExercisesFromContainer(el);
  let next = exercise;
  if (lastPerfCache?.loaded) {
    const perf = (exercise.exercise_id && lastPerfCache.byId.get(exercise.exercise_id))
      || lastPerfCache.byName.get(normalizeName(exercise.name));
    if (perf) {
      next = {
        ...exercise,
        _lastPerf: perf,
        sets: (exercise.sets || []).map((s, i) => (i === 0
          ? { ...s, kg: s.kg ?? perf.kg, reps: s.reps ?? perf.reps }
          : s)),
      };
    }
  }
  list.push(next);
  el._workoutExercises = list;
  el._userInteracted = true;
  rerenderExerciseList(el, onChange);
}

export function setupWorkoutExerciseHandlers(container, onChange) {
  const el = container || document.getElementById('workout-exercise-list');
  if (!el || el._workoutHandlersBound) return;
  el._workoutHandlersBound = true;

  el.addEventListener('click', (e) => {
    const option = e.target.closest('[data-exercise-id]');
    if (option && el.contains(option)) {
      const lib = findExerciseById(option.dataset.exerciseId);
      if (lib) {
        addExerciseToWorkout(createWeightedExercise(lib), el, onChange);
        const search = el.querySelector('#gym-exercise-search');
        if (search) search.value = '';
      }
      return;
    }

    if (e.target.closest('#gym-custom-add')) {
      const input = el.querySelector('#gym-custom-name');
      const name = input?.value?.trim();
      if (!name) return;
      addExerciseToWorkout(createWeightedExercise(name), el, onChange);
      if (input) input.value = '';
      return;
    }

    const card = e.target.closest('[data-exercise-index]');
    if (!card) return;
    el._userInteracted = true;
    const exIdx = parseInt(card.dataset.exerciseIndex, 10);

    if (e.target.closest('[data-remove-exercise]')) {
      const list = getExercisesFromContainer(el);
      list.splice(exIdx, 1);
      el._workoutExercises = list;
      rerenderExerciseList(el, onChange);
      return;
    }

    if (e.target.closest('[data-add-set]')) {
      const list = getExercisesFromContainer(el);
      const ex = list[exIdx];
      if (!ex) return;
      const prev = ex.sets?.[ex.sets.length - 1];
      ex.sets = ex.sets || [];
      ex.sets.push({
        done: false,
        reps: prev?.reps ?? ex.targetReps ?? 10,
        kg: prev?.kg ?? null,
      });
      ex.setCount = ex.sets.length;
      rerenderExerciseList(el, onChange);
      return;
    }

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

  el.addEventListener('input', (e) => {
    if (e.target.id === 'gym-exercise-search') {
      paintExerciseResults(el, e.target.value);
      return;
    }

    const weighted = e.target.closest('.workout-weighted-inputs');
    if (!weighted) return;
    const card = e.target.closest('[data-exercise-index]');
    if (!card) return;
    el._userInteracted = true;
    const exIdx = parseInt(card.dataset.exerciseIndex, 10);
    const setIdx = parseInt(weighted.dataset.setIndex, 10);
    const exercises = getExercisesFromContainer(el);
    const set = exercises[exIdx]?.sets?.[setIdx];
    if (!set) return;

    if (e.target.classList.contains('workout-kg-input')) {
      const v = e.target.value;
      set.kg = v === '' ? null : parseFloat(v);
    }
    if (e.target.classList.contains('workout-reps-input')) {
      const v = e.target.value;
      set.reps = v === '' ? null : parseInt(v, 10);
    }
    onChange?.();
  });
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

        const weighted = card.querySelector(`.workout-weighted-inputs[data-set-index="${setIdx}"]`);
        if (weighted) {
          const kgIn = weighted.querySelector('.workout-kg-input');
          const repIn = weighted.querySelector('.workout-reps-input');
          if (kgIn && document.activeElement !== kgIn) kgIn.value = set.kg ?? '';
          if (repIn && document.activeElement !== repIn) repIn.value = set.reps ?? '';
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
  if (exercise.type === 'weighted') {
    if (set.reps == null) set.reps = exercise.targetReps ?? 8;
    if (set.kg == null) set.kg = 0;
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

export function collectExercisesFromDOM(container) {
  const el = container || document.getElementById('workout-exercise-list');
  return getExercisesFromContainer(el).map((ex) => ({
    exercise_id: ex.exercise_id || null,
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
      kg: s.kg ?? null,
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
    return ex.sets?.some((s) => s.done
      || (s.reps != null && s.reps !== ex.targetReps)
      || (s.kg != null && Number(s.kg) > 0));
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
