// Supplement definitions + schedule helpers

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
    key: 'uprise_d3_60k',
    label: 'Uprise D3 60K',
    hint: 'Thursday — with fattiest meal',
    weekly: true,
  },
];

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

/** Supplement keys required for a given calendar date. */
export function getRequiredSupplementKeys(dateIso) {
  const keys = ['supradyn', 'creatine'];
  if (isD3Day(dateIso)) keys.push('uprise_d3_60k');
  return keys;
}

export function isSupplementLogComplete(log, dateIso) {
  if (!log) return false;
  return getRequiredSupplementKeys(dateIso).every((key) => log[key] === true);
}

export function formatSupplementDebriefLine(log, dateIso) {
  if (!log) return 'Not logged';
  const parts = [];
  if (log.supradyn) parts.push('Supradyn ✓');
  else parts.push('Supradyn ✗');
  if (log.creatine) parts.push('Creatine ✓');
  else parts.push('Creatine ✗');
  if (isD3Day(dateIso)) {
    parts.push(log.uprise_d3_60k ? 'Uprise D3 60K ✓' : 'Uprise D3 60K ✗');
  } else {
    parts.push('Uprise D3 60K — NA (not Thursday)');
  }
  return parts.join(' · ');
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

export function computeAdherenceStats(logsByDate, endIso, days = 28) {
  const dates = dateRangeEnding(endIso, days);
  let dailyTaken = 0;
  let dailyRequired = 0;
  let d3Taken = 0;
  let d3Required = 0;

  for (const iso of dates) {
    const log = logsByDate.get(iso);
    const required = getRequiredSupplementKeys(iso);
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
