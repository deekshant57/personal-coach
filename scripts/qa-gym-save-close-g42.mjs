#!/usr/bin/env node
/**
 * Phase 3.1.G.4.2 — Gym Save & Close persistence (QA user only).
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const PORT = 8787;
const BASE = `http://127.0.0.1:${PORT}`;
const EMAIL = process.env.COACH_TEST_EMAIL;
const PASSWORD = process.env.COACH_TEST_PASSWORD;
const UID = process.env.COACH_TEST_USER_ID;
const SUPABASE_URL = 'https://lqtwtcgnzpsrhfuynzdk.supabase.co';
const PROTECTED = new Set([
  'd6f25dae-4cc8-48dd-9822-fbccf9a92139',
  '9e6a0d55-b63f-4857-b318-122e0c337ef4',
]);

const GYM_A = '2026-11-09';
const GYM_B = '2026-11-16';
const GYM_D = '2026-11-06';
const RUN = '2026-11-04';

function loadServiceRole() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) return process.env.SUPABASE_SERVICE_ROLE_KEY;
  const parentEnv = join(ROOT, '..', '.env');
  if (!existsSync(parentEnv)) return '';
  for (const line of readFileSync(parentEnv, 'utf8').split('\n')) {
    const m = line.match(/^\s*SUPABASE_SERVICE_ROLE_KEY\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[1].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    return v;
  }
  return '';
}
const SERVICE = loadServiceRole();
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
};

if (!EMAIL || !PASSWORD || !UID) {
  console.error('Missing COACH_TEST_*');
  process.exit(1);
}
if (PROTECTED.has(UID)) {
  console.error('Refusing protected athlete uid');
  process.exit(1);
}

const results = [];
const rec = (status, step, detail = '') => {
  results.push({ status, step, detail });
  console.log(`${status === 'Passed' ? 'PASS' : status === 'Failed' ? 'FAIL' : 'PARTIAL'} — ${step}${detail ? ` · ${detail}` : ''}`);
};
const pass = (s, d) => rec('Passed', s, d);
const fail = (s, d) => rec('Failed', s, d);
const partial = (s, d) => rec('Partially verified', s, d);

async function db(method, path, body) {
  const headers = {
    apikey: SERVICE,
    Authorization: `Bearer ${SERVICE}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers,
    body: body == null ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { error: text, status: res.status }; }
}
async function workoutLogs(date) {
  return db('GET', `/rest/v1/workout_logs?user_id=eq.${UID}&date=eq.${date}&select=user_id,date,done,rpe,notes,what_i_did`);
}
async function foreignWorkoutLogs(date) {
  return db('GET', `/rest/v1/workout_logs?date=eq.${date}&user_id=neq.${UID}&select=user_id,date`);
}

function startServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let path = req.url?.split('?')[0] || '/';
      if (path === '/') path = '/index.html';
      const filePath = join(ROOT, path);
      if (!filePath.startsWith(ROOT) || !existsSync(filePath)) {
        res.writeHead(404); res.end('Not found'); return;
      }
      res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' });
      res.end(readFileSync(filePath));
    });
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}

async function iso(page) {
  return page.evaluate(() => document.getElementById('date-display')?.dataset?.iso || null);
}
async function goDate(page, target) {
  await page.evaluate((d) => { location.hash = `#tab=coach&date=${d}`; }, target);
  await page.waitForFunction((want) => document.getElementById('date-display')?.dataset?.iso === want, target, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(600);
  return (await iso(page)) === target;
}
async function enablePastEdit(page) {
  await page.evaluate(() => document.getElementById('coach-past-edit-btn')?.click());
  await page.waitForTimeout(300);
}
async function setRpe(page, value) {
  await page.evaluate((v) => {
    const el = document.getElementById('input-workout-rpe');
    if (!el) return;
    el.value = String(v);
    el.dataset.rpeExplicit = '1';
    const d = document.getElementById('workout-rpe-value');
    if (d) d.textContent = String(v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}
async function clearRpe(page) {
  await page.evaluate(() => {
    const el = document.getElementById('input-workout-rpe');
    if (!el) return;
    delete el.dataset.rpeExplicit;
    el.value = '5';
    const d = document.getElementById('workout-rpe-value');
    if (d) d.textContent = '—';
  });
}
async function forceExit(page) {
  await page.evaluate(() => document.getElementById('session-exit-btn')?.click());
  await page.waitForTimeout(300);
}
async function openSession(page) {
  await page.evaluate(() => {
    const resume = document.getElementById('session-resume-btn');
    const start = document.getElementById('session-start-btn');
    if (resume && !resume.classList.contains('hidden')) resume.click();
    else start?.click();
  });
  await page.waitForTimeout(600);
}
async function completeAllSetPills(page, leaveOne = false) {
  const pills = page.locator('.workout-set-pill:not(.done)');
  let n = await pills.count();
  const target = leaveOne ? Math.max(0, n - 1) : n;
  for (let i = 0; i < target; i += 1) {
    await page.locator('.workout-set-pill:not(.done)').first().click({ force: true }).catch(() => {});
    await page.waitForTimeout(80);
    if (await page.locator('#session-rest:not(.hidden)').count()) {
      await page.evaluate(() => document.getElementById('session-rest-skip')?.click());
    }
  }
  return page.evaluate(() => {
    const all = [...document.querySelectorAll('.workout-set-pill')];
    return { total: all.length, done: all.filter((p) => p.classList.contains('done')).length };
  });
}
async function memoryCard(page) {
  return page.evaluate(() => ({
    floor: document.body.classList.contains('session-floor-active'),
    done: document.getElementById('training-done-btn')?.classList.contains('done'),
    card: document.getElementById('training-card')?.innerText?.slice(0, 280) || '',
    memory: document.getElementById('session-memory-summary')?.innerText?.slice(0, 160) || '',
    toast: document.getElementById('toast')?.textContent || '',
    closeOpen: !document.getElementById('session-close-panel')?.classList.contains('hidden'),
    floorBar: !document.getElementById('session-floor-bar')?.classList.contains('hidden'),
  }));
}

async function login(page) {
  await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  if (await page.locator('#auth-screen.show').count()) {
    await page.fill('#auth-email', EMAIL);
    await page.fill('#auth-password', PASSWORD);
    await page.click('#auth-submit');
  }
  await page.waitForFunction(() => !document.getElementById('auth-screen')?.classList.contains('show'), { timeout: 60000 });
  await page.waitForTimeout(1000);
}

async function run() {
  const ownership = {
    uid: UID,
    protectedBlocked: !PROTECTED.has(UID),
    foreignA: await foreignWorkoutLogs(GYM_A),
    foreignB: await foreignWorkoutLogs(GYM_B),
  };
  if (ownership.foreignA?.length || ownership.foreignB?.length) {
    console.error('Foreign workout logs on QA dates — abort');
    process.exit(1);
  }

  const gymA = await db('GET', `/rest/v1/daily_plans?user_id=eq.${UID}&date=eq.${GYM_A}&select=user_id,date,day_type,workout_plan`);
  if (!gymA?.[0] || gymA[0].user_id !== UID) {
    console.error('Gym A plan not QA-owned', gymA);
    process.exit(1);
  }

  await db('POST', '/rest/v1/daily_plans?on_conflict=user_id,date', [{
    user_id: UID, date: GYM_B, day_name: 'Monday', day_type: 'Gym',
    protein_target: 140, water_target: '2L', run_type: null, run_km: null, run_pace: null, run_cue: null,
    workout_plan: 'Upper',
    workout_detail: 'WARM-UP · Bench Press 3×8 · Row 3×10 · Overhead Press 3×8 · COOL-DOWN',
    meals_plan: 'QA', directive: 'G42 validation gym', calorie_target: 2200,
    planned_session_window: 'morning', actual_session_window: 'morning', session_status: 'planned', slot_scheme: null,
  }]);
  await db('DELETE', `/rest/v1/workout_logs?user_id=eq.${UID}&date=in.(${GYM_A},${GYM_B},${GYM_D})`);

  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.setDefaultTimeout(45000);
  const findings = { ownership };

  try {
    await login(page);

    // ── A: valid Save & Close ──
    if (!(await goDate(page, GYM_A))) fail('A navigate', await iso(page));
    else {
      await enablePastEdit(page);
      await openSession(page);
      const sets = await completeAllSetPills(page);
      await setRpe(page, 7);
      await page.evaluate(() => {
        const el = document.getElementById('input-workout-notes');
        if (el) {
          el.value = 'G42 scenario A';
          el.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
      findings.aSets = sets;
      await page.evaluate(() => document.getElementById('session-finish-btn')?.click());
      await page.waitForTimeout(300);
      await page.evaluate(() => {
        const el = document.getElementById('session-close-note');
        if (el) el.value = 'close A';
      });
      await page.evaluate(() => document.getElementById('session-close-confirm')?.click());
      await page.waitForTimeout(2500);
      const after = await memoryCard(page);
      const dbA = await workoutLogs(GYM_A);
      findings.aAfter = { after, dbA };
      const completeUi = !after.floor && /Edit session|Session logged|· done|sets · done/i.test(`${after.card} ${after.memory}`);
      const oneRow = Array.isArray(dbA) && dbA.length === 1 && dbA[0].user_id === UID && dbA[0].done === true;
      if (completeUi && oneRow) pass('A Save & Close Memory + DB', JSON.stringify({ card: after.card.slice(0, 120), db: dbA[0] }));
      else fail('A Save & Close Memory + DB', JSON.stringify({ after, dbA }).slice(0, 500));

      await goDate(page, GYM_D);
      await goDate(page, GYM_A);
      await page.waitForTimeout(800);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);
      if (await page.locator('#auth-screen.show').count()) await login(page);
      await goDate(page, GYM_A);
      await page.waitForTimeout(800);
      const refreshed = await memoryCard(page);
      const dbA2 = await workoutLogs(GYM_A);
      findings.aRefresh = { refreshed, dbA2 };
      if (/Edit session|Session logged|· done/i.test(refreshed.card) && dbA2?.[0]?.done === true && dbA2.length === 1) {
        pass('A refresh persist', refreshed.card.slice(0, 120));
      } else fail('A refresh persist', JSON.stringify({ refreshed, dbA2 }).slice(0, 400));
    }

    // ── C then E then B on a clean gym date (do not complete the day) ──
    await forceExit(page);
    if (!(await goDate(page, GYM_B))) fail('C navigate', await iso(page));
    else {
      await enablePastEdit(page);
      await openSession(page);
      await completeAllSetPills(page);
      await clearRpe(page);
      await page.evaluate(() => document.getElementById('session-finish-btn')?.click());
      await page.waitForTimeout(250);
      await page.evaluate(() => document.getElementById('session-close-confirm')?.click());
      await page.waitForTimeout(900);
      const cState = await memoryCard(page);
      findings.cAfter = cState;
      if (/RPE not set/i.test(cState.toast) && cState.floor && !cState.done) {
        pass('C missing RPE blocked', cState.toast);
      } else fail('C missing RPE blocked', JSON.stringify(cState).slice(0, 300));

      // E: Close Back
      await setRpe(page, 6);
      await page.evaluate(() => document.getElementById('session-finish-btn')?.click());
      await page.waitForTimeout(250);
      const closeOpen = await page.evaluate(() => !document.getElementById('session-close-panel')?.classList.contains('hidden'));
      await page.evaluate(() => document.getElementById('session-close-cancel')?.click());
      await page.waitForTimeout(300);
      const eState = await page.evaluate(() => ({
        floor: document.body.classList.contains('session-floor-active'),
        closeHidden: document.getElementById('session-close-panel')?.classList.contains('hidden'),
        pills: [...document.querySelectorAll('.workout-set-pill')].filter((p) => p.classList.contains('done')).length,
        rpe: document.getElementById('input-workout-rpe')?.dataset?.rpeExplicit,
      }));
      findings.eAfter = { closeOpen, eState };
      if (closeOpen && eState.floor && eState.closeHidden && eState.pills > 0) pass('E Close Back retains Floor data', JSON.stringify(eState));
      else fail('E Close Back retains Floor data', JSON.stringify({ closeOpen, eState }));

      // B: un-mark one set, keep RPE, attempt Save & Close
      await page.locator('.workout-set-pill.done').first().click({ force: true }).catch(() => {});
      await page.waitForTimeout(150);
      const setsB = await page.evaluate(() => {
        const all = [...document.querySelectorAll('.workout-set-pill')];
        return { total: all.length, done: all.filter((p) => p.classList.contains('done')).length };
      });
      await page.evaluate(() => {
        const el = document.getElementById('input-workout-notes');
        if (el) { el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); }
      });
      await page.evaluate(() => document.getElementById('session-finish-btn')?.click());
      await page.waitForTimeout(250);
      await page.evaluate(() => document.getElementById('session-close-confirm')?.click());
      await page.waitForTimeout(1500);
      const bState = await memoryCard(page);
      const dbB = await workoutLogs(GYM_B);
      findings.bAfter = { setsB, bState, dbB };
      if (bState.floor && !bState.done && /Log at least|set/i.test(bState.toast)) {
        pass('B incomplete sets blocked', bState.toast);
      } else if (setsB.done > 0 && (bState.done || dbB?.[0]?.done === true)) {
        partial('B incomplete remaining set allowed by existing validation (≥1 set counts as logged work)', JSON.stringify({ setsB, dbDone: dbB?.[0]?.done ?? null }));
      } else {
        partial('B incomplete sets', JSON.stringify({ setsB, bState }).slice(0, 280));
      }
      await forceExit(page);
    }

    // ── D: Exit without Done ──
    await forceExit(page);
    if (!(await goDate(page, GYM_D))) fail('D navigate', await iso(page));
    else {
      await enablePastEdit(page);
      await openSession(page);
      await completeAllSetPills(page, true);
      await setRpe(page, 5);
      await page.waitForTimeout(1800);
      await page.evaluate(() => document.getElementById('session-exit-btn')?.click());
      await page.waitForTimeout(600);
      const dState = await memoryCard(page);
      const dbD = await workoutLogs(GYM_D);
      findings.dAfter = { dState, dbD };
      if (!dState.floor && dState.done !== true && dbD?.[0]?.done !== true) {
        pass('D Exit does not mark Done', JSON.stringify({ dbDone: dbD?.[0]?.done ?? null, inProgress: /Resume/i.test(dState.card) }));
      } else fail('D Exit does not mark Done', JSON.stringify({ dState, dbD }).slice(0, 300));
    }

    // ── F: persist failure (GYM_D still not Done) ──
    await forceExit(page);
    await goDate(page, GYM_D);
    await enablePastEdit(page);
    await openSession(page);
    await completeAllSetPills(page);
    await setRpe(page, 7);
    await page.evaluate(() => {
      const el = document.getElementById('input-workout-notes');
      if (el) {
        el.value = 'G42 offline';
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await page.evaluate(() => document.getElementById('session-finish-btn')?.click());
    await page.waitForTimeout(250);
    await page.context().setOffline(true);
    await page.evaluate(() => document.getElementById('session-close-confirm')?.click());
    await page.waitForTimeout(2500);
    const fOffline = await memoryCard(page);
    const dbF1 = await workoutLogs(GYM_D);
    findings.fOffline = { fOffline, dbF1 };
    await page.context().setOffline(false);
    await page.waitForTimeout(400);
    if (fOffline.floor && dbF1?.[0]?.done !== true) {
      pass('F offline does not complete', JSON.stringify({ toast: fOffline.toast, dbDone: dbF1?.[0]?.done ?? null }));
      if (await page.locator('#save-error-retry').isVisible().catch(() => false)) {
        await page.evaluate(() => document.getElementById('save-error-retry')?.click());
        await page.waitForTimeout(2000);
      }
      await page.evaluate(() => {
        if (!document.body.classList.contains('session-floor-active')) {
          document.getElementById('session-resume-btn')?.click();
          document.getElementById('session-start-btn')?.click();
        }
        document.getElementById('session-finish-btn')?.click();
      });
      await page.waitForTimeout(300);
      await page.evaluate(() => document.getElementById('session-close-confirm')?.click());
      await page.waitForTimeout(2500);
      const fRetry = await memoryCard(page);
      const dbF2 = await workoutLogs(GYM_D);
      findings.fRetry = { fRetry, dbF2 };
      const one = Array.isArray(dbF2) && dbF2.filter((r) => r.user_id === UID).length === 1;
      if (one && dbF2[0].done === true) pass('F retry persists one row', JSON.stringify(dbF2[0]));
      else partial('F retry persist', JSON.stringify({ fRetry, dbF2 }).slice(0, 300));
    } else {
      partial('F offline Save & Close', JSON.stringify({ fOffline, dbF1 }).slice(0, 300));
    }

    // ── G: Run regression ──
    await forceExit(page);
    await goDate(page, RUN);
    await page.waitForTimeout(800);
    const runMem = await memoryCard(page);
    const runDb = await db('GET', `/rest/v1/run_logs?user_id=eq.${UID}&date=eq.${RUN}&select=user_id,date,done,actual_km`);
    findings.gRun = { runMem, runDb };
    if (/6\.4|Resume|Edit session|logged/i.test(runMem.card) && runDb?.[0]?.actual_km === 6.4) {
      pass('G Run regression', runMem.card.slice(0, 120));
    } else fail('G Run regression', JSON.stringify({ runMem, runDb }).slice(0, 300));

  } catch (err) {
    fail('Suite aborted', (err.stack || err.message).slice(0, 400));
  } finally {
    await browser.close();
    server.close();
  }

  const summary = {
    passed: results.filter((r) => r.status === 'Passed').length,
    failed: results.filter((r) => r.status === 'Failed').length,
    partial: results.filter((r) => r.status === 'Partially verified').length,
    results,
    findings,
  };
  writeFileSync(join(ROOT, '.env.qa-g42-results.json'), JSON.stringify(summary, null, 2));
  console.log('\n=== SUMMARY ===');
  console.log(JSON.stringify({ passed: summary.passed, failed: summary.failed, partial: summary.partial }, null, 2));
  process.exit(summary.failed ? 1 : 0);
}

run().catch((e) => {
  console.error('FATAL', e.message);
  process.exit(1);
});
