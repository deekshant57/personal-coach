import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseWorkoutExercises,
  formatWorkoutSummary,
  stripWorkoutMeta,
} from './plan-templates.js';

const MON_DETAIL =
  'WARM-UP (5 min): brisk walk or jog in place 2 min → arm circles 20 → hip circles 10/side → bodyweight squats 1×10 (slow) → push-ups 1×5 (slow) · ' +
  'Pull-ups 4×max · Push-ups 3×15 · Rows 3×10 (park bench) · Dead hang 3×20s · Plank 3×40s · Side plank 2×30s · ' +
  'Glute bridges 2×12 (light activation only — not strength) · 25–30 min · RPE 5 · ' +
  "COOL-DOWN (5 min): chest doorway stretch 30s/side → lat stretch 30s/side → shoulder cross-body 30s/side → hip flexor stretch 30s/side → child's pose 30s";

const WED_DETAIL =
  'WARM-UP (5 min): 5 min brisk walk · Squats 3×15 (slow, controlled) · Lunges 2×10/leg · Glute bridges 3×15 · Calf raises 3×20 · ' +
  'Foam roll quads + calves + IT band 5 min · 20–25 min · RPE 4–5 · Keep it light — this is prep, not a leg day · ' +
  'COOL-DOWN (5 min): kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute stretch 30s/side → standing wall calf stretch 30s/side';

const FRI_DETAIL =
  'WARM-UP (5 min): brisk walk or jog in place 2 min → arm circles 20 → hip circles 10/side → bodyweight squats 1×10 (slow) → push-ups 1×5 (slow) · ' +
  'Pull-ups 4×max · Push-ups 3×max · Rows 3×10 (park bench) · Dead hang 3×20s · Plank 3×40s · Side plank 2×30s · Calf raises 2×15 (light) · ' +
  '25–30 min · RPE 5–6 · COOL-DOWN (5 min): chest doorway stretch 30s/side → lat stretch 30s/side → shoulder cross-body 30s/side → hip flexor stretch 30s/side → child\'s pose 30s';

test('stripWorkoutMeta removes warm-up, cool-down, and session meta', () => {
  const segments = stripWorkoutMeta(MON_DETAIL);
  assert.ok(segments.some((s) => s.startsWith('Pull-ups')));
  assert.ok(!segments.some((s) => /^WARM-UP/i.test(s)));
  assert.ok(!segments.some((s) => /^COOL-DOWN/i.test(s)));
  assert.ok(!segments.some((s) => /^RPE /i.test(s)));
  assert.ok(!segments.some((s) => /^\d+–\d+ min/.test(s)));
});

test('parseWorkoutExercises — Monday bodyweight', () => {
  const exercises = parseWorkoutExercises(MON_DETAIL);
  assert.equal(exercises.length, 7);

  const pullups = exercises.find((e) => e.name === 'Pull-ups');
  assert.equal(pullups.type, 'max');
  assert.equal(pullups.sets.length, 4);

  const pushups = exercises.find((e) => e.name === 'Push-ups');
  assert.equal(pushups.type, 'reps');
  assert.equal(pushups.targetReps, 15);
  assert.equal(pushups.sets.length, 3);
  assert.equal(pushups.sets[0].reps, 15);

  const deadHang = exercises.find((e) => e.name === 'Dead hang');
  assert.equal(deadHang.type, 'timed');
  assert.equal(deadHang.durationSec, 20);
  assert.equal(deadHang.sets.length, 3);

  const rows = exercises.find((e) => e.name === 'Rows');
  assert.equal(rows.note, 'park bench');
});

test('parseWorkoutExercises — Wednesday mobility', () => {
  const exercises = parseWorkoutExercises(WED_DETAIL);
  assert.equal(exercises.length, 5);

  const lunges = exercises.find((e) => e.name === 'Lunges');
  assert.equal(lunges.perSide, true);
  assert.equal(lunges.sets.length, 4);
  assert.deepEqual(lunges.sets.map((s) => s.side), ['L', 'R', 'L', 'R']);

  const foam = exercises.find((e) => e.name.includes('Foam roll'));
  assert.equal(foam.type, 'simple');
});

test('parseWorkoutExercises — Friday bodyweight', () => {
  const exercises = parseWorkoutExercises(FRI_DETAIL);
  const pushups = exercises.find((e) => e.name === 'Push-ups');
  assert.equal(pushups.type, 'max');
  assert.equal(exercises.find((e) => e.name === 'Calf raises').targetReps, 15);
});

test('parseWorkoutExercises — Wednesday W2 mobility (Jul 1)', () => {
  const detail =
    'WARM-UP (5 min): 5 min brisk walk · Glute bridges 3×15 · Calf raises 3×20 · ' +
    'Clamshells 2×12/side · Ankle dorsiflexion drills: knee-to-wall 2×10/side — fix ankle lock · ' +
    'Foam roll quads + calves + IT band 5 min · 20 min · RPE 4 · COOL-DOWN (5 min): stretch';
  const exercises = parseWorkoutExercises(detail);
  assert.equal(exercises.length, 5);
  assert.ok(!exercises.some((e) => e.name === '20 min'));
  const ankle = exercises.find((e) => e.name.includes('Ankle dorsiflexion'));
  assert.equal(ankle.type, 'reps');
  assert.equal(ankle.perSide, true);
  assert.equal(ankle.sets.length, 4);
  assert.equal(ankle.note, 'fix ankle lock');
});

test('formatWorkoutSummary builds readable summary', () => {
  const exercises = parseWorkoutExercises(MON_DETAIL);
  exercises[0].sets[0].done = true;
  exercises[0].sets[0].reps = 6;
  exercises[0].sets[1].done = true;
  exercises[0].sets[1].reps = 5;
  exercises[3].sets.forEach((s) => { s.done = true; });

  const summary = formatWorkoutSummary(exercises);
  assert.match(summary, /Pull-ups 6, 5/);
  assert.match(summary, /Dead hang 3×20s/);
});
