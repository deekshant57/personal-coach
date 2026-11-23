// Display-only meal plan lines. Does not change stored meals_plan or slot ids.
import { SLOT_LABELS } from './data.js';

const NON_MEAL_LABEL = /^(swaps|supplements)\b/i;

function splitMealLine(line) {
  const trimmed = line.trim();
  if (!trimmed || /^[—–-]/.test(trimmed)) return null;

  let idx = trimmed.indexOf('—');
  let sepLen = 1;
  if (idx === -1) idx = trimmed.indexOf('–');
  if (idx === -1) {
    const spaced = trimmed.match(/\s+-\s+/);
    if (!spaced) return null;
    idx = spaced.index;
    sepLen = spaced[0].length;
  }

  const left = trimmed.slice(0, idx).trim();
  const foods = trimmed.slice(idx + sepLen).trim();
  if (!left || !foods) return null;

  const label = left.replace(/^~?\d{1,2}:\d{2}\s*/, '').trim();
  if (!label || NON_MEAL_LABEL.test(label)) return null;
  return { label, foods };
}

function mealLines(mealsPlan) {
  if (!mealsPlan) return [];
  return mealsPlan.split('\n').map(splitMealLine).filter(Boolean);
}

function labelMatches(label, slot) {
  const name = (SLOT_LABELS[slot] || slot).toLowerCase();
  return label.toLowerCase() === name || label.toLowerCase().includes(name);
}

function findSlot(lines, slot) {
  return lines.find((line) => labelMatches(line.label, slot)) || null;
}

function planMealShape(mealsPlan) {
  const lines = mealLines(mealsPlan);
  return {
    breakfastLine: findSlot(lines, 'breakfast'),
    postLine: findSlot(lines, 'post-workout') || findSlot(lines, 'post-run'),
    dinnerLine: findSlot(lines, 'dinner'),
    lines,
  };
}

/**
 * Evening breakfast shows the morning plate taken from the post line
 * (plan has post, no separate breakfast line).
 */
export function eveningBreakfastUsesPostPlate(mealsPlan) {
  const { breakfastLine, postLine } = planMealShape(mealsPlan);
  return !!(postLine && !breakfastLine);
}

/**
 * Evening typical gym/run: post was the morning plate (no breakfast line)
 * and dinner exists → Dinner is the post-session meal; omit Post pill.
 */
export function isPostAbsorbedIntoDinner(mealsPlan) {
  const { breakfastLine, postLine, dinnerLine } = planMealShape(mealsPlan);
  return !!(postLine && !breakfastLine && dinnerLine?.foods);
}

/**
 * Whether evening layout should include a Post · eve pill.
 * False when absorbed into dinner, or when the plan has no post line.
 */
export function shouldShowEveningPostSlot(mealsPlan) {
  const { breakfastLine, postLine, dinnerLine } = planMealShape(mealsPlan);
  if (!postLine) return false;
  // B1/B2: morning plate moved to breakfast → dinner is post-session
  if (!breakfastLine && dinnerLine?.foods) return false;
  // B3 (split) or B4 (dinner empty): keep Post
  return true;
}

/**
 * Foods to show for a slot. Evening training retimes the morning plate
 * onto breakfast; when post would duplicate dinner, Dinner alone is post-session.
 * @returns {{ foods: string, context: string }}
 */
export function plannedMealForSlot(mealsPlan, slot, { evening = false } = {}) {
  const { breakfastLine, postLine, dinnerLine, lines } = planMealShape(mealsPlan);
  const direct = findSlot(lines, slot);

  if (!evening) {
    return direct ? { foods: direct.foods, context: '' } : { foods: '', context: '' };
  }

  const showPost = shouldShowEveningPostSlot(mealsPlan);

  if (slot === 'breakfast') {
    const morning = breakfastLine || postLine;
    return {
      foods: morning?.foods || '',
      context: 'Morning meal. Training is this evening.',
    };
  }

  if (slot === 'pre-workout' || slot === 'pre-run') {
    if (direct) return { foods: direct.foods, context: '' };
    return { foods: '', context: 'Nothing planned before the session.' };
  }

  if (slot === 'post-workout' || slot === 'post-run') {
    // Absorbed plans omit this slot from the pill list; if called, show written post only.
    return direct ? { foods: direct.foods, context: '' } : { foods: '', context: '' };
  }

  if (slot === 'dinner') {
    const foods = dinnerLine?.foods || direct?.foods || '';
    const context = showPost ? '' : 'Post-session meal.';
    if (!foods && !context) return { foods: '', context: '' };
    if (!foods) return { foods: '', context: '' };
    return { foods, context };
  }

  return direct ? { foods: direct.foods, context: '' } : { foods: '', context: '' };
}

const MEAL_SLOT_IDS = [
  'breakfast', 'lunch', 'snack', 'dinner',
  'pre-workout', 'post-workout', 'pre-run', 'post-run',
];

function isRetimedMealLine(line) {
  const parsed = splitMealLine(line);
  if (!parsed) return false;
  if (NON_MEAL_LABEL.test(parsed.label)) return false;
  if (/^extra carbs\b/i.test(parsed.label)) return false;
  if (/^monday\b/i.test(parsed.label)) return false;
  return MEAL_SLOT_IDS.some((slot) => labelMatches(parsed.label, slot));
}

/**
 * Full meal-plan text for Plan / Week / preview.
 * Morning keeps the coach's written plan. Evening shows clock-order slots
 * with the same retiming as the Food card. Stored meals_plan is never rewritten.
 */
export function formatMealsPlanDisplay(mealsPlan, {
  evening = false,
  slots = null,
  formatLabel = (slot) => SLOT_LABELS[slot] || slot,
} = {}) {
  if (!mealsPlan) return '';
  if (!evening) return mealsPlan;

  let slotList = slots?.length
    ? slots
    : ['breakfast', 'lunch', 'snack', 'pre-workout', 'post-workout', 'dinner'];

  if (!slots?.length && !shouldShowEveningPostSlot(mealsPlan)) {
    slotList = slotList.filter((s) => s !== 'post-workout' && s !== 'post-run');
  }

  const rawLines = mealsPlan.split('\n').map((l) => l.trim()).filter(Boolean);
  const out = [];

  for (const line of rawLines) {
    if (/^[—–-]/.test(line)) out.push(line);
  }

  for (const slot of slotList) {
    const { foods, context } = plannedMealForSlot(mealsPlan, slot, { evening: true });
    if (!foods && !context) continue;
    const label = formatLabel(slot);
    if (foods) {
      out.push(`${label} — ${foods}`);
      if (context) out.push(`(${context})`);
    } else {
      out.push(`${label} — ${context}`);
    }
  }

  for (const line of rawLines) {
    if (/^[—–-]/.test(line)) continue;
    if (isRetimedMealLine(line)) continue;
    out.push(line);
  }

  return out.join('\n');
}
