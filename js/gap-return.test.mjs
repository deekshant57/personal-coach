import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildActivityDateSet,
  computeLoggingGap,
} from './gap-return-logic.js';

test('buildActivityDateSet collects dates from vitals, food, and training', () => {
  const dates = buildActivityDateSet(
    [{ date: '2026-07-01', weight_kg: 75 }],
    [{ date: '2026-07-02', total_protein: 120, total_calories: 2000 }],
    [{ date: '2026-07-03', done: true }],
    [{ date: '2026-07-04', done: false }],
  );
  assert.deepEqual([...dates].sort(), ['2026-07-01', '2026-07-02', '2026-07-03']);
});

test('computeLoggingGap counts consecutive empty days ending yesterday', () => {
  const today = new Date(2026, 6, 10); // 10 Jul 2026
  const activity = new Set(['2026-07-01', '2026-07-02']);
  const gap = computeLoggingGap(activity, today);
  assert.equal(gap.gapDays, 7);
  assert.equal(gap.lastLoggedDate, '2026-07-02');
});

test('computeLoggingGap returns zero when yesterday was logged', () => {
  const today = new Date(2026, 6, 10);
  const activity = new Set(['2026-07-09']);
  const gap = computeLoggingGap(activity, today);
  assert.equal(gap.gapDays, 0);
  assert.equal(gap.lastLoggedDate, '2026-07-09');
});

test('computeLoggingGap ignores future activity dates for lastLoggedDate', () => {
  const today = new Date(2026, 6, 10);
  const activity = new Set(['2026-07-08', '2026-07-15']);
  const gap = computeLoggingGap(activity, today);
  assert.equal(gap.lastLoggedDate, '2026-07-08');
});
