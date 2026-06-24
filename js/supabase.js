// Supabase client — configure once, use everywhere
// Replace these with your actual Supabase project values

const SUPABASE_URL = localStorage.getItem('supabase_url') || 'https://lqtwtcgnzpsrhfuynzdk.supabase.co';
const SUPABASE_ANON_KEY = localStorage.getItem('supabase_key') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxdHd0Y2duenBzcmhmdXluemRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNjU1MzUsImV4cCI6MjA5Nzg0MTUzNX0.QqfjgnC3b_VjWUrKbhgb4YF-FDN2ptZgYQ3WoyjMer4';

let supabase = null;

export function isConfigured() {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export async function initSupabase() {
  if (!isConfigured()) return null;

  // Load Supabase JS from CDN
  if (!window.supabase) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabase;
}

export function getClient() {
  return supabase;
}

// ── Config UI ────────────────────────────────────────────────
export function saveConfig(url, key) {
  localStorage.setItem('supabase_url', url);
  localStorage.setItem('supabase_key', key);
  window.location.reload();
}

// ── Daily Plans ──────────────────────────────────────────────
export async function fetchDailyPlan(date) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('daily_plans')
    .select('*')
    .eq('date', date)
    .maybeSingle();
  if (error) { console.error('fetchDailyPlan:', error); return null; }
  return data;
}

export async function fetchWeekPlans(startDate, endDate) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('daily_plans')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date');
  if (error) { console.error('fetchWeekPlans:', error); return []; }
  return data || [];
}

// ── Daily Vitals ─────────────────────────────────────────────
export async function fetchVitals(date) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('daily_vitals')
    .select('*')
    .eq('date', date)
    .maybeSingle();
  if (error) { console.error('fetchVitals:', error); return null; }
  return data;
}

export async function upsertVitals(date, vitals) {
  if (!supabase) return saveLocal('vitals', date, vitals);
  const { error } = await supabase
    .from('daily_vitals')
    .upsert({ date, ...vitals, updated_at: new Date().toISOString() }, { onConflict: 'date' });
  if (error) console.error('upsertVitals:', error);
  return !error;
}

// ── Food Logs ────────────────────────────────────────────────
export async function fetchFoodLogs(date) {
  if (!supabase) return getLocal('food', date) || [];
  const { data, error } = await supabase
    .from('food_logs')
    .select('*')
    .eq('date', date)
    .order('created_at');
  if (error) { console.error('fetchFoodLogs:', error); return []; }
  return data || [];
}

export async function upsertFoodLog(date, mealSlot, items, customText, totalProtein, totalCalories) {
  if (!supabase) return saveLocal('food', `${date}_${mealSlot}`, { date, meal_slot: mealSlot, items, custom_text: customText, total_protein: totalProtein, total_calories: totalCalories });
  const { error } = await supabase
    .from('food_logs')
    .upsert({
      date,
      meal_slot: mealSlot,
      items: JSON.stringify(items),
      custom_text: customText || null,
      total_protein: totalProtein,
      total_calories: totalCalories,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'date,meal_slot' });
  if (error) console.error('upsertFoodLog:', error);
  return !error;
}

export async function deleteFoodLog(date, mealSlot) {
  if (!supabase) {
    deleteLocalFoodLog(date, mealSlot);
    return;
  }
  const { error } = await supabase
    .from('food_logs')
    .delete()
    .eq('date', date)
    .eq('meal_slot', mealSlot);
  if (error) console.error('deleteFoodLog:', error);
}

function deleteLocalFoodLog(date, mealSlot) {
  const store = JSON.parse(localStorage.getItem('coach_food') || '{}');
  delete store[`${date}_${mealSlot}`];
  localStorage.setItem('coach_food', JSON.stringify(store));
}

// ── Run Logs ─────────────────────────────────────────────────
export async function fetchRunLog(date) {
  if (!supabase) return getLocal('run', date);
  const { data, error } = await supabase
    .from('run_logs')
    .select('*')
    .eq('date', date)
    .maybeSingle();
  if (error) { console.error('fetchRunLog:', error); return null; }
  return data;
}

export async function upsertRunLog(date, log) {
  if (!supabase) return saveLocal('run', date, log);
  const { error } = await supabase
    .from('run_logs')
    .upsert({ date, ...log, updated_at: new Date().toISOString() }, { onConflict: 'date' });
  if (error) console.error('upsertRunLog:', error);
  return !error;
}

// ── Workout Logs ─────────────────────────────────────────────
export async function fetchWorkoutLog(date) {
  if (!supabase) return getLocal('workout', date);
  const { data, error } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('date', date)
    .maybeSingle();
  if (error) { console.error('fetchWorkoutLog:', error); return null; }
  return data;
}

export async function upsertWorkoutLog(date, log) {
  if (!supabase) return saveLocal('workout', date, log);
  const { error } = await supabase
    .from('workout_logs')
    .upsert({ date, ...log, updated_at: new Date().toISOString() }, { onConflict: 'date' });
  if (error) console.error('upsertWorkoutLog:', error);
  return !error;
}

// ── LocalStorage fallback (works without Supabase for testing) ──
function saveLocal(type, key, data) {
  const store = JSON.parse(localStorage.getItem(`coach_${type}`) || '{}');
  store[key] = data;
  localStorage.setItem(`coach_${type}`, JSON.stringify(store));
  return true;
}

function getLocal(type, key) {
  const store = JSON.parse(localStorage.getItem(`coach_${type}`) || '{}');
  return store[key] || null;
}

// For food logs, return all entries for a date from localStorage
export function getLocalFoodLogs(date) {
  const store = JSON.parse(localStorage.getItem('coach_food') || '{}');
  return Object.entries(store)
    .filter(([k]) => k.startsWith(date))
    .map(([, v]) => v);
}
