// Week windows + aggregates — single source for cross-day stats (P7)
import { MEAL_SLOTS } from './data.js';
import { isRunLogComplete } from './run-log.js';
import {
  fetchWeekPlans,
  fetchWeekRunLogs,
  fetchWeekVitals,
  fetchWeekFoodLogs,
  fetchWeekWorkoutLogs,
} from './supabase.js';
import { resolvePlansForRange } from './plan-merge.js';

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const KNEE_RANKS = {
  'Pain-free': 1,
  'Minor pressure': 2,
  Minor: 2,
  Discomfort: 3,
  Pain: 4,
};

const weekStatsCache = new Map();

// ── Local date helpers (no app.js import — avoids circular deps) ──

function calendarDate(d) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDayDisplayFromIso(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const dd = String(d.getDate()).padStart(2, '0');
  const mon = MONTH_ABBR[d.getMonth()];
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd} ${mon},${yy}`;
}

export function getWeekMonday(date) {
  const copy = calendarDate(date);
  const dayOfWeek = copy.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

export function getWeekSunday(date) {
  const monday = getWeekMonday(date);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return sunday;
}

export function getCurrentWeekRange(anchor) {
  const monday = getWeekMonday(anchor);
  const sunday = getWeekSunday(anchor);
  return { startIso: formatDate(monday), endIso: formatDate(sunday) };
}

export function getPriorWeekRange(anchor) {
  const monday = getWeekMonday(anchor);
  const priorMonday = new Date(monday);
  priorMonday.setDate(priorMonday.getDate() - 7);
  const priorSunday = new Date(priorMonday);
  priorSunday.setDate(priorSunday.getDate() + 6);
  return { startIso: formatDate(priorMonday), endIso: formatDate(priorSunday) };
}

export function formatWeekRangeLabel(startIso, endIso) {
  return `${formatDayDisplayFromIso(startIso)} – ${formatDayDisplayFromIso(endIso)}`;
}

export function invalidateWeekStatsCache() {
  weekStatsCache.clear();
}

// ── Pure helpers ─────────────────────────────────────────────

export function mean(values) {
  const nums = values.filter((v) => v != null && !Number.isNaN(Number(v)));
  if (!nums.length) return null;
  const sum = nums.reduce((a, b) => a + Number(b), 0);
  return Math.round((sum / nums.length) * 10) / 10;
}

export function worstKnee(runLogs) {
  let bestRank = 0;
  let label = null;
  for (const log of runLogs) {
    if (log.done !== true || !log.knee_status) continue;
    const rank = KNEE_RANKS[log.knee_status] || 0;
    if (rank > bestRank) {
      bestRank = rank;
      label = log.knee_status;
    }
  }
  return label;
}

function enumerateDates(startIso, endIso) {
  const dates = [];
  const [sy, sm, sd] = startIso.split('-').map(Number);
  const [ey, em, ed] = endIso.split('-').map(Number);
  const cur = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);
  while (cur.getTime() <= end.getTime()) {
    dates.push(formatDate(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function indexByDate(rows, dateKey = 'date') {
  const map = new Map();
  for (const row of rows || []) {
    if (row?.[dateKey]) map.set(row[dateKey], row);
  }
  return map;
}

function groupFoodByDate(foodRows) {
  const map = new Map();
  for (const row of foodRows || []) {
    if (!row.date) continue;
    if (!map.has(row.date)) map.set(row.date, []);
    map.get(row.date).push(row);
  }
  return map;
}

function mealSlotsForPlan(plan) {
  if (!plan?.day_type) return MEAL_SLOTS.Rest;
  return MEAL_SLOTS[plan.day_type] || MEAL_SLOTS.Rest;
}

function parseFoodItems(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw || '[]');
    } catch {
      return [];
    }
  }
  return [];
}

function isMealsCompleteForDay(slots, foodRows) {
  if (!slots.length) return true;
  const bySlot = new Map();
  for (const row of foodRows || []) {
    bySlot.set(row.meal_slot, row);
  }
  let filled = 0;
  for (const slot of slots) {
    const row = bySlot.get(slot);
    if (!row) continue;
    const items = parseFoodItems(row.items);
    const text = (row.custom_text || '').trim();
    if (items.length > 0 || text) filled++;
  }
  return filled >= slots.length;
}

function computeLongRunSeries(doneRuns) {
  const series = doneRuns
    .filter((r) => r.actual_km != null && Number(r.actual_km) > 0)
    .map((r) => ({ date: r.date, km: Number(r.actual_km) }))
    .sort((a, b) => a.date.localeCompare(b.date));

  let peakLongRun = null;
  for (const point of series) {
    if (!peakLongRun || point.km > peakLongRun.km || (point.km === peakLongRun.km && point.date > peakLongRun.date)) {
      peakLongRun = point;
    }
  }
  return { longRunSeries: series, peakLongRun };
}

function computeLongestRun(doneRuns) {
  let longestRun = null;
  let longestRunDate = null;
  for (const r of doneRuns) {
    const km = Number(r.actual_km);
    if (!km) continue;
    if (
      longestRun == null
      || km > longestRun
      || (km === longestRun && r.date > longestRunDate)
    ) {
      longestRun = km;
      longestRunDate = r.date;
    }
  }
  return { longestRun, longestRunDate };
}

// ── Pure aggregate (no I/O) ──────────────────────────────────

export function computeWeekStats(
  range,
  plans,
  runLogs,
  vitals,
  foodLogs,
  workoutLogs,
) {
  const doneRuns = (runLogs || []).filter((r) => r.done === true);
  const plannedKm = (plans || []).reduce(
    (sum, p) => (p.run_km != null ? sum + Number(p.run_km) : sum),
    0,
  );
  const actualKm = doneRuns.reduce((sum, r) => sum + (Number(r.actual_km) || 0), 0);
  const runDaysPlanned = (plans || []).filter((p) => p.run_type).length;
  const { longestRun, longestRunDate } = computeLongestRun(doneRuns);
  const avgSleep = mean((vitals || []).map((v) => v.sleep_hours));
  const cigsAvg = mean((vitals || []).map((v) => v.cigarettes));
  const kneeStatus = worstKnee(doneRuns);
  const { longRunSeries, peakLongRun } = computeLongRunSeries(doneRuns);

  const planByDate = indexByDate(plans);
  const vitalsByDate = indexByDate(vitals);
  const runByDate = indexByDate(runLogs);
  const workoutByDate = indexByDate(workoutLogs);
  const foodByDate = groupFoodByDate(foodLogs);

  const dayCompletion = enumerateDates(range.startIso, range.endIso).map((date) => {
    const plan = planByDate.get(date);
    const v = vitalsByDate.get(date);
    const vitalsDone = !!(v && (v.weight_kg != null || v.sleep_hours != null));

    let trainingDone = true;
    let trainingRequired = false;
    if (plan?.run_type) {
      trainingRequired = true;
      trainingDone = isRunLogComplete(runByDate.get(date));
    } else if (plan?.workout_plan) {
      trainingRequired = true;
      trainingDone = workoutByDate.get(date)?.done === true;
    }

    const slots = mealSlotsForPlan(plan);
    const mealsDone = isMealsCompleteForDay(slots, foodByDate.get(date));

    const complete = vitalsDone && (!trainingRequired || trainingDone) && mealsDone;

    return {
      date,
      vitals: vitalsDone,
      training: trainingRequired ? trainingDone : null,
      meals: mealsDone,
      complete,
    };
  });

  return {
    startIso: range.startIso,
    endIso: range.endIso,
    plannedKm,
    actualKm,
    longestRun,
    longestRunDate,
    runDaysPlanned,
    runDaysLogged: doneRuns.length,
    avgSleep,
    cigsAvg,
    kneeStatus,
    dayCompletion,
    longRunSeries,
    peakLongRun,
    tenPercentCeiling: actualKm > 0 ? Math.round(actualKm * 1.1 * 10) / 10 : null,
  };
}

// ── Fetch + cache ────────────────────────────────────────────

export async function getWeekStats(range, { force = false, plans: plansOverride } = {}) {
  const key = `${range.startIso}_${range.endIso}`;
  if (!force && !plansOverride && weekStatsCache.has(key)) {
    return weekStatsCache.get(key);
  }

  const [fetchedPlans, runLogs, vitals, foodLogs, workoutLogs] = await Promise.all([
    plansOverride ? Promise.resolve(plansOverride) : fetchWeekPlans(range.startIso, range.endIso),
    fetchWeekRunLogs(range.startIso, range.endIso),
    fetchWeekVitals(range.startIso, range.endIso),
    fetchWeekFoodLogs(range.startIso, range.endIso),
    fetchWeekWorkoutLogs(range.startIso, range.endIso),
  ]);

  const plans = plansOverride
    ? fetchedPlans
    : resolvePlansForRange(range.startIso, range.endIso, fetchedPlans);

  const stats = computeWeekStats(range, plans, runLogs, vitals, foodLogs, workoutLogs);
  if (!plansOverride) weekStatsCache.set(key, stats);
  return stats;
}

export function formatMondayCheckInLine(vitals, priorWeekStats) {
  const weight = vitals?.weight_kg ?? '-';
  const waist = vitals?.waist_inches ?? '-';

  let longest = '-';
  if (priorWeekStats?.longestRun != null) {
    const km = Number(priorWeekStats.longestRun);
    const displayKm = Number.isInteger(km) ? km : km.toFixed(1);
    longest = `${displayKm} km (${formatDayDisplayFromIso(priorWeekStats.longestRunDate)})`;
  }

  const sleep = priorWeekStats?.avgSleep != null ? `${priorWeekStats.avgSleep}h` : '-';
  const knee = priorWeekStats?.kneeStatus || '-';
  const cigs = priorWeekStats?.cigsAvg != null ? String(priorWeekStats.cigsAvg) : '-';

  return `${weight} / ${waist} / ${longest} / ${sleep} / ${knee} / ${cigs}`;
}

export async function getMondayCheckInLine(anchorDate, vitals, { force = false } = {}) {
  const range = getPriorWeekRange(anchorDate);
  const priorStats = await getWeekStats(range, { force });
  return formatMondayCheckInLine(vitals, priorStats);
}

export const LONG_RUN_TARGET_MIN_KM = 18;
export const LONG_RUN_TARGET_MAX_KM = 20;
export const RACE_DATE = new Date(2026, 8, 6);

export function formatKm(n) {
  if (n == null || Number.isNaN(Number(n))) return '0';
  const v = Number(n);
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

export function getRaceCountdownDays(fromDate = new Date()) {
  const race = new Date(RACE_DATE);
  race.setHours(0, 0, 0, 0);
  const today = new Date(fromDate);
  today.setHours(0, 0, 0, 0);
  const days = Math.ceil((race - today) / 86400000);
  return Math.max(0, days);
}

export function buildLongRunProgress(runLogs) {
  const doneRuns = (runLogs || []).filter((r) => r.done === true);
  const { longRunSeries, peakLongRun } = computeLongRunSeries(doneRuns);
  const latestLongRun = longRunSeries.length ? longRunSeries[longRunSeries.length - 1] : null;
  return { longRunSeries, peakLongRun, latestLongRun };
}

export function getTenPercentCapKm(priorWeekActualKm) {
  const actual = Number(priorWeekActualKm);
  if (!actual || actual <= 0) return null;
  return Math.round(actual * 1.1 * 10) / 10;
}
