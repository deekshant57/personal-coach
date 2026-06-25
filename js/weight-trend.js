// Weight trend sparkline from daily vitals (P12)
import { formatDayDisplayFromIso } from './week-stats.js';

export const WEIGHT_GOAL_KG = 70.5;
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

export function renderWeightSparkline(series, { goalKg = WEIGHT_GOAL_KG } = {}) {
  if (!series.length) {
    return '<p class="text-muted">Log morning weight on the Today tab to start your trend.</p>';
  }

  const latest = latestWeight(series);
  const avg = meanWeight(series);
  const weights = series.map((p) => p.kg);
  const minW = Math.min(...weights, goalKg) - 0.5;
  const maxW = Math.max(...weights) + 0.5;
  const span = maxW - minW || 1;

  const goalY = 100 - ((goalKg - minW) / span) * 100;
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
      <div class="weight-stat">
        <span class="weight-stat-label">Race goal</span>
        <span class="weight-stat-value">70–71 kg</span>
      </div>
      <div class="weight-stat">
        <span class="weight-stat-label">Trend</span>
        <span class="weight-stat-value">${deltaLabel}</span>
      </div>
    </div>
    <div class="weight-sparkline-wrap">
      <svg class="weight-sparkline" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <line class="weight-goal-line" x1="0" y1="${goalY}" x2="100" y2="${goalY}" />
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
