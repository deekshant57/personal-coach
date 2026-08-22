// Weight trend sparkline from daily vitals (P12)
import { formatDayDisplayFromIso } from './week-stats.js';
import { getAthleteProfile } from './athlete-profile.js';

// Deekshant defaults (legacy exports) — UI should prefer getAthleteProfile()
export const WEIGHT_GOAL_KG = 73.5;
export const WEIGHT_GOAL_LABEL = '73–74 kg';
export const WEIGHT_SPARKLINE_DAYS = 56;

export function buildWeightSeries(vitalsRows) {
  return (vitalsRows || [])
    .filter((v) => v.weight_kg != null && !Number.isNaN(Number(v.weight_kg)))
    .map((v) => ({ date: v.date, kg: Number(v.weight_kg) }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function meanWeight(series) {
  if (!series.length) return null;
  const sum = series.reduce((s, p) => s + p.kg, 0);
  return Math.round((sum / series.length) * 10) / 10;
}

export function latestWeight(series) {
  return series.length ? series[series.length - 1] : null;
}

export function renderWeightSparkline(series, options = {}) {
  const profile = options.profile || getAthleteProfile();
  const goalKg = options.goalKg !== undefined ? options.goalKg : profile.weightGoalKg;
  const goalLabel = options.goalLabel !== undefined ? options.goalLabel : profile.weightGoalLabel;
  const goalStatLabel = options.goalStatLabel !== undefined
    ? options.goalStatLabel
    : (profile.weightGoalStatLabel || 'Goal');

  if (!series.length) {
    return '<p class="text-muted">Log morning weight on the Today tab to start your trend.</p>';
  }

  const latest = latestWeight(series);
  const avg = meanWeight(series);
  const weights = series.map((p) => p.kg);
  const minBase = goalKg != null ? Math.min(...weights, goalKg) : Math.min(...weights);
  const minW = minBase - 0.5;
  const maxW = Math.max(...weights) + 0.5;
  const span = maxW - minW || 1;

  const goalY = goalKg != null ? 100 - ((goalKg - minW) / span) * 100 : null;
  const points = series.map((p, i) => {
    const x = series.length === 1 ? 50 : (i / (series.length - 1)) * 100;
    const y = 100 - ((p.kg - minW) / span) * 100;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const first = series[0];
  const last = series[series.length - 1];
  const delta = last.kg - first.kg;
  const deltaLabel = delta === 0
    ? 'flat'
    : `${delta > 0 ? '+' : ''}${delta.toFixed(1)} kg vs ${formatDayDisplayFromIso(first.date)}`;

  const goalStat = goalKg != null && goalLabel
    ? `<div class="weight-stat">
        <span class="weight-stat-label">${goalStatLabel}</span>
        <span class="weight-stat-value">${goalLabel}</span>
      </div>`
    : '';

  return `
    <div class="weight-stats">
      <div class="weight-stat">
        <span class="weight-stat-label">Latest</span>
        <span class="weight-stat-value">${latest.kg} kg · ${formatDayDisplayFromIso(latest.date)}</span>
      </div>
      <div class="weight-stat">
        <span class="weight-stat-label">${series.length}-day avg</span>
        <span class="weight-stat-value">${avg} kg</span>
      </div>
      ${goalStat}
      <div class="weight-stat">
        <span class="weight-stat-label">Trend</span>
        <span class="weight-stat-value">${deltaLabel}</span>
      </div>
    </div>
    <div class="weight-sparkline-wrap">
      <svg class="weight-sparkline" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        ${goalY != null ? `<line class="weight-goal-line" x1="0" y1="${goalY}" x2="100" y2="${goalY}" />` : ''}
        <polyline class="weight-sparkline-line" points="${points}" />
      </svg>
      <div class="weight-sparkline-labels">
        <span>${minW.toFixed(1)}</span>
        <span>${maxW.toFixed(1)} kg</span>
      </div>
    </div>
    <p class="weight-sparkline-hint">Scale weight from morning vitals · ±0.5 kg = noise; watch 2+ week trends.</p>
  `;
}
