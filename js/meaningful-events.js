// Meaningful event registry — Bible S10 (Sprint 4)
import { formatDate } from './app.js';
import { parseTimeToMinutes } from './run-log.js';
import { fetchVitalsRange, fetchAllRunLogs } from './supabase.js';
import { eventLabel } from './meaningful-event-labels.js';

export { eventLabel };

const REGISTRY_KEY = 'meaningful_events_registry';

export const EVENT_TYPES = ['new', 'progression', 'stagnation', 'milestone', 'threshold'];

let cachedRegistry = null;
let lastDetectSnapshot = null;

function loadRegistry() {
  if (cachedRegistry) return cachedRegistry;
  try {
    cachedRegistry = JSON.parse(localStorage.getItem(REGISTRY_KEY) || '{}');
  } catch {
    cachedRegistry = {};
  }
  return cachedRegistry;
}

function saveRegistry(registry) {
  cachedRegistry = registry;
  try {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
  } catch {
    /* private browsing */
  }
}

function todayIso() {
  return formatDate(new Date());
}

function upsertEvent(event) {
  const registry = loadRegistry();
  const existing = registry[event.id];
  registry[event.id] = {
    ...existing,
    ...event,
    firstSeenDate: existing?.firstSeenDate || event.firstSeenDate || todayIso(),
    lastSurfacedDate: event.active ? todayIso() : (existing?.lastSurfacedDate || null),
  };
  saveRegistry(registry);
  return registry[event.id];
}

function deactivateEvent(id) {
  const registry = loadRegistry();
  if (!registry[id]) return;
  registry[id] = { ...registry[id], active: false };
  saveRegistry(registry);
}

export function getActiveEvents() {
  const registry = loadRegistry();
  return Object.values(registry).filter((e) => e.active);
}

export function getEventsSinceLastCheck() {
  const registry = loadRegistry();
  const snapshot = lastDetectSnapshot || {};
  return Object.values(registry).filter((e) => {
    if (!e.active) return false;
    const prev = snapshot[e.id];
    return !prev?.active;
  });
}

function doneRuns(runLogs) {
  return (runLogs || []).filter((r) => r.done === true);
}

function parsePaceSec(paceStr) {
  if (!paceStr) return null;
  const cleaned = String(paceStr).replace(/\/km/i, '').trim();
  const mins = parseTimeToMinutes(cleaned);
  return mins != null ? Math.round(mins * 60) : null;
}

function detectSleepThreshold(vitals) {
  const id = 'threshold:sleep:3nights_below_7h';
  const sorted = [...(vitals || [])]
    .filter((v) => v.sleep_hours != null)
    .sort((a, b) => b.date.localeCompare(a.date));

  let belowStreak = 0;
  let aboveStreak = 0;
  for (const row of sorted) {
    if (Number(row.sleep_hours) < 7) {
      belowStreak += 1;
      aboveStreak = 0;
    } else {
      aboveStreak += 1;
      belowStreak = 0;
    }
    if (belowStreak >= 3) {
      upsertEvent({
        id,
        type: 'threshold',
        metric: 'sleep',
        active: true,
        payload: { nights: belowStreak, lastDate: row.date },
      });
      return;
    }
    if (aboveStreak >= 2) {
      deactivateEvent(id);
      return;
    }
  }
  if (belowStreak < 3) deactivateEvent(id);
}

function detectCadenceProgression(runLogs, today) {
  const id = 'progression:cadence:monthly_high';
  const monthPrefix = today.slice(0, 7);
  const runs = doneRuns(runLogs)
    .filter((r) => r.date.startsWith(monthPrefix) && r.cadence != null)
    .map((r) => Number(r.cadence));

  if (!runs.length) {
    deactivateEvent(id);
    return;
  }

  const maxCadence = Math.max(...runs);
  const registry = loadRegistry();
  const prev = registry[id]?.payload?.cadence ?? 0;

  if (maxCadence > prev) {
    upsertEvent({
      id,
      type: 'progression',
      metric: 'cadence',
      active: true,
      payload: { cadence: maxCadence, month: monthPrefix },
    });
  } else if (maxCadence < prev) {
    deactivateEvent(id);
  }
}

function detectCadenceStagnation(runLogs) {
  const id = 'stagnation:cadence:6runs_flat';
  const cadences = doneRuns(runLogs)
    .filter((r) => r.cadence != null)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6)
    .map((r) => Number(r.cadence));

  if (cadences.length < 6) {
    deactivateEvent(id);
    return;
  }

  const min = Math.min(...cadences);
  const max = Math.max(...cadences);
  if (max - min <= 2) {
    upsertEvent({
      id,
      type: 'stagnation',
      metric: 'cadence',
      active: true,
      payload: { cadences, range: max - min },
    });
  } else {
    deactivateEvent(id);
  }
}

function detectLongRunMilestone(runLogs) {
  const id = 'milestone:long_run:block_record';
  const runs = doneRuns(runLogs).filter((r) => r.actual_km != null && Number(r.actual_km) > 0);
  if (!runs.length) {
    deactivateEvent(id);
    return;
  }

  let best = null;
  for (const r of runs) {
    const km = Number(r.actual_km);
    if (!best || km > best.km || (km === best.km && r.date > best.date)) {
      best = { km, date: r.date };
    }
  }

  const registry = loadRegistry();
  const prevKm = registry[id]?.payload?.km ?? 0;
  if (best.km > prevKm) {
    upsertEvent({
      id,
      type: 'milestone',
      metric: 'long_run',
      active: true,
      payload: { km: best.km, date: best.date },
    });
  }
}

function detectPaceMilestone(runLogs) {
  const id = 'new:pace:below_730';
  const threshold = 7 * 60 + 30;
  const registry = loadRegistry();
  if (registry[id]?.active) return;

  const runs = doneRuns(runLogs)
    .filter((r) => r.avg_pace)
    .sort((a, b) => a.date.localeCompare(b.date));

  for (const r of runs) {
    const sec = parsePaceSec(r.avg_pace);
    if (sec != null && sec < threshold) {
      upsertEvent({
        id,
        type: 'new',
        metric: 'pace',
        active: true,
        payload: { pace: r.avg_pace, date: r.date },
      });
      return;
    }
  }
}

export function detectMeaningfulEvents({ vitals = [], runLogs = [], today = todayIso() } = {}) {
  const snapshot = { ...loadRegistry() };
  detectSleepThreshold(vitals);
  detectCadenceProgression(runLogs, today);
  detectCadenceStagnation(runLogs);
  detectLongRunMilestone(runLogs);
  detectPaceMilestone(runLogs);
  lastDetectSnapshot = snapshot;
  return getActiveEvents();
}

export function refreshMeaningfulEvents(data) {
  return detectMeaningfulEvents(data);
}

export async function syncMeaningfulEvents() {
  const endIso = formatDate(new Date());
  const start = new Date();
  start.setDate(start.getDate() - 55);
  const startIso = formatDate(start);
  const [vitals, runLogs] = await Promise.all([
    fetchVitalsRange(startIso, endIso),
    fetchAllRunLogs(),
  ]);
  detectMeaningfulEvents({ vitals, runLogs, today: endIso });
  renderActiveSignals();
  return getActiveEvents();
}

export function renderActiveSignals(containerId = 'active-signals-content') {
  const section = document.getElementById('active-signals-section');
  const el = document.getElementById(containerId);
  if (!el || !section) return;

  const events = getActiveEvents();
  if (!events.length) {
    section.classList.add('hidden');
    el.innerHTML = '';
    return;
  }

  section.classList.remove('hidden');
  el.innerHTML = events.map((e) => `
    <div class="active-signal" role="status">${escapeHtml(eventLabel(e))}</div>
  `).join('');
}

export function resetStaleEventsAfterGap(daysSinceLastLog) {
  if (daysSinceLastLog < 5) return;
  const registry = loadRegistry();
  let changed = false;
  for (const id of Object.keys(registry)) {
    if (registry[id].active) {
      registry[id] = { ...registry[id], active: false };
      changed = true;
    }
  }
  if (changed) saveRegistry(registry);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
