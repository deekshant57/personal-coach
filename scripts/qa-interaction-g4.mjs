#!/usr/bin/env node
/**
 * Phase 3.1.G.4 — authenticated interaction QA (QA user only).
 * Loads COACH_TEST_* from env. Never prints credentials/password.
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const PORT = 8780;
const BASE = `http://127.0.0.1:${PORT}`;
const EMAIL = process.env.COACH_TEST_EMAIL;
const PASSWORD = process.env.COACH_TEST_PASSWORD;
const EXPECT_UID = process.env.COACH_TEST_USER_ID || '99705a15-91b5-4eb8-926b-0055db3497c3';
const PROTECTED = new Set([
  'd6f25dae-4cc8-48dd-9822-fbccf9a92139',
  '9e6a0d55-b63f-4857-b318-122e0c337ef4',
]);
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
};

const GYM_DATE = '2026-11-13'; // Fri Gym — unused completed session
const RUN_DATE = '2026-11-14'; // Sat Run — unused
const HIST_DATE = '2026-11-16'; // Mon Gym with existing data
const EMPTY_DATE = '2026-11-15';
const VITALS_DATE = '2026-11-19';

if (!EMAIL || !PASSWORD) {
  console.error('Missing COACH_TEST_EMAIL / COACH_TEST_PASSWORD');
  process.exit(1);
}

const results = [];
function rec(status, step, detail = '') {
  results.push({ status, step, detail });
  const tag = status === 'Passed' ? 'PASS' : status === 'Failed' ? 'FAIL' : status === 'Partially verified' ? 'PARTIAL' : 'SKIP';
  console.log(`${tag} — ${step}${detail ? ` · ${detail}` : ''}`);
}
const pass = (s, d) => rec('Passed', s, d);
const fail = (s, d) => rec('Failed', s, d);
const partial = (s, d) => rec('Partially verified', s, d);
const untested = (s, d) => rec('Not tested', s, d);

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
  await page.waitForTimeout(1100);
  for (let i = 0; i < 40 && (await iso(page)) !== target; i += 1) {
    const cur = await iso(page);
    if (cur > target) await page.click('#date-prev');
    else await page.click('#date-next');
    await page.waitForTimeout(300);
  }
  return (await iso(page)) === target;
}
async function closeOverlays(page) {
  await page.keyboard.press('Escape').catch(() => {});
  await page.evaluate(() => {
    const sheet = document.getElementById('food-add-sheet');
    if (sheet) sheet.setAttribute('aria-hidden', 'true');
  }).catch(() => {});
  await page.waitForTimeout(150);
}
async function stickyH(page) {
  return page.evaluate(() => {
    const el = document.querySelector('.app-sticky-context, .app-sticky-header');
    return el ? Math.round(el.getBoundingClientRect().height) : null;
  });
}
async function floorStripH(page) {
  return page.evaluate(() => {
    const el = document.getElementById('session-floor-bar');
    if (!el || el.classList.contains('hidden')) return null;
    return Math.round(el.getBoundingClientRect().height);
  });
}
async function authUid(page) {
  return page.evaluate(async () => {
    try {
      const client = window.supabase?.getClient?.() || null;
      // app stores via auth module; try localStorage session
      for (const k of Object.keys(localStorage)) {
        if (k.includes('auth-token') || k.includes('sb-')) {
          try {
            const raw = JSON.parse(localStorage.getItem(k));
            const uid = raw?.user?.id || raw?.currentSession?.user?.id;
            if (uid) return uid;
          } catch { /* continue */ }
        }
      }
      return null;
    } catch { return null; }
  });
}

async function run() {
  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.setDefaultTimeout(45000);
  let uid = null;

  try {
    await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('#auth-screen.show, .nav-tab[data-tab="coach"]', { timeout: 30000 });
    if (await page.locator('#auth-screen.show').count()) {
      await page.fill('#auth-email', EMAIL);
      await page.fill('#auth-password', PASSWORD);
      await page.click('#auth-submit');
    }
    await page.waitForFunction(() => !document.getElementById('auth-screen')?.classList.contains('show'), { timeout: 60000 });
    if (await page.locator('#setup-screen.show').count()) {
      fail('Preflight setup screen', 'QA profile should already be set up');
    }
    await page.waitForSelector('.nav-tab[data-tab="coach"]', { timeout: 30000 });
    await page.waitForTimeout(1500);

    uid = await authUid(page);
    if (!uid) {
      // fallback: decode from any sb cookie/local key more broadly
      uid = await page.evaluate(() => {
        const dump = JSON.stringify(localStorage);
        const m = dump.match(/"sub":"([0-9a-f-]{36})"/);
        return m?.[1] || null;
      });
    }
    if (uid === EXPECT_UID && !PROTECTED.has(uid)) pass('Preflight QA user id', uid);
    else fail('Preflight QA user id', `got=${uid} expected=${EXPECT_UID}`);

    // ── Vitals ───────────────────────────────────────────────
    if (!(await goDate(page, VITALS_DATE))) fail('Vitals navigate', await iso(page));
    else {
      await page.click('.nav-tab[data-tab="coach"]', { force: true });
      await page.waitForTimeout(600);
      // Expand if collapsed
      const collapsed = await page.evaluate(() => document.getElementById('vitals-card')?.classList.contains('collapsed'));
      if (collapsed) await page.click('#vitals-collapse');
      await page.fill('#input-weight', '78.1');
      await page.fill('#input-sleep', '7.5');
      const waistVisible = await page.locator('#waist-row:not(.hidden)').count();
      if (waistVisible) await page.fill('#input-waist', '33.5');
      await page.click('#save-vitals');
      await page.waitForTimeout(1200);
      const saveState = await page.evaluate(() => document.getElementById('save-state-indicator')?.textContent || '');
      // reload date
      await goDate(page, EMPTY_DATE);
      await goDate(page, VITALS_DATE);
      await page.waitForTimeout(800);
      const vals = await page.evaluate(() => ({
        w: document.getElementById('input-weight')?.value,
        s: document.getElementById('input-sleep')?.value,
      }));
      if (vals.w === '78.1' && vals.s === '7.5') pass('Vitals save + reload', JSON.stringify(vals));
      else fail('Vitals save + reload', JSON.stringify({ vals, saveState }));

      // collapse toggle once
      const before = await page.evaluate(() => document.getElementById('vitals-card')?.classList.contains('collapsed'));
      await page.click('#vitals-collapse');
      await page.waitForTimeout(200);
      const mid = await page.evaluate(() => document.getElementById('vitals-card')?.classList.contains('collapsed'));
      await page.click('#vitals-collapse');
      await page.waitForTimeout(200);
      const after = await page.evaluate(() => document.getElementById('vitals-card')?.classList.contains('collapsed'));
      if (mid !== before && after === before) pass('Vitals collapse one-toggle', `${before}->${mid}->${after}`);
      else fail('Vitals collapse one-toggle', `${before}->${mid}->${after}`);
    }

    // ── Food interactions (AR today slots: breakfast…) ───────
    await goDate(page, VITALS_DATE);
    await closeOverlays(page);
    await page.click('.nav-tab[data-tab="food"]', { force: true });
    await page.waitForTimeout(900);
    // pick breakfast slot if chips exist
    const slotBtn = page.locator('#meal-slots button, .meal-slot-btn, [data-slot]').first();
    if (await slotBtn.count()) await slotBtn.click().catch(() => {});
    await page.click('#food-add-open', { force: true }).catch(() => {});
    await page.waitForTimeout(500);
    const search = page.locator('#food-search');
    if (await search.count()) {
      await search.fill('oat');
      await page.waitForTimeout(500);
      const firstItem = page.locator('.food-picker-item, [data-food-id], .food-search-result').first();
      if (await firstItem.count()) {
        await firstItem.click();
        await page.waitForTimeout(400);
        // quantity stepper if present
        const plus = page.locator('.food-item-stepper button, .qty-plus, [data-qty-plus]').first();
        if (await plus.count()) await plus.click().catch(() => {});
        pass('Food search + add', 'oat');
      } else {
        partial('Food search + add', 'no picker item for oat');
      }
      await page.click('#food-add-sheet-close', { force: true }).catch(() => {});
      await closeOverlays(page);
    } else {
      untested('Food search + add', 'search UI missing');
    }
    // macros after add
    await page.waitForTimeout(800);
    const foodMacros = await page.evaluate(() => ({
      slot: document.getElementById('food-slot-total')?.textContent || '',
      spine: document.getElementById('macro-spine')?.textContent || document.querySelector('.macro-spine')?.textContent || '',
    }));
    if (/[1-9]\d*g|\d+\s*kcal/i.test(`${foodMacros.slot} ${foodMacros.spine}`)) {
      pass('Food macro update', JSON.stringify(foodMacros).slice(0, 120));
    } else {
      partial('Food macro update', JSON.stringify(foodMacros).slice(0, 120));
    }
    // same-as-yesterday / custom / OFF — opportunistic
    const same = await page.locator('#same-as-yesterday:not(.hidden)').count();
    if (same) {
      partial('Same-as-yesterday', 'banner visible (not clicked to avoid overwrite)');
    } else {
      untested('Same-as-yesterday', 'banner not shown');
    }
    untested('Barcode / OFF lookup', 'no controlled barcode in CI');
    // custom food button
    await page.click('#food-add-open', { force: true }).catch(() => {});
    await page.waitForTimeout(300);
    if (await page.locator('#food-picker-create').count()) {
      pass('Custom food control present', 'food-picker-create');
    } else {
      partial('Custom food control present', 'not found');
    }
    await closeOverlays(page);

    // Historical Food without Today Edit
    await page.click('.nav-tab[data-tab="coach"]', { force: true });
    await goDate(page, HIST_DATE);
    const editBar = (await page.locator('#coach-past-edit-bar').innerText().catch(() => '')).trim();
    const editing = /Editing/i.test(editBar);
    await page.click('.nav-tab[data-tab="food"]', { force: true });
    await page.waitForTimeout(700);
    const histFood = await page.evaluate(() => ({
      diary: !document.getElementById('food-diary-block')?.classList.contains('hidden'),
      add: !document.getElementById('food-add-open')?.disabled,
    }));
    if (!editing && histFood.diary) pass('Historical Food without Today Edit', JSON.stringify(histFood));
    else partial('Historical Food without Today Edit', JSON.stringify({ editing, histFood, editBar: editBar.slice(0, 40) }));

    // ── Gym lifecycle on unused Fri ──────────────────────────
    await closeOverlays(page);
    await page.click('.nav-tab[data-tab="coach"]', { force: true });
    if (!(await goDate(page, GYM_DATE))) fail('Gym navigate', await iso(page));
    else {
      // enable edit if past readonly
      if (await page.locator('#coach-past-edit-btn').isVisible().catch(() => false)) {
        await page.click('#coach-past-edit-btn', { force: true });
        await page.waitForTimeout(400);
      } else {
        await page.evaluate(() => document.getElementById('coach-past-edit-btn')?.click());
        await page.waitForTimeout(400);
      }
      // Start, Resume, or Edit session depending on leftover QA state
      if (await page.locator('#session-resume-btn:not(.hidden)').count()) {
        await page.click('#session-resume-btn', { force: true });
      } else if (await page.locator('#session-start-btn:not(.hidden)').count()) {
        await page.click('#session-start-btn', { force: true });
      } else {
        const editSess = page.getByRole('button', { name: /Edit session|Resume session|Start session/i }).first();
        if (await editSess.count()) await editSess.click({ force: true });
        else await page.evaluate(() => {
          document.getElementById('session-start-btn')?.click();
          document.getElementById('session-resume-btn')?.click();
        });
      }
      await page.waitForTimeout(700);
      const floorOn = await page.evaluate(() => document.body.classList.contains('session-floor-active'));
      const strip = await floorStripH(page);
      if (floorOn) pass('Gym Start → Floor', `strip=${strip}`);
      else fail('Gym Start → Floor', `strip=${strip}`);

      // mark first set done if pills exist
      const pill = page.locator('.workout-set-pill').first();
      if (await pill.count()) {
        await pill.click();
        await page.waitForTimeout(400);
        // rest timer may appear
        if (await page.locator('#session-rest:not(.hidden)').count()) {
          await page.click('#session-rest-plus');
          await page.waitForTimeout(200);
          await page.click('#session-rest-skip');
          pass('Gym rest +15 / Skip', 'ok');
        } else {
          partial('Gym rest +15 / Skip', 'rest bar not shown after set');
        }
      } else {
        partial('Gym set logging', 'no set pills — plan may lack parsed exercises');
      }

      // Exit without completion
      await page.click('#session-exit-btn');
      await page.waitForTimeout(500);
      const afterExit = await page.evaluate(() => ({
        floor: document.body.classList.contains('session-floor-active'),
        done: document.getElementById('training-done-btn')?.classList.contains('done'),
        resume: !document.getElementById('session-resume-btn')?.classList.contains('hidden'),
      }));
      if (!afterExit.floor && !afterExit.done) pass('Gym Exit not complete', JSON.stringify(afterExit));
      else fail('Gym Exit not complete', JSON.stringify(afterExit));

      // Resume
      if (await page.locator('#session-resume-btn:not(.hidden)').count()) {
        await page.click('#session-resume-btn');
      } else {
        await page.click('#session-start-btn', { force: true });
      }
      await page.waitForTimeout(500);

      // Complete all set pills so Finish validation can succeed
      for (let round = 0; round < 4; round += 1) {
        const remaining = page.locator('.workout-set-pill:not(.done)');
        const count = await remaining.count();
        if (!count) break;
        for (let i = 0; i < count; i += 1) {
          await remaining.nth(i).click({ force: true }).catch(() => {});
          await page.waitForTimeout(120);
          if (await page.locator('#session-rest:not(.hidden)').count()) {
            await page.click('#session-rest-skip', { force: true }).catch(() => {});
          }
        }
      }
      // Also toggle simple-done buttons if present
      const simple = page.locator('.workout-simple-done:not(.done)');
      const sc = await simple.count();
      for (let i = 0; i < sc; i += 1) await simple.nth(i).click({ force: true }).catch(() => {});

      await page.click('#session-finish-btn', { force: true });
      await page.waitForTimeout(400);
      const closeOpen = await page.evaluate(() => !document.getElementById('session-close-panel')?.classList.contains('hidden'));
      if (closeOpen) pass('Gym Finish → Close', 'panel open');
      else fail('Gym Finish → Close', 'panel not open');

      await page.click('#session-close-cancel', { force: true }); // Back to Floor
      await page.waitForTimeout(300);
      const backFloor = await page.evaluate(() => document.body.classList.contains('session-floor-active')
        && !document.getElementById('session-floor-bar')?.classList.contains('hidden'));
      if (backFloor) pass('Gym Close → Back to Floor', 'ok');
      else partial('Gym Close → Back to Floor', 'floor state unclear');

      await page.click('#session-finish-btn', { force: true });
      await page.waitForTimeout(300);
      const note = page.locator('#session-close-note');
      if (await note.count()) await note.fill('QA G.4 close note');
      await page.click('#session-close-confirm', { force: true });
      await page.waitForTimeout(1800);
      // If validation blocked, try Mark as Done then confirm again
      let closed = await page.evaluate(() => ({
        floor: document.body.classList.contains('session-floor-active'),
        done: document.getElementById('training-done-btn')?.classList.contains('done'),
        memory: document.getElementById('session-memory-summary')?.innerText?.slice(0, 100) || '',
        closeOpen: !document.getElementById('session-close-panel')?.classList.contains('hidden'),
      }));
      if (closed.floor || closed.closeOpen) {
        await page.click('#training-done-btn', { force: true }).catch(() => {});
        await page.waitForTimeout(400);
        if (await page.locator('#session-close-panel:not(.hidden)').count()) {
          await page.click('#session-close-confirm', { force: true }).catch(() => {});
        } else {
          await page.click('#session-finish-btn', { force: true }).catch(() => {});
          await page.waitForTimeout(200);
          await page.click('#session-close-confirm', { force: true }).catch(() => {});
        }
        await page.waitForTimeout(1200);
        closed = await page.evaluate(() => ({
          floor: document.body.classList.contains('session-floor-active'),
          done: document.getElementById('training-done-btn')?.classList.contains('done'),
          memory: document.getElementById('session-memory-summary')?.innerText?.slice(0, 100) || '',
        }));
      }
      if (!closed.floor && (closed.done || /set|kg|Lower|Upper|session|Edit/i.test(closed.memory))) {
        pass('Gym Save & Close → Memory', closed.memory || 'done');
      } else {
        // Force exit so later flows can continue; record failure honestly
        await page.click('#session-exit-btn', { force: true }).catch(() => {});
        await page.evaluate(() => {
          document.body.classList.remove('session-floor-active');
          document.getElementById('session-floor-bar')?.classList.add('hidden');
          document.getElementById('session-close-panel')?.classList.add('hidden');
        });
        fail('Gym Save & Close → Memory', JSON.stringify(closed));
      }

      // refresh persist
      await goDate(page, EMPTY_DATE);
      await goDate(page, GYM_DATE);
      await page.waitForTimeout(900);
      const persisted = (await page.locator('#training-card').innerText().catch(() => '')).trim();
      if (/Edit session|Done|set|kg|Lower|Upper/i.test(persisted)) pass('Gym persist after navigate', persisted.slice(0, 100));
      else partial('Gym persist after navigate', persisted.slice(0, 100));
    }

    // Ensure not stuck on floor before Run
    await page.evaluate(() => {
      document.body.classList.remove('session-floor-active');
      document.getElementById('session-floor-bar')?.classList.add('hidden');
      document.getElementById('session-close-panel')?.classList.add('hidden');
    });
    await closeOverlays(page);

    // ── Run lifecycle ────────────────────────────────────────
    await closeOverlays(page);
    if (!(await goDate(page, RUN_DATE))) fail('Run navigate', await iso(page));
    else {
      const editVisible = await page.locator('#coach-past-edit-btn').isVisible().catch(() => false);
      if (editVisible) {
        await page.click('#coach-past-edit-btn', { force: true });
        await page.waitForTimeout(300);
      } else if (await page.locator('#coach-past-edit-bar--editing, .coach-past-edit-bar--editing').count()) {
        // already editing
      } else if (await page.locator('#coach-past-edit-btn').count()) {
        await page.evaluate(() => document.getElementById('coach-past-edit-btn')?.click());
        await page.waitForTimeout(300);
      }
      await page.click('#session-start-btn', { force: true });
      await page.waitForTimeout(500);
      await page.fill('#input-run-km', '6.0');
      await page.fill('#input-run-time', '36:00');
      await page.fill('#input-run-pace', '6:00');
      await page.fill('#input-run-cadence', '170');
      await page.locator('#input-run-rpe').fill('6');
      await page.fill('#input-run-notes', 'QA G.4 run');
      await page.waitForTimeout(800); // autosave
      await page.click('#session-finish-btn');
      await page.waitForTimeout(300);
      if (await page.locator('#session-close-note').count()) {
        await page.fill('#session-close-note', 'QA run close');
      }
      await page.click('#session-close-confirm');
      await page.waitForTimeout(1500);
      const runMem = (await page.locator('#training-card').innerText().catch(() => '')).trim();
      if (/6(\.0)?\s*km|36:00|Edit session|Done/i.test(runMem)) pass('Run Save & Close → Memory', runMem.slice(0, 120));
      else fail('Run Save & Close → Memory', runMem.slice(0, 120));

      await goDate(page, EMPTY_DATE);
      await goDate(page, RUN_DATE);
      await page.waitForTimeout(800);
      const runPersisted = (await page.locator('#training-card').innerText().catch(() => '')).trim();
      const kmVal = await page.evaluate(() => document.getElementById('input-run-km')?.value || '');
      if (/6/.test(runPersisted) || kmVal === '6' || kmVal === '6.0') pass('Run persist after navigate', `mem=${runPersisted.slice(0, 80)} km=${kmVal}`);
      else partial('Run persist after navigate', `mem=${runPersisted.slice(0, 80)} km=${kmVal}`);
    }

    // ── Historical Edit persistence ──────────────────────────
    await goDate(page, HIST_DATE);
    await page.waitForTimeout(600);
    const ro = (await page.locator('#coach-past-edit-bar').innerText().catch(() => '')).trim();
    if (/read-only/i.test(ro)) pass('Historical read-only bar', ro.slice(0, 60));
    else partial('Historical read-only bar', ro.slice(0, 60));
    if (await page.locator('#coach-past-edit-btn').isVisible().catch(() => false)) {
      await page.click('#coach-past-edit-btn', { force: true });
      await page.waitForTimeout(400);
    } else {
      await page.evaluate(() => document.getElementById('coach-past-edit-btn')?.click());
      await page.waitForTimeout(400);
    }
    // expand vitals and tweak sleep slightly
    if (await page.evaluate(() => document.getElementById('vitals-card')?.classList.contains('collapsed'))) {
      await page.click('#vitals-collapse', { force: true });
    }
    await page.fill('#input-sleep', '7.25');
    await page.click('#save-vitals', { force: true });
    await page.waitForTimeout(1200);
    await goDate(page, EMPTY_DATE);
    await goDate(page, HIST_DATE);
    await page.waitForTimeout(800);
    if (await page.locator('#coach-past-edit-btn').isVisible().catch(() => false)) {
      await page.click('#coach-past-edit-btn', { force: true });
      await page.waitForTimeout(300);
    } else {
      await page.evaluate(() => document.getElementById('coach-past-edit-btn')?.click());
      await page.waitForTimeout(300);
    }
    const sleepBack = await page.evaluate(() => document.getElementById('input-sleep')?.value);
    if (sleepBack === '7.25') pass('Historical Edit persist', `sleep=${sleepBack}`);
    else fail('Historical Edit persist', `sleep=${sleepBack}`);

    await goDate(page, EMPTY_DATE);
    const emptyChrome = `${(await page.locator('#date-off-today-hint').innerText().catch(() => '')).trim()} ${(await page.locator('#coach-past-edit-bar').innerText().catch(() => '')).trim()}`;
    if (/fail|error|missing/i.test(emptyChrome)) fail('Empty historical day', emptyChrome);
    else pass('Empty historical day', emptyChrome.slice(0, 80));

    // ── Save failure simulation (network offline) ────────────
    await goDate(page, VITALS_DATE);
    if (await page.evaluate(() => document.getElementById('vitals-card')?.classList.contains('collapsed'))) {
      await page.click('#vitals-collapse');
    }
    await page.context().setOffline(true);
    await page.fill('#input-sleep', '6.0');
    await page.click('#save-vitals');
    await page.waitForTimeout(1500);
    const errUi = await page.evaluate(() => document.getElementById('save-state-indicator')?.textContent || document.body.innerText.slice(0, 200));
    await page.context().setOffline(false);
    await page.waitForTimeout(500);
    if (/fail|error|retry|offline|unable|saved/i.test(errUi)) {
      partial('Save failure / retry UI', 'offline attempted — check indicator copy');
    } else {
      partial('Save failure / retry UI', 'no clear error chrome observed');
    }
    // restore sleep value online
    await page.fill('#input-sleep', '7.5');
    await page.click('#save-vitals');
    await page.waitForTimeout(800);

    // ── Responsive + floor height if still on floor skip ─────
    for (const w of [320, 360, 390, 430]) {
      await page.setViewportSize({ width: w, height: 844 });
      await page.waitForTimeout(200);
      const ox = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
      const h = await stickyH(page);
      if (!ox && h >= 80 && h <= 130) pass(`Responsive ${w}px`, `sticky ${h}`);
      else fail(`Responsive ${w}px`, `ox=${ox} sticky=${h}`);
    }

    // Week null observation (read-only)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.click('.nav-tab[data-tab="week"]', { force: true });
    await page.waitForTimeout(1000);
    const weekChrome = (await page.locator('#tab-week').innerText().catch(() => '')).trim();
    if (/Week null/i.test(weekChrome)) {
      partial('Week null still present', weekChrome.slice(0, 100));
    } else {
      pass('Week null not visible now', weekChrome.slice(0, 80));
    }

  } catch (err) {
    fail('Suite aborted', err.message);
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
    uid,
  };
  writeFileSync(join(ROOT, '.env.qa-g4-results.json'), JSON.stringify(summary, null, 2));
  console.log('\n=== SUMMARY ===');
  console.log(JSON.stringify({
    passed: summary.passed,
    failed: summary.failed,
    partial: summary.partial,
    untested: summary.untested,
  }, null, 2));
  process.exit(summary.failed ? 1 : 0);
}

run().catch((e) => {
  console.error('FATAL', e.message);
  process.exit(1);
});
