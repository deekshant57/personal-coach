import assert from 'node:assert/strict';
import test from 'node:test';
import { describeTargets } from './setup.js';

test('describeTargets summarizes a saved profile without editing copy', () => {
  const described = describeTargets({
    goal_primary: 'recomp',
    sport_mode: 'hybrid',
    protein_target_g: 145,
    calorie_target_training: 2100,
    calorie_target_rest: 1900,
    week_template: [
      { weekday: 1, day_type: 'Gym' },
      { weekday: 2, day_type: 'Run' },
      { weekday: 3, day_type: 'Gym' },
      { weekday: 4, day_type: 'Active Recovery' },
      { weekday: 5, day_type: 'Bodyweight' },
      { weekday: 6, day_type: 'Run' },
      { weekday: 0, day_type: 'Rest' },
    ],
  });

  assert.equal(described.training, 'Hybrid · Recomp');
  assert.equal(described.protein, '145g');
  assert.match(described.calories, /2,100 training · 1,900 rest|2100 training · 1900 rest/);
  assert.equal(
    described.week,
    'Mon Gym · Tue Run · Wed Gym · Thu Recovery · Fri BW · Sat Run · Sun Rest',
  );
  assert.equal(described.link, 'Targets · 145g · Hybrid');
  assert.equal(described.hint, '145g · Hybrid');
});

test('describeTargets stays quiet when nothing is saved yet', () => {
  const described = describeTargets(null);
  assert.equal(described.link, 'Targets');
  assert.equal(described.hint, '');
});
