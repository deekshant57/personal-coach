// Seed daily_plans from athlete week_template (Phase A)
import { upsertDailyPlan, fetchWeekPlans } from './supabase.js';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function addDays(isoOrDate, n) {
  const d = typeof isoOrDate === 'string'
    ? (() => {
        const [y, m, day] = isoOrDate.split('-').map(Number);
        return new Date(y, m - 1, day);
      })()
    : new Date(isoOrDate);
  d.setDate(d.getDate() + n);
  return d;
}

function isoFromDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function templateEntryForDate(weekTemplate, date) {
  const weekday = date.getDay();
  const list = Array.isArray(weekTemplate) ? weekTemplate : [];
  return list.find((e) => Number(e.weekday) === weekday) || {
    weekday,
    day_type: 'Rest',
    session_window: null,
    label: null,
  };
}

function calorieForDay(profile, entry, weekday) {
  if (
    profile.calorie_target_special != null
    && profile.special_day_weekday != null
    && Number(profile.special_day_weekday) === weekday
  ) {
    return profile.calorie_target_special;
  }
  const training = entry.day_type === 'Run'
    || entry.day_type === 'Gym'
    || entry.day_type === 'Bodyweight';
  return training
    ? (profile.calorie_target_training || 2000)
    : (profile.calorie_target_rest || 1800);
}

function buildPlanRow(profile, date, entry) {
  const weekday = date.getDay();
  const dayType = entry.day_type || 'Rest';
  const label = entry.label || null;
  const window = entry.session_window || profile.default_session_window || 'morning';
  const isTraining = dayType === 'Run' || dayType === 'Gym' || dayType === 'Bodyweight';

  const row = {
    date: isoFromDate(date),
    day_name: DAY_NAMES[weekday],
    day_type: dayType,
    protein_target: profile.protein_target_g || 120,
    calorie_target: calorieForDay(profile, entry, weekday),
    water_target: '2L',
    directive: label || (isTraining ? 'Training day' : 'Rest'),
    planned_session_window: isTraining ? window : null,
    actual_session_window: null,
    session_status: 'planned',
    slot_scheme: null,
    run_type: null,
    run_km: null,
    run_pace: null,
    run_cue: null,
    workout_plan: null,
    workout_detail: null,
    meals_plan: null,
  };

  if (dayType === 'Run') {
    row.run_type = label || 'Run';
  } else if (dayType === 'Gym' || dayType === 'Bodyweight') {
    row.workout_plan = label || dayType;
  }

  return row;
}

/** True if a coach (or prior seed) already authored meaningful plan content. */
export function planIsCoachAuthored(plan) {
  if (!plan) return false;
  if (plan.run_km != null) return true;
  if (plan.run_pace) return true;
  if (plan.run_cue) return true;
  if (plan.workout_detail) return true;
  if (plan.meals_plan) return true;
  const directive = (plan.directive || '').trim();
  if (directive && directive !== 'Training day' && directive !== 'Rest') {
    // Custom directive beyond template defaults — treat as authored
    return true;
  }
  return false;
}

/**
 * Seed missing daily_plans for [today … today+daysInclusive-1].
 * Never overwrites coach-authored rows. Fills empty dates only.
 */
export async function seedPlansFromProfile(profile, { days = 14, fromDate = new Date() } = {}) {
  if (!profile?.week_template?.length) {
    return { inserted: 0, skipped: 0 };
  }

  const start = new Date(fromDate);
  start.setHours(0, 0, 0, 0);
  const end = addDays(start, days - 1);
  const startIso = isoFromDate(start);
  const endIso = isoFromDate(end);

  const existing = await fetchWeekPlans(startIso, endIso);
  const byDate = new Map((existing || []).map((p) => [p.date, p]));

  let inserted = 0;
  let skipped = 0;

  for (let i = 0; i < days; i++) {
    const date = addDays(start, i);
    const iso = isoFromDate(date);
    const current = byDate.get(iso);
    if (current) {
      skipped += 1;
      continue;
    }
    const entry = templateEntryForDate(profile.week_template, date);
    const row = buildPlanRow(profile, date, entry);
    const ok = await upsertDailyPlan(iso, row);
    if (ok) inserted += 1;
  }

  return { inserted, skipped };
}

export function defaultWeekTemplate(sessionWindow = 'morning') {
  return weekTemplateForSportMode('gym', sessionWindow);
}

/** @param {'gym'|'run'|'hybrid'} sportMode */
export function weekTemplateForSportMode(sportMode = 'gym', sessionWindow = 'morning') {
  const w = sessionWindow || 'morning';
  if (sportMode === 'run') {
    return [
      { weekday: 1, day_type: 'Run', session_window: w, label: 'Easy run' },
      { weekday: 2, day_type: 'Run', session_window: w, label: 'Easy run' },
      { weekday: 3, day_type: 'Rest', session_window: null, label: null },
      { weekday: 4, day_type: 'Run', session_window: w, label: 'Easy run' },
      { weekday: 5, day_type: 'Rest', session_window: null, label: null },
      { weekday: 6, day_type: 'Run', session_window: w, label: 'Long run' },
      { weekday: 0, day_type: 'Rest', session_window: null, label: null },
    ];
  }
  if (sportMode === 'hybrid') {
    return [
      { weekday: 1, day_type: 'Gym', session_window: w, label: 'Upper' },
      { weekday: 2, day_type: 'Run', session_window: w, label: 'Easy run' },
      { weekday: 3, day_type: 'Gym', session_window: w, label: 'Lower' },
      { weekday: 4, day_type: 'Run', session_window: w, label: 'Easy run' },
      { weekday: 5, day_type: 'Gym', session_window: w, label: 'Full body' },
      { weekday: 6, day_type: 'Run', session_window: w, label: 'Long run' },
      { weekday: 0, day_type: 'Rest', session_window: null, label: null },
    ];
  }
  // gym-only — Mon–Sat Gym, Sunday Rest
  return [
    { weekday: 1, day_type: 'Gym', session_window: w, label: 'Lower' },
    { weekday: 2, day_type: 'Gym', session_window: w, label: 'Upper' },
    { weekday: 3, day_type: 'Gym', session_window: w, label: 'Lower' },
    { weekday: 4, day_type: 'Gym', session_window: w, label: 'Full light' },
    { weekday: 5, day_type: 'Gym', session_window: w, label: 'Upper' },
    { weekday: 6, day_type: 'Gym', session_window: w, label: 'Lower' },
    { weekday: 0, day_type: 'Rest', session_window: null, label: null },
  ];
}

/** Default goal_primary for a sport preset. */
export function goalForSportMode(sportMode) {
  if (sportMode === 'run') return 'endurance';
  if (sportMode === 'hybrid') return 'general';
  return 'strength';
}

/**
 * Infer sport mode from profile when sport_mode column is missing.
 * @returns {'gym'|'run'|'hybrid'}
 */
export function deriveSportMode(profile) {
  const explicit = profile?.sport_mode;
  if (explicit === 'gym' || explicit === 'run' || explicit === 'hybrid') return explicit;
  const list = Array.isArray(profile?.week_template) ? profile.week_template : [];
  let hasGym = false;
  let hasRun = false;
  for (const e of list) {
    if (e.day_type === 'Gym' || e.day_type === 'Bodyweight') hasGym = true;
    if (e.day_type === 'Run') hasRun = true;
  }
  if (hasGym && hasRun) return 'hybrid';
  if (hasRun && !hasGym) return 'run';
  return 'gym';
}

/** Human-readable run plan line without "null km". */
export function formatRunPlanLabel(plan) {
  if (!plan?.run_type && plan?.day_type !== 'Run') return '';
  const type = plan.run_type || 'Run';
  const km = plan.run_km;
  const pace = plan.run_pace;
  const parts = [type];
  if (km != null && km !== '' && !Number.isNaN(Number(km))) {
    parts.push(`${km} km`);
  }
  if (pace) parts.push(`@ ${pace}`);
  return parts.join(' ');
}

/**
 * Ensure daily_plans exist for the next `days` from today (fills gaps only).
 * Call when friends approach the end of their seeded window.
 */
export async function ensurePlansExtended(profile, { days = 14, minRemaining = 3 } = {}) {
  if (!profile?.week_template?.length) {
    return { inserted: 0, skipped: 0, extended: false };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = addDays(today, days - 1);
  const existing = await fetchWeekPlans(isoFromDate(today), isoFromDate(end));
  const byDate = new Set((existing || []).map((p) => p.date));
  let remaining = 0;
  for (let i = 0; i < days; i++) {
    if (byDate.has(isoFromDate(addDays(today, i)))) remaining += 1;
  }
  if (remaining >= minRemaining) {
    return { inserted: 0, skipped: remaining, extended: false };
  }
  const result = await seedPlansFromProfile(profile, { days, fromDate: today });
  return { ...result, extended: result.inserted > 0 };
}
