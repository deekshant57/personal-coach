// Pure meal-slot resolution (no app/food imports — safe for week-stats)
import { MEAL_SLOTS } from './data.js';
import { isPostAbsorbedIntoDinner, shouldShowEveningPostSlot } from './planned-meals.js';

const TRAINING_TYPES = new Set(['Run', 'Gym', 'Bodyweight']);

export function isTrainingDayType(dayType) {
  return TRAINING_TYPES.has(dayType);
}

export function effectiveSlotScheme(plan) {
  if (!plan) return 'Rest';
  if (plan.slot_scheme && MEAL_SLOTS[plan.slot_scheme]) return plan.slot_scheme;
  return MEAL_SLOTS[plan.day_type] ? plan.day_type : 'Rest';
}

/** Resolved training window for meal layout: actual wins; skip → none. */
export function effectiveSessionWindow(plan) {
  if (!plan || !isTrainingDayType(plan.day_type)) return null;
  const scheme = effectiveSlotScheme(plan);
  if (scheme === 'Rest' || scheme === 'Active Recovery') return null;
  const actual = plan.actual_session_window;
  if (actual === 'skipped') return null;
  if (actual === 'morning' || actual === 'evening') return actual;
  const planned = plan.planned_session_window || 'morning';
  if (planned === 'flexible') return 'morning';
  return planned;
}

/** Clock-order slots for evening training: morning meal + pre/post around the session. */
export function eveningTrainingSlots(scheme, mealsPlan = null) {
  const key = MEAL_SLOTS[scheme] ? scheme : 'Gym';
  const pre = key === 'Run' ? 'pre-run' : 'pre-workout';
  const post = key === 'Run' ? 'post-run' : 'post-workout';
  const slots = ['breakfast', 'lunch', 'snack', pre, post, 'dinner'];
  if (mealsPlan != null && !shouldShowEveningPostSlot(mealsPlan)) {
    return slots.filter((s) => s !== post);
  }
  return slots;
}

export function slotsForPlan(plan) {
  const scheme = effectiveSlotScheme(plan);
  const base = MEAL_SLOTS[scheme] || MEAL_SLOTS.Rest;
  if (effectiveSessionWindow(plan) === 'evening') {
    return eveningTrainingSlots(scheme, plan?.meals_plan ?? null);
  }
  return base;
}

/** Training post slot key for a day type / scheme. */
export function postSlotForScheme(schemeOrDayType) {
  return schemeOrDayType === 'Run' ? 'post-run' : 'post-workout';
}

/**
 * Level-1 fact when planned vs actual session window differ.
 * Used by observations and optional coach copy.
 */
export function sessionWindowFact(plan) {
  if (!plan || !isTrainingDayType(plan.day_type)) return null;
  const actual = plan.actual_session_window;
  const planned = plan.planned_session_window || 'morning';
  if (!actual || actual === 'skipped') return null;
  if (planned === 'flexible') {
    return actual === 'evening' ? 'Training this evening.' : null;
  }
  if (actual !== planned) return `Planned ${planned} · actual ${actual}.`;
  return null;
}

/**
 * Slot remaps for morning↔evening when the morning plate is absorbed onto Breakfast.
 * Pairwise: post ↔ breakfast (matches evening display of the morning plate).
 * B3 already-split plans: no food remap.
 * @returns {{ from: string, to: string }[]}
 */
export function sessionWindowMigrateActions(plan, fromWindow, toWindow) {
  if (!plan || fromWindow === toWindow) return [];
  if (!isPostAbsorbedIntoDinner(plan.meals_plan)) return [];

  const scheme = effectiveSlotScheme(plan);
  const post = postSlotForScheme(scheme === 'Rest' ? plan.day_type : scheme);

  if (fromWindow !== 'evening' && toWindow === 'evening') {
    return [{ from: post, to: 'breakfast' }];
  }
  if (fromWindow === 'evening' && toWindow === 'morning') {
    return [{ from: 'breakfast', to: post }];
  }
  return [];
}
