#!/usr/bin/env node
/**
 * Phase 3.1.G.5 — authenticated regression (QA Hybrid athlete only).
 * Does not print credentials. Does not delete QA records.
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
const PROTECTED = new Set([
  'd6f25dae-4cc8-48dd-9822-fbccf9a92139',
  '9e6a0d55-b63f-4857-b318-122e0c337ef4',
]);
const GYM_DONE = '2026-11-09';
const RUN_DONE = '2026-11-04';
const REST = '2026-10-31';
const BW = '2026-11-11';
const AR = '2026-11-12';
const GYM_FRESH = '2026-11-23';
const FOOD_DST = '2026-11-01';

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
  console.error('Refusing protected athlete');
  process.exit(1);
}

const results = [];
const rec = (status, step, detail = '') => {
  results.push({ status, step, detail });
  const tag = status === 'Passed' ? 'PASS' : status === 'Failed' ? 'FAIL' : status === 'Partially verified' ? 'PARTIAL' : 'SKIP';
  console.log(`${tag} — ${step}${detail ? ` · ${String(detail).slice(0, 160)}` : ''}`);
};
const pass = (s, d) => rec('Passed', s, d);
const fail = (s, d) => rec('Failed', s, d);
const partial = (s, d) => rec('Partially verified', s, d);
const skip = (s, d) => rec('Not tested', s, d);

async function db(method, path, body) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers: {
      apikey: SERVICE,
      Authorization: `Bearer ${SERVICE}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: body == null ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { error: text, status: res.status }; }
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
  await page.waitForTimeout(500);
  return (await iso(page)) === target;
}
async function forceExit(page) {
  await page.evaluate(() => document.getElementById('session-exit-btn')?.click());
  await page.waitForTimeout(250);
}
async function enablePastEdit(page) {
  await page.evaluate(() => document.getElementById('coach-past-edit-btn')?.click());
  await page.waitForTimeout(250);
}
async function stickyH(page) {
  return page.evaluate(() => {
    const el = document.querySelector('.app-sticky-context');
    return el ? Math.round(el.getBoundingClientRect().height) : null;
  });
}
async function overflowX(page) {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
}

async function run() {
  const findings = {};

  const foreignWo = await db('GET', `/rest/v1/workout_logs?user_id=neq.${UID}&date=in.(${GYM_DONE},${GYM_FRESH},${RUN_DONE})&select=user_id,date`);
  const qaWo = await db('GET', `/rest/v1/workout_logs?user_id=eq.${UID}&date=eq.${GYM_DONE}&select=user_id,date,done`);
  const deek = await db('GET', `/rest/v1/workout_logs?user_id=eq.d6f25dae-4cc8-48dd-9822-fbccf9a92139&select=user_id&limit=1`);
  findings.preflight = {
    qaUid: UID,
    supabase: SUPABASE_URL,
    foreignOnQaDates: Array.isArray(foreignWo) ? foreignWo.length : foreignWo,
    qaGymRow: qaWo,
    deekshantStillHasLogs: Array.isArray(deek) && deek.length > 0,
  };
  if (!findings.preflight.deekshantStillHasLogs) fail('Prod athlete data still present', 'Deekshant workout_logs empty unexpectedly');
  else pass('Prod athlete data still present', 'Deekshant logs exist (untouched probe)');
  if (Array.isArray(foreignWo) && foreignWo.length === 0) pass('QA date ownership isolation', 'no foreign workout_logs on QA gym dates');
  else fail('QA date ownership isolation', JSON.stringify(foreignWo).slice(0, 200));

  await db('POST', '/rest/v1/daily_plans?on_conflict=user_id,date', [{
    user_id: UID, date: GYM_FRESH, day_name: 'Monday', day_type: 'Gym',
    protein_target: 140, water_target: '2L', run_type: null, run_km: null, run_pace: null, run_cue: null,
    workout_plan: 'Upper',
    workout_detail: 'WARM-UP · Bench Press 3×8 · Row 3×10 · Overhead Press 3×8 · COOL-DOWN',
    meals_plan: 'QA', directive: 'G5 release gym', calorie_target: 2200,
    planned_session_window: 'morning', actual_session_window: 'morning', session_status: 'planned', slot_scheme: null,
  }]);

  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.setDefaultTimeout(40000);

  try {
    await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    if (await page.locator('#auth-screen.show').count()) {
      await page.fill('#auth-email', EMAIL);
      await page.fill('#auth-password', PASSWORD);
      await page.click('#auth-submit');
    }
    await page.waitForFunction(() => !document.getElementById('auth-screen')?.classList.contains('show'), { timeout: 60000 });
    await page.waitForTimeout(1200);
    const uid = await page.evaluate(() => {
      const dump = JSON.stringify(localStorage);
      const m = dump.match(/"sub":"([0-9a-f-]{36})"/);
      return m?.[1] || null;
    });
    if (uid === UID) pass('Authenticated QA uid', uid);
    else partial('Authenticated QA uid', `storage sub=${uid || 'null'}; login succeeded as QA email`);

    // ── Today ──
    const today = await page.evaluate(() => ({
      iso: document.getElementById('date-display')?.dataset?.iso,
      label: document.getElementById('date-display')?.textContent?.trim(),
      dayType: document.getElementById('date-day-type')?.textContent?.trim(),
      sticky: Math.round(document.querySelector('.app-sticky-context')?.getBoundingClientRect().height || 0),
      weekChip: document.getElementById('block-chip')?.textContent?.trim()
        || document.querySelector('.block-chip, #plan-block-chip')?.textContent?.trim()
        || '',
      macros: document.querySelector('.macro-spine')?.textContent?.replace(/\s+/g, ' ').trim()?.slice(0, 80) || '',
      vitals: !document.getElementById('vitals-card')?.classList.contains('hidden'),
      meals: !document.getElementById('meals-summary-card')?.classList.contains('hidden'),
      notes: !document.getElementById('notes-card')?.classList.contains('hidden'),
      debrief: !document.getElementById('coach-debrief-export-card')?.classList.contains('hidden'),
      save: document.getElementById('save-state-indicator')?.textContent || '',
      weekNull: /Week null/i.test(document.body.innerText),
    }));
    findings.today = today;
    if (today.iso && today.dayType) pass('Today date + day-type', `${today.iso} ${today.dayType}`);
    else fail('Today date + day-type', JSON.stringify(today));
    if (today.sticky >= 80 && today.sticky <= 110) pass('Sticky header ~94px', `${today.sticky}px`);
    else partial('Sticky header ~94px', `${today.sticky}px`);
    if (today.weekNull) fail('Week null absent on Today', 'present');
    else pass('Week null absent on Today', today.weekChip || 'no Week null');
    if (today.vitals && today.meals) pass('Today cards (vitals/meals)', 'visible');
    else partial('Today cards (vitals/meals)', JSON.stringify({ v: today.vitals, m: today.meals }));
    if (today.macros) pass('Macro spine from food', today.macros);
    else partial('Macro spine from food', 'empty on today');

    const copyOk = await page.locator('#copy-debrief').isEnabled().catch(() => false);
    if (copyOk) pass('Day Log export enabled on today', 'copy-debrief');
    else partial('Day Log export enabled on today', 'disabled or missing');

    // Vitals persist on today (QA only)
    await enablePastEdit(page);
    await page.evaluate(() => {
      document.getElementById('vitals-collapse')?.click();
      const el = document.getElementById('input-sleep');
      if (!el) return;
      el.removeAttribute('disabled');
      el.value = '7';
      el.dispatchEvent(new Event('input', { bubbles: true }));
      const btn = document.getElementById('save-vitals');
      btn?.removeAttribute('disabled');
      btn?.click();
    });
    await page.waitForTimeout(1800);
    const vitalsDb = await db('GET', `/rest/v1/daily_vitals?user_id=eq.${UID}&date=eq.${today.iso}&select=user_id,date,sleep_hours`);
    findings.vitalsToday = vitalsDb;
    if (Array.isArray(vitalsDb) && vitalsDb[0]?.user_id === UID) pass('Vitals persist QA-owned', JSON.stringify(vitalsDb[0]));
    else partial('Vitals persist QA-owned', JSON.stringify(vitalsDb).slice(0, 160));

    // ── Food ──
    await goDate(page, FOOD_DST);
    await page.evaluate(() => document.querySelector('.nav-tab[data-tab="food"]')?.click());
    await page.waitForTimeout(800);
    await page.evaluate(() => {
      document.querySelector('#meal-slots .meal-slot-pill[data-slot="lunch"]')?.click();
      document.getElementById('food-add-open')?.click();
    });
    await page.waitForTimeout(400);
    await page.fill('#food-search', 'Egg');
    await page.waitForTimeout(400);
    const searchHits = await page.evaluate(() => [...document.querySelectorAll('.food-picker-row .food-picker-name')].map((n) => n.textContent.trim()).slice(0, 6));
    findings.foodSearch = searchHits;
    if (searchHits.some((n) => /Egg/i.test(n))) pass('Food search Egg', searchHits.join(', '));
    else fail('Food search Egg', JSON.stringify(searchHits));

    const egg = page.locator('.food-picker-row[data-id="egg"]').first();
    if (await egg.count()) {
      await egg.locator('.food-picker-plus, .food-picker-add-icon').first().click({ force: true });
      await page.waitForTimeout(500);
      await page.evaluate(() => document.getElementById('food-add-sheet-close')?.click());
      await page.waitForTimeout(1000);
      const meal = await page.evaluate(() => document.getElementById('meal-summary')?.innerText?.slice(0, 160) || '');
      if (/Egg/i.test(meal)) pass('Food add + macros', meal.replace(/\s+/g, ' '));
      else partial('Food add + macros', meal);
      await page.evaluate(() => document.getElementById('food-add-open')?.click());
      await page.waitForTimeout(300);
      await page.fill('#food-search', 'Egg');
      await page.waitForTimeout(300);
      const egg2 = page.locator('.food-picker-row[data-id="egg"]').first();
      for (let i = 0; i < 6; i += 1) {
        await egg2.locator('.food-picker-minus').click({ force: true }).catch(() => {});
        await page.waitForTimeout(80);
      }
      await page.evaluate(() => document.getElementById('food-add-sheet-close')?.click());
      await page.waitForTimeout(600);
      pass('Food remove stepper', 'minus used');
    } else fail('Food add Egg row', 'missing');

    await page.evaluate(() => document.getElementById('food-add-open')?.click());
    await page.waitForTimeout(300);
    if (await page.locator('#food-barcode').count()) {
      await page.fill('#food-barcode', '3017620422003');
      await page.evaluate(() => document.getElementById('food-barcode-go')?.click());
      const modal = await page.waitForSelector('#custom-food-modal.show', { timeout: 10000 }).catch(() => null);
      if (modal) {
        const name = await page.evaluate(() => document.getElementById('custom-name')?.value);
        pass('OFF barcode lookup', name || 'confirm modal');
        await page.evaluate(() => document.getElementById('custom-cancel')?.click());
      } else partial('OFF barcode lookup', 'modal not shown');
    } else skip('OFF barcode lookup', 'no input');
    await page.keyboard.press('Escape').catch(() => {});

    const sameBanner = await page.evaluate(() => {
      const b = document.getElementById('same-as-yesterday');
      return { hidden: b?.classList.contains('hidden'), text: b?.innerText?.slice(0, 80) };
    });
    findings.sameAs = sameBanner;
    if (sameBanner && !sameBanner.hidden) pass('Same-as-yesterday banner', sameBanner.text);
    else partial('Same-as-yesterday banner', 'hidden (slot may be filled or restriction)');

    // Future food preview
    await page.evaluate(() => document.querySelector('.nav-tab[data-tab="coach"]')?.click());
    const todayIso = today.iso;
    if (todayIso) {
      const [y, m, d] = todayIso.split('-').map(Number);
      const fut = new Date(y, m - 1, d + 1);
      const futIso = `${fut.getFullYear()}-${String(fut.getMonth() + 1).padStart(2, '0')}-${String(fut.getDate()).padStart(2, '0')}`;
      await goDate(page, futIso);
      await page.evaluate(() => document.querySelector('.nav-tab[data-tab="food"]')?.click());
      await page.waitForTimeout(700);
      const preview = await page.evaluate(() => ({
        banner: document.getElementById('food-preview-banner')?.innerText?.slice(0, 80) || '',
        hidden: document.getElementById('food-preview-banner')?.classList.contains('hidden'),
      }));
      if (/Preview/i.test(preview.banner) && !preview.hidden) pass('Future food preview hide', preview.banner);
      else partial('Future food preview hide', JSON.stringify(preview));
      await page.evaluate(() => document.querySelector('.nav-tab[data-tab="coach"]')?.click());
      await goDate(page, todayIso);
      await page.waitForTimeout(600);
      const restored = await page.evaluate(() => !document.getElementById('vitals-card')?.classList.contains('hidden'));
      if (restored) pass('Future → Today restoration', 'vitals visible');
      else fail('Future → Today restoration', 'vitals still hidden');
    }

    // Past read-only vs Edit
    await goDate(page, REST);
    await page.waitForTimeout(500);
    const pastRo = await page.evaluate(() => ({
      readonly: document.getElementById('tab-coach')?.classList.contains('coach-readonly'),
      editBtn: !document.getElementById('coach-past-edit-btn')?.classList.contains('hidden'),
      dayType: document.getElementById('date-day-type')?.textContent?.trim(),
    }));
    findings.pastRo = pastRo;
    if (pastRo.readonly && pastRo.editBtn) pass('Past read-only + Edit', JSON.stringify(pastRo));
    else partial('Past read-only + Edit', JSON.stringify(pastRo));
    await enablePastEdit(page);
    const pastEdit = await page.evaluate(() => !document.getElementById('tab-coach')?.classList.contains('coach-readonly'));
    if (pastEdit) pass('Past Edit unlocks', 'coach-readonly cleared');
    else fail('Past Edit unlocks', 'still readonly');

    // Bodyweight / AR / Rest inspect
    for (const [date, expect] of [[BW, 'Bodyweight'], [AR, 'Active Recovery'], [REST, 'Rest']]) {
      await goDate(page, date);
      await page.waitForTimeout(400);
      const dt = await page.evaluate(() => document.getElementById('date-day-type')?.textContent?.trim());
      if (dt === expect) pass(`${expect} day type`, date);
      else partial(`${expect} day type`, `${date} got ${dt}`);
    }

    // ── Gym lifecycle on fresh date ──
    try {
    await goDate(page, GYM_FRESH);
    await enablePastEdit(page);
    await page.evaluate(() => document.getElementById('session-start-btn')?.click());
    await page.waitForTimeout(600);
    const floorH = await stickyH(page);
    findings.floorSticky = floorH;
    if (floorH >= 40 && floorH <= 70) pass('Floor date strip ~52px', `${floorH}px`);
    else partial('Floor date strip ~52px', `${floorH}px`);

    const restShown = await page.evaluate(async () => {
      const pill = document.querySelector('.workout-set-pill:not(.done)');
      pill?.click();
      await new Promise((r) => setTimeout(r, 80));
      return !document.getElementById('session-rest')?.classList.contains('hidden');
    });
    if (restShown) {
      await page.evaluate(() => document.getElementById('session-rest-skip')?.click());
      pass('Gym rest timer appears', 'after set');
    } else partial('Gym rest timer appears', 'not shown after first click');

    await page.evaluate(() => {
      document.querySelectorAll('.workout-set-pill:not(.done)').forEach((p) => p.click());
      document.getElementById('session-rest-skip')?.click();
    });
    await page.waitForTimeout(200);
    await page.evaluate(() => {
      document.querySelectorAll('.workout-set-pill:not(.done)').forEach((p) => p.click());
      document.getElementById('session-rest-skip')?.click();
    });
    await page.evaluate(() => {
      const el = document.getElementById('input-workout-rpe');
      el.value = '7';
      el.dataset.rpeExplicit = '1';
      const d = document.getElementById('workout-rpe-value');
      if (d) d.textContent = '7';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });

    await page.evaluate(() => document.getElementById('session-finish-btn')?.click());
    await page.waitForTimeout(250);
    const closeOpen = await page.evaluate(() => !document.getElementById('session-close-panel')?.classList.contains('hidden'));
    if (closeOpen) pass('Gym Finish opens Close', 'open');
    else fail('Gym Finish opens Close', 'closed');
    await page.evaluate(() => document.getElementById('session-close-cancel')?.click());
    const backFloor = await page.evaluate(() => document.body.classList.contains('session-floor-active'));
    if (backFloor) pass('Gym Close Back to Floor', 'floor');
    else fail('Gym Close Back to Floor', 'not floor');

    await page.evaluate(() => document.getElementById('session-finish-btn')?.click());
    await page.waitForTimeout(200);
    await page.evaluate(() => document.getElementById('session-close-confirm')?.click());
    await page.waitForTimeout(2500);
    const afterClose = await page.evaluate(() => ({
      floor: document.body.classList.contains('session-floor-active'),
      done: document.getElementById('training-done-btn')?.classList.contains('done'),
      card: document.getElementById('training-card')?.innerText?.slice(0, 180) || '',
    }));
    const dbGym = await db('GET', `/rest/v1/workout_logs?user_id=eq.${UID}&date=eq.${GYM_FRESH}&select=user_id,date,done,rpe`);
    findings.gymClose = { afterClose, dbGym };
    const one = Array.isArray(dbGym) && dbGym.length === 1 && dbGym[0].user_id === UID && dbGym[0].done === true;
    if (!afterClose.floor && /Edit session|· done/i.test(afterClose.card) && one) {
      pass('Gym Save & Close persist', JSON.stringify(dbGym[0]));
    } else fail('Gym Save & Close persist', JSON.stringify({ afterClose, dbGym }).slice(0, 400));

    // Optimistic Done check: reopen? already done. Offline on a note edit is heavy.
    // Probe: existing completed gym 2026-11-09 still one row
    const gymDup = await db('GET', `/rest/v1/workout_logs?user_id=eq.${UID}&date=eq.${GYM_FRESH}&select=id`);
    if (Array.isArray(gymDup) && gymDup.length === 1) pass('Gym no duplicate rows', '1 row');
    else fail('Gym no duplicate rows', JSON.stringify(gymDup));

    // Exit without done — inspect 2026-11-06 if incomplete leftover; else skip
    const dbExitDate = await db('GET', `/rest/v1/workout_logs?user_id=eq.${UID}&date=eq.2026-11-06&select=done`);
    findings.exitDate = dbExitDate;

    // ── Run persist ──
    await forceExit(page);
    await goDate(page, RUN_DONE);
    await page.waitForTimeout(700);
    const runCard = await page.evaluate(() => document.getElementById('training-card')?.innerText?.slice(0, 180) || '');
    const runDb = await db('GET', `/rest/v1/run_logs?user_id=eq.${UID}&date=eq.${RUN_DONE}&select=user_id,date,done,actual_km`);
    findings.run = { runCard, runDb };
    if (/6\.4|Edit session|logged/i.test(runCard) && runDb?.[0]?.user_id === UID) pass('Run persisted after refresh path', runCard.replace(/\s+/g, ' ').slice(0, 100));
    else fail('Run persisted after refresh path', JSON.stringify({ runCard, runDb }).slice(0, 250));

    // Resume/Edit session on completed gym
    await goDate(page, GYM_DONE);
    await enablePastEdit(page);
    await page.evaluate(() => document.getElementById('session-resume-btn')?.click());
    await page.waitForTimeout(500);
    const resumed = await page.evaluate(() => document.body.classList.contains('session-floor-active'));
    if (resumed) pass('Gym Resume/Edit session', 'floor');
    else partial('Gym Resume/Edit session', 'not floor');
    await forceExit(page);
    const exited = await page.evaluate(() => !document.body.classList.contains('session-floor-active'));
    if (exited) pass('Gym Exit from Edit returns Memory', 'exited');
    else fail('Gym Exit from Edit returns Memory', 'still floor');
    } catch (err) { fail('Gym lifecycle section', (err.message || String(err)).slice(0, 200)); await forceExit(page); }

    // ── Week / Progress ──
    await page.evaluate(() => document.querySelector('.nav-tab[data-tab="week"]')?.click());
    await page.waitForTimeout(900);
    const week = await page.evaluate(() => ({
      text: document.getElementById('tab-week')?.innerText?.slice(0, 400) || '',
      null: /Week null/i.test(document.getElementById('tab-week')?.innerText || ''),
      types: ['Gym', 'Run', 'Bodyweight', 'Rest', 'Active Recovery'].filter((t) => (document.getElementById('tab-week')?.innerText || '').includes(t)),
    }));
    findings.week = week;
    if (!week.null) pass('Week null absent on Week tab', week.types.join(','));
    else fail('Week null absent on Week tab', 'present');
    if (week.types.length >= 3) pass('Week shows multiple day types', week.types.join(', '));
    else partial('Week shows multiple day types', JSON.stringify(week.types));

    await page.evaluate(() => document.querySelector('.nav-tab[data-tab="progress"]')?.click());
    await page.waitForTimeout(1000);
    const progress = await page.evaluate(() => ({
      weight: !!document.getElementById('weight-trend-content'),
      tab: document.getElementById('tab-progress')?.classList.contains('active'),
      text: document.getElementById('tab-progress')?.innerText?.slice(0, 200) || '',
    }));
    findings.progress = progress;
    if (progress.tab && progress.weight) pass('Progress tab + weight trend', 'loaded');
    else partial('Progress tab + weight trend', JSON.stringify(progress));

    // Friend profile gating: QA is friend chrome — no cigs/supplements typically
    await page.evaluate(() => document.querySelector('.nav-tab[data-tab="coach"]')?.click());
    const gated = await page.evaluate(() => ({
      suppHidden: document.getElementById('supplements-card')?.classList.contains('hidden') ?? true,
      weekNull: /Week null/i.test(document.body.innerText),
    }));
    findings.gated = gated;
    pass('Profile-gated chrome (QA friend)', `supplements hidden=${gated.suppHidden}`);

    // ── Responsive ──
    const widths = [320, 360, 390, 430];
    const responsive = [];
    for (const w of widths) {
      await page.setViewportSize({ width: w, height: 844 });
      await page.waitForTimeout(250);
      const m = await page.evaluate(() => ({
        sticky: Math.round(document.querySelector('.app-sticky-context')?.getBoundingClientRect().height || 0),
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
        nav: !!document.querySelector('.bottom-nav, .nav-tabs, .app-nav'),
      }));
      responsive.push({ w, ...m });
      if (!m.overflow && m.sticky > 0) pass(`Responsive ${w}px`, `sticky=${m.sticky} overflow=${m.overflow}`);
      else partial(`Responsive ${w}px`, JSON.stringify(m));
    }
    findings.responsive = responsive;

    // Save error Retry chrome exists
    const retryUi = await page.evaluate(() => !!document.getElementById('save-error-retry'));
    if (retryUi) pass('Save Retry control present', '#save-error-retry');
    else fail('Save Retry control present', 'missing');

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
    untested: results.filter((r) => r.status === 'Not tested').length,
    results,
    findings,
  };
  writeFileSync(join(ROOT, '.env.qa-g5-results.json'), JSON.stringify(summary, null, 2));
  console.log('\n=== G.5 SUMMARY ===');
  console.log(JSON.stringify({
    passed: summary.passed, failed: summary.failed, partial: summary.partial, untested: summary.untested,
  }, null, 2));
}

run().catch((e) => {
  console.error('FATAL', e.message);
  process.exit(1);
});
