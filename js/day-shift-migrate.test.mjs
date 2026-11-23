import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sessionWindowMigrateActions,
  sessionWindowFact,
  effectiveSessionWindow,
} from './meal-slots.js';
import { getSupradynTimingHint } from './supplements-data.js';
import { renderObservation } from './observation-engine.js';

const GYM_ABSORB = `— MAINTENANCE —
7:45 Post-workout — 4 eggs + whey
1:00 Lunch — dal + paneer
4:30 Snack — whey
8:30 Dinner — eggs + curd
Supplements — Supradyn · Creatine 5g · Omega-3`;

const ALREADY_SPLIT = `8:00 Breakfast — oats and whey
7:00 Pre-workout — banana
8:00 Post-workout — eggs
9:00 Dinner — dal`;

function gymPlan(overrides = {}) {
  return {
    day_type: 'Gym',
    workout_plan: 'Lower',
    meals_plan: GYM_ABSORB,
    planned_session_window: 'morning',
    actual_session_window: null,
    ...overrides,
  };
}

test('absorb morning→evening migrates post → breakfast', () => {
  const actions = sessionWindowMigrateActions(gymPlan(), 'morning', 'evening');
  assert.deepEqual(actions, [{ from: 'post-workout', to: 'breakfast' }]);
});

test('absorb evening→morning migrates breakfast → post (pairwise reverse)', () => {
  const actions = sessionWindowMigrateActions(
    gymPlan({ actual_session_window: 'evening', session_status: 'moved' }),
    'evening',
    'morning',
  );
  assert.deepEqual(actions, [{ from: 'breakfast', to: 'post-workout' }]);
});

test('absorb run uses post-run key', () => {
  const plan = {
    day_type: 'Run',
    run_type: 'Easy',
    meals_plan: `6:20 Pre-run — banana
~7:30 Post-run — eggs + toast
1:00 Lunch — dal
8:30 Dinner — eggs
`,
  };
  assert.deepEqual(
    sessionWindowMigrateActions(plan, 'morning', 'evening'),
    [{ from: 'post-run', to: 'breakfast' }],
  );
});

test('B3 already-split does not remap food on either direction', () => {
  const plan = gymPlan({ meals_plan: ALREADY_SPLIT });
  assert.deepEqual(sessionWindowMigrateActions(plan, 'morning', 'evening'), []);
  assert.deepEqual(sessionWindowMigrateActions(plan, 'evening', 'morning'), []);
});

test('same window or missing plan → no actions', () => {
  assert.deepEqual(sessionWindowMigrateActions(gymPlan(), 'evening', 'evening'), []);
  assert.deepEqual(sessionWindowMigrateActions(null, 'morning', 'evening'), []);
});

test('sessionWindowFact for moved gym day', () => {
  assert.equal(
    sessionWindowFact(gymPlan({
      actual_session_window: 'evening',
      session_status: 'moved',
    })),
    'Planned morning · actual evening.',
  );
  assert.equal(sessionWindowFact(gymPlan()), null);
  assert.equal(
    sessionWindowFact(gymPlan({
      planned_session_window: 'flexible',
      actual_session_window: 'evening',
    })),
    'Training this evening.',
  );
});

test('Supradyn hint switches to breakfast on evening session', () => {
  assert.equal(
    getSupradynTimingHint(gymPlan()),
    'After workout (~7:45)',
  );
  assert.equal(
    getSupradynTimingHint(gymPlan({ actual_session_window: 'evening' })),
    'After breakfast — first meal',
  );
  assert.equal(
    getSupradynTimingHint({
      day_type: 'Run',
      run_type: 'Easy',
      actual_session_window: 'evening',
    }),
    'After breakfast — first meal',
  );
});

test('observation includes session window fact when moved', () => {
  const event = {
    id: 'threshold:sleep:3nights_below_7h',
    type: 'threshold',
    metric: 'sleep',
    active: true,
    payload: { nights: 3 },
  };
  const text = renderObservation([event], {
    plan: gymPlan({
      day_name: 'Mon',
      actual_session_window: 'evening',
      session_status: 'moved',
    }),
  });
  assert.ok(text.includes('Planned morning · actual evening'));
  assert.ok(text.includes("Today's session:"));
});

test('effectiveSessionWindow prefers actual evening', () => {
  assert.equal(effectiveSessionWindow(gymPlan()), 'morning');
  assert.equal(
    effectiveSessionWindow(gymPlan({ actual_session_window: 'evening' })),
    'evening',
  );
});
