import test from 'node:test';
import assert from 'node:assert/strict';
import {
  plannedMealForSlot,
  formatMealsPlanDisplay,
  isPostAbsorbedIntoDinner,
  shouldShowEveningPostSlot,
} from './planned-meals.js';
import { slotsForPlan, eveningTrainingSlots } from './meal-slots.js';

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

const NO_DINNER = `7:45 Post-workout — 4 eggs + whey
1:00 Lunch — dal and chapati
4:30 Snack — whey`;

const BREAKFAST_ONLY = `8:00 Breakfast — oats and whey
1:00 Lunch — dal
8:30 Dinner — eggs and sabzi`;

function gymPlan(overrides = {}) {
  return {
    day_type: 'Gym',
    planned_session_window: 'morning',
    actual_session_window: null,
    meals_plan: GYM,
    ...overrides,
  };
}

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

test('B1 typical gym absorbs post into dinner (no duplicate plate)', () => {
  assert.equal(isPostAbsorbedIntoDinner(GYM), true);
  assert.equal(shouldShowEveningPostSlot(GYM), false);
  const post = plannedMealForSlot(GYM, 'post-workout', { evening: true });
  assert.equal(post.foods, '4 eggs bhurji + 1 chapati + 1 scoop whey');
  assert.equal(post.context, '');
  const dinner = plannedMealForSlot(GYM, 'dinner', { evening: true });
  assert.equal(dinner.foods, '3 eggs omelette + 1 bowl curd + sautéed veggies');
  assert.equal(dinner.context, 'Post-session meal.');
});

test('evening legs plan with no breakfast word still uses the 7:45 plate', () => {
  const breakfast = plannedMealForSlot(LEGS, 'breakfast', { evening: true });
  assert.equal(breakfast.foods, '4 eggs + 2 chapati + 1 scoop whey');
});

test('B2 evening run keeps pre-run and absorbs post-run into dinner', () => {
  assert.equal(isPostAbsorbedIntoDinner(RUN), true);
  assert.equal(shouldShowEveningPostSlot(RUN), false);
  const breakfast = plannedMealForSlot(RUN, 'breakfast', { evening: true });
  assert.equal(breakfast.foods, '4 eggs + 2 toast OR poha + curd + electrolyte water');
  const pre = plannedMealForSlot(RUN, 'pre-run', { evening: true });
  assert.equal(pre.foods, '1 banana + 250ml water');
  assert.equal(pre.context, '');
  const dinner = plannedMealForSlot(RUN, 'dinner', { evening: true });
  assert.equal(dinner.foods, '3 eggs + dal + veggies');
  assert.equal(dinner.context, 'Post-session meal.');
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
  assert.equal(dinner.context, 'Post-session meal.');
  const breakfast = plannedMealForSlot(PULL, 'breakfast', { evening: true });
  assert.equal(breakfast.foods, '4 eggs bhurji + 1 chapati + 1 scoop whey');
});

test('A morning gym still shows post-workout on that slot', () => {
  const post = plannedMealForSlot(GYM, 'post-workout', { evening: false });
  assert.equal(post.foods, '4 eggs bhurji + 1 chapati + 1 scoop whey');
  assert.equal(post.context, '');
  const breakfast = plannedMealForSlot(GYM, 'breakfast', { evening: false });
  assert.equal(breakfast.foods, '');
  assert.deepEqual(
    slotsForPlan(gymPlan()),
    ['pre-workout', 'post-workout', 'lunch', 'snack', 'dinner'],
  );
});

test('rest-day breakfast uses the breakfast line, not swaps', () => {
  const breakfast = plannedMealForSlot(REST, 'breakfast', { evening: false });
  assert.equal(breakfast.foods, '4 eggs + 1 scoop whey OR 2 moong chilla w/ paneer');
  assert.equal(breakfast.context, '');
});

test('B3 already-split evening keeps distinct post and dinner', () => {
  assert.equal(isPostAbsorbedIntoDinner(ALREADY_SPLIT), false);
  assert.equal(shouldShowEveningPostSlot(ALREADY_SPLIT), true);
  const breakfast = plannedMealForSlot(ALREADY_SPLIT, 'breakfast', { evening: true });
  assert.equal(breakfast.foods, 'oats and whey');
  const post = plannedMealForSlot(ALREADY_SPLIT, 'post-workout', { evening: true });
  assert.equal(post.foods, 'eggs and rice');
  assert.equal(post.context, '');
  const dinner = plannedMealForSlot(ALREADY_SPLIT, 'dinner', { evening: true });
  assert.equal(dinner.foods, 'dal and paneer');
  assert.equal(dinner.context, '');
});

test('B4 post moved but dinner empty keeps Post pill', () => {
  assert.equal(isPostAbsorbedIntoDinner(NO_DINNER), false);
  assert.equal(shouldShowEveningPostSlot(NO_DINNER), true);
  const breakfast = plannedMealForSlot(NO_DINNER, 'breakfast', { evening: true });
  assert.equal(breakfast.foods, '4 eggs + whey');
  const post = plannedMealForSlot(NO_DINNER, 'post-workout', { evening: true });
  assert.equal(post.foods, '4 eggs + whey');
  const dinner = plannedMealForSlot(NO_DINNER, 'dinner', { evening: true });
  assert.equal(dinner.foods, '');
  assert.equal(dinner.context, '');
});

test('B5 breakfast exists with no post — dinner is post-session, no Post pill', () => {
  assert.equal(shouldShowEveningPostSlot(BREAKFAST_ONLY), false);
  const dinner = plannedMealForSlot(BREAKFAST_ONLY, 'dinner', { evening: true });
  assert.equal(dinner.foods, 'eggs and sabzi');
  assert.equal(dinner.context, 'Post-session meal.');
});

test('evening gym slots omit post when absorbed', () => {
  const plan = gymPlan({ actual_session_window: 'evening' });
  assert.deepEqual(
    slotsForPlan(plan),
    ['breakfast', 'lunch', 'snack', 'pre-workout', 'dinner'],
  );
});

test('evening bodyweight slots match gym absorb behavior', () => {
  const plan = gymPlan({ day_type: 'Bodyweight', actual_session_window: 'evening' });
  assert.deepEqual(
    slotsForPlan(plan),
    ['breakfast', 'lunch', 'snack', 'pre-workout', 'dinner'],
  );
});

test('evening run slots omit post-run when absorbed', () => {
  const plan = {
    day_type: 'Run',
    planned_session_window: 'morning',
    actual_session_window: 'evening',
    meals_plan: RUN,
  };
  assert.deepEqual(
    slotsForPlan(plan),
    ['breakfast', 'lunch', 'snack', 'pre-run', 'dinner'],
  );
});

test('evening already-split keeps post slot', () => {
  const plan = gymPlan({
    actual_session_window: 'evening',
    meals_plan: ALREADY_SPLIT,
  });
  assert.deepEqual(
    slotsForPlan(plan),
    ['breakfast', 'lunch', 'snack', 'pre-workout', 'post-workout', 'dinner'],
  );
});

test('round-trip evening back to morning restores morning slots', () => {
  const movedEve = gymPlan({ actual_session_window: 'evening', session_status: 'moved' });
  assert.ok(!slotsForPlan(movedEve).includes('post-workout'));
  const movedAm = gymPlan({ actual_session_window: 'morning', session_status: 'moved' });
  assert.deepEqual(
    slotsForPlan(movedAm),
    ['pre-workout', 'post-workout', 'lunch', 'snack', 'dinner'],
  );
  assert.equal(
    plannedMealForSlot(movedAm.meals_plan, 'post-workout', { evening: false }).foods,
    '4 eggs bhurji + 1 chapati + 1 scoop whey',
  );
});

test('planned evening without actual uses evening layout', () => {
  const plan = gymPlan({
    planned_session_window: 'evening',
    actual_session_window: null,
  });
  assert.deepEqual(
    slotsForPlan(plan),
    ['breakfast', 'lunch', 'snack', 'pre-workout', 'dinner'],
  );
});

test('null meals_plan keeps post in eveningTrainingSlots', () => {
  assert.deepEqual(
    eveningTrainingSlots('Gym', null),
    ['breakfast', 'lunch', 'snack', 'pre-workout', 'post-workout', 'dinner'],
  );
});

test('plan display keeps the written text on a morning session', () => {
  assert.equal(formatMealsPlanDisplay(GYM, { evening: false }), GYM);
});

test('plan display retimes evening meals without duplicating post and dinner', () => {
  const evening = formatMealsPlanDisplay(GYM, {
    evening: true,
    slots: slotsForPlan(gymPlan({ actual_session_window: 'evening' })),
  });
  assert.match(evening, /^— MAINTENANCE/);
  assert.match(evening, /Breakfast — 4 eggs bhurji \+ 1 chapati \+ 1 scoop whey/);
  assert.match(evening, /\(Morning meal\. Training is this evening\.\)/);
  assert.match(evening, /Pre-workout — Nothing planned before the session\./);
  assert.match(evening, /Dinner — 3 eggs omelette \+ 1 bowl curd \+ sautéed veggies/);
  assert.match(evening, /\(Post-session meal\.\)/);
  assert.equal(evening.includes('Post-workout —'), false);
  assert.equal(evening.includes('Dinner is the post-session meal'), false);
  assert.match(evening, /Supplements —/);
  assert.match(evening, /SWAPS —/);
  assert.equal(evening.includes('7:45 Post-workout'), false);
  assert.equal(evening.includes('breakfast/post: poha'), true);
});

test('evening run plan display keeps pre-run and omits absorbed post-run', () => {
  const plan = {
    day_type: 'Run',
    actual_session_window: 'evening',
    meals_plan: RUN,
  };
  const evening = formatMealsPlanDisplay(RUN, {
    evening: true,
    slots: slotsForPlan(plan),
    formatLabel: (slot) => ({
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      snack: 'Snack',
      'pre-run': 'Pre-run · eve',
      'post-run': 'Post-run · eve',
      dinner: 'Dinner',
    })[slot] || slot,
  });
  assert.match(evening, /Breakfast — 4 eggs \+ 2 toast OR poha \+ curd \+ electrolyte water/);
  assert.match(evening, /Pre-run · eve — 1 banana \+ 250ml water/);
  assert.match(evening, /Dinner — 3 eggs \+ dal \+ veggies/);
  assert.match(evening, /\(Post-session meal\.\)/);
  assert.equal(evening.includes('Post-run'), false);
});
