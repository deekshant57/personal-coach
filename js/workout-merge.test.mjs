import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mergePlanWithSavedExercises } from './workout-log.js';

const MON_DETAIL =
  'WARM-UP (5 min): brisk walk · Pull-ups 4×max · Push-ups 3×15 · Dead hang 3×20s · ' +
  'COOL-DOWN (5 min): stretch';

test('mergePlanWithSavedExercises restores done sets by exact name', () => {
  const saved = [
    {
      name: 'Pull-ups',
      type: 'max',
      sets: [
        { done: true, reps: 8 },
        { done: true, reps: 7 },
        { done: false, reps: null },
        { done: false, reps: null },
      ],
    },
    {
      name: 'Push-ups',
      type: 'reps',
      targetReps: 15,
      sets: [
        { done: true, reps: 15 },
        { done: true, reps: 14 },
        { done: false, reps: 15 },
      ],
    },
  ];

  const merged = mergePlanWithSavedExercises(MON_DETAIL, saved);
  const pullups = merged.find((e) => e.name === 'Pull-ups');
  const pushups = merged.find((e) => e.name === 'Push-ups');

  assert.equal(pullups.sets[0].done, true);
  assert.equal(pullups.sets[0].reps, 8);
  assert.equal(pullups.sets[1].done, true);
  assert.equal(pushups.sets[0].done, true);
  assert.equal(pushups.sets[2].done, false);
});

test('mergePlanWithSavedExercises matches renamed exercises via index fallback', () => {
  const saved = [
    {
      name: 'Pull ups',
      type: 'max',
      sets: [
        { done: true, reps: 6 },
        { done: true, reps: 5 },
        { done: true, reps: 4 },
        { done: true, reps: 4 },
      ],
    },
  ];

  const merged = mergePlanWithSavedExercises(MON_DETAIL, saved);
  const pullups = merged.find((e) => e.name === 'Pull-ups');
  assert.equal(pullups.sets.every((s) => s.done), true);
  assert.deepEqual(pullups.sets.map((s) => s.reps), [6, 5, 4, 4]);
});

test('mergePlanWithSavedExercises parses exercises_json string', () => {
  const savedJson = JSON.stringify([
    { name: 'Pull-ups', type: 'max', sets: [{ done: false }, { done: false }, { done: false }, { done: false }] },
    { name: 'Push-ups', type: 'reps', sets: [{ done: false }, { done: false }, { done: false }] },
    {
      name: 'Dead hang',
      type: 'timed',
      sets: [
        { done: true, durationSec: 20 },
        { done: true, durationSec: 20 },
        { done: false, durationSec: 20 },
      ],
    },
  ]);

  const merged = mergePlanWithSavedExercises(MON_DETAIL, savedJson);
  const deadHang = merged.find((e) => e.name === 'Dead hang');
  assert.equal(deadHang.sets[0].done, true);
  assert.equal(deadHang.sets[2].done, false);
});
