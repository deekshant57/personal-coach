// Food reference items — protein/calories per unit
export const FOOD_ITEMS = [
  { id: 'egg',      name: 'Egg',         protein: 7,  calories: 70,  emoji: '\u{1F95A}', unit: '1' },
  { id: 'chapati',  name: 'Chapati',     protein: 3,  calories: 80,  emoji: '\u{1FAD3}', unit: '1' },
  { id: 'dal',      name: 'Dal',         protein: 12, calories: 180, emoji: '\u{1F963}', unit: 'bowl' },
  { id: 'paneer',   name: 'Paneer',      protein: 18, calories: 265, emoji: '\u{1F9C0}', unit: '100g' },
  { id: 'curd',     name: 'Curd',        protein: 8,  calories: 150, emoji: '\u{1F95B}', unit: 'cup' },
  { id: 'whey',     name: 'Whey',        protein: 24, calories: 120, emoji: '\u{1F4AA}', unit: 'scoop' },
  { id: 'banana',   name: 'Banana',      protein: 1,  calories: 105, emoji: '\u{1F34C}', unit: '1' },
  { id: 'toast',    name: 'Toast',       protein: 3,  calories: 80,  emoji: '\u{1F35E}', unit: '1' },
  { id: 'walnuts',  name: 'Walnuts',     protein: 3,  calories: 130, emoji: '\u{1F330}', unit: '10' },
  { id: 'peanuts',  name: 'Peanuts',     protein: 7,  calories: 170, emoji: '\u{1F95C}', unit: '30g' },
  { id: 'flaxseed', name: 'Flaxseed',    protein: 2,  calories: 55,  emoji: '\u{1F331}', unit: 'tbsp' },
  { id: 'dates',    name: 'Dates',       protein: 1,  calories: 40,  emoji: '\u{1F334}', unit: '2' },
  { id: 'chana',    name: 'Chana',       protein: 15, calories: 210, emoji: '\u{1FAD8}', unit: 'bowl' },
  { id: 'salad',    name: 'Salad',       protein: 2,  calories: 30,  emoji: '\u{1F957}', unit: '1' },
  { id: 'veggies',  name: 'Veggies',     protein: 3,  calories: 50,  emoji: '\u{1F966}', unit: '1' },
  { id: 'milk',     name: 'Milk',        protein: 8,  calories: 150, emoji: '\u{1F95B}', unit: 'cup' },
  { id: 'rice',     name: 'Rice',        protein: 4,  calories: 200, emoji: '\u{1F35A}', unit: 'bowl' },
  { id: 'poha',     name: 'Poha',        protein: 4,  calories: 250, emoji: '\u{1F35A}', unit: 'plate' },
  { id: 'upma',     name: 'Upma',        protein: 4,  calories: 240, emoji: '\u{1F33E}', unit: 'plate' },
  { id: 'moong_chilla', name: 'Moong Chilla', protein: 20, calories: 280, emoji: '\u{1F95E}', unit: '2 w/ paneer' },
  { id: 'besan_chilla', name: 'Besan Chilla', protein: 17, calories: 340, emoji: '\u{1F95E}', unit: '1.5 w/ paneer' },
  { id: 'rajma',    name: 'Rajma',       protein: 15, calories: 210, emoji: '\u{1FAD8}', unit: 'bowl' },
  { id: 'tofu',     name: 'Tofu',        protein: 12, calories: 144, emoji: '\u{1F9C8}', unit: '100g' },
  { id: 'sprout_chaat', name: 'Sprout Chaat', protein: 10, calories: 180, emoji: '\u{1F957}', unit: 'bowl' },
  { id: 'sattu',    name: 'Sattu Drink', protein: 10, calories: 120, emoji: '\u{1F964}', unit: '1' },
  { id: 'hung_curd', name: 'Hung Curd',  protein: 14, calories: 160, emoji: '\u{1F95B}', unit: '200g' },
  { id: 'roasted_chana', name: 'Roasted Chana', protein: 8, calories: 140, emoji: '\u{1FAD8}', unit: '30g' },
  { id: 'palak_dal', name: 'Palak Dal',  protein: 14, calories: 190, emoji: '\u{1F96C}', unit: 'bowl' },
  { id: 'paneer_bhurji', name: 'Paneer Bhurji', protein: 14, calories: 220, emoji: '\u{1F373}', unit: '80g' },
];

/** Human-readable portion label for summaries and debrief */
export function formatFoodLabel(item, qty) {
  const ref = FOOD_ITEMS.find(f => f.id === item.id);
  const unit = ref?.unit;
  const name = item.name;
  if (!unit || unit === '1') return `${qty}× ${name}`;
  if (/^\d+g$/.test(unit)) {
    const gramsPerUnit = parseInt(unit, 10);
    return `${qty}× ${name} (${gramsPerUnit * qty}g)`;
  }
  return `${qty}× ${name} (${qty} ${unit})`;
}

/** Short unit label for food grid tiles */
export function formatUnitDisplay(unit) {
  if (!unit || unit === '1') return 'each';
  return unit;
}

// Meal slot labels by day type
export const MEAL_SLOTS = {
  Run: ['pre-run', 'post-run', 'lunch', 'snack', 'dinner'],
  Bodyweight: ['pre-workout', 'post-workout', 'lunch', 'snack', 'dinner'],
  'Active Recovery': ['pre-workout', 'post-workout', 'lunch', 'snack', 'dinner'],
  Rest: ['breakfast', 'lunch', 'snack', 'dinner'],
};

// Display labels for meal slots
export const SLOT_LABELS = {
  'pre-run': 'Pre-run',
  'post-run': 'Post-run',
  'pre-workout': 'Pre-workout',
  'post-workout': 'Post-workout',
  'breakfast': 'Breakfast',
  'lunch': 'Lunch',
  'snack': 'Snack',
  'dinner': 'Dinner',
};

// Day type badge colors (CSS class suffixes)
export const DAY_TYPES = {
  Run: { color: '#60a5fa', label: 'Run' },
  Bodyweight: { color: '#fb923c', label: 'Bodyweight' },
  'Active Recovery': { color: '#2dd4bf', label: 'Active Recovery' },
  Rest: { color: '#737373', label: 'Rest' },
};

const DAY_BADGE_CLASS = {
  Run: 'day-badge--run',
  Bodyweight: 'day-badge--bodyweight',
  'Active Recovery': 'day-badge--active-recovery',
  Rest: 'day-badge--rest',
};

/** HTML for day-type badge — no inline styles */
export function renderDayBadge(dayType, { small = false } = {}) {
  const info = DAY_TYPES[dayType] || DAY_TYPES.Rest;
  const variant = DAY_BADGE_CLASS[dayType] || DAY_BADGE_CLASS.Rest;
  const sm = small ? ' day-badge--sm' : '';
  return `<span class="day-badge ${variant}${sm}">${info.label}</span>`;
}

// Knee status options
export const KNEE_OPTIONS = ['Pain-free', 'Minor pressure', 'Discomfort', 'Pain'];

// RPE range
export const RPE_MIN = 1;
export const RPE_MAX = 10;
