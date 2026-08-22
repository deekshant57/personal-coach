// Today tab — supplement toggles + 7-day history strip
import { state, getToday, formatDayDisplayFromIso, showToast } from './app.js';
import {
  SUPPLEMENT_ITEMS,
  isD3Day,
  getNextD3Date,
  getRequiredSupplementKeys,
  isSupplementLogComplete,
  getSupradynTimingHint,
  getSupplementTasks,
  areSupplementTasksComplete,
  dateRangeEnding,
  toIsoDate,
  getAthleteSupplementKeys,
} from './supplements-data.js';
import { fetchSupplementLog, upsertSupplementLog, fetchSupplementLogsRange } from './supabase.js';
import { updateDayProgress } from './day-progress.js';
import { refreshDebriefIfActive } from './debrief.js';
import { updateSectionCompression } from './coach-layout.js';
import { trackSave } from './save-state.js';
import { setButtonLoading } from './spinner.js';
import { getAthleteProfile } from './athlete-profile.js';

const HISTORY_DAYS = 7;

const TOGGLE_IDS = {
  supradyn: 'supp-supradyn',
  creatine: 'supp-creatine',
  omega_3: 'supp-omega_3',
  uprise_d3_60k: 'supp-d3-row',
};

function syncSupplementStatus() {
  updateDayProgress();
  refreshDebriefIfActive();
  updateSectionCompression();
}

function emptyLog() {
  return { supradyn: false, creatine: false, omega_3: false, uprise_d3_60k: false, notes: null };
}

function applyAthleteSupplementVisibility(profile = getAthleteProfile()) {
  const allowed = new Set(getAthleteSupplementKeys(profile));
  for (const [key, elId] of Object.entries(TOGGLE_IDS)) {
    const el = document.getElementById(elId);
    if (!el) continue;
    // D3 row visibility also depends on Thursday — handled in renderD3Hint
    if (key === 'uprise_d3_60k') {
      el.dataset.athleteAllows = allowed.has(key) ? '1' : '0';
      if (!allowed.has(key)) el.classList.add('hidden');
      continue;
    }
    el.classList.toggle('hidden', !allowed.has(key));
  }
}

function collectLogFromForm() {
  const allowed = new Set(getAthleteSupplementKeys());
  return {
    supradyn: allowed.has('supradyn')
      && (document.getElementById('supp-supradyn')?.classList.contains('done') ?? false),
    creatine: allowed.has('creatine')
      && (document.getElementById('supp-creatine')?.classList.contains('done') ?? false),
    omega_3: allowed.has('omega_3')
      && (document.getElementById('supp-omega_3')?.classList.contains('done') ?? false),
    uprise_d3_60k: allowed.has('uprise_d3_60k')
      && (document.getElementById('supp-d3')?.classList.contains('done') ?? false),
    notes: document.getElementById('input-supplement-notes')?.value.trim() || null,
  };
}

function applyLogToForm(log) {
  const data = log || emptyLog();
  for (const item of SUPPLEMENT_ITEMS) {
    const btn = document.getElementById(`supp-${item.key === 'uprise_d3_60k' ? 'd3' : item.key}`);
    if (btn) btn.classList.toggle('done', !!data[item.key]);
  }
  const notesEl = document.getElementById('input-supplement-notes');
  if (notesEl) notesEl.value = data.notes || '';
}

function updateSummary(log, dateIso) {
  const summary = document.getElementById('supplements-summary');
  if (!summary) return;

  if (!log || !isSupplementLogComplete(log, dateIso)) {
    const required = getRequiredSupplementKeys(dateIso);
    const done = required.filter((k) => log?.[k]).length;
    summary.textContent = `${done}/${required.length} taken`;
    return;
  }

  const allowed = new Set(getAthleteSupplementKeys());
  const parts = [];
  if (allowed.has('supradyn') && log.supradyn) parts.push('Supradyn');
  if (allowed.has('creatine') && log.creatine) parts.push('Creatine');
  if (allowed.has('omega_3') && log.omega_3) parts.push('Omega-3');
  if (allowed.has('uprise_d3_60k') && log.uprise_d3_60k) parts.push('D3');
  summary.textContent = parts.join(' · ') || 'Not logged';
}

function renderSupradynHint() {
  const hintEl = document.querySelector('#supp-supradyn .supp-toggle-hint');
  if (hintEl) {
    hintEl.textContent = getSupradynTimingHint(state.currentPlan);
  }
}

function renderD3Hint(dateIso) {
  const hint = document.getElementById('supplements-d3-hint');
  const d3Row = document.getElementById('supp-d3-row');
  if (!hint || !d3Row) return;

  const allowsD3 = d3Row.dataset.athleteAllows !== '0'
    && getAthleteSupplementKeys().includes('uprise_d3_60k');

  if (!allowsD3) {
    d3Row.classList.add('hidden');
    hint.textContent = '';
    return;
  }

  if (isD3Day(dateIso)) {
    d3Row.classList.remove('hidden');
    hint.textContent = 'Weekly dose — take with your fattiest meal today';
    return;
  }

  d3Row.classList.add('hidden');
  const next = getNextD3Date(new Date());
  hint.textContent = `Next D3: ${formatDayDisplayFromIso(toIsoDate(next))}`;
}

function renderHistoryStrip(logs, endIso) {
  const el = document.getElementById('supplements-history-strip');
  if (!el) return;

  const dates = dateRangeEnding(endIso, HISTORY_DAYS);
  const byDate = new Map((logs || []).map((r) => [r.date, r]));

  el.innerHTML = dates.map((iso) => {
    const log = byDate.get(iso);
    const complete = isSupplementLogComplete(log, iso);
    const partial = log && getRequiredSupplementKeys(iso).some((k) => log[k]);
    const label = formatDayDisplayFromIso(iso).slice(0, 6);
    const cls = complete ? 'complete' : partial ? 'partial' : '';
    const mark = complete ? '✓' : partial ? '·' : '○';
    return `<span class="supp-history-day ${cls}" title="${formatDayDisplayFromIso(iso)}">${label}<br>${mark}</span>`;
  }).join('');
}

export function isSupplementsComplete() {
  if (!getAthleteProfile().showSupplementsCard) return true;
  const dateIso = getToday();
  return areSupplementTasksComplete(
    getSupplementTasks(state.currentPlan, state.supplementLog, dateIso),
  );
}

export function refreshSupplementHints() {
  if (!getAthleteProfile().showSupplementsCard) return;
  renderSupradynHint();
}

export async function loadSupplements() {
  const card = document.getElementById('supplements-card');
  const profile = getAthleteProfile();
  if (!profile.showSupplementsCard) {
    card?.classList.add('hidden');
    state.supplementLog = emptyLog();
    state.supplementHistory = [];
    syncSupplementStatus();
    return;
  }
  card?.classList.remove('hidden');
  applyAthleteSupplementVisibility(profile);

  const date = getToday();
  const startDates = dateRangeEnding(date, HISTORY_DAYS);
  const [log, history] = await Promise.all([
    fetchSupplementLog(date),
    fetchSupplementLogsRange(startDates[0], date),
  ]);

  state.supplementLog = log;
  state.supplementHistory = history || [];

  applyLogToForm(log);
  updateSummary(log, date);
  renderSupradynHint();
  renderD3Hint(date);
  renderHistoryStrip(state.supplementHistory, date);
  syncSupplementStatus();
}

export function initSupplements() {
  document.getElementById('save-supplements')?.addEventListener('click', saveSupplements);

  document.querySelectorAll('.supp-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('done');
      const date = getToday();
      updateSummary(collectLogFromForm(), date);
      syncSupplementStatus();
    });
  });
}

async function saveSupplements() {
  const btn = document.getElementById('save-supplements');
  if (btn?.disabled) return;
  setButtonLoading(btn, true, 'Save Supplements');

  try {
    const log = collectLogFromForm();
    const ok = await trackSave('supplements', 'Supplements', async () => {
      const saved = await upsertSupplementLog(getToday(), log);
      if (!saved) return false;
      state.supplementLog = log;
      updateSummary(log, getToday());
      await loadSupplements();
      syncSupplementStatus();
      return true;
    });
    if (ok) showToast('Supplements saved');
  } finally {
    setButtonLoading(btn, false, 'Save Supplements');
  }
}

export function resetSupplementsForFuture() {
  state.supplementLog = null;
  state.supplementHistory = [];
  applyLogToForm(null);
  updateSummary(null, getToday());
  document.getElementById('supplements-history-strip')?.replaceChildren();
}
