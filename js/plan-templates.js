// Warm-up / cool-down templates — keep in sync with coach/week-plans.py

export const RUN_WARMUP =
  'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → ' +
  'bodyweight squats 1×10 (slow) → calf raises 1×15 → ' +
  'leg swings 10/side → hip circles 10/side → ankle circles → ' +
  '1 min easy jog to start';

export const RUN_COOLDOWN =
  "COOL-DOWN (8 min): 5 min walk (don't stop abruptly) → " +
  'standing wall calf stretch 30s/side → ' +
  'standing quad pull (hand on foot) 30s/side → ' +
  'kneeling hip flexor stretch 30s/side → ' +
  'seated hamstring stretch 30s/side → ' +
  'figure-4 glute / IT band stretch 30s/side';

export const WKT_WARMUP =
  'WARM-UP (5 min): brisk walk or jog in place 2 min → ' +
  'arm circles 20 → hip circles 10/side → ' +
  'bodyweight squats 1×10 (slow) → push-ups 1×5 (slow)';

export const WKT_COOLDOWN =
  'COOL-DOWN (5 min): chest doorway stretch 30s/side → ' +
  'lat stretch 30s/side → shoulder cross-body 30s/side → ' +
  'hip flexor stretch 30s/side → child\'s pose 30s';

export const MOBILITY_COOLDOWN =
  'COOL-DOWN (5 min): kneeling hip flexor stretch 30s/side → ' +
  'seated hamstring stretch 30s/side → ' +
  'figure-4 glute stretch 30s/side → ' +
  'standing wall calf stretch 30s/side';

/** Pull WARM-UP / COOL-DOWN lines out of a plan detail string. */
export function extractWarmupCooldown(text) {
  if (!text) return '';
  return text
    .split(' · ')
    .map((s) => s.trim())
    .filter((s) => /^WARM-UP/i.test(s) || /^COOL-DOWN/i.test(s) || /^Extra:/i.test(s))
    .join('\n\n');
}

/** Run cues only — cadence, RPE, location (not warm-up / cool-down). */
export function extractRunCues(runCue) {
  if (!runCue) return '';
  return runCue
    .split(' · ')
    .map((s) => s.trim())
    .filter((s) => s && !/^WARM-UP/i.test(s) && !/^COOL-DOWN/i.test(s) && !/^Extra:/i.test(s))
    .join(' · ');
}

const SET_RX = /^(.+?)\s+(\d+)×(max|\d+s|\d+)(?:\/(?:side|leg))?(?:\s+\((.+)\))?$/i;

function isMetaSegment(segment) {
  return /^WARM-UP/i.test(segment)
    || /^COOL-DOWN/i.test(segment)
    || /^Extra:/i.test(segment)
    || /^\d+–\d+ min/i.test(segment)
    || /^\d+ min$/i.test(segment)
    || /^RPE /i.test(segment)
    || /^NO /i.test(segment)
    || /^Keep it light/i.test(segment)
    || /^MONSOON/i.test(segment)
    || /^CADENCE:/i.test(segment)
    || /^Mandatory:/i.test(segment);
}

function parseSetSegment(segment) {
  let noteSuffix = null;
  let text = segment;
  const dashIdx = segment.indexOf(' — ');
  if (dashIdx !== -1) {
    text = segment.slice(0, dashIdx).trim();
    noteSuffix = segment.slice(dashIdx + 3).trim();
  }

  const m = text.match(SET_RX);
  if (!m) {
    return {
      name: text,
      target: '',
      type: 'simple',
      setCount: 1,
      perSide: false,
      note: noteSuffix,
      sets: [{ done: false }],
    };
  }

  const [, name, setCountStr, value, parenNote] = m;
  const note = parenNote || noteSuffix || null;
  const setCount = parseInt(setCountStr, 10);
  const perSide = /\/(?:side|leg)/i.test(segment);
  const lower = value.toLowerCase();

  if (lower === 'max') {
    return buildExercise({ name, setCount, perSide, note, type: 'max', target: `${setCountStr}×max` });
  }
  if (lower.endsWith('s')) {
    const durationSec = parseInt(lower, 10);
    return buildExercise({
      name, setCount, perSide, note, type: 'timed',
      target: `${setCountStr}×${durationSec}s`, durationSec,
    });
  }

  const targetReps = parseInt(value, 10);
  return buildExercise({
    name, setCount, perSide, note, type: 'reps',
    target: `${setCountStr}×${targetReps}`, targetReps,
  });
}

function buildExercise({ name, setCount, perSide, note, type, target, targetReps = null, durationSec = null }) {
  const totalSets = perSide ? setCount * 2 : setCount;
  const sets = [];
  for (let i = 0; i < totalSets; i++) {
    const side = perSide ? (i % 2 === 0 ? 'L' : 'R') : null;
    const round = perSide ? Math.floor(i / 2) + 1 : i + 1;
    if (type === 'reps') {
      sets.push({ done: false, reps: targetReps, side, round });
    } else if (type === 'max') {
      sets.push({ done: false, reps: null, side, round });
    } else if (type === 'timed') {
      sets.push({ done: false, durationSec, side, round });
    } else {
      sets.push({ done: false, side, round });
    }
  }

  return {
    name: name.trim(),
    target,
    type,
    setCount,
    perSide,
    note: note || null,
    targetReps,
    durationSec,
    sets,
    skipped: false,
  };
}

/** Strip warm-up, cool-down, and session meta from workout_detail. */
export function stripWorkoutMeta(workoutDetail) {
  if (!workoutDetail) return [];
  return workoutDetail
    .split(' · ')
    .map((s) => s.trim())
    .filter((s) => s && !isMetaSegment(s) && !/^WARM-UP/i.test(s) && !/^COOL-DOWN/i.test(s));
}

/** Parse planned exercises from workout_detail for structured logging. */
export function parseWorkoutExercises(workoutDetail) {
  return stripWorkoutMeta(workoutDetail).map(parseSetSegment);
}

function formatSetReps(set, type) {
  if (type === 'timed') {
    return set.done ? `${set.durationSec}s` : null;
  }
  if (type === 'simple') {
    return set.done ? '✓' : null;
  }
  if (!set.done || set.reps == null) return null;
  return String(set.reps);
}

/** Build debrief-friendly what_i_did summary from structured exercises. */
export function formatWorkoutSummary(exercises) {
  if (!exercises?.length) return '';

  const parts = [];
  for (const ex of exercises) {
    if (ex.skipped) continue;

    if (ex.type === 'simple') {
      if (ex.sets?.[0]?.done) parts.push(ex.name);
      continue;
    }

    const logged = (ex.sets || [])
      .map((s) => formatSetReps(s, ex.type))
      .filter(Boolean);
    if (!logged.length) continue;

    if (ex.type === 'timed') {
      parts.push(`${ex.name} ${ex.setCount}×${ex.durationSec}s`);
    } else {
      parts.push(`${ex.name} ${logged.join(', ')}`);
    }
  }

  return parts.join(' · ');
}
