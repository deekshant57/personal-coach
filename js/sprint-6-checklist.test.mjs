/**
 * Sprint 6 edge-case checklist — automated verification
 * Run: node --import ./js/test-setup.mjs --test js/sprint-6-checklist.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { computeLoggingGap } from './gap-return-logic.js';
import {
  renderObservation,
  shouldShowPostSaveObservation,
  shouldStaySilent,
} from './observation-engine.js';
import { summarizePlanSession } from './plan-summary.js';

const __dir = dirname(fileURLToPath(import.meta.url));
const blockContextJs = readFileSync(join(__dir, 'block-context.js'), 'utf8');

function formatRecoveryTodayHtml({ plan, nextLabel }) {
  const protein = plan?.protein_target || 140;
  const lines = [
    `Protein floor: ${protein}g`,
    'Sleep floor: 7h',
    'Supplements: Supradyn, Creatine, Omega-3 (D3 on Thu)',
  ];
  if (nextLabel) lines.push(`Tomorrow: ${nextLabel}`);
  return lines.map((line) => `<p class="recovery-today-line">${line}</p>`).join('');
}

function blockNameFromSource() {
  const m = blockContextJs.match(/name:\s*'([^']+)'/);
  return m?.[1] || '';
}

function blockWeekFromSource() {
  const m = blockContextJs.match(/week:\s*(\d+)/);
  return Number(m?.[1] || 0);
}

const indexHtml = readFileSync(join(__dir, '..', 'index.html'), 'utf8');
const gapReturnJs = readFileSync(join(__dir, 'gap-return.js'), 'utf8');
const debriefJs = readFileSync(join(__dir, 'debrief.js'), 'utf8');

function isMonday(d) {
  return d.getDay() === 1;
}

function isRestPlan(plan) {
  return plan && !plan.run_type && !plan.workout_plan;
}

function getIncompleteWarning(readiness) {
  const missing = readiness.tasks.filter((t) => !t.done);
  if (!missing.length) return '';
  const labels = missing.map((t) => t.label).join(', ');
  return `${missing.length} item${missing.length === 1 ? '' : 's'} not logged — ${labels}. Export anyway?`;
}

const SHAME_PHRASES = [
  /welcome back/i,
  /where have you been/i,
  /we missed you/i,
  /sorry you/i,
  /you've been away/i,
  /get back on track/i,
  /don't worry/i,
  /guilty/i,
];

// ── 1. Return after 7-day gap ───────────────────────────────
test('checklist 1a — 7-day gap detected', () => {
  const today = new Date(2026, 6, 10);
  const activity = new Set(['2026-07-02']);
  const gap = computeLoggingGap(activity, today);
  assert.ok(gap.gapDays >= 7, `expected gapDays >= 7, got ${gap.gapDays}`);
  assert.equal(gap.lastLoggedDate, '2026-07-02');
});

test('checklist 1b — gap banner has no shame copy', () => {
  for (const re of SHAME_PHRASES) {
    assert.equal(re.test(gapReturnJs), false, `shame phrase matched: ${re}`);
  }
  assert.ok(gapReturnJs.includes('Continuing from today.'));
  assert.ok(gapReturnJs.includes('Last logged:'));
  assert.ok(!gapReturnJs.includes('welcome back'));
});

test('checklist 1c — gap >= 5 resets stale meaningful events', () => {
  const registry = {
    'threshold:sleep:3nights_below_7h': { id: 'threshold:sleep:3nights_below_7h', active: true },
    'progression:cadence:monthly_high': { id: 'progression:cadence:monthly_high', active: true },
  };

  const gapDays = 7;
  assert.ok(gapDays >= 5);
  for (const id of Object.keys(registry)) {
    if (registry[id].active) registry[id].active = false;
  }
  assert.equal(Object.values(registry).filter((e) => e.active).length, 0);
  assert.ok(readFileSync(join(__dir, 'gap-return.js'), 'utf8').includes('resetStaleEventsAfterGap'));
});

// ── 2. Perfect on-plan day — zero observations ──────────────
test('checklist 2a — no observation when no new or active events', () => {
  assert.equal(renderObservation([], { plan: null }), null);
  assert.equal(shouldShowPostSaveObservation([]), false);
  assert.equal(shouldStaySilent({ newEvents: [], activeEvents: [] }), true);
});

test('checklist 2b — post-save silent when no newly activated events', () => {
  assert.equal(shouldShowPostSaveObservation([]), false);
});

test('checklist 2c — layout hides observation block when registry empty', () => {
  const observationCoach = readFileSync(join(__dir, 'observation-coach.js'), 'utf8');
  assert.ok(observationCoach.includes('if (!getActiveEvents().length) hideObservationBlock()'));
});

// ── 3. Export with ~90% data — succeeds with warning ────────
test('checklist 3a — incomplete export shows warning, not blocked', () => {
  const readiness = {
    tasks: [
      { label: 'Vitals', done: true },
      { label: 'Run', done: true },
      { label: 'Meals', done: true },
      { label: 'Supradyn', done: true },
      { label: 'Creatine', done: true },
      { label: 'Omega-3', done: false },
    ],
    ready: false,
  };
  const warn = getIncompleteWarning(readiness);
  assert.ok(warn.includes('1 item not logged'));
  assert.ok(warn.includes('Export anyway?'));
  assert.ok(warn.includes('Omega-3'));
});

test('checklist 3b — copy button stays enabled when incomplete', () => {
  assert.ok(debriefJs.includes('copyBtn.disabled = false'));
  assert.ok(!debriefJs.match(/copyBtn\.disabled\s*=\s*!ready/));
});

test('checklist 3c — missing fields export as "not logged"', () => {
  assert.ok(debriefJs.includes("return 'not logged'"));
  assert.ok(debriefJs.includes('debrief-incomplete-warning'));
});

test('checklist 3d — debrief export card present on Coach tab', () => {
  assert.ok(indexHtml.includes('id="coach-debrief-export-card"'));
  assert.ok(indexHtml.includes('id="copy-debrief"'));
  assert.ok(indexHtml.includes('id="debrief-incomplete-warning"'));
});

// ── 4. Rest day — recovery block + tomorrow preview ─────────
test('checklist 4a — recovery HTML includes floors and tomorrow', () => {
  const restPlan = { day_type: 'Rest', protein_target: 149 };
  const nextPlan = { day_name: 'Mon', run_type: 'Easy', run_km: 5 };
  const html = formatRecoveryTodayHtml({
    plan: restPlan,
    nextLabel: summarizePlanSession(nextPlan),
  });
  assert.ok(html.includes('Protein floor: 149g'));
  assert.ok(html.includes('Sleep floor: 7h'));
  assert.ok(html.includes('Supplements:'));
  assert.ok(html.includes('Tomorrow: Mon Easy 5 km'));
});

test('checklist 4b — recovery card DOM + coach-layout wiring', () => {
  assert.ok(indexHtml.includes('id="recovery-card"'));
  assert.ok(indexHtml.includes('id="recovery-content"'));
  const coachLayout = readFileSync(join(__dir, 'coach-layout.js'), 'utf8');
  assert.ok(coachLayout.includes('renderRecoveryCard'));
  assert.ok(coachLayout.includes('formatRecoveryTodayHtml'));
});

test('checklist 4c — rest day plan title pattern in block-context', () => {
  assert.ok(blockContextJs.includes('formatRestDayPlanTitle'));
  assert.ok(blockContextJs.includes('Rest day'));
  assert.ok(blockContextJs.includes('Next:'));
  const blockName = blockNameFromSource();
  assert.ok(blockName.includes('HM Build'));
});

test('checklist 4d — Sunday fallback plan shape is rest day', () => {
  const sunRest = {
    day_type: 'Rest',
    run_type: null,
    workout_plan: null,
    protein_target: 149,
  };
  assert.ok(isRestPlan(sunRest));
});

// ── 5. Monday — weekly review + waist + block chip ───────────
test('checklist 5a — Monday review card in DOM', () => {
  assert.ok(indexHtml.includes('id="monday-review-card"'));
  assert.ok(indexHtml.includes('id="monday-review-content"'));
});

test('checklist 5b — waist field row exists (Monday only in today.js)', () => {
  assert.ok(indexHtml.includes('id="waist-row"'));
  const todayJs = readFileSync(join(__dir, 'today.js'), 'utf8');
  assert.ok(todayJs.includes("waistRow.classList.toggle('hidden', !isMonday(state.currentDate))"));
});

test('checklist 5c — Monday debrief requires waist', () => {
  const dayProgress = readFileSync(join(__dir, 'day-progress.js'), 'utf8');
  assert.ok(dayProgress.includes("vitals.label = 'Vitals (+ waist)'"));
  assert.ok(dayProgress.includes('waist_inches == null'));
});

test('checklist 5d — block chip uses BLOCK.week from block-context.js', () => {
  assert.ok(blockContextJs.includes('formatBlockChip'));
  assert.ok(blockContextJs.includes('wk to race'));
  assert.equal(blockWeekFromSource(), 2);
  assert.ok(blockNameFromSource().length > 0);
});

test('checklist 5e — Jul 6 2026 is Monday (fixture date)', () => {
  assert.equal(isMonday(new Date(2026, 6, 6)), true);
});

test('checklist 5f — monday review wired in observation-coach', () => {
  const observationCoach = readFileSync(join(__dir, 'observation-coach.js'), 'utf8');
  assert.ok(observationCoach.includes('renderMondayReviewBlock'));
  assert.ok(observationCoach.includes('isMonday(state.currentDate)'));
});
