import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseAppRouteHash,
  buildAppRouteHash,
  parseRouteDate,
} from './app-route.js';

function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

test('parseRouteDate validates ISO dates', () => {
  const d = parseRouteDate('2026-08-22');
  assert.ok(d instanceof Date);
  assert.equal(formatDate(d), '2026-08-22');
  assert.equal(parseRouteDate('2026-13-01'), null);
  assert.equal(parseRouteDate('bad'), null);
});

test('buildAppRouteHash omits defaults for coach + today', () => {
  assert.equal(buildAppRouteHash('coach', '2026-08-22', { todayIso: '2026-08-22' }), '');
  assert.equal(buildAppRouteHash('food', '2026-08-22', { todayIso: '2026-08-22' }), '#tab=food');
  assert.equal(
    buildAppRouteHash('coach', '2026-08-20', { todayIso: '2026-08-22' }),
    '#date=2026-08-20',
  );
  assert.equal(
    buildAppRouteHash('food', '2026-08-20', { todayIso: '2026-08-22' }),
    '#tab=food&date=2026-08-20',
  );
});

test('parseAppRouteHash reads tab and date', () => {
  const route = parseAppRouteHash('#tab=food&date=2026-08-20');
  assert.equal(route.tab, 'food');
  assert.equal(formatDate(route.date), '2026-08-20');
});

test('parseAppRouteHash rejects invalid tab', () => {
  const route = parseAppRouteHash('#tab=invalid&date=2026-08-20');
  assert.equal(route.tab, 'coach');
});
