// Trend series builders and renderers (Sprint 4)
import {
  buildSeries,
  renderSparklineCard,
  renderComplianceStrip,
  renderKneeTimeline,
  renderRpeDots,
  renderWeeklyMileageChart,
  SPARKLINE_DAYS,
} from './sparkline.js';
import {
  buildWeightSeries,
  renderWeightSparkline,
  WEIGHT_GOAL_KG,
  WEIGHT_GOAL_LABEL,
} from './weight-trend.js';
import { getWeekMonday, formatDate, formatDayDisplayFromIso } from './week-stats.js';
import { resolvePlansForRange } from './plan-merge.js';

export { SPARKLINE_DAYS };

export function lookbackStartIso(days = SPARKLINE_DAYS) {
  const d = new Date();
  d.setDate(d.getDate() - (days - 1));
  return formatDate(d);
}

export function complianceStartIso(days = 14) {
  const d = new Date();
  d.setDate(d.getDate() - (days - 1));
  return formatDate(d);
}

export function buildSleepSeries(vitals) {
  return buildSeries(vitals, { valueKey: 'sleep_hours' });
}

export function buildCigaretteSeries(vitals) {
  return buildSeries(vitals, { valueKey: 'cigarettes' });
}

export function buildWaistSeries(vitals) {
  return buildSeries(vitals, { valueKey: 'waist_inches', filter: (v) => v.waist_inches != null });
}

export function buildCadenceSeries(runLogs) {
  return buildSeries(runLogs, {
    valueKey: 'cadence',
    filter: (r) => r.done === true && r.cadence != null,
  });
}

export function buildWeeklyMileage(runLogs, weekCount = 8) {
  const done = (runLogs || []).filter((r) => r.done === true && r.actual_km != null);
  const weeks = [];

  for (let i = weekCount - 1; i >= 0; i -= 1) {
    const anchor = new Date();
    anchor.setDate(anchor.getDate() - i * 7);
    const monday = getWeekMonday(anchor);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const startIso = formatDate(monday);
    const endIso = formatDate(sunday);

    const actual = done
      .filter((r) => r.date >= startIso && r.date <= endIso)
      .reduce((s, r) => s + Number(r.actual_km), 0);

    weeks.push({
      label: `W${weekCount - i}`,
      startIso,
      endIso,
      actual: Math.round(actual * 10) / 10,
      planned: null,
    });
  }

  return weeks;
}

export function enrichWeeklyMileageWithPlans(weeks, plans) {
  const planMap = new Map((plans || []).map((p) => [p.date, p]));
  return weeks.map((w) => {
    let planned = 0;
    const cur = new Date(`${w.startIso}T12:00:00`);
    const end = new Date(`${w.endIso}T12:00:00`);
    while (cur <= end) {
      const iso = formatDate(cur);
      const plan = planMap.get(iso);
      if (plan?.run_km != null) planned += Number(plan.run_km);
      cur.setDate(cur.getDate() + 1);
    }
    return { ...w, planned: planned > 0 ? Math.round(planned * 10) / 10 : null };
  });
}

function groupFoodProteinByDate(foodRows) {
  const map = new Map();
  for (const row of foodRows || []) {
    if (!row.date) continue;
    const prev = map.get(row.date) || 0;
    map.set(row.date, prev + (Number(row.total_protein) || 0));
  }
  return map;
}

function groupFoodCaloriesByDate(foodRows) {
  const map = new Map();
  for (const row of foodRows || []) {
    if (!row.date) continue;
    const prev = map.get(row.date) || 0;
    map.set(row.date, prev + (Number(row.total_calories) || 0));
  }
  return map;
}

function enumerateDates(startIso, endIso) {
  const dates = [];
  const [sy, sm, sd] = startIso.split('-').map(Number);
  const [ey, em, ed] = endIso.split('-').map(Number);
  const cur = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);
  while (cur <= end) {
    dates.push(formatDate(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export function buildProteinCompliance(foodRows, plans, { days = 14 } = {}) {
  const endIso = formatDate(new Date());
  const startIso = complianceStartIso(days);
  const proteinByDate = groupFoodProteinByDate(foodRows);
  const planMap = new Map((plans || []).map((p) => [p.date, p]));
  const dates = enumerateDates(startIso, endIso);

  return dates.map((date) => {
    const target = planMap.get(date)?.protein_target ?? 140;
    const actual = proteinByDate.get(date) ?? 0;
    const hit = actual >= target;
    return {
      date,
      hit,
      detail: actual > 0 ? `${Math.round(actual)}g / ${target}g` : 'not logged',
    };
  });
}

export function buildCalorieCompliance(foodRows, plans, { days = 14 } = {}) {
  const endIso = formatDate(new Date());
  const startIso = complianceStartIso(days);
  const calByDate = groupFoodCaloriesByDate(foodRows);
  const planMap = new Map((plans || []).map((p) => [p.date, p]));
  const dates = enumerateDates(startIso, endIso);

  return dates.map((date) => {
    const target = planMap.get(date)?.calorie_target;
    const actual = calByDate.get(date) ?? 0;
    if (!target || actual === 0) {
      return { date, hit: false, detail: actual > 0 ? `${actual} kcal` : 'not logged' };
    }
    const low = target * 0.85;
    const high = target * 1.15;
    const hit = actual >= low && actual <= high;
    return { date, hit, detail: `${actual} / ${target} kcal` };
  });
}

export function buildRpeSessions(runLogs, workoutLogs) {
  const sessions = [];
  for (const r of runLogs || []) {
    if (r.done === true && r.rpe != null) {
      sessions.push({ date: r.date, rpe: r.rpe, type: 'run' });
    }
  }
  for (const w of workoutLogs || []) {
    if (w.done === true && w.rpe != null) {
      sessions.push({ date: w.date, rpe: w.rpe, type: 'workout' });
    }
  }
  return sessions;
}

export function renderWeightTrend(vitals) {
  return renderWeightSparkline(buildWeightSeries(vitals));
}

export function renderSleepTrend(vitals) {
  return renderSparklineCard({
    label: 'Sleep',
    series: buildSleepSeries(vitals),
    unit: 'h',
    targetLine: 7,
    targetLabel: 'floor: 7h',
    deltaDirection: 'up-good',
    emptyMessage: 'Log sleep on the Today tab to start your trend.',
    hint: 'Watch 3+ night patterns — single nights vary.',
    formatLatest: (p) => `${p.value}h · ${formatDayDisplayFromIso(p.date)}`,
  });
}

export function renderCigaretteTrend(vitals) {
  return renderSparklineCard({
    label: 'Cigarettes',
    series: buildCigaretteSeries(vitals),
    unit: '/day',
    deltaDirection: 'down-good',
    emptyMessage: 'Log cigarettes on the Today tab to track the trend.',
    formatLatest: (p) => `${p.value}/day · ${formatDayDisplayFromIso(p.date)}`,
  });
}

export function renderCadenceTrend(runLogs) {
  return renderSparklineCard({
    label: 'Cadence',
    series: buildCadenceSeries(runLogs),
    unit: 'spm',
    targetLine: 150,
    targetLabel: 'target: 150',
    deltaDirection: 'up-good',
    emptyMessage: 'Cadence trend builds after logged runs.',
    formatLatest: (p) => `${p.value} spm · ${formatDayDisplayFromIso(p.date)}`,
  });
}

export function renderWaistTrend(vitals) {
  return renderSparklineCard({
    label: 'Waist',
    series: buildWaistSeries(vitals),
    unit: 'in',
    deltaDirection: 'down-good',
    emptyMessage: 'Waist is logged on Monday vitals.',
    formatLatest: (p) => `${p.value}" · ${formatDayDisplayFromIso(p.date)}`,
  });
}

export async function resolvePlansForCompliance(startIso, endIso, rawPlans) {
  return resolvePlansForRange(startIso, endIso, rawPlans || []);
}
