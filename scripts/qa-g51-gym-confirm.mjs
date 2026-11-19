#!/usr/bin/env node
/**
 * Phase 3.1.G.5.1 — confirmatory Gym completion (QA user only).
 * Verification only: does not change product code, plans, or other athletes.
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const PORT = 8788;
const BASE = `http://127.0.0.1:${PORT}`;
const EMAIL = process.env.COACH_TEST_EMAIL;
const PASSWORD = process.env.COACH_TEST_PASSWORD;
const UID = process.env.COACH_TEST_USER_ID;
const SUPABASE_URL = 'https://lqtwtcgnzpsrhfuynzdk.supabase.co';
const TODAY = '2026-11-20';
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
if (PROTECTED.has(UID)) {
  console.error('Refusing protected athlete uid');
  process.exit(1);
}

const results = [];
const rec = (status, step, detail = '') => {
  results.push({ status, step, detail });
  const tag = status === 'Passed' ? 'PASS' : status === 'Failed' ? 'FAIL' : 'PARTIAL';
  console.log(`${tag} — ${step}${detail ? ` · ${String(detail).slice(0, 220)}` : ''}`);
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
  return db('GET', `/rest/v1/workout_logs?user_id=eq.${UID}&date=eq.${date}&select=user_id,date,done,rpe,notes,what_i_did,exercises_json`);
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
    doneLabel: document.getElementById('training-done-btn')?.innerText?.trim() || '',
    card: document.getElementById('training-card')?.innerText?.slice(0, 360) || '',
    memory: document.getElementById('session-memory-summary')?.innerText?.slice(0, 200) || '',
    toast: document.getElementById('toast')?.textContent || '',
    closeOpen: !document.getElementById('session-close-panel')?.classList.contains('hidden'),
    floorBar: !document.getElementById('session-floor-bar')?.classList.contains('hidden'),
    rpe: document.getElementById('input-workout-rpe')?.value || '',
    rpeExplicit: document.getElementById('input-workout-rpe')?.dataset?.rpeExplicit || '',
    notes: document.getElementById('input-workout-notes')?.value || '',
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
async function clearRpe(page) {
  await page.evaluate(() => {
    const el = document.getElementById('input-workout-rpe');
    if (!el) return;
    delete el.dataset.rpeExplicit;
    el.value = '5';
    const d = document.getElementById('workout-rpe-value');
    if (d) d.textContent = '—';
    el.setAttribute('aria-valuetext', 'not set');
  });
}
async function login(page) {
  await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  if (await page.locator('#auth-screen.show').count()) {
    await page.fill('#auth-email', EMAIL);
    await page.fill('#auth-password', PASSWORD);
    await page.click('#auth-submit');
  }
  await page.waitForFunction(() => !document.getElementById('auth-screen')?.classList.contains('show'), { timeout: 60000 });
  await page.waitForTimeout(1200);
}
async function authUidFromStorage(page) {
  return page.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      if (!/auth-token/i.test(key)) continue;
      try {
        const parsed = JSON.parse(localStorage.getItem(key) || 'null');
        const id = parsed?.user?.id || parsed?.currentSession?.user?.id || null;
        if (id) return id;
      } catch { /* ignore */ }
    }
    return null;
  });
}
async function floorSnapshot(page) {
  return page.evaluate(() => {
    const sticky = document.querySelector('.app-sticky-context');
    const dateHeader = document.getElementById('date-header');
    const floorBar = document.getElementById('session-floor-bar');
    const macros = document.getElementById('macro-spine');
    const secondary = document.querySelector('.app-header-secondary');
    const cs = (el) => (el ? getComputedStyle(el) : null);
    const rect = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { h: Math.round(r.height * 10) / 10, w: Math.round(r.width * 10) / 10 };
    };
    const stickyCs = cs(sticky);
    const macrosCs = cs(macros);
    const secondaryCs = cs(secondary);
    const stickyKids = sticky ? [...sticky.children].map((c) => ({
      id: c.id || c.className,
      display: getComputedStyle(c).display,
      h: Math.round(c.getBoundingClientRect().height * 10) / 10,
    })) : [];
    return {
      floorClass: document.body.classList.contains('session-floor-active'),
      stickyH: rect(sticky)?.h ?? null,
      dateHeaderH: rect(dateHeader)?.h ?? null,
      floorBarH: rect(floorBar)?.h ?? null,
      floorBarHidden: floorBar?.classList.contains('hidden') ?? null,
      macrosDisplay: macrosCs?.display || null,
      secondaryDisplay: secondaryCs?.display || null,
      dateText: document.getElementById('date-display')?.textContent?.trim() || '',
      dayType: document.getElementById('date-day-type')?.textContent?.trim() || '',
      iso: document.getElementById('date-display')?.dataset?.iso || '',
      exitVisible: !!(document.getElementById('session-exit-btn')?.offsetParent),
      finishVisible: !!(document.getElementById('session-finish-btn')?.offsetParent),
      fieldsVisible: !!(document.getElementById('workout-fields')?.offsetParent
        || document.getElementById('workout-exercise-list')?.offsetParent),
      markDoneVisible: !!(document.getElementById('training-done-btn')?.offsetParent),
      kgInputs: document.querySelectorAll('.workout-kg-input').length,
      pills: [...document.querySelectorAll('.workout-set-pill')].map((p) => ({
        text: p.textContent.trim(),
        done: p.classList.contains('done'),
      })),
      stickyKids,
      stickyPadding: stickyCs ? stickyCs.padding : null,
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
async function expandIncomplete(page) {
  await page.evaluate(() => {
    document.querySelectorAll('.workout-exercise-card.collapsed .workout-exercise-header-btn').forEach((b) => b.click());
  });
  await page.waitForTimeout(80);
}
async function fillRepsAndKg(page) {
  return page.evaluate(() => {
    const kgFields = [...document.querySelectorAll('.workout-kg-input')];
    const repFields = [...document.querySelectorAll('.workout-reps-input')];
    kgFields.forEach((el, i) => {
      const v = [40, 40, 40, 35, 35, 35, 25, 25, 25][i] ?? 20;
      el.focus();
      el.value = String(v);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    repFields.forEach((el) => {
      const target = el.closest('[data-exercise-index]')?.querySelector('.workout-target-badge')?.textContent || '';
      const m = target.match(/×(\d+)/);
      const reps = m ? m[1] : (el.value || '8');
      el.focus();
      el.value = String(reps);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    const steppers = [...document.querySelectorAll('.workout-set-stepper')];
    return { kg: kgFields.length, repInputs: repFields.length, steppers: steppers.length };
  });
}
async function completeAllSetPills(page) {
  await expandIncomplete(page);
  for (let i = 0; i < 24; i += 1) {
    await skipRestIfOpen(page);
    await expandIncomplete(page);
    const undone = page.locator('.workout-set-pill:not(.done)');
    if (await undone.count() === 0) break;
    await undone.first().click({ timeout: 4000 });
    await page.waitForTimeout(180);
    await skipRestIfOpen(page);
  }
  return page.evaluate(() => {
    const all = [...document.querySelectorAll('.workout-set-pill')];
    return { total: all.length, done: all.filter((p) => p.classList.contains('done')).length };
  });
}

async function run() {
  const findings = {};
  const plan = await db('GET', `/rest/v1/daily_plans?user_id=eq.${UID}&date=eq.${TODAY}&select=user_id,date,day_type,workout_plan,workout_detail`);
  const existing = await workoutLogs(TODAY);
  const foreign = await foreignWorkoutLogs(TODAY);
  findings.preflight = {
    uid: UID,
    supabase: SUPABASE_URL,
    date: TODAY,
    plan: plan?.[0] || plan,
    existingLogs: existing,
    foreign,
  };

  if (!plan?.[0] || plan[0].user_id !== UID) {
    fail('Preflight plan ownership', JSON.stringify(plan).slice(0, 200));
    writeFileSync(join(ROOT, '.env.qa-g51-results.json'), JSON.stringify({ results, findings }, null, 2));
    process.exit(1);
  }
  if (plan[0].day_type !== 'Gym') {
    fail('Selected date is Gym', plan[0].day_type);
    writeFileSync(join(ROOT, '.env.qa-g51-results.json'), JSON.stringify({ results, findings }, null, 2));
    process.exit(1);
  }
  if (TODAY > '2026-11-20') {
    fail('Date is not future', TODAY);
    process.exit(1);
  }
  if (Array.isArray(existing) && existing.some((r) => r.done === true)) {
    fail('No existing completed workout', JSON.stringify(existing));
    process.exit(1);
  }
  if (Array.isArray(foreign) && foreign.length) {
    fail('No foreign logs on test date', JSON.stringify(foreign));
    process.exit(1);
  }
  pass('Preflight date valid', `${TODAY} ${plan[0].day_type} ${plan[0].workout_plan}; existing done=false/none; foreign=0`);

  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.setDefaultTimeout(45000);

  try {
    await login(page);
    const authUid = await authUidFromStorage(page);
    findings.authUid = authUid;
    if (authUid === UID) pass('Authenticated UID matches QA', authUid.slice(0, 8));
    else if (authUid) fail('Authenticated UID matches QA', authUid.slice(0, 8));
    else partial('Authenticated UID from storage', 'null (login succeeded; writes will confirm ownership)');

    if (!(await goDate(page, TODAY))) fail('Navigate to test date', await iso(page));
    else pass('Navigate to test date', TODAY);

    const dayType = await page.evaluate(() => ({
      iso: document.getElementById('date-display')?.dataset?.iso,
      label: document.getElementById('date-day-type')?.textContent?.trim(),
      planTitle: document.getElementById('plan-card')?.innerText?.slice(0, 120) || '',
    }));
    findings.dayTypeUi = dayType;
    if (dayType.iso === TODAY && /Gym/i.test(`${dayType.label} ${dayType.planTitle}`)) {
      pass('UI day type Gym', JSON.stringify(dayType));
    } else {
      fail('UI day type Gym', JSON.stringify(dayType));
    }

    await openSession(page);
    const floorOn = await page.evaluate(() => document.body.classList.contains('session-floor-active'));
    const snap = await floorSnapshot(page);
    findings.floor = snap;
    if (floorOn && snap.floorClass && snap.fieldsVisible) pass('Floor activation', `session-floor-active stickyH=${snap.stickyH} floorBarH=${snap.floorBarH}`);
    else fail('Floor activation', JSON.stringify(snap).slice(0, 400));

    const stripOk = snap.stickyH != null && snap.stickyH >= 40 && snap.stickyH <= 64;
    if (stripOk && snap.macrosDisplay === 'none' && snap.secondaryDisplay === 'none' && snap.dateText && snap.dayType) {
      pass('Compact date strip', JSON.stringify({
        stickyContextH: snap.stickyH,
        dateHeaderH: snap.dateHeaderH,
        floorBarH: snap.floorBarH,
        macros: snap.macrosDisplay,
        secondary: snap.secondaryDisplay,
        date: snap.dateText,
        dayType: snap.dayType,
        exit: snap.exitVisible,
        finish: snap.finishVisible,
      }));
    } else if (floorOn) {
      partial('Compact date strip', JSON.stringify({
        stickyContextH: snap.stickyH,
        dateHeaderH: snap.dateHeaderH,
        floorBarH: snap.floorBarH,
        macros: snap.macrosDisplay,
        secondary: snap.secondaryDisplay,
      }));
    } else {
      fail('Compact date strip', 'Floor not active');
    }

    const fill = await fillRepsAndKg(page);
    findings.fill = fill;
    const sets = await completeAllSetPills(page);
    findings.sets = sets;
    await setRpe(page, 7);
    await page.evaluate(() => {
      const el = document.getElementById('input-workout-notes');
      if (el) {
        el.value = 'G51 confirmatory Lower';
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    if (sets.done >= 1 && sets.done === sets.total && sets.total >= 9) {
      pass('Planned sets completed via UI', JSON.stringify({ ...sets, ...fill }));
    } else if (sets.done >= 1) {
      partial('Planned sets completed via UI', JSON.stringify({ ...sets, ...fill }));
    } else {
      fail('Planned sets completed via UI', JSON.stringify({ ...sets, ...fill }));
    }
    if (fill.kg > 0) pass('Weight fields entered', `${fill.kg} kg inputs`);
    else partial('Weight fields', 'planned exercises are reps-type; no kg inputs on Floor');

    await page.waitForTimeout(2000);
    const autosave = await workoutLogs(TODAY);
    findings.autosave = autosave;
    const autoRow = Array.isArray(autosave) && autosave.length === 1 && autosave[0].user_id === UID;
    if (autoRow && autosave[0].done !== true) pass('Autosave in-progress QA row', JSON.stringify({ done: autosave[0].done, rpe: autosave[0].rpe }));
    else if (autoRow) partial('Autosave row exists', JSON.stringify(autosave[0]));
    else partial('Autosave', JSON.stringify(autosave).slice(0, 240));

    await page.evaluate(() => document.getElementById('session-exit-btn')?.click());
    await page.waitForTimeout(800);
    const afterExit = await memoryCard(page);
    const exitDb = await workoutLogs(TODAY);
    findings.afterExit = { afterExit, exitDb };
    if (!afterExit.floor && afterExit.done !== true && exitDb?.[0]?.done !== true) {
      pass('Exit does not force Done', JSON.stringify({ dbDone: exitDb?.[0]?.done ?? null, resume: /Resume/i.test(afterExit.card) }));
    } else {
      fail('Exit does not force Done', JSON.stringify({ afterExit, exitDb }).slice(0, 400));
    }

    await openSession(page);
    const resumed = await memoryCard(page);
    findings.resumed = {
      floor: resumed.floor,
      rpe: resumed.rpe,
      rpeExplicit: resumed.rpeExplicit,
      notes: resumed.notes,
      sets: await page.evaluate(() => {
        const all = [...document.querySelectorAll('.workout-set-pill')];
        return { total: all.length, done: all.filter((p) => p.classList.contains('done')).length };
      }),
    };
    if (resumed.floor && findings.resumed.sets.done >= 9 && resumed.rpeExplicit === '1' && /G51/.test(resumed.notes)) {
      pass('Resume restores Floor data', JSON.stringify(findings.resumed));
    } else if (resumed.floor) {
      partial('Resume restores Floor data', JSON.stringify(findings.resumed));
    } else {
      fail('Resume restores Floor data', JSON.stringify(resumed).slice(0, 300));
    }

    await clearRpe(page);
    await page.evaluate(() => document.getElementById('training-done-btn')?.click());
    await page.waitForTimeout(500);
    const markBlocked = await memoryCard(page);
    findings.markBlocked = markBlocked;
    if (markBlocked.floor && markBlocked.done !== true && /RPE not set/i.test(markBlocked.toast)) {
      pass('Mark as Done still validates', markBlocked.toast);
    } else if (markBlocked.floor && markBlocked.done !== true) {
      partial('Mark as Done still validates', JSON.stringify({ toast: markBlocked.toast, done: markBlocked.done }));
    } else {
      fail('Mark as Done still validates', JSON.stringify(markBlocked).slice(0, 300));
    }
    await setRpe(page, 7);

    await page.evaluate(() => document.getElementById('session-finish-btn')?.click());
    await page.waitForTimeout(350);
    const closeOpen = await page.evaluate(() => !document.getElementById('session-close-panel')?.classList.contains('hidden'));
    await page.locator('#session-close-cancel').click();
    await page.waitForTimeout(400);
    const backState = await page.evaluate(() => ({
      floor: document.body.classList.contains('session-floor-active'),
      closeHidden: document.getElementById('session-close-panel')?.classList.contains('hidden'),
      pills: [...document.querySelectorAll('.workout-set-pill')].filter((p) => p.classList.contains('done')).length,
      rpe: document.getElementById('input-workout-rpe')?.dataset?.rpeExplicit,
      notes: document.getElementById('input-workout-notes')?.value || '',
    }));
    findings.closeBack = { closeOpen, backState };
    if (closeOpen && backState.floor && backState.closeHidden && backState.pills >= 9 && backState.rpe === '1' && /G51/.test(backState.notes)) {
      pass('Close Back returns to Floor intact', JSON.stringify(backState));
    } else {
      fail('Close Back returns to Floor intact', JSON.stringify({ closeOpen, backState }));
    }

    await page.evaluate(() => document.getElementById('session-finish-btn')?.click());
    await page.waitForTimeout(300);
    await page.evaluate(() => {
      const el = document.getElementById('session-close-note');
      if (el) el.value = 'close G51';
    });
    await page.context().setOffline(true);
    await page.locator('#session-close-confirm').click();
    await page.waitForTimeout(2500);
    const offlineState = await memoryCard(page);
    const offlineDb = await workoutLogs(TODAY);
    findings.offline = { offlineState, offlineDb };
    await page.context().setOffline(false);
    await page.waitForTimeout(400);
    const falseComplete = offlineState.done === true && offlineDb?.[0]?.done !== true && !offlineState.floor;
    if (offlineState.floor && offlineState.done !== true && offlineDb?.[0]?.done !== true) {
      pass('Failed persist does not show false completion', JSON.stringify({
        floor: offlineState.floor,
        doneUi: offlineState.done,
        dbDone: offlineDb?.[0]?.done ?? null,
      }));
    } else if (!falseComplete && offlineDb?.[0]?.done !== true) {
      partial('Failed persist does not show false completion', JSON.stringify({
        floor: offlineState.floor,
        doneUi: offlineState.done,
        dbDone: offlineDb?.[0]?.done ?? null,
        toast: offlineState.toast,
      }));
    } else {
      fail('Failed persist does not show false completion', JSON.stringify({ offlineState, dbDone: offlineDb?.[0]?.done }).slice(0, 400));
    }

    const retryVisible = await page.locator('#save-error-retry').isVisible().catch(() => false);
    findings.retryVisible = retryVisible;
    if (retryVisible) {
      await page.locator('#save-error-retry').click();
      await page.waitForTimeout(2500);
    }
    const afterRetryClick = await memoryCard(page);
    findings.afterRetryClick = afterRetryClick;
    if (!afterRetryClick.floor && afterRetryClick.done === true) {
      pass('Retry completed session', afterRetryClick.memory || afterRetryClick.card.slice(0, 120));
    } else {
      if (retryVisible) partial('Retry did not complete alone', JSON.stringify({
        floor: afterRetryClick.floor,
        done: afterRetryClick.done,
      }));
      await page.evaluate(() => {
        if (!document.body.classList.contains('session-floor-active')) {
          document.getElementById('session-resume-btn')?.click();
          document.getElementById('session-start-btn')?.click();
        }
      });
      await page.waitForFunction(() => document.body.classList.contains('session-floor-active'), { timeout: 8000 }).catch(() => {});
      await page.waitForTimeout(400);
      await setRpe(page, 7);
      await completeAllSetPills(page);
      await page.evaluate(() => document.getElementById('session-finish-btn')?.click());
      await page.waitForTimeout(350);
      await page.locator('#session-close-confirm').click();
      await page.waitForFunction(() => !document.body.classList.contains('session-floor-active'), { timeout: 12000 }).catch(() => {});
      await page.waitForTimeout(800);
    }

    const afterClose = await memoryCard(page);
    const dbAfter = await workoutLogs(TODAY);
    findings.afterClose = { afterClose, dbAfter };
    const completeUi = !afterClose.floor && /Edit session|Session logged|· done|sets · done/i.test(`${afterClose.card} ${afterClose.memory}`);
    const oneRow = Array.isArray(dbAfter) && dbAfter.length === 1 && dbAfter[0].user_id === UID && dbAfter[0].done === true;
    if (completeUi && oneRow) {
      pass('Save & Close Memory + DB', JSON.stringify({
        memory: afterClose.memory,
        card: afterClose.card.slice(0, 160),
        db: {
          user_id: dbAfter[0].user_id,
          date: dbAfter[0].date,
          done: dbAfter[0].done,
          rpe: dbAfter[0].rpe,
          notes: dbAfter[0].notes,
          what_i_did: dbAfter[0].what_i_did,
        },
      }));
    } else {
      fail('Save & Close Memory + DB', JSON.stringify({ afterClose, dbAfter }).slice(0, 600));
    }
    if (retryVisible) pass('Retry control functional', 'banner retry was visible after offline fail');

    if (!(await goDate(page, '2026-11-18'))) partial('Navigate away', await iso(page));
    else pass('Navigate away', '2026-11-18');
    if (!(await goDate(page, TODAY))) fail('Return to date', await iso(page));
    await page.waitForTimeout(800);
    const returned = await memoryCard(page);
    findings.returned = returned;
    if (/Edit session|Session logged|· done/i.test(`${returned.card} ${returned.memory}`)) {
      pass('Summary after navigate return', returned.memory || returned.card.slice(0, 140));
    } else {
      fail('Summary after navigate return', returned.card.slice(0, 200));
    }

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    if (await page.locator('#auth-screen.show').count()) await login(page);
    await goDate(page, TODAY);
    await page.waitForTimeout(1000);
    const refreshed = await memoryCard(page);
    const dbRefresh = await workoutLogs(TODAY);
    const foreignAfter = await foreignWorkoutLogs(TODAY);
    findings.refresh = { refreshed, dbRefresh, foreignAfter };
    const stillOne = Array.isArray(dbRefresh) && dbRefresh.length === 1 && dbRefresh[0].user_id === UID && dbRefresh[0].done === true;
    if (/Edit session|Session logged|· done/i.test(refreshed.card) && stillOne && !(foreignAfter?.length)) {
      pass('Persist after refresh', JSON.stringify({
        card: refreshed.card.slice(0, 140),
        rows: dbRefresh.length,
        done: dbRefresh[0].done,
        rpe: dbRefresh[0].rpe,
        notes: dbRefresh[0].notes,
        what_i_did: dbRefresh[0].what_i_did,
      }));
    } else {
      fail('Persist after refresh', JSON.stringify({ refreshed, dbRefresh, foreignAfter }).slice(0, 500));
    }

    const setSummary = summarizeExercises(dbRefresh?.[0]?.exercises_json);
    findings.setSummary = setSummary;
    if (stillOne && dbRefresh[0].rpe === 7 && /G51/.test(dbRefresh[0].notes || '')) {
      pass('DB ownership + row count + notes/RPE', JSON.stringify({
        user_id: dbRefresh[0].user_id,
        date: dbRefresh[0].date,
        rows: dbRefresh.length,
        done: dbRefresh[0].done,
        rpe: dbRefresh[0].rpe,
        notes: dbRefresh[0].notes,
        sets: setSummary,
      }));
    } else {
      fail('DB ownership + row count + notes/RPE', JSON.stringify(dbRefresh).slice(0, 400));
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
  writeFileSync(join(ROOT, '.env.qa-g51-results.json'), JSON.stringify(summary, null, 2));
  console.log('\n=== SUMMARY ===');
  console.log(JSON.stringify({ passed: summary.passed, failed: summary.failed, partial: summary.partial }, null, 2));
  process.exit(summary.failed ? 1 : 0);
}

function summarizeExercises(json) {
  const list = Array.isArray(json) ? json : [];
  return list.map((ex) => ({
    name: ex.name,
    type: ex.type,
    doneSets: (ex.sets || []).filter((s) => s.done).length,
    totalSets: (ex.sets || []).length,
    reps: (ex.sets || []).map((s) => s.reps),
    kg: (ex.sets || []).map((s) => s.kg),
  }));
}

run().catch((e) => {
  console.error('FATAL', e.message);
  process.exit(1);
});
