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
  // Mon–Sat Gym, Sunday Rest — beginner-friendly default
  return [
    { weekday: 1, day_type: 'Gym', session_window: sessionWindow, label: 'Lower' },
    { weekday: 2, day_type: 'Gym', session_window: sessionWindow, label: 'Upper' },
    { weekday: 3, day_type: 'Gym', session_window: sessionWindow, label: 'Lower' },
    { weekday: 4, day_type: 'Gym', session_window: sessionWindow, label: 'Full light' },
    { weekday: 5, day_type: 'Gym', session_window: sessionWindow, label: 'Upper' },
    { weekday: 6, day_type: 'Gym', session_window: sessionWindow, label: 'Lower' },
    { weekday: 0, day_type: 'Rest', session_window: null, label: null },
  ];
}
