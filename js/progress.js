// Trends tab — body composition + coaching-domain trends (Sprint 4)
import {
  state,
  formatDate,
  formatDayDisplayFromIso,
  showToast,
} from './app.js';
import {
  fetchBodyCompScans,
  fetchBodyCompScanForDate,
  fetchAllRunLogs,
  fetchVitalsRange,
  fetchSupplementLogsRange,
  fetchWeekFoodLogs,
  fetchWeekPlans,
  fetchWeekWorkoutLogs,
  upsertBodyCompScan,
  deleteBodyCompScan,
} from './supabase.js';
import { refreshDebriefIfActive } from './debrief.js';
import { setButtonLoading, setOverlayLoading } from './spinner.js';
import { trackSave } from './save-state.js';
import {
  buildLongRunProgress,
  formatKm,
  LONG_RUN_TARGET_MIN_KM,
  LONG_RUN_TARGET_MAX_KM,
  getRaceCountdownDays,
} from './week-stats.js';
import {
  renderSupplementAdherence,
  supplementAdherenceStartIso,
} from './supplement-adherence.js';
import {
  detectMeaningfulEvents,
  renderActiveSignals,
} from './meaningful-events.js';
import {
  renderComplianceStrip,
  renderKneeTimeline,
  renderRpeDots,
  renderWeeklyMileageChart,
} from './sparkline.js';
import {
  lookbackStartIso,
  complianceStartIso,
  buildWeeklyMileage,
  enrichWeeklyMileageWithPlans,
  buildProteinCompliance,
  buildCalorieCompliance,
  buildRpeSessions,
  renderWeightTrend,
  renderSleepTrend,
  renderCigaretteTrend,
  renderCadenceTrend,
  renderWaistTrend,
  resolvePlansForCompliance,
} from './trends-data.js';
import { getAthleteProfile } from './athlete-profile.js';
import { renderLiftProgression } from './lift-progress.js';

const SCAN_INTERVAL_WEEKS = 5;

let editingScanId = null;
let cachedRunLogs = [];
let cachedVitals = [];
let cachedWorkoutLogs = [];

export function initProgress() {
  document.getElementById('scan-form-toggle')?.addEventListener('click', toggleScanForm);
  document.getElementById('save-scan')?.addEventListener('click', saveScan);
  document.getElementById('cancel-scan')?.addEventListener('click', resetScanForm);
  document.getElementById('delete-scan')?.addEventListener('click', deleteCurrentScan);
  document.getElementById('scan-history')?.addEventListener('click', onHistoryClick);
  document.getElementById('tab-progress')?.addEventListener('click', (e) => {
    if (e.target.closest('.progress-retry-btn')) loadProgressView();
  });
  // Hide athlete-irrelevant cards immediately (before async fetch)
  applyAthleteTrendsVisibility();
}

const PROGRESS_LOAD_ERROR_HTML = `
  <p class="text-muted progress-load-error">
    Couldn't load.
    <button type="button" class="progress-retry-btn">Retry</button>
  </p>`;

const PROGRESS_CARD_IDS = [
  'active-signals-content',
  'weight-trend-content',
  'waist-trend-content',
  'weekly-mileage-content',
  'long-run-content',
  'cadence-trend-content',
  'sleep-trend-content',
  'rpe-trend-content',
  'knee-timeline-content',
  'lift-progress-content',
  'protein-compliance-content',
  'calorie-compliance-content',
  'cigarettes-trend-content',
  'supplement-adherence-content',
  'latest-scan-content',
];

function renderProgressLoadError() {
  applyAthleteTrendsVisibility();
  PROGRESS_CARD_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = PROGRESS_LOAD_ERROR_HTML;
  });
  const banner = document.getElementById('scan-due-banner');
  if (banner) banner.innerHTML = '';
  const history = document.getElementById('scan-history');
  if (history) history.innerHTML = '';
  document.getElementById('active-signals-section')?.classList.add('hidden');
}

export async function loadProgressView() {
  applyAthleteTrendsVisibility();
  setOverlayLoading('progress-loading-overlay', true);
  try {
    const profile = getAthleteProfile();
    const endIso = formatDate(new Date());
    const startIso = lookbackStartIso();

    const [
      scans,
      runLogs,
      vitals,
      supplementLogs,
      foodLogs28,
      rawPlans,
      workoutLogs,
    ] = await Promise.all([
      fetchBodyCompScans(),
      profile.showRunningTrends ? fetchAllRunLogs() : Promise.resolve([]),
      fetchVitalsRange(startIso, endIso),
      profile.showSupplementsCard
        ? fetchSupplementLogsRange(supplementAdherenceStartIso(), endIso)
        : Promise.resolve([]),
      fetchWeekFoodLogs(complianceStartIso(28), endIso),
      fetchWeekPlans(complianceStartIso(28), endIso),
      fetchWeekWorkoutLogs(startIso, endIso),
    ]);

    state.bodyCompScans = scans;
    cachedRunLogs = runLogs;
    cachedVitals = vitals;
    cachedWorkoutLogs = workoutLogs;

    const plans = await resolvePlansForCompliance(complianceStartIso(28), endIso, rawPlans);

    detectMeaningfulEvents({
      vitals,
      runLogs: profile.showRunningTrends ? runLogs : [],
      today: endIso,
    });
    renderActiveSignals();

    renderProgressView({ foodLogs: foodLogs28, plans });
    if (profile.showSupplementsCard) {
      renderSupplementAdherence(supplementLogs, endIso);
    }
  } catch (err) {
    console.error('loadProgressView:', err);
    renderProgressLoadError();
  } finally {
    setOverlayLoading('progress-loading-overlay', false);
  }
}

export async function loadBodyCompForDate(date) {
  const cached = state.bodyCompScans?.find((s) => s.scan_date === date);
  if (cached) {
    state.bodyCompScanForDate = cached;
    return;
  }
  state.bodyCompScanForDate = await fetchBodyCompScanForDate(date);
}

function toggleScanForm() {
  const body = document.getElementById('scan-form-body');
  const toggle = document.getElementById('scan-form-toggle');
  if (!body || !toggle) return;
  const open = body.classList.toggle('open');
  toggle.classList.toggle('open', open);
  if (open && !editingScanId) {
    document.getElementById('input-scan-date').value = formatDate(new Date());
  }
}

function resetScanForm() {
  editingScanId = null;
  document.getElementById('scan-form-title').textContent = 'Log scan';
  document.getElementById('input-scan-date').value = formatDate(new Date());
  document.getElementById('input-scan-machine').value = 'InBody';
  document.getElementById('input-scan-weight').value = '';
  document.getElementById('input-scan-bf').value = '';
  document.getElementById('input-scan-muscle').value = '';
  document.getElementById('input-scan-fat-mass').value = '';
  document.getElementById('input-scan-visceral').value = '';
  document.getElementById('input-scan-waist').value = '';
  document.getElementById('input-scan-notes').value = '';
  document.getElementById('delete-scan')?.classList.add('hidden');
}

function fillScanForm(scan) {
  editingScanId = scan.id;
  document.getElementById('scan-form-title').textContent = 'Edit scan';
  document.getElementById('input-scan-date').value = scan.scan_date;
  document.getElementById('input-scan-machine').value = scan.machine || 'InBody';
  document.getElementById('input-scan-weight').value = scan.weight_kg ?? '';
  document.getElementById('input-scan-bf').value = scan.body_fat_pct ?? '';
  document.getElementById('input-scan-muscle').value = scan.muscle_mass_kg ?? '';
  document.getElementById('input-scan-fat-mass').value = scan.body_fat_mass_kg ?? '';
  document.getElementById('input-scan-visceral').value = scan.visceral_fat_level ?? '';
  document.getElementById('input-scan-waist').value = scan.waist_inches ?? '';
  document.getElementById('input-scan-notes').value = scan.notes || '';
  document.getElementById('delete-scan')?.classList.remove('hidden');
  const body = document.getElementById('scan-form-body');
  const toggle = document.getElementById('scan-form-toggle');
  body?.classList.add('open');
  toggle?.classList.add('open');
}

async function saveScan() {
  const btn = document.getElementById('save-scan');
  if (btn?.disabled) return;

  const scanDate = document.getElementById('input-scan-date').value;
  const weight = parseFloat(document.getElementById('input-scan-weight').value);
  const bf = parseFloat(document.getElementById('input-scan-bf').value);
  const muscle = parseFloat(document.getElementById('input-scan-muscle').value);

  if (!scanDate) {
    showToast('Scan date required', { variant: 'error' });
    return;
  }
  if (!weight && !bf && !muscle) {
    showToast('Enter at least weight, body fat %, or muscle mass', { variant: 'error' });
    return;
  }

  setButtonLoading(btn, true, 'Save Scan');
  try {
    const payload = {
      scan_date: scanDate,
      machine: document.getElementById('input-scan-machine').value || 'InBody',
      weight_kg: weight || null,
      body_fat_pct: bf || null,
      muscle_mass_kg: muscle || null,
      body_fat_mass_kg: parseFloat(document.getElementById('input-scan-fat-mass').value) || null,
      visceral_fat_level: parseFloat(document.getElementById('input-scan-visceral').value) || null,
      waist_inches: parseFloat(document.getElementById('input-scan-waist').value) || null,
      notes: document.getElementById('input-scan-notes').value.trim() || null,
    };
    if (editingScanId) payload.id = editingScanId;

    const ok = await trackSave(`scan:${scanDate}`, 'Body scan', async () => {
      const saved = await upsertBodyCompScan(payload);
      if (!saved) return false;
      state.bodyCompScans = await fetchBodyCompScans();
      state.bodyCompScanForDate = state.bodyCompScans.find((s) => s.scan_date === scanDate) || null;
      resetScanForm();
      document.getElementById('scan-form-body')?.classList.remove('open');
      document.getElementById('scan-form-toggle')?.classList.remove('open');
      await loadProgressView();
      refreshDebriefIfActive();
      return true;
    });
    if (!ok) return;
  } finally {
    setButtonLoading(btn, false, 'Save Scan');
  }
}

async function deleteCurrentScan() {
  if (!editingScanId || !confirm('Delete this scan?')) return;
  const ok = await deleteBodyCompScan(editingScanId);
  if (!ok) {
    showToast('Delete failed', { variant: 'error' });
    return;
  }
  state.bodyCompScans = await fetchBodyCompScans();
  resetScanForm();
  document.getElementById('scan-form-body')?.classList.remove('open');
  document.getElementById('scan-form-toggle')?.classList.remove('open');
  await loadProgressView();
  refreshDebriefIfActive();
  showToast('Scan deleted');
}

async function onHistoryClick(e) {
  const editBtn = e.target.closest('[data-edit-scan]');
  const delBtn = e.target.closest('[data-delete-scan]');

  if (editBtn) {
    const scan = state.bodyCompScans.find((s) => s.id === editBtn.dataset.editScan);
    if (scan) {
      fillScanForm(scan);
      document.getElementById('scan-form-card')?.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
    return;
  }

  if (delBtn) {
    const id = delBtn.dataset.deleteScan;
    if (!id || !confirm('Delete this scan?')) return;
    const ok = await deleteBodyCompScan(id);
    if (!ok) {
      showToast('Delete failed', { variant: 'error' });
      return;
    }
    state.bodyCompScans = await fetchBodyCompScans();
    resetScanForm();
    await loadProgressView();
    refreshDebriefIfActive();
    showToast('Scan deleted');
  }
}

function formatDelta(current, previous, unit, lowerIsBetter = false) {
  if (current == null || previous == null) return '';
  const diff = current - previous;
  if (Math.abs(diff) < 0.05) return '<span class="scan-delta scan-delta--neutral">→</span>';
  const sign = diff > 0 ? '+' : '';
  const good = lowerIsBetter ? diff < 0 : diff > 0;
  const cls = good ? 'scan-delta--good' : 'scan-delta--warn';
  return `<span class="scan-delta ${cls}">${sign}${diff.toFixed(1)}${unit}</span>`;
}

function renderDueBanner(scans) {
  const el = document.getElementById('scan-due-banner');
  if (!el) return;

  if (!scans.length) {
    el.innerHTML = '<div class="scan-due scan-due--info">No scans yet — log your Karada Scan from today.</div>';
    return;
  }

  const latest = scans[0];
  const latestDate = new Date(latest.scan_date + 'T12:00:00');
  const dueDate = new Date(latestDate);
  dueDate.setDate(dueDate.getDate() + SCAN_INTERVAL_WEEKS * 7);
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  if (today >= dueDate) {
    el.innerHTML = `<div class="scan-due scan-due--warn">Next scan due — last was ${formatDayDisplayFromIso(latest.scan_date)} (${latest.machine})</div>`;
  } else {
    const daysLeft = Math.ceil((dueDate - today) / 86400000);
    el.innerHTML = `<div class="scan-due scan-due--ok">Next scan in ~${daysLeft} days · last ${formatDayDisplayFromIso(latest.scan_date)}</div>`;
  }
}

function renderLatestScan(scans) {
  const el = document.getElementById('latest-scan-content');
  if (!el) return;

  if (!scans.length) {
    el.innerHTML = '<p class="text-muted">Log your first machine scan to start tracking.</p>';
    return;
  }

  const latest = scans[0];
  const prev = scans[1] || null;

  el.innerHTML = `
    <div class="scan-latest-meta">${formatDayDisplayFromIso(latest.scan_date)} · ${escapeHtml(latest.machine || 'Machine')}</div>
    <div class="scan-metrics-grid">
      <div class="scan-metric">
        <span class="scan-metric-label">Weight</span>
        <span class="scan-metric-value">${fmt(latest.weight_kg)} kg ${formatDelta(latest.weight_kg, prev?.weight_kg, ' kg', true)}</span>
      </div>
      <div class="scan-metric">
        <span class="scan-metric-label">Body fat</span>
        <span class="scan-metric-value">${fmt(latest.body_fat_pct)}% ${formatDelta(latest.body_fat_pct, prev?.body_fat_pct, '%', true)}</span>
      </div>
      <div class="scan-metric">
        <span class="scan-metric-label">Muscle mass</span>
        <span class="scan-metric-value">${fmt(latest.muscle_mass_kg)} kg ${formatDelta(latest.muscle_mass_kg, prev?.muscle_mass_kg, ' kg')}</span>
      </div>
      ${latest.body_fat_mass_kg != null ? `
      <div class="scan-metric">
        <span class="scan-metric-label">Fat mass</span>
        <span class="scan-metric-value">${fmt(latest.body_fat_mass_kg)} kg ${formatDelta(latest.body_fat_mass_kg, prev?.body_fat_mass_kg, ' kg', true)}</span>
      </div>` : ''}
      ${latest.visceral_fat_level != null ? `
      <div class="scan-metric">
        <span class="scan-metric-label">Visceral fat</span>
        <span class="scan-metric-value">${fmt(latest.visceral_fat_level)} ${formatDelta(latest.visceral_fat_level, prev?.visceral_fat_level, '', true)}</span>
      </div>` : ''}
      ${latest.waist_inches != null ? `
      <div class="scan-metric">
        <span class="scan-metric-label">Waist</span>
        <span class="scan-metric-value">${fmt(latest.waist_inches)}" ${formatDelta(latest.waist_inches, prev?.waist_inches, '"', true)}</span>
      </div>` : ''}
    </div>
    ${latest.notes ? `<p class="scan-notes">${escapeHtml(latest.notes)}</p>` : ''}
    ${prev ? `<p class="scan-compare-hint">vs prior scan ${formatDayDisplayFromIso(prev.scan_date)}</p>` : ''}
  `;
}

function renderHistory(scans) {
  const el = document.getElementById('scan-history');
  if (!el) return;

  if (scans.length <= 1) {
    el.innerHTML = scans.length
      ? '<p class="text-muted">One scan logged — history builds after your next visit.</p>'
      : '';
    return;
  }

  el.innerHTML = scans.map((s) => `
    <div class="scan-history-item">
      <div class="scan-history-main">
        <span class="scan-history-date">${formatDayDisplayFromIso(s.scan_date)}</span>
        <span class="scan-history-machine">${escapeHtml(s.machine || '')}</span>
      </div>
      <div class="scan-history-stats">
        ${s.weight_kg != null ? `${fmt(s.weight_kg)} kg` : ''}
        ${s.body_fat_pct != null ? ` · ${fmt(s.body_fat_pct)}% BF` : ''}
        ${s.muscle_mass_kg != null ? ` · ${fmt(s.muscle_mass_kg)} kg muscle` : ''}
      </div>
      <div class="scan-history-actions">
        <button type="button" class="scan-history-btn" data-edit-scan="${s.id}">Edit</button>
        <button type="button" class="scan-history-btn scan-history-btn--danger" data-delete-scan="${s.id}">Delete</button>
      </div>
    </div>
  `).join('');
}

function renderLongRunProgress(runLogs) {
  const el = document.getElementById('long-run-content');
  if (!el) return;

  const { longRunSeries, peakLongRun, latestLongRun } = buildLongRunProgress(runLogs);
  const daysToRace = getRaceCountdownDays();

  if (!longRunSeries.length) {
    el.innerHTML = '<p class="text-muted">No completed runs yet — long-run arc builds after your first logged run.</p>';
    return;
  }

  const maxKm = Math.max(
    LONG_RUN_TARGET_MAX_KM,
    peakLongRun?.km || 0,
    ...longRunSeries.map((p) => p.km),
  );

  const rows = [...longRunSeries].reverse().slice(0, 10).map((point) => {
    const pct = Math.min(100, Math.round((point.km / maxKm) * 100));
    return `
      <div class="long-run-row">
        <span class="long-run-date">${formatDayDisplayFromIso(point.date)}</span>
        <span class="long-run-km">${formatKm(point.km)} km</span>
        <span class="long-run-bar" aria-hidden="true"><span class="long-run-bar-fill" style="width:${pct}%"></span></span>
      </div>`;
  }).join('');

  const latestLabel = latestLongRun
    ? `${formatKm(latestLongRun.km)} km · ${formatDayDisplayFromIso(latestLongRun.date)}`
    : '—';
  const peakLabel = peakLongRun
    ? `${formatKm(peakLongRun.km)} km · ${formatDayDisplayFromIso(peakLongRun.date)}`
    : '—';

  el.innerHTML = `
    <div class="long-run-stats">
      <div class="long-run-stat">
        <span class="long-run-stat-label">Latest</span>
        <span class="long-run-stat-value">${latestLabel}</span>
      </div>
      <div class="long-run-stat">
        <span class="long-run-stat-label">Peak</span>
        <span class="long-run-stat-value">${peakLabel}</span>
      </div>
      <div class="long-run-stat">
        <span class="long-run-stat-label">Race target</span>
        <span class="long-run-stat-value">${LONG_RUN_TARGET_MIN_KM}–${LONG_RUN_TARGET_MAX_KM} km</span>
      </div>
      ${daysToRace > 0 ? `<div class="long-run-stat"><span class="long-run-stat-label">Countdown</span><span class="long-run-stat-value">${daysToRace} days</span></div>` : ''}
    </div>
    <div class="long-run-target-line">
      <span class="long-run-target-mark" style="left:${Math.round((LONG_RUN_TARGET_MIN_KM / maxKm) * 100)}%"></span>
      <span class="long-run-target-label">${LONG_RUN_TARGET_MIN_KM} km goal</span>
    </div>
    <div class="long-run-list">${rows}</div>
  `;
}

function renderWeeklyMileage(runLogs, plans) {
  const el = document.getElementById('weekly-mileage-content');
  if (!el) return;
  const weeks = enrichWeeklyMileageWithPlans(buildWeeklyMileage(runLogs), plans);
  el.innerHTML = renderWeeklyMileageChart(weeks);
}

function renderComplianceSections(foodLogs, plans) {
  const proteinEl = document.getElementById('protein-compliance-content');
  const calorieEl = document.getElementById('calorie-compliance-content');
  if (proteinEl) {
    const days14 = buildProteinCompliance(foodLogs, plans, { days: 14 });
    const days7 = buildProteinCompliance(foodLogs, plans, { days: 7 });
    const days28 = buildProteinCompliance(foodLogs, plans, { days: 28 });
    const rate = (days) => {
      const logged = days.filter((d) => d.detail !== 'not logged');
      if (!logged.length) return '—';
      const hits = logged.filter((d) => d.hit).length;
      return `${hits}/${logged.length} (${Math.round((hits / logged.length) * 100)}%)`;
    };
    proteinEl.innerHTML = `
      <div class="protein-hit-rates">
        <div class="protein-hit-rate"><span class="protein-hit-label">7d</span><span class="protein-hit-value">${rate(days7)}</span></div>
        <div class="protein-hit-rate"><span class="protein-hit-label">14d</span><span class="protein-hit-value">${rate(days14)}</span></div>
        <div class="protein-hit-rate"><span class="protein-hit-label">28d</span><span class="protein-hit-value">${rate(days28)}</span></div>
      </div>
      ${renderComplianceStrip({ days: days14, label: 'days on protein floor' })}`;
  }
  if (calorieEl) {
    const days = buildCalorieCompliance(foodLogs, plans);
    calorieEl.innerHTML = renderComplianceStrip({ days, label: 'days in calorie range' });
  }
}

function setTrendsCardVisible(cardId, visible) {
  const card = document.getElementById(cardId);
  if (!card) return;
  card.classList.toggle('hidden', !visible);
}

function applyAthleteTrendsVisibility(profile = getAthleteProfile()) {
  setTrendsCardVisible('weekly-mileage-card', profile.showRunningTrends);
  setTrendsCardVisible('long-run-card', profile.showRunningTrends);
  setTrendsCardVisible('cadence-trend-card', profile.showRunningTrends);
  setTrendsCardVisible('knee-timeline-card', profile.showKneeTracking);
  setTrendsCardVisible('cigarettes-trend-card', profile.showCigarettes);
  setTrendsCardVisible('supplement-adherence-card', profile.showSupplementsCard);

  // Hide empty domain headings when all cards under them are off
  // Training section stays visible for gym-only athletes (key lifts card)
  document.getElementById('trends-training-title')?.classList.remove('hidden');
  setTrendsCardVisible('lift-progress-card', true);
  const showHabits = profile.showCigarettes || profile.showSupplementsCard;
  document.getElementById('trends-habits-title')?.classList.toggle('hidden', !showHabits);

  // Clear run/knee card bodies so a stale flash never shows empty-run copy
  if (!profile.showRunningTrends) {
    for (const id of ['weekly-mileage-content', 'long-run-content', 'cadence-trend-content']) {
      const el = document.getElementById(id);
      if (el) el.innerHTML = '';
    }
  }
  if (!profile.showKneeTracking) {
    const knee = document.getElementById('knee-timeline-content');
    if (knee) knee.innerHTML = '';
  }
}

function renderProgressView({ foodLogs = [], plans = [] } = {}) {
  const scans = state.bodyCompScans || [];
  const profile = getAthleteProfile();
  applyAthleteTrendsVisibility(profile);

  document.getElementById('weight-trend-content').innerHTML = renderWeightTrend(cachedVitals)
    || '<p class="progress-section-empty">No weight logs yet — add morning vitals on Today.</p>';
  document.getElementById('waist-trend-content').innerHTML = renderWaistTrend(cachedVitals)
    || '<p class="progress-section-empty">Waist logs appear after Monday vitals.</p>';

  if (profile.showRunningTrends) {
    renderWeeklyMileage(cachedRunLogs, plans);
    renderLongRunProgress(cachedRunLogs);
    document.getElementById('cadence-trend-content').innerHTML = renderCadenceTrend(cachedRunLogs);
  }
  renderLiftProgression(cachedWorkoutLogs);
  document.getElementById('sleep-trend-content').innerHTML = renderSleepTrend(cachedVitals);
  document.getElementById('rpe-trend-content').innerHTML = renderRpeDots(
    buildRpeSessions(
      profile.showRunningTrends ? cachedRunLogs : [],
      cachedWorkoutLogs,
    ),
  );
  if (profile.showKneeTracking) {
    document.getElementById('knee-timeline-content').innerHTML = renderKneeTimeline(cachedRunLogs);
  }
  if (profile.showCigarettes) {
    document.getElementById('cigarettes-trend-content').innerHTML = renderCigaretteTrend(cachedVitals);
  }
  renderComplianceSections(foodLogs, plans);
  renderDueBanner(scans);
  renderLatestScan(scans);
  renderHistory(scans);
}

function fmt(n) {
  if (n == null || Number.isNaN(n)) return '—';
  return Number(n) % 1 === 0 ? String(n) : Number(n).toFixed(1);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildBodyCompDebriefSection(scan) {
  if (!scan) return '';

  const scans = state.bodyCompScans || [];
  const idx = scans.findIndex((s) => s.id === scan.id || s.scan_date === scan.scan_date);
  const prev = idx >= 0 ? scans[idx + 1] : null;

  let text = `\n## Body Composition Scan\n`;
  text += `- **Date:** ${formatDayDisplayFromIso(scan.scan_date)}\n`;
  text += `- **Machine:** ${scan.machine || '-'}\n`;
  text += `- **Weight / Body fat / Muscle mass:** `;
  text += `${scan.weight_kg ?? '-'} kg / ${scan.body_fat_pct ?? '-'}% / ${scan.muscle_mass_kg ?? '-'} kg\n`;

  const extras = [];
  if (scan.body_fat_mass_kg != null) extras.push(`Fat mass ${scan.body_fat_mass_kg} kg`);
  if (scan.visceral_fat_level != null) extras.push(`Visceral ${scan.visceral_fat_level}`);
  if (scan.waist_inches != null) extras.push(`Waist ${scan.waist_inches}"`);
  if (extras.length) text += `- **Also:** ${extras.join(' · ')}\n`;

  if (prev) {
    text += `- **Delta vs ${formatDayDisplayFromIso(prev.scan_date)}:** `;
    const parts = [];
    if (scan.weight_kg != null && prev.weight_kg != null) {
      parts.push(`weight ${(scan.weight_kg - prev.weight_kg).toFixed(1)} kg`);
    }
    if (scan.body_fat_pct != null && prev.body_fat_pct != null) {
      parts.push(`BF ${(scan.body_fat_pct - prev.body_fat_pct).toFixed(1)}%`);
    }
    if (scan.muscle_mass_kg != null && prev.muscle_mass_kg != null) {
      parts.push(`muscle ${(scan.muscle_mass_kg - prev.muscle_mass_kg).toFixed(1)} kg`);
    }
    text += parts.length ? parts.join(' · ') + '\n' : '-\n';
  }

  if (scan.notes) text += `- **Notes:** ${scan.notes}\n`;
  return text;
}
