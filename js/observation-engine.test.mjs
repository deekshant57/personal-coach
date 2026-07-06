import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  renderObservation,
  buildDaySummary,
  validateObservation,
  isLevel3Violation,
  shouldShowPostSaveObservation,
  shouldStaySilent,
  FORBIDDEN_PATTERNS,
} from './observation-engine.js';

const sleepEvent = {
  id: 'threshold:sleep:3nights_below_7h',
  type: 'threshold',
  metric: 'sleep',
  active: true,
  payload: { nights: 3 },
};

const cadenceEvent = {
  id: 'progression:cadence:monthly_high',
  type: 'progression',
  metric: 'cadence',
  active: true,
  payload: { cadence: 148 },
};

const runPlan = {
  day_name: 'Tue',
  run_type: 'Easy',
  run_km: 5,
};

test('silence — no events returns null', () => {
  assert.equal(renderObservation([], { plan: runPlan }), null);
  assert.equal(shouldShowPostSaveObservation([]), false);
  assert.equal(shouldStaySilent({ newEvents: [], activeEvents: [] }), true);
});

test('silence — post-save with no new events stays silent', () => {
  assert.equal(shouldStaySilent({ newEvents: [], activeEvents: [sleepEvent] }), false);
  assert.equal(shouldStaySilent({ newEvents: [], activeEvents: [] }), true);
});

test('Level 1 — sleep threshold fact only without plan', () => {
  const text = renderObservation([sleepEvent], { plan: null });
  assert.ok(text.includes('Sleep below 7h'));
  assert.ok(!text.includes('should'));
});

test('Level 2 — event plus today plan demand', () => {
  const text = renderObservation([sleepEvent], { plan: runPlan });
  assert.ok(text.includes('Sleep below 7h'));
  assert.ok(text.includes("Today's session:"));
  assert.ok(text.includes('Tue Easy 5 km'));
});

test('Level 1 — cadence monthly high', () => {
  const text = renderObservation([cadenceEvent], { plan: null });
  assert.ok(text.includes('Cadence 148'));
  assert.ok(text.includes('highest this month'));
});

test('Level 3 rejection — forbidden coaching patterns', () => {
  assert.equal(isLevel3Violation('You should deload this week.'), true);
  assert.equal(isLevel3Violation('Consider reducing mileage.'), true);
  assert.equal(isLevel3Violation('Good job on protein.'), true);
  assert.equal(isLevel3Violation('Cadence 148 — highest this month.'), false);
});

test('validateObservation rejects Level 3 copy', () => {
  const result = validateObservation('You should skip tomorrow\'s run.');
  assert.equal(result.valid, false);
  assert.equal(result.reason, 'level3');
});

test('day summary — factual only, no praise', () => {
  const summary = buildDaySummary({
    vitals: { sleep_hours: 7.1 },
    foodLogs: {
      breakfast: { totalProtein: 38, totalCalories: 480 },
      lunch: { totalProtein: 56, totalCalories: 620 },
    },
  });
  assert.ok(summary.includes('94g protein'));
  assert.ok(summary.includes('kcal'));
  assert.ok(summary.includes('7.1h sleep'));
  assert.ok(!summary.toLowerCase().includes('good'));
  assert.ok(!summary.toLowerCase().includes('great'));
});

test('day summary — empty when nothing logged', () => {
  assert.equal(buildDaySummary({ vitals: {}, foodLogs: {} }), null);
});

test('forbidden patterns list is non-empty', () => {
  assert.ok(FORBIDDEN_PATTERNS.length >= 8);
});
