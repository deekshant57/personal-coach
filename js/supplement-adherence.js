// Progress tab — supplement adherence (28-day window)
import { formatDayDisplayFromIso } from './app.js';
import {
  computeAdherenceStats,
  toIsoDate,
} from './supplements-data.js';

const ADHERENCE_DAYS = 28;

export function renderSupplementAdherence(logs, endIso) {
  const el = document.getElementById('supplement-adherence-content');
  if (!el) return;

  if (!logs?.length) {
    el.innerHTML = '<p class="text-muted">No supplement logs yet — track on the Today tab.</p>';
    return;
  }

  const byDate = new Map(logs.map((r) => [r.date, r]));
  const stats = computeAdherenceStats(byDate, endIso, ADHERENCE_DAYS);

  const d3Doses = logs
    .filter((r) => r.uprise_d3_60k)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  const d3List = d3Doses.length
    ? `<ul class="supp-d3-history">${d3Doses.map((r) =>
      `<li>${formatDayDisplayFromIso(r.date)} — Uprise D3 60K</li>`,
    ).join('')}</ul>`
    : '<p class="text-muted">No weekly D3 doses logged yet.</p>';

  el.innerHTML = `
    <div class="supp-adherence-stats">
      <div class="supp-adherence-stat">
        <strong>${stats.dailyPct}%</strong>
        <span>Daily stack (28d)</span>
      </div>
      <div class="supp-adherence-stat">
        <strong>${stats.d3Pct != null ? `${stats.d3Pct}%` : '—'}</strong>
        <span>Weekly D3 (${stats.d3Taken}/${stats.d3Required})</span>
      </div>
    </div>
    <p class="form-hint">Supradyn + Creatine every day · Uprise D3 60K on Thursdays only.</p>
    <p class="form-label mt-12">D3 dose history</p>
    ${d3List}
  `;
}

export function supplementAdherenceStartIso(endDate = new Date()) {
  const d = new Date(endDate);
  d.setDate(d.getDate() - (ADHERENCE_DAYS - 1));
  return toIsoDate(d);
}
