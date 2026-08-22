// Food reference items — protein/calories per unit
export const FOOD_ITEMS = [
  { id: 'egg',      name: 'Egg',         protein: 7,  calories: 70,  fat: 5,  emoji: '\u{1F95A}', unit: '1' },
  { id: 'chapati',  name: 'Chapati',     protein: 3,  calories: 80,  fat: 3,  emoji: '\u{1FAD3}', unit: '1' },
  { id: 'dal',      name: 'Dal',         protein: 12, calories: 180, fat: 4,  emoji: '\u{1F963}', unit: 'bowl' },
  { id: 'paneer',   name: 'Paneer',      protein: 18, calories: 265, fat: 21, emoji: '\u{1F9C0}', unit: '100g' },
  { id: 'curd',     name: 'Curd',        protein: 8,  calories: 150, fat: 8,  emoji: '\u{1F95B}', unit: 'cup' },
  { id: 'whey',     name: 'Whey',        protein: 24, calories: 120, fat: 2,  emoji: '\u{1F4AA}', unit: 'scoop' },
  { id: 'banana',   name: 'Banana',      protein: 1,  calories: 105, fat: 0,  emoji: '\u{1F34C}', unit: '1' },
  { id: 'toast',    name: 'Toast',       protein: 3,  calories: 80,  fat: 1,  emoji: '\u{1F35E}', unit: '1' },
  { id: 'walnuts',  name: 'Walnuts',     protein: 3,  calories: 130, fat: 13, emoji: '\u{1F330}', unit: '10' },
  { id: 'peanuts',  name: 'Peanuts',     protein: 7,  calories: 170, fat: 14, emoji: '\u{1F95C}', unit: '30g' },
  { id: 'flaxseed', name: 'Flaxseed',    protein: 2,  calories: 55,  fat: 4,  emoji: '\u{1F331}', unit: 'tbsp' },
  { id: 'dates',    name: 'Dates',       protein: 1,  calories: 40,  fat: 0,  emoji: '\u{1F334}', unit: '2' },
  { id: 'chana',    name: 'Chana',       protein: 15, calories: 210, fat: 5,  emoji: '\u{1FAD8}', unit: 'bowl' },
  { id: 'salad',    name: 'Salad',       protein: 2,  calories: 30,  fat: 1,  emoji: '\u{1F957}', unit: '1' },
  { id: 'veggies',  name: 'Veggies',     protein: 3,  calories: 50,  fat: 1,  emoji: '\u{1F966}', unit: '1' },
  { id: 'milk',     name: 'Milk',        protein: 8,  calories: 150, fat: 8,  emoji: '\u{1F95B}', unit: 'cup' },
  { id: 'rice',     name: 'Rice',        protein: 4,  calories: 200, fat: 1,  emoji: '\u{1F35A}', unit: 'bowl' },
  { id: 'poha',     name: 'Poha',        protein: 4,  calories: 250, fat: 8,  emoji: '\u{1F35A}', unit: 'plate' },
  { id: 'upma',     name: 'Upma',        protein: 4,  calories: 240, fat: 7,  emoji: '\u{1F33E}', unit: 'plate' },
  { id: 'moong_chilla', name: 'Moong Chilla', protein: 20, calories: 280, fat: 14, emoji: '\u{1F95E}', unit: '2 w/ paneer' },
  { id: 'besan_chilla', name: 'Besan Chilla', protein: 17, calories: 340, fat: 18, emoji: '\u{1F95E}', unit: '1.5 w/ paneer' },
  { id: 'rajma',    name: 'Rajma',       protein: 15, calories: 210, fat: 3,  emoji: '\u{1FAD8}', unit: 'bowl' },
  { id: 'lobia',    name: 'Lobia',       protein: 15, calories: 200, fat: 3,  emoji: '\u{1FAD8}', unit: 'bowl' },
  { id: 'quinoa',   name: 'Quinoa',      protein: 8,  calories: 220, fat: 4,  emoji: '\u{1F33E}', unit: 'bowl' },
  { id: 'oats',     name: 'Oats',        protein: 6,  calories: 220, fat: 5,  emoji: '\u{1F33E}', unit: 'plate' },
  { id: 'chana_dal', name: 'Chana Dal',  protein: 14, calories: 190, fat: 4,  emoji: '\u{1F963}', unit: 'bowl' },
  { id: 'chhole',   name: 'Chhole',      protein: 15, calories: 210, fat: 5,  emoji: '\u{1FAD8}', unit: 'bowl' },
  { id: 'kala_chana', name: 'Kala Chana', protein: 15, calories: 210, fat: 5, emoji: '\u{1FAD8}', unit: 'bowl' },
  { id: 'idli_sambar', name: 'Idli + Sambar', protein: 12, calories: 300, fat: 6, emoji: '\u{1F35A}', unit: '3 + bowl' },
  { id: 'dosa_sambar', name: 'Dosa + Sambar', protein: 10, calories: 280, fat: 8, emoji: '\u{1F35A}', unit: '1 + bowl' },
  { id: 'uttapam_sambar', name: 'Uttapam + Sambar', protein: 12, calories: 320, fat: 8, emoji: '\u{1F35A}', unit: '1 + bowl' },
  { id: 'tofu',     name: 'Tofu',        protein: 12, calories: 144, fat: 9,  emoji: '\u{1F9C8}', unit: '100g' },
  { id: 'sprout_chaat', name: 'Sprout Chaat', protein: 10, calories: 180, fat: 4, emoji: '\u{1F957}', unit: 'bowl' },
  { id: 'sattu',    name: 'Sattu Drink', protein: 10, calories: 120, fat: 2,  emoji: '\u{1F964}', unit: '1' },
  { id: 'hung_curd', name: 'Hung Curd',  protein: 14, calories: 160, fat: 6,  emoji: '\u{1F95B}', unit: '200g' },
  { id: 'roasted_chana', name: 'Roasted Chana', protein: 8, calories: 140, fat: 4, emoji: '\u{1FAD8}', unit: '30g' },
  { id: 'palak_dal', name: 'Palak Dal',  protein: 14, calories: 190, fat: 6,  emoji: '\u{1F96C}', unit: 'bowl' },
  { id: 'paneer_bhurji', name: 'Paneer Bhurji', protein: 14, calories: 220, fat: 15, emoji: '\u{1F373}', unit: '80g' },
  { id: 'palak_paneer', name: 'Palak Paneer', protein: 18, calories: 300, fat: 20, emoji: '\u{1F96C}', unit: 'bowl' },
  { id: 'matar_paneer', name: 'Matar Paneer', protein: 18, calories: 310, fat: 18, emoji: '\u{1F9C0}', unit: 'bowl' },
  { id: 'aloo_paratha', name: 'Aloo Paratha', protein: 8, calories: 320, fat: 12, emoji: '\u{1FAD3}', unit: '1' },
  { id: 'gobi_paratha', name: 'Gobi Paratha', protein: 7, calories: 290, fat: 10, emoji: '\u{1FAD3}', unit: '1' },
  { id: 'methi_paratha', name: 'Methi Paratha', protein: 8, calories: 280, fat: 9, emoji: '\u{1FAD3}', unit: '1' },
  { id: 'khichdi', name: 'Khichdi', protein: 10, calories: 280, fat: 6, emoji: '\u{1F35A}', unit: 'bowl' },
  { id: 'dal_rice', name: 'Dal + Rice', protein: 14, calories: 380, fat: 5, emoji: '\u{1F35A}', unit: 'plate' },
  { id: 'rajma_chawal', name: 'Rajma Chawal', protein: 18, calories: 420, fat: 6, emoji: '\u{1F35A}', unit: 'plate' },
  { id: 'chole_bhature', name: 'Chole Bhature', protein: 16, calories: 550, fat: 22, emoji: '\u{1FAD8}', unit: '1 plate' },
  { id: 'misal_pav', name: 'Misal Pav', protein: 14, calories: 420, fat: 14, emoji: '\u{1F35A}', unit: 'plate' },
  { id: 'pav_bhaji', name: 'Pav Bhaji', protein: 12, calories: 480, fat: 18, emoji: '\u{1F35E}', unit: 'plate' },
  { id: 'vada_pav', name: 'Vada Pav', protein: 8, calories: 320, fat: 14, emoji: '\u{1F35E}', unit: '1' },
  { id: 'samosa', name: 'Samosa', protein: 5, calories: 260, fat: 14, emoji: '\u{1F95F}', unit: '1' },
  { id: 'thepla', name: 'Thepla', protein: 5, calories: 140, fat: 5, emoji: '\u{1FAD3}', unit: '1' },
  { id: 'dhokla', name: 'Dhokla', protein: 8, calories: 180, fat: 4, emoji: '\u{1F95E}', unit: '2 pcs' },
  { id: 'handvo', name: 'Handvo', protein: 10, calories: 220, fat: 8, emoji: '\u{1F35E}', unit: 'slice' },
  { id: 'sev_tamatar', name: 'Sev Tamatar', protein: 6, calories: 240, fat: 12, emoji: '\u{1F345}', unit: 'bowl' },
  { id: 'baingan_bharta', name: 'Baingan Bharta', protein: 4, calories: 160, fat: 10, emoji: '\u{1F96C}', unit: 'bowl' },
  { id: 'bhindi', name: 'Bhindi Masala', protein: 3, calories: 140, fat: 9, emoji: '\u{1F966}', unit: 'bowl' },
  { id: 'lauki_sabzi', name: 'Lauki Sabzi', protein: 3, calories: 90, fat: 4, emoji: '\u{1F966}', unit: 'bowl' },
  { id: 'kadhi', name: 'Kadhi', protein: 8, calories: 180, fat: 8, emoji: '\u{1F963}', unit: 'bowl' },
  { id: 'sambar', name: 'Sambar', protein: 8, calories: 140, fat: 4, emoji: '\u{1F963}', unit: 'bowl' },
  { id: 'rasam', name: 'Rasam', protein: 3, calories: 60, fat: 1, emoji: '\u{1F963}', unit: 'bowl' },
  { id: 'coconut_chutney', name: 'Coconut Chutney', protein: 2, calories: 80, fat: 7, emoji: '\u{1F965}', unit: '2 tbsp' },
  { id: 'raita', name: 'Raita', protein: 5, calories: 90, fat: 4, emoji: '\u{1F95B}', unit: 'bowl' },
  { id: 'lassi', name: 'Lassi (sweet)', protein: 6, calories: 180, fat: 5, emoji: '\u{1F95B}', unit: 'glass' },
  { id: 'chaas', name: 'Chaas', protein: 4, calories: 70, fat: 2, emoji: '\u{1F95B}', unit: 'glass' },
  { id: 'buttermilk', name: 'Buttermilk', protein: 4, calories: 60, fat: 2, emoji: '\u{1F95B}', unit: 'glass' },
  { id: 'greek_yogurt', name: 'Greek Yogurt', protein: 17, calories: 120, fat: 0, emoji: '\u{1F95B}', unit: '150g' },
  { id: 'cottage_cheese', name: 'Cottage Cheese', protein: 14, calories: 110, fat: 4, emoji: '\u{1F9C0}', unit: '100g' },
  { id: 'soya_chunks', name: 'Soya Chunks', protein: 26, calories: 170, fat: 1, emoji: '\u{1FAD8}', unit: '50g dry' },
  { id: 'egg_bhurji', name: 'Egg Bhurji', protein: 14, calories: 200, fat: 14, emoji: '\u{1F95A}', unit: '2 eggs' },
  { id: 'omelette', name: 'Omelette', protein: 14, calories: 190, fat: 14, emoji: '\u{1F95A}', unit: '2 eggs' },
  { id: 'boiled_potato', name: 'Boiled Potato', protein: 3, calories: 130, fat: 0, emoji: '\u{1F954}', unit: '1 med' },
  { id: 'sweet_potato', name: 'Sweet Potato', protein: 2, calories: 110, fat: 0, emoji: '\u{1F954}', unit: '1 med' },
  { id: 'apple', name: 'Apple', protein: 0, calories: 95, fat: 0, emoji: '\u{1F34E}', unit: '1' },
  { id: 'orange', name: 'Orange', protein: 1, calories: 60, fat: 0, emoji: '\u{1F34A}', unit: '1' },
  { id: 'guava', name: 'Guava', protein: 2, calories: 70, fat: 1, emoji: '\u{1F345}', unit: '1' },
  { id: 'papaya', name: 'Papaya', protein: 1, calories: 60, fat: 0, emoji: '\u{1F34D}', unit: 'bowl' },
  { id: 'pomegranate', name: 'Pomegranate', protein: 2, calories: 80, fat: 1, emoji: '\u{1F347}', unit: 'bowl' },
  { id: 'almonds', name: 'Almonds', protein: 6, calories: 160, fat: 14, emoji: '\u{1F95C}', unit: '20g' },
  { id: 'cashews', name: 'Cashews', protein: 5, calories: 160, fat: 12, emoji: '\u{1F95C}', unit: '20g' },
  { id: 'ghee', name: 'Ghee', protein: 0, calories: 112, fat: 13, emoji: '\u{1F9C8}', unit: '1 tbsp' },
  { id: 'peanut_butter', name: 'Peanut Butter', protein: 8, calories: 190, fat: 16, emoji: '\u{1F95C}', unit: '2 tbsp' },
  { id: 'protein_bar', name: 'Protein Bar', protein: 20, calories: 220, fat: 8, emoji: '\u{1F36B}', unit: '1' },
  { id: 'idli', name: 'Idli', protein: 4, calories: 80, fat: 1, emoji: '\u{1F35A}', unit: '2' },
  { id: 'medu_vada', name: 'Medu Vada', protein: 6, calories: 200, fat: 10, emoji: '\u{1F35A}', unit: '2' },
  { id: 'appam', name: 'Appam', protein: 4, calories: 160, fat: 4, emoji: '\u{1F35A}', unit: '2' },
  { id: 'puttu', name: 'Puttu', protein: 5, calories: 220, fat: 3, emoji: '\u{1F35A}', unit: '1' },
];

/** Sum protein and calories from a food_log items array */
export function sumItemsMacros(items) {
  return (items || []).reduce(
    (acc, i) => {
      const qty = i.qty || 1;
      acc.protein += (i.protein || 0) * qty;
      acc.calories += (i.calories || 0) * qty;
      acc.fat += (i.fat || 0) * qty;
      return acc;
    },
    { protein: 0, calories: 0, fat: 0 }
  );
}

/** Prefer stored totals; fall back to summing items (e.g. after macro skill patch). */
export function macrosFromFoodLog(log) {
  const items = typeof log.items === 'string' ? JSON.parse(log.items) : (log.items || []);
  const fromItems = sumItemsMacros(items);
  return {
    items,
    protein: log.total_protein || fromItems.protein,
    calories: log.total_calories || fromItems.calories,
    fat: log.total_fat || fromItems.fat,
  };
}

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
  'Active Recovery': ['breakfast', 'lunch', 'snack', 'dinner'],
  Rest: ['breakfast', 'lunch', 'snack', 'dinner'],
  Gym: ['pre-workout', 'post-workout', 'lunch', 'snack', 'dinner'],
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
  Gym: { color: '#a78bfa', label: 'Gym' },
};

const DAY_BADGE_CLASS = {
  Run: 'day-badge--run',
  Bodyweight: 'day-badge--bodyweight',
  'Active Recovery': 'day-badge--active-recovery',
  Rest: 'day-badge--rest',
  Gym: 'day-badge--gym',
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
