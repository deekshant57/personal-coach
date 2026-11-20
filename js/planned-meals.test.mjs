import test from 'node:test';
import assert from 'node:assert/strict';
import { plannedMealForSlot, formatMealsPlanDisplay } from './planned-meals.js';

const GYM = `— MAINTENANCE ~2,300-2,400 kcal · 160g protein —
7:45 Post-workout — 4 eggs bhurji + 1 chapati + 1 scoop whey
1:00 Lunch — 2 chapati + 1 bowl dal OR chana OR rajma + 100g paneer + salad
4:30 Snack — 1 scoop whey (water) + 10 walnuts
8:30 Dinner — 3 eggs omelette + 1 bowl curd + sautéed veggies
Supplements — Supradyn · Creatine 5g · Omega-3
SWAPS — breakfast/post: poha / upma / toast / quinoa / oats / chilla · legume 1:1 dal/chana/rajma/lobia`;

const LEGS = `— MAINTENANCE ~2,350-2,450 kcal · 160g protein —
7:45 Post-workout — 4 eggs + 2 chapati + 1 scoop whey
1:00 Lunch — 2.5 chapati + dal OR rajma + 100g paneer + salad
4:30 Snack — 1 scoop whey + 10 walnuts
8:30 Dinner — 3 eggs + curd + veggies
Supplements — Supradyn · Creatine 5g · Omega-3
Extra carbs today — leg day needs fuel
SWAPS — post: poha/upma/chilla OK · legume 1:1`;

const RUN = `— MAINTENANCE ~2,300-2,400 kcal · 160g protein —
6:20 Pre-run — 1 banana + 250ml water
~7:30 Post-run — 4 eggs + 2 toast OR poha + curd + electrolyte water
1:00 Lunch — 2 chapati + dal OR chana + 100g paneer + salad
4:00 Snack — 1 scoop whey + handful peanuts (30g)
8:30 Dinner — 3 eggs + dal + veggies
Supplements — Supradyn · Creatine 5g · Omega-3
SWAPS — post-run carb: toast / poha / upma / quinoa / oats / chilla · legume 1:1`;

const REST = `— MAINTENANCE ~2,250-2,350 kcal · 160g protein —
8:00 Breakfast — 4 eggs + 1 scoop whey OR 2 moong chilla w/ paneer
1:00 Lunch — 2 chapati + dal OR lobia + 100g paneer + salad
4:30 Snack — 1 scoop whey + 10 walnuts
8:30 Dinner — 3 eggs + curd + veggies
Supplements — Supradyn · Creatine 5g · Omega-3
Monday AM — weigh before food (when next Mon)
SWAPS — breakfast: eggs/whey / chilla / poha+eggs · legume 1:1`;

const PULL = `— MAINTENANCE ~2,300-2,400 kcal · 160g protein · CARB-FORWARD DINNER —
7:45 Post-workout — 4 eggs bhurji + 1 chapati + 1 scoop whey
1:00 Lunch — 2 chapati + 1 bowl dal OR chana + 100g paneer + salad
4:30 Snack — 1 scoop whey (water) + 10 walnuts
8:30 Dinner — 3 eggs + 2 chapati + dal + veggies (extra carbs — pre-Sat run)
Supplements — Supradyn · Creatine 5g · Omega-3
Pre-run dinner: carb-forward (+1 chapati vs normal)
SWAPS — legume 1:1 · post: poha/upma/chilla OK`;

const ALREADY_SPLIT = `8:00 Breakfast — oats and whey
18:00 Post-workout — eggs and rice
8:30 Dinner — dal and paneer`;

test('evening gym breakfast shows the morning plate, not the swaps line', () => {
  const breakfast = plannedMealForSlot(GYM, 'breakfast', { evening: true });
  assert.equal(breakfast.foods, '4 eggs bhurji + 1 chapati + 1 scoop whey');
  assert.equal(breakfast.context, 'Morning meal. Training is this evening.');
  assert.equal(breakfast.foods.includes('poha'), false);
});

test('evening gym pre-workout has no invented meal', () => {
  const pre = plannedMealForSlot(GYM, 'pre-workout', { evening: true });
  assert.equal(pre.foods, '');
  assert.equal(pre.context, 'Nothing planned before the session.');
});

test('evening gym post-workout points at dinner once the morning plate moved', () => {
  const post = plannedMealForSlot(GYM, 'post-workout', { evening: true });
  assert.equal(post.context, 'Dinner is the post-session meal.');
  assert.equal(post.foods, '3 eggs omelette + 1 bowl curd + sautéed veggies');
  const dinner = plannedMealForSlot(GYM, 'dinner', { evening: true });
  assert.equal(dinner.foods, '3 eggs omelette + 1 bowl curd + sautéed veggies');
  assert.equal(dinner.context, '');
});

test('evening legs plan with no breakfast word still uses the 7:45 plate', () => {
  const breakfast = plannedMealForSlot(LEGS, 'breakfast', { evening: true });
  assert.equal(breakfast.foods, '4 eggs + 2 chapati + 1 scoop whey');
});

test('evening run keeps pre-run fuel and moves the post-run plate to breakfast', () => {
  const breakfast = plannedMealForSlot(RUN, 'breakfast', { evening: true });
  assert.equal(breakfast.foods, '4 eggs + 2 toast OR poha + curd + electrolyte water');
  const pre = plannedMealForSlot(RUN, 'pre-run', { evening: true });
  assert.equal(pre.foods, '1 banana + 250ml water');
  assert.equal(pre.context, '');
  const post = plannedMealForSlot(RUN, 'post-run', { evening: true });
  assert.equal(post.context, 'Dinner is the post-session meal.');
  assert.equal(post.foods, '3 eggs + dal + veggies');
});

test('lunch and snack stay on their own lines', () => {
  assert.equal(
    plannedMealForSlot(GYM, 'lunch', { evening: true }).foods,
    '2 chapati + 1 bowl dal OR chana OR rajma + 100g paneer + salad',
  );
  assert.equal(plannedMealForSlot(GYM, 'snack', { evening: true }).foods, '1 scoop whey (water) + 10 walnuts');
});

test('a dash inside the dinner foods stays part of the meal', () => {
  const dinner = plannedMealForSlot(PULL, 'dinner', { evening: true });
  assert.equal(dinner.foods, '3 eggs + 2 chapati + dal + veggies (extra carbs — pre-Sat run)');
  const breakfast = plannedMealForSlot(PULL, 'breakfast', { evening: true });
  assert.equal(breakfast.foods, '4 eggs bhurji + 1 chapati + 1 scoop whey');
});

test('morning gym still shows post-workout on that slot', () => {
  const post = plannedMealForSlot(GYM, 'post-workout', { evening: false });
  assert.equal(post.foods, '4 eggs bhurji + 1 chapati + 1 scoop whey');
  assert.equal(post.context, '');
  const breakfast = plannedMealForSlot(GYM, 'breakfast', { evening: false });
  assert.equal(breakfast.foods, '');
});

test('rest-day breakfast uses the breakfast line, not swaps', () => {
  const breakfast = plannedMealForSlot(REST, 'breakfast', { evening: false });
  assert.equal(breakfast.foods, '4 eggs + 1 scoop whey OR 2 moong chilla w/ paneer');
  assert.equal(breakfast.context, '');
});

test('an evening plan that already has breakfast does not move post-workout', () => {
  const breakfast = plannedMealForSlot(ALREADY_SPLIT, 'breakfast', { evening: true });
  assert.equal(breakfast.foods, 'oats and whey');
  const post = plannedMealForSlot(ALREADY_SPLIT, 'post-workout', { evening: true });
  assert.equal(post.foods, 'eggs and rice');
  assert.equal(post.context, '');
});

test('plan display keeps the written text on a morning session', () => {
  assert.equal(formatMealsPlanDisplay(GYM, { evening: false }), GYM);
});

test('plan display retimes evening meals and restores morning text', () => {
  const evening = formatMealsPlanDisplay(GYM, {
    evening: true,
    slots: ['breakfast', 'lunch', 'snack', 'pre-workout', 'post-workout', 'dinner'],
  });
  assert.match(evening, /^— MAINTENANCE/);
  assert.match(evening, /Breakfast — 4 eggs bhurji \+ 1 chapati \+ 1 scoop whey/);
  assert.match(evening, /\(Morning meal\. Training is this evening\.\)/);
  assert.match(evening, /Pre-workout — Nothing planned before the session\./);
  assert.match(evening, /Post-workout — 3 eggs omelette \+ 1 bowl curd \+ sautéed veggies/);
  assert.match(evening, /\(Dinner is the post-session meal\.\)/);
  assert.match(evening, /Dinner — 3 eggs omelette \+ 1 bowl curd \+ sautéed veggies/);
  assert.match(evening, /Supplements —/);
  assert.match(evening, /SWAPS —/);
  assert.equal(evening.includes('7:45 Post-workout'), false);
  assert.equal(evening.includes('breakfast/post: poha'), true);

  assert.equal(formatMealsPlanDisplay(GYM, { evening: false }), GYM);
});

test('evening run plan display keeps pre-run fuel before the session', () => {
  const evening = formatMealsPlanDisplay(RUN, {
    evening: true,
    slots: ['breakfast', 'lunch', 'snack', 'pre-run', 'post-run', 'dinner'],
    formatLabel: (slot) => ({
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      snack: 'Snack',
      'pre-run': 'Pre-run (evening)',
      'post-run': 'Post-run (evening)',
      dinner: 'Dinner',
    })[slot] || slot,
  });
  assert.match(evening, /Breakfast — 4 eggs \+ 2 toast OR poha \+ curd \+ electrolyte water/);
  assert.match(evening, /Pre-run \(evening\) — 1 banana \+ 250ml water/);
  assert.match(evening, /Post-run \(evening\) — 3 eggs \+ dal \+ veggies/);
});
