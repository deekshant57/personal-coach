// Supabase client — all data scoped to logged-in user

const SUPABASE_URL = localStorage.getItem('supabase_url') || 'https://lqtwtcgnzpsrhfuynzdk.supabase.co';
const SUPABASE_ANON_KEY = localStorage.getItem('supabase_key') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxdHd0Y2duenBzcmhmdXluemRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNjU1MzUsImV4cCI6MjA5Nzg0MTUzNX0.QqfjgnC3b_VjWUrKbhgb4YF-FDN2ptZgYQ3WoyjMer4';

let supabase = null;
let currentUserId = null;

export function isConfigured() {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export function setCurrentUserId(userId) {
  currentUserId = userId;
}

export async function initSupabase() {
  if (!isConfigured()) throw new Error('Supabase not configured');

  if (!window.supabase) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Failed to load Supabase SDK'));
      document.head.appendChild(script);
    });
  }

  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
  return supabase;
}

export function getClient() {
  return supabase;
}

function uid() {
  return currentUserId;
}

// ── Daily Plans ──────────────────────────────────────────────
export async function fetchDailyPlan(date) {
  if (!supabase || !uid()) return null;
  const { data, error } = await supabase
    .from('daily_plans')
    .select('*')
    .eq('user_id', uid())
    .eq('date', date)
    .maybeSingle();
  if (error) { console.error('fetchDailyPlan:', error); return null; }
  return data;
}

export async function fetchWeekPlans(startDate, endDate) {
  if (!supabase || !uid()) return [];
  const { data, error } = await supabase
    .from('daily_plans')
    .select('*')
    .eq('user_id', uid())
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date');
  if (error) { console.error('fetchWeekPlans:', error); return []; }
  return data || [];
}

// ── Daily Vitals ─────────────────────────────────────────────
export async function fetchVitals(date) {
  if (!supabase || !uid()) return null;
  const { data, error } = await supabase
    .from('daily_vitals')
    .select('*')
    .eq('user_id', uid())
    .eq('date', date)
    .maybeSingle();
  if (error) { console.error('fetchVitals:', error); return null; }
  return data;
}

export async function upsertVitals(date, vitals) {
  if (!supabase || !uid()) return false;
  const { error } = await supabase
    .from('daily_vitals')
    .upsert(
      { user_id: uid(), date, ...vitals, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,date' }
    );
  if (error) console.error('upsertVitals:', error);
  return !error;
}

// ── Food Logs ────────────────────────────────────────────────
export async function fetchFoodLogs(date) {
  if (!supabase || !uid()) return [];
  const { data, error } = await supabase
    .from('food_logs')
    .select('*')
    .eq('user_id', uid())
    .eq('date', date)
    .order('created_at');
  if (error) { console.error('fetchFoodLogs:', error); return []; }
  return data || [];
}

export async function upsertFoodLog(date, mealSlot, items, customText, totalProtein, totalCalories) {
  if (!supabase || !uid()) return false;
  const { error } = await supabase
    .from('food_logs')
    .upsert({
      user_id: uid(),
      date,
      meal_slot: mealSlot,
      items: JSON.stringify(items),
      custom_text: customText || null,
      total_protein: totalProtein,
      total_calories: totalCalories,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,date,meal_slot' });
  if (error) console.error('upsertFoodLog:', error);
  return !error;
}

export async function deleteFoodLog(date, mealSlot) {
  if (!supabase || !uid()) return;
  const { error } = await supabase
    .from('food_logs')
    .delete()
    .eq('user_id', uid())
    .eq('date', date)
    .eq('meal_slot', mealSlot);
  if (error) console.error('deleteFoodLog:', error);
}

// ── Run Logs ─────────────────────────────────────────────────
export async function fetchRunLog(date) {
  if (!supabase || !uid()) return null;
  const { data, error } = await supabase
    .from('run_logs')
    .select('*')
    .eq('user_id', uid())
    .eq('date', date)
    .maybeSingle();
  if (error) { console.error('fetchRunLog:', error); return null; }
  return data;
}

export async function upsertRunLog(date, log) {
  if (!supabase || !uid()) return false;
  const { error } = await supabase
    .from('run_logs')
    .upsert(
      { user_id: uid(), date, ...log, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,date' }
    );
  if (error) console.error('upsertRunLog:', error);
  return !error;
}

// ── Workout Logs ─────────────────────────────────────────────
export async function fetchWorkoutLog(date) {
  if (!supabase || !uid()) return null;
  const { data, error } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', uid())
    .eq('date', date)
    .maybeSingle();
  if (error) { console.error('fetchWorkoutLog:', error); return null; }
  return data;
}

export async function upsertWorkoutLog(date, log) {
  if (!supabase || !uid()) return false;
  const { error } = await supabase
    .from('workout_logs')
    .upsert(
      { user_id: uid(), date, ...log, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,date' }
    );
  if (error) console.error('upsertWorkoutLog:', error);
  return !error;
}
