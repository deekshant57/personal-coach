// Reusable sparkline, compliance strip, and dot timelines (Sprint 4)
import { formatDayDisplayFromIso } from './week-stats.js';

export const SPARKLINE_DAYS = 56;

export function buildSeries(rows, { dateKey = 'date', valueKey, filter } = {}) {
  return (rows || [])
    .filter((row) => {
      if (filter && !filter(row)) return false;
      const v = row[valueKey];
      return v != null && !Number.isNaN(Number(v));
    })
    .map((row) => ({ date: row[dateKey], value: Number(row[valueKey]) }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function meanValue(series) {
  if (!series.length) return null;
  const sum = series.reduce((s, p) => s + p.value, 0);
  return Math.round((sum / series.length) * 10) / 10;
}

export function latestPoint(series) {
  return series.length ? series[series.length - 1] : null;
}

export function computeDelta(series) {
  if (series.length < 2) return null;
  const first = series[0].value;
  const last = series[series.length - 1].value;
  return { from: first, to: last, delta: last - first };
}

function deltaClass(delta, direction) {
  if (delta == null || delta === 0) return 'sparkline-delta--neutral';
  const improving = direction === 'down-good' ? delta < 0 : delta > 0;
  return improving ? 'sparkline-delta--good' : 'sparkline-delta--warn';
}

function formatDelta(delta, unit, decimals = 1) {
  if (delta == null) return '—';
  if (delta === 0) return 'flat';
  const sign = delta > 0 ? '+' : '';
  const val = Number.isInteger(delta) ? delta : delta.toFixed(decimals);
  return `${sign}${val}${unit}`;
}

export function renderSparklineSvg(series, {
  targetLine = null,
  targetLabel = null,
  unit = '',
  ariaLabel = '',
  lowerBetter = false,
} = {}) {
  const values = series.map((p) => p.value);
  const minV = Math.min(...values, targetLine ?? Infinity) - (unit === 'kg' ? 0.5 : 0.3);
  const maxV = Math.max(...values, targetLine ?? -Infinity) + (unit === 'kg' ? 0.5 : 0.3);
  const span = maxV - minV || 1;

  const toY = (v) => 100 - ((v - minV) / span) * 100;
  const points = series.map((p, i) => {
    const x = series.length === 1 ? 50 : (i / (series.length - 1)) * 100;
    return `${x.toFixed(1)},${toY(p.value).toFixed(1)}`;
  }).join(' ');

  const goalY = targetLine != null ? toY(targetLine) : null;
  const label = ariaLabel || `Trend from ${series[0].value} to ${series[series.length - 1].value} ${unit}`.trim();

  return `
    <div class="sparkline-wrap">
      <svg class="sparkline" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="${escapeAttr(label)}">
        ${goalY != null ? `<line class="sparkline-target-line" x1="0" y1="${goalY}" x2="100" y2="${goalY}" />` : ''}
        <polyline class="sparkline-line" points="${points}" />
      </svg>
      <div class="sparkline-labels">
        <span>${formatAxis(minV, unit)}</span>
        ${targetLabel && goalY != null ? `<span class="sparkline-target-label">${escapeHtml(targetLabel)}</span>` : '<span></span>'}
        <span>${formatAxis(maxV, unit)}</span>
      </div>
    </div>`;
}

function formatAxis(v, unit) {
  const n = Number(v);
  const text = unit === 'kg' ? n.toFixed(1) : (Number.isInteger(n) ? String(n) : n.toFixed(1));
  return unit ? `${text} ${unit}` : text;
}

export function renderSparklineCard({
  label,
  series,
  unit = '',
  targetLine = null,
  targetLabel = null,
  deltaDirection = 'up-good',
  emptyMessage = 'No data yet.',
  hint = null,
  formatLatest = null,
  extraStats = [],
} = {}) {
  if (!series?.length) {
    return `<p class="text-muted">${escapeHtml(emptyMessage)}</p>`;
  }

  const latest = latestPoint(series);
  const avg = meanValue(series);
  const delta = computeDelta(series);
  const deltaCls = deltaClass(delta?.delta, deltaDirection);
  const first = series[0];
  const deltaText = delta
    ? `${formatDelta(delta.delta, unit === 'h' ? 'h' : unit === 'kg' ? ' kg' : unit ? ` ${unit}` : '')} vs ${formatDayDisplayFromIso(first.date)}`
    : '—';

  const latestText = formatLatest
    ? formatLatest(latest)
    : `${latest.value}${unit === 'h' ? 'h' : unit ? ` ${unit}` : ''} · ${formatDayDisplayFromIso(latest.date)}`;

  const extraHtml = extraStats.map((s) => `
    <div class="sparkline-stat">
      <span class="sparkline-stat-label">${escapeHtml(s.label)}</span>
      <span class="sparkline-stat-value">${escapeHtml(s.value)}</span>
    </div>`).join('');

  return `
    <div class="sparkline-card">
      <div class="sparkline-header">
        <span class="sparkline-metric">${escapeHtml(label)}</span>
        <span class="sparkline-latest">${escapeHtml(latestText)}</span>
      </div>
      <div class="sparkline-stats">
        <div class="sparkline-stat">
          <span class="sparkline-stat-label">${series.length}-day avg</span>
          <span class="sparkline-stat-value">${avg}${unit === 'h' ? 'h' : unit ? ` ${unit}` : ''}</span>
        </div>
        ${extraStats.length ? extraHtml : ''}
        <div class="sparkline-stat">
          <span class="sparkline-stat-label">Trend</span>
          <span class="sparkline-stat-value ${deltaCls}">${escapeHtml(deltaText)}</span>
        </div>
      </div>
      ${renderSparklineSvg(series, { targetLine, targetLabel, unit, lowerBetter: deltaDirection === 'down-good' })}
      ${hint ? `<p class="sparkline-hint">${escapeHtml(hint)}</p>` : ''}
    </div>`;
}

export function renderComplianceStrip({ days, label = 'days on target' }) {
  if (!days?.length) {
    return '<p class="text-muted">Log meals to track compliance.</p>';
  }

  const hits = days.filter((d) => d.hit).length;
  const dots = days.map((d) => {
    const cls = d.hit ? 'compliance-dot--hit' : 'compliance-dot--miss';
    const title = `${d.date}: ${d.hit ? 'on target' : 'below target'}${d.detail ? ` (${d.detail})` : ''}`;
    return `<span class="compliance-dot ${cls}" title="${escapeAttr(title)}" aria-label="${escapeAttr(title)}"></span>`;
  }).join('');

  return `
    <div class="compliance-strip">
      <div class="compliance-dots" role="list" aria-label="${escapeAttr(label)}">${dots}</div>
      <span class="compliance-count">${hits}/${days.length} ${escapeHtml(label)}</span>
    </div>`;
}

export function renderKneeTimeline(runLogs) {
  const runs = (runLogs || [])
    .filter((r) => r.done === true && r.knee_status)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (!runs.length) {
    return '<p class="text-muted">Knee status appears after your first logged run.</p>';
  }

  const rank = {
    'Pain-free': 0,
    'Minor pressure': 1,
    Minor: 1,
    Discomfort: 2,
    Pain: 3,
  };

  const dots = runs.map((r) => {
    const level = rank[r.knee_status] ?? 0;
    const cls = level === 0 ? 'knee-dot--ok' : level === 1 ? 'knee-dot--minor' : level === 2 ? 'knee-dot--warn' : 'knee-dot--pain';
    return `<span class="knee-dot ${cls}" title="${escapeAttr(`${r.date}: ${r.knee_status}`)}" aria-label="${escapeAttr(`${r.date}: ${r.knee_status}`)}"></span>`;
  }).join('');

  const issues = runs.filter((r) => (rank[r.knee_status] ?? 0) > 0).length;
  const summary = issues === 0
    ? `All clear — ${runs.length} run${runs.length === 1 ? '' : 's'}`
    : `${issues} of ${runs.length} runs flagged`;

  return `
    <div class="knee-timeline">
      <div class="knee-dots">${dots}</div>
      <p class="knee-timeline-summary text-muted">${escapeHtml(summary)}</p>
    </div>`;
}

export function renderRpeDots(sessions) {
  const items = (sessions || []).filter((s) => s.rpe != null).sort((a, b) => a.date.localeCompare(b.date));

  if (!items.length) {
    return '<p class="text-muted">RPE trend builds after logged sessions.</p>';
  }

  const dots = items.map((s) => {
    const rpe = Number(s.rpe);
    const cls = rpe >= 8 ? 'rpe-dot--high' : rpe >= 6 ? 'rpe-dot--mid' : 'rpe-dot--low';
    const type = s.type === 'workout' ? 'workout' : 'run';
    return `<span class="rpe-dot ${cls}" title="${escapeAttr(`${s.date} ${type}: RPE ${rpe}`)}">${rpe}</span>`;
  }).join('');

  const avg = Math.round((items.reduce((s, i) => s + Number(i.rpe), 0) / items.length) * 10) / 10;

  return `
    <div class="rpe-timeline">
      <div class="rpe-dots">${dots}</div>
      <p class="rpe-timeline-summary text-muted">${items.length} sessions · avg RPE ${avg}</p>
    </div>`;
}

export function renderWeeklyMileageChart(weeks) {
  if (!weeks?.length) {
    return '<p class="text-muted">Weekly mileage builds after your first logged run.</p>';
  }

  const maxKm = Math.max(...weeks.map((w) => Math.max(w.actual, w.planned || 0)), 1);
  const rows = weeks.map((w) => {
    const actualPct = Math.round((w.actual / maxKm) * 100);
    const plannedPct = w.planned ? Math.round((w.planned / maxKm) * 100) : 0;
    const label = w.planned
      ? `${w.actual.toFixed(1)}/${w.planned} km`
      : `${w.actual.toFixed(1)} km`;
    return `
      <div class="weekly-km-row">
        <span class="weekly-km-label">${escapeHtml(w.label)}</span>
        <span class="weekly-km-bars" aria-hidden="true">
          ${w.planned ? `<span class="weekly-km-bar weekly-km-bar--planned" style="width:${plannedPct}%"></span>` : ''}
          <span class="weekly-km-bar weekly-km-bar--actual" style="width:${actualPct}%"></span>
        </span>
        <span class="weekly-km-value">${escapeHtml(label)}</span>
      </div>`;
  }).join('');

  return `<div class="weekly-km-chart">${rows}</div>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttr(str) {
  return escapeHtml(str).replace(/"/g, '&quot;');
}
