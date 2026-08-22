// Supplement definitions + schedule helpers (filtered per athlete profile)
import { getAthleteProfile } from './athlete-profile.js';

export const D3_WEEKDAY = 4; // Thursday (0 = Sun)

export const SUPPLEMENT_ITEMS = [
  {
    key: 'supradyn',
    label: 'Supradyn',
    hint: 'After breakfast — with food',
    daily: true,
  },
  {
    key: 'creatine',
    label: 'Creatine 5g',
    hint: 'With lunch',
    daily: true,
  },
  {
    key: 'omega_3',
    label: 'Omega-3 (Algae)',
    hint: 'With lunch — 1-2g EPA+DHA',
    daily: true,
  },
  {
    key: 'uprise_d3_60k',
    label: 'Uprise D3 60K',
    hint: 'Thursday — with fattiest meal',
    weekly: true,
  },
];

const ALL_DAILY_KEYS = ['supradyn', 'creatine', 'omega_3'];

export function getAthleteSupplementKeys(profile = getAthleteProfile()) {
  return profile.supplementKeys || ALL_DAILY_KEYS.concat(['uprise_d3_60k']);
}

export function parseIsoDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function toIsoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function isD3Day(dateOrIso) {
  const d = typeof dateOrIso === 'string' ? parseIsoDate(dateOrIso) : dateOrIso;
  return d.getDay() === D3_WEEKDAY;
}

/** Next Thursday on or after the given date (calendar day). */
export function getNextD3Date(fromDate = new Date()) {
  const d = new Date(fromDate);
  d.setHours(0, 0, 0, 0);
  const daysUntil = (D3_WEEKDAY - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + daysUntil);
  return d;
}

/** When to take Supradyn based on today's plan. */
export function getSupradynTimingHint(plan) {
  if (plan?.run_type) return 'After post-run meal (~7:30)';
  if (plan?.workout_plan) return 'After workout (~7:45)';
  return 'After breakfast (~8:00)';
}

const TASK_META = {
  supradyn: {
    id: 'supradyn',
    key: 'supradyn',
    label: 'Supradyn',
    action: 'supplements',
    focusKey: 'supradyn',
  },
  creatine: {
    id: 'creatine',
    key: 'creatine',
    label: 'Creatine',
    hint: 'With lunch',
    action: 'supplements',
    focusKey: 'creatine',
  },
  omega_3: {
    id: 'omega_3',
    key: 'omega_3',
    label: 'Omega-3',
    hint: 'With lunch',
    action: 'supplements',
    focusKey: 'omega_3',
  },
  uprise_d3_60k: {
    id: 'uprise_d3_60k',
    key: 'uprise_d3_60k',
    label: 'D3 60K',
    hint: 'With fattiest meal',
    action: 'supplements',
    focusKey: 'uprise_d3_60k',
  },
};

/** Per-supplement tasks for the Today day-progress strip. */
export function getSupplementTasks(plan, log, dateIso, profile = getAthleteProfile()) {
  const allowed = new Set(getAthleteSupplementKeys(profile));
  const tasks = [];

  if (allowed.has('supradyn')) {
    tasks.push({
      ...TASK_META.supradyn,
      hint: getSupradynTimingHint(plan),
      done: !!log?.supradyn,
      required: true,
    });
  }
  if (allowed.has('creatine')) {
    tasks.push({
      ...TASK_META.creatine,
      done: !!log?.creatine,
      required: true,
    });
  }
  if (allowed.has('omega_3')) {
    tasks.push({
      ...TASK_META.omega_3,
      done: !!log?.omega_3,
      required: true,
    });
  }
  if (allowed.has('uprise_d3_60k') && isD3Day(dateIso)) {
    tasks.push({
      ...TASK_META.uprise_d3_60k,
      done: !!log?.uprise_d3_60k,
      required: true,
    });
  }

  return tasks;
}

export function areSupplementTasksComplete(tasks) {
  return tasks.filter((t) => t.required).every((t) => t.done);
}

/** Supplement keys required for a given calendar date (athlete-scoped). */
export function getRequiredSupplementKeys(dateIso, profile = getAthleteProfile()) {
  const allowed = getAthleteSupplementKeys(profile);
  const keys = ALL_DAILY_KEYS.filter((k) => allowed.includes(k));
  if (allowed.includes('uprise_d3_60k') && isD3Day(dateIso)) {
    keys.push('uprise_d3_60k');
  }
  return keys;
}

export function isSupplementLogComplete(log, dateIso, profile = getAthleteProfile()) {
  if (!log) return false;
  return getRequiredSupplementKeys(dateIso, profile).every((key) => log[key] === true);
}

export function formatSupplementDebriefLine(log, dateIso, profile = getAthleteProfile()) {
  if (!log) return 'Not logged';
  const allowed = new Set(getAthleteSupplementKeys(profile));
  const parts = [];
  if (allowed.has('supradyn')) {
    parts.push(log.supradyn ? 'Supradyn ✓' : 'Supradyn ✗');
  }
  if (allowed.has('creatine')) {
    parts.push(log.creatine ? 'Creatine ✓' : 'Creatine ✗');
  }
  if (allowed.has('omega_3')) {
    parts.push(log.omega_3 ? 'Omega-3 ✓' : 'Omega-3 ✗');
  }
  if (allowed.has('uprise_d3_60k')) {
    if (isD3Day(dateIso)) {
      parts.push(log.uprise_d3_60k ? 'Uprise D3 60K ✓' : 'Uprise D3 60K ✗');
    } else {
      parts.push('Uprise D3 60K — NA (not Thursday)');
    }
  }
  return parts.join(' · ') || 'Not logged';
}

/** Last N calendar days ending at endIso (inclusive). */
export function dateRangeEnding(endIso, days) {
  const end = parseIsoDate(endIso);
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    out.push(toIsoDate(d));
  }
  return out;
}

export function computeAdherenceStats(logsByDate, endIso, days = 28, profile = getAthleteProfile()) {
  const dates = dateRangeEnding(endIso, days);
  let dailyTaken = 0;
  let dailyRequired = 0;
  let d3Taken = 0;
  let d3Required = 0;

  for (const iso of dates) {
    const log = logsByDate.get(iso);
    const required = getRequiredSupplementKeys(iso, profile);
    for (const key of required) {
      if (key === 'uprise_d3_60k') {
        d3Required++;
        if (log?.uprise_d3_60k) d3Taken++;
      } else {
        dailyRequired++;
        if (log?.[key]) dailyTaken++;
      }
    }
  }

  return {
    dates,
    dailyPct: dailyRequired ? Math.round((dailyTaken / dailyRequired) * 100) : 0,
    d3Pct: d3Required ? Math.round((d3Taken / d3Required) * 100) : null,
    d3Taken,
    d3Required,
  };
}

export function formatSupplementAdherenceHint(profile = getAthleteProfile()) {
  const keys = getAthleteSupplementKeys(profile);
  const daily = [];
  if (keys.includes('supradyn')) daily.push('Supradyn');
  if (keys.includes('creatine')) daily.push('Creatine');
  if (keys.includes('omega_3')) daily.push('Omega-3');
  const dailyBit = daily.length ? `${daily.join(' + ')} every day` : 'No daily stack';
  const d3Bit = keys.includes('uprise_d3_60k')
    ? ' · Uprise D3 60K on Thursdays only'
    : '';
  return `${dailyBit}${d3Bit}.`;
}
