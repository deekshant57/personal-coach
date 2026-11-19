/**
 * Gym Save & Close race — completion must await persistence before exit.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { completeThenExitSession, visibleCompletionState } from './session-complete.js';
import { scheduleAutosave, flushAutosave, hasPendingAutosave, cancelAutosave } from './auto-save.js';

test('Save & Close ordering: validate → persist → state → exit', async () => {
  const order = [];
  let releasePersist;
  const persistGate = new Promise((resolve) => { releasePersist = resolve; });

  const pending = completeThenExitSession({
    complete: async () => {
      order.push('validate');
      await persistGate;
      order.push('persist');
      order.push('state');
      return { ok: true };
    },
    exit: () => { order.push('exit'); },
  });

  await Promise.resolve();
  assert.deepEqual(order, ['validate'], 'must not persist or exit before complete() yields');
  assert.equal(order.includes('exit'), false);

  releasePersist();
  const outcome = await pending;
  assert.equal(outcome.exited, true);
  assert.deepEqual(order, ['validate', 'persist', 'state', 'exit']);
});

test('Save & Close does not exit while persistence is pending', async () => {
  let exited = false;
  let failCalled = false;
  let resolveComplete;
  const pending = completeThenExitSession({
    complete: () => new Promise((resolve) => { resolveComplete = resolve; }),
    exit: () => { exited = true; },
    onFail: () => { failCalled = true; },
  });

  await new Promise((r) => setTimeout(r, 20));
  assert.equal(exited, false);
  assert.equal(failCalled, false);

  resolveComplete({ ok: true });
  await pending;
  assert.equal(exited, true);
  assert.equal(failCalled, false);
});

test('Save & Close does not exit when persistence fails', async () => {
  const order = [];
  const outcome = await completeThenExitSession({
    complete: async () => {
      order.push('validate');
      order.push('persist-fail');
      return { ok: false, reason: 'persist' };
    },
    exit: () => { order.push('exit'); },
    onFail: (result) => { order.push(`fail:${result.reason}`); },
  });

  assert.equal(outcome.exited, false);
  assert.equal(outcome.result.reason, 'persist');
  assert.deepEqual(order, ['validate', 'persist-fail', 'fail:persist']);
});

test('Save & Close does not exit when validation fails', async () => {
  let exited = false;
  const outcome = await completeThenExitSession({
    complete: async () => ({ ok: false, reason: 'validation', errors: ['RPE not set'] }),
    exit: () => { exited = true; },
  });
  assert.equal(outcome.exited, false);
  assert.equal(exited, false);
  assert.equal(outcome.result.reason, 'validation');
});

test('Save & Close does not exit when complete() throws', async () => {
  let exited = false;
  let failReason = null;
  const outcome = await completeThenExitSession({
    complete: async () => { throw new Error('network'); },
    exit: () => { exited = true; },
    onFail: (result) => { failReason = result.reason; },
  });
  assert.equal(outcome.exited, false);
  assert.equal(exited, false);
  assert.equal(failReason, 'error');
});

test('failed persist does not produce a false completed state', () => {
  const ui = visibleCompletionState({ persistSucceeded: false, intendedDone: true });
  assert.equal(ui.visibleDone, false);
  assert.equal(ui.authoritativeDone, false);
});

test('retry persist completes once and does not duplicate rows', async () => {
  const rows = new Map();
  const record = { userId: '99705a15-91b5-4eb8-926b-0055db3497c3', date: '2026-11-09' };
  const ui = { visibleDone: false, sessionCompleted: false, exited: false, floor: true };
  let persistShouldFail = true;

  async function persistCompleted(log) {
    if (persistShouldFail) return false;
    const key = `${log.userId}:${log.date}`;
    rows.set(key, { ...log, done: true });
    return true;
  }

  async function attempt({ exitWhenSaved }) {
    const intendedDone = true;
    const persistSucceeded = await persistCompleted({ ...record, sets: 9, rpe: 7 });
    const shown = visibleCompletionState({ persistSucceeded, intendedDone });
    ui.visibleDone = shown.visibleDone;
    if (!persistSucceeded) {
      return { ok: false, reason: 'persist' };
    }
    ui.sessionCompleted = true;
    if (exitWhenSaved) {
      ui.exited = true;
      ui.floor = false;
    }
    return { ok: true };
  }

  const first = await completeThenExitSession({
    complete: () => attempt({ exitWhenSaved: true }),
    exit: () => { ui.exited = true; ui.floor = false; },
    onFail: () => { ui.floor = true; },
  });

  assert.equal(first.exited, false);
  assert.equal(ui.visibleDone, false);
  assert.equal(ui.sessionCompleted, false);
  assert.equal(ui.floor, true);
  assert.equal(rows.size, 0);

  persistShouldFail = false;
  const retry = await completeThenExitSession({
    complete: () => attempt({ exitWhenSaved: true }),
    exit: () => { ui.exited = true; ui.floor = false; },
  });

  assert.equal(retry.exited, true);
  assert.equal(ui.visibleDone, true);
  assert.equal(ui.sessionCompleted, true);
  assert.equal(ui.floor, false);
  assert.equal(rows.size, 1);
  assert.equal(rows.get('99705a15-91b5-4eb8-926b-0055db3497c3:2026-11-09').done, true);
});

test('flushAutosave awaits execute and returns its result (no premature completion)', async () => {
  const key = 'training:flush-race';
  cancelAutosave(key);
  let finished = false;
  scheduleAutosave(key, async () => {
    await new Promise((r) => setTimeout(r, 25));
    finished = true;
    return true;
  }, 60_000);

  assert.equal(hasPendingAutosave(key), true);
  const result = await flushAutosave(key);
  assert.equal(finished, true);
  assert.equal(result, true);
  assert.equal(hasPendingAutosave(key), false);
});
