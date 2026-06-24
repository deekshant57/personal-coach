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
];

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

// Knee status options
export const KNEE_OPTIONS = ['Pain-free', 'Minor pressure', 'Discomfort', 'Pain'];

// RPE range
export const RPE_MIN = 1;
export const RPE_MAX = 10;
