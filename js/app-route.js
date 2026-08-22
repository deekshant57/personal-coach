// URL hash ↔ tab + date (PWA — no server router)

const VALID_TABS = new Set(['coach', 'food', 'week', 'progress']);

function formatDateLocal(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseRouteDate(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [year, month, day] = iso.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  if (Number.isNaN(d.getTime()) || formatDateLocal(d) !== iso) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

/** @returns {{ tab: string, date: Date|null, dateIso: string|null }} */
export function parseAppRouteHash(hash = typeof location !== 'undefined' ? location.hash : '') {
  const raw = (hash || '').replace(/^#/, '').trim();
  if (!raw) return { tab: 'coach', date: null, dateIso: null };

  const params = new URLSearchParams(raw);
  const tabRaw = params.get('tab') || 'coach';
  const tab = VALID_TABS.has(tabRaw) ? tabRaw : 'coach';
  const dateIso = params.get('date');
  const date = parseRouteDate(dateIso);

  return {
    tab,
    date,
    dateIso: date ? dateIso : null,
  };
}

export function buildAppRouteHash(tab, date, { todayIso } = {}) {
  const params = new URLSearchParams();
  const tabName = tab || 'coach';
  if (tabName !== 'coach') params.set('tab', tabName);

  const dateIso = date instanceof Date ? formatDateLocal(date) : date;
  if (dateIso && todayIso && dateIso !== todayIso) {
    params.set('date', dateIso);
  } else if (dateIso && !todayIso) {
    params.set('date', dateIso);
  }

  const qs = params.toString();
  return qs ? `#${qs}` : '';
}

export function writeAppRoute(tab, date, { todayIso } = {}) {
  if (typeof location === 'undefined') return;
  const hash = buildAppRouteHash(tab, date, { todayIso });
  const next = `${location.pathname}${location.search}${hash}`;
  const current = `${location.pathname}${location.search}${location.hash}`;
  if (current !== next) {
    history.replaceState({ appRoute: true }, '', next);
  }
}

export function isValidAppTab(tab) {
  return VALID_TABS.has(tab);
}
