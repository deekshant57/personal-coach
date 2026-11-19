#!/usr/bin/env node
/**
 * Phase 3.1.G.5.2 — Floor save-error Retry visibility (QA user only).
 * Does not change plans or other athletes.
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const PORT = 8789;
const BASE = `http://127.0.0.1:${PORT}`;
const EMAIL = process.env.COACH_TEST_EMAIL;
const PASSWORD = process.env.COACH_TEST_PASSWORD;
const UID = process.env.COACH_TEST_USER_ID;
const SUPABASE_URL = 'https://lqtwtcgnzpsrhfuynzdk.supabase.co';
const DATE = '2026-11-13';
const PROTECTED = new Set([
  'd6f25dae-4cc8-48dd-9822-fbccf9a92139',
  '9e6a0d55-b63f-4857-b318-122e0c337ef4',
]);

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
if (PROTECTED.has(UID) || DATE > '2026-11-20') {
  console.error('Refusing protected uid or future date');
  process.exit(1);
}

const results = [];
const rec = (status, step, detail = '') => {
  results.push({ status, step, detail });
  const tag = status === 'Passed' ? 'PASS' : status === 'Failed' ? 'FAIL' : 'PARTIAL';
  console.log(`${tag} — ${step}${detail ? ` · ${String(detail).slice(0, 240)}` : ''}`);
};
const pass = (s, d) => rec('Passed', s, d);
const fail = (s, d) => rec('Failed', s, d);
const partial = (s, d) => rec('Partially verified', s, d);

async function db(method, path) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` },
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { error: text, status: res.status }; }
}
async function workoutLogs(date) {
  return db('GET', `/rest/v1/workout_logs?user_id=eq.${UID}&date=eq.${date}&select=user_id,date,done,rpe,notes,what_i_did`);
}
async function foreignWorkoutLogs(date) {
  return db('GET', `/rest/v1/workout_logs?date=eq.${date}&user_id=neq.${UID}&select=user_id,date,done`);
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
  await page.waitForTimeout(700);
  return (await iso(page)) === target;
}
async function skipRestIfOpen(page) {
  if (await page.locator('#session-rest:not(.hidden)').count()) {
    await page.locator('#session-rest-skip').click({ timeout: 2000 }).catch(() => {});
    await page.waitForTimeout(120);
  }
}
async function memoryCard(page) {
  return page.evaluate(() => ({
    floor: document.body.classList.contains('session-floor-active'),
    done: document.getElementById('training-done-btn')?.classList.contains('done'),
    card: document.getElementById('training-card')?.innerText?.slice(0, 280) || '',
    memory: document.getElementById('session-memory-summary')?.innerText?.slice(0, 180) || '',
    closeOpen: !document.getElementById('session-close-panel')?.classList.contains('hidden'),
  }));
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
async function measureChrome(page) {
  return page.evaluate(() => {
    const rect = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { h: Math.round(r.height * 10) / 10, top: Math.round(r.top * 10) / 10 };
    };
    const banner = document.getElementById('save-error-banner');
    const retry = document.getElementById('save-error-retry');
    const macros = document.getElementById('macro-spine');
    const secondary = document.querySelector('.app-header-secondary');
    const vis = (el) => !!(el && !el.classList.contains('hidden') && el.offsetParent !== null && getComputedStyle(el).display !== 'none');
    return {
      floor: document.body.classList.contains('session-floor-active'),
      stickyH: rect(document.querySelector('.app-sticky-context'))?.h,
      dateHeaderH: rect(document.getElementById('date-header'))?.h,
      floorBarH: rect(document.getElementById('session-floor-bar'))?.h,
      bannerH: rect(banner)?.h,
      bannerHiddenClass: banner?.classList.contains('hidden') ?? null,
      bannerVisible: vis(banner),
      retryVisible: vis(retry),
      retryDisabled: retry?.disabled || retry?.getAttribute('disabled') != null,
      message: document.getElementById('save-error-message')?.textContent || '',
      macrosDisplay: macros ? getComputedStyle(macros).display : null,
      secondaryDisplay: secondary ? getComputedStyle(secondary).display : null,
      dateText: document.getElementById('date-display')?.textContent?.trim() || '',
      dayType: document.getElementById('date-day-type')?.textContent?.trim() || '',
      done: document.getElementById('training-done-btn')?.classList.contains('done'),
    };
  });
}
async function openSession(page) {
  await page.evaluate(() => {
    const resume = document.getElementById('session-resume-btn');
    const start = document.getElementById('session-start-btn');
    if (resume && !resume.classList.contains('hidden')) resume.click();
    else start?.click();
  });
  await page.waitForFunction(() => document.body.classList.contains('session-floor-active'), { timeout: 10000 });
  await page.waitForTimeout(400);
}
async function completeAllSetPills(page) {
  await page.evaluate(() => {
    document.querySelectorAll('.workout-exercise-card.collapsed .workout-exercise-header-btn').forEach((b) => b.click());
  });
  for (let i = 0; i < 24; i += 1) {
    await skipRestIfOpen(page);
    await page.evaluate(() => {
      document.querySelectorAll('.workout-exercise-card.collapsed .workout-exercise-header-btn').forEach((b) => b.click());
    });
    const undone = page.locator('.workout-set-pill:not(.done)');
    if (await undone.count() === 0) break;
    await undone.first().click({ timeout: 4000 });
    await page.waitForTimeout(160);
    await skipRestIfOpen(page);
  }
  return page.evaluate(() => {
    const all = [...document.querySelectorAll('.workout-set-pill')];
    return { total: all.length, done: all.filter((p) => p.classList.contains('done')).length };
  });
}

async function run() {
  const findings = {};
  const plan = await db('GET', `/rest/v1/daily_plans?user_id=eq.${UID}&date=eq.${DATE}&select=user_id,date,day_type,workout_plan`);
  const existing = await workoutLogs(DATE);
  const foreign = await foreignWorkoutLogs(DATE);
  findings.preflight = { date: DATE, plan: plan?.[0], existing, foreign };

  if (!plan?.[0] || plan[0].user_id !== UID || plan[0].day_type !== 'Gym') {
    fail('Preflight Gym plan', JSON.stringify(plan).slice(0, 200));
    process.exit(1);
  }
  if (Array.isArray(existing) && existing.some((r) => r.done === true)) {
    fail('No completed workout on test date', JSON.stringify(existing));
    process.exit(1);
  }
  if (Array.isArray(foreign) && foreign.length) {
    fail('No foreign logs', JSON.stringify(foreign));
    process.exit(1);
  }
  pass('Preflight date valid', `${DATE} ${plan[0].day_type} ${plan[0].workout_plan}; completed=false; foreign=0`);

  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.setDefaultTimeout(45000);

  try {
    await login(page);
    const authUid = await page.evaluate(() => {
      for (const key of Object.keys(localStorage)) {
        if (!/auth-token/i.test(key)) continue;
        try {
          const parsed = JSON.parse(localStorage.getItem(key) || 'null');
          return parsed?.user?.id || null;
        } catch { /* ignore */ }
      }
      return null;
    });
    findings.authUid = authUid;
    if (authUid === UID) pass('Authenticated UID matches QA', authUid.slice(0, 8));
    else partial('Authenticated UID', String(authUid).slice(0, 8));

    if (!(await goDate(page, DATE))) fail('Navigate', await iso(page));
    await page.evaluate(() => document.getElementById('coach-past-edit-btn')?.click());
    await page.waitForTimeout(300);
    await openSession(page);

    const before = await measureChrome(page);
    findings.stripBefore = before;
    if (before.floor && before.stickyH >= 40 && before.stickyH <= 64 && before.macrosDisplay === 'none' && !before.bannerVisible) {
      pass('Floor compact strip ~52px with banner hidden', JSON.stringify({
        stickyH: before.stickyH, dateHeaderH: before.dateHeaderH, floorBarH: before.floorBarH,
        macros: before.macrosDisplay, secondary: before.secondaryDisplay,
      }));
    } else {
      fail('Floor compact strip ~52px with banner hidden', JSON.stringify(before));
    }

    const sets = await completeAllSetPills(page);
    await setRpe(page, 7);
    await page.evaluate(() => {
      const el = document.getElementById('input-workout-notes');
      if (el) {
        el.value = 'G52 floor retry';
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    findings.sets = sets;
    if (sets.done >= 9) pass('Sets entered on Floor', JSON.stringify(sets));
    else fail('Sets entered on Floor', JSON.stringify(sets));

    await page.evaluate(() => document.getElementById('session-finish-btn')?.click());
    await page.waitForTimeout(300);
    await page.context().setOffline(true);
    await page.locator('#session-close-confirm').click();
    await page.waitForTimeout(2500);

    const offlineUi = await measureChrome(page);
    const offlineDb = await workoutLogs(DATE);
    findings.offline = { offlineUi, offlineDb };
    if (offlineUi.floor && offlineUi.done !== true && offlineDb?.[0]?.done !== true) {
      pass('Offline Save & Close stays on Floor, Done off', JSON.stringify({
        floor: offlineUi.floor, doneUi: offlineUi.done, dbDone: offlineDb?.[0]?.done ?? null,
      }));
    } else {
      fail('Offline Save & Close stays on Floor, Done off', JSON.stringify({ offlineUi, dbDone: offlineDb?.[0]?.done }));
    }

    if (offlineUi.bannerVisible && offlineUi.retryVisible && /could not save/i.test(offlineUi.message)) {
      pass('Error + Retry visible on Floor', JSON.stringify({
        message: offlineUi.message,
        stickyH: offlineUi.stickyH,
        dateHeaderH: offlineUi.dateHeaderH,
        bannerH: offlineUi.bannerH,
        macros: offlineUi.macrosDisplay,
        secondary: offlineUi.secondaryDisplay,
      }));
    } else {
      fail('Error + Retry visible on Floor', JSON.stringify(offlineUi));
    }

    if (offlineUi.dateHeaderH >= 30 && offlineUi.dateHeaderH <= 50 && offlineUi.macrosDisplay === 'none' && offlineUi.secondaryDisplay === 'none') {
      pass('Date strip compact while banner showing', JSON.stringify({
        dateHeaderH: offlineUi.dateHeaderH, stickyH: offlineUi.stickyH, bannerH: offlineUi.bannerH,
      }));
    } else {
      partial('Date strip compact while banner showing', JSON.stringify({
        dateHeaderH: offlineUi.dateHeaderH, stickyH: offlineUi.stickyH,
      }));
    }

    await page.context().setOffline(false);
    await page.waitForTimeout(400);
    await page.locator('#save-error-retry').click({ timeout: 5000 });
    await page.waitForFunction(() => !document.body.classList.contains('session-floor-active'), { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(800);

    const afterRetry = await memoryCard(page);
    const dbAfter = await workoutLogs(DATE);
    findings.afterRetry = { afterRetry, dbAfter };
    const one = Array.isArray(dbAfter) && dbAfter.length === 1 && dbAfter[0].user_id === UID && dbAfter[0].done === true;
    const memoryDone = !afterRetry.floor && /· done|Edit session|Session logged/i.test(`${afterRetry.memory} ${afterRetry.card}`);
    if (one && memoryDone) {
      pass('Retry completes to Memory + one done row', JSON.stringify({
        memory: afterRetry.memory,
        db: { user_id: dbAfter[0].user_id, date: dbAfter[0].date, done: dbAfter[0].done, rpe: dbAfter[0].rpe, notes: dbAfter[0].notes },
      }));
    } else {
      fail('Retry completes to Memory + one done row', JSON.stringify({ afterRetry, dbAfter }).slice(0, 600));
    }

    if (!(await goDate(page, '2026-11-12'))) partial('Navigate away', await iso(page));
    await goDate(page, DATE);
    await page.waitForTimeout(700);
    const returned = await memoryCard(page);
    findings.returned = returned;
    if (/· done|Edit session|Session logged/i.test(`${returned.memory} ${returned.card}`)) {
      pass('Summary after navigate return', returned.memory || returned.card.slice(0, 120));
    } else fail('Summary after navigate return', returned.card.slice(0, 180));

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    if (await page.locator('#auth-screen.show').count()) await login(page);
    await goDate(page, DATE);
    await page.waitForTimeout(900);
    const refreshed = await memoryCard(page);
    const dbRefresh = await workoutLogs(DATE);
    const foreignAfter = await foreignWorkoutLogs(DATE);
    findings.refresh = { refreshed, dbRefresh, foreignAfter };
    const stillOne = Array.isArray(dbRefresh) && dbRefresh.length === 1 && dbRefresh[0].user_id === UID && dbRefresh[0].done === true;
    if (stillOne && /· done|Edit session|Session logged/i.test(`${refreshed.memory} ${refreshed.card}`) && !(foreignAfter?.length)) {
      pass('Persist after refresh', JSON.stringify({
        memory: refreshed.memory,
        rows: dbRefresh.length,
        done: dbRefresh[0].done,
        rpe: dbRefresh[0].rpe,
        notes: dbRefresh[0].notes,
      }));
    } else {
      fail('Persist after refresh', JSON.stringify({ refreshed, dbRefresh, foreignAfter }).slice(0, 500));
    }
  } catch (err) {
    fail('Suite aborted', (err.stack || err.message).slice(0, 500));
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
  writeFileSync(join(ROOT, '.env.qa-g52-results.json'), JSON.stringify(summary, null, 2));
  console.log('\n=== SUMMARY ===');
  console.log(JSON.stringify({ passed: summary.passed, failed: summary.failed, partial: summary.partial }, null, 2));
  process.exit(summary.failed ? 1 : 0);
}

run().catch((e) => {
  console.error('FATAL', e.message);
  process.exit(1);
});
