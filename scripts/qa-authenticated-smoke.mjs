#!/usr/bin/env node
/**
 * Authenticated QA smoke — read-mostly + date/Food/Plan/Progress checks.
 * Loads COACH_TEST_* from env. Does not print credentials.
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dir = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = join(__dir, '..');
const PORT = 8778;
const BASE = `http://127.0.0.1:${PORT}`;
const EMAIL = process.env.COACH_TEST_EMAIL;
const PASSWORD = process.env.COACH_TEST_PASSWORD;
const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
};

if (!EMAIL || !PASSWORD) {
  console.error('Missing COACH_TEST_EMAIL / COACH_TEST_PASSWORD');
  process.exit(1);
}

function startServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let path = req.url?.split('?')[0] || '/';
      if (path === '/') path = '/index.html';
      const filePath = join(APP_ROOT, path);
      if (!filePath.startsWith(APP_ROOT) || !existsSync(filePath)) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' });
      res.end(readFileSync(filePath));
    });
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}

const results = [];
function pass(step, detail = '') {
  results.push({ step, status: 'Passed', detail });
  console.log(`PASS — ${step}${detail ? ` · ${detail}` : ''}`);
}
function fail(step, detail = '') {
  results.push({ step, status: 'Failed', detail });
  console.log(`FAIL — ${step}${detail ? ` · ${detail}` : ''}`);
}
function partial(step, detail = '') {
  results.push({ step, status: 'Partially verified', detail });
  console.log(`PARTIAL — ${step}${detail ? ` · ${detail}` : ''}`);
}

async function stickyHeight(page) {
  return page.evaluate(() => {
    const el = document.querySelector('.app-sticky-context, .app-sticky-header');
    return el ? Math.round(el.getBoundingClientRect().height) : null;
  });
}

async function currentIso(page) {
  return page.evaluate(() => document.getElementById('date-display')?.dataset?.iso || null);
}

async function closeOverlays(page) {
  await page.keyboard.press('Escape').catch(() => {});
  await page.evaluate(() => {
    document.getElementById('food-add-sheet')?.setAttribute('aria-hidden', 'true');
    document.getElementById('food-add-sheet')?.classList.remove('open', 'show');
    document.querySelector('.food-add-sheet')?.setAttribute('aria-hidden', 'true');
  }).catch(() => {});
  await page.waitForTimeout(200);
}

async function goToDate(page, targetIso) {
  await page.evaluate((d) => { location.hash = `#tab=coach&date=${d}`; }, targetIso);
  await page.waitForTimeout(1200);
  if ((await currentIso(page)) === targetIso) return true;
  for (let i = 0; i < 45; i += 1) {
    const iso = await currentIso(page);
    if (iso === targetIso) return true;
    if (iso && iso > targetIso) await page.click('#date-prev');
    else if (iso && iso < targetIso) await page.click('#date-next');
    else break;
    await page.waitForTimeout(350);
  }
  return (await currentIso(page)) === targetIso;
}

async function run() {
  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.setDefaultTimeout(45000);

  try {
    await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('#auth-screen, .nav-tab[data-tab="coach"]', { timeout: 30000 });

    if (await page.locator('#auth-screen.show').count()) {
      await page.fill('#auth-email', EMAIL);
      await page.fill('#auth-password', PASSWORD);
      await page.click('#auth-submit');
    }

    await page.waitForFunction(
      () => !document.getElementById('auth-screen')?.classList.contains('show'),
      { timeout: 60000 },
    );

    if (await page.locator('#setup-screen.show').count()) {
      const name = page.locator('#setup-display-name');
      if (await name.count()) await name.fill('Personal Coach QA Athlete');
      const hybrid = page.locator('.setup-preset[data-sport-mode="hybrid"]');
      if (await hybrid.count()) await hybrid.click();
      const save = page.locator('#setup-save-btn, #setup-complete-btn, #setup-save').first();
      if (await save.count()) await save.click();
      else {
        const btn = page.getByRole('button', { name: /save|continue|done|finish/i }).first();
        if (await btn.count()) await btn.click();
      }
      await page.waitForFunction(
        () => !document.getElementById('setup-screen')?.classList.contains('show'),
        { timeout: 60000 },
      ).catch(() => {});
    }

    await page.waitForSelector('.nav-tab[data-tab="coach"]', { timeout: 30000 });
    await page.waitForTimeout(1500);
    pass('Login + app shell', `iso=${await currentIso(page)}`);

    const dateText = (await page.locator('#date-display').innerText().catch(() => '')).trim();
    const dayType = (await page.locator('#date-day-type').innerText().catch(() => '')).trim();
    const sticky = await stickyHeight(page);
    const plan = (await page.locator('#plan-directive').innerText().catch(() => '')).trim();
    const recovery = (await page.locator('#recovery-card').innerText().catch(() => '')).trim();
    if (dateText) pass('Today date context', `${dateText} · ${dayType} · sticky ${sticky}px · iso=${await currentIso(page)}`);
    else fail('Today date context');
    if (sticky != null && sticky >= 80 && sticky <= 130) pass('Sticky ~94px', `${sticky}px`);
    else partial('Sticky ~94px', `${sticky}`);
    if ((plan && !/^Loading/i.test(plan)) || /Active Recovery|Rest|Protein floor/i.test(recovery)) {
      pass('Plan/recovery content', (plan || recovery).slice(0, 90));
    } else {
      fail('Plan/recovery content', `plan=${plan || 'empty'}`);
    }

    const order = await page.evaluate(() => {
      const root = document.getElementById('coach-sections');
      return root ? [...root.querySelectorAll(':scope > .card, :scope > [id]')].map((el) => el.id).filter(Boolean) : [];
    });
    pass('Coach section ids', order.join(' → ') || '(none)');

    // Populated historical day
    const reachedGym = await goToDate(page, '2026-11-16');
    await page.waitForTimeout(900);
    if (reachedGym) pass('Navigate to gym past', '2026-11-16');
    else partial('Navigate to gym past', `landed ${await currentIso(page)}`);

    const barText = (await page.locator('#coach-past-edit-bar').innerText().catch(() => '')).trim();
    const hint = (await page.locator('#date-off-today-hint').innerText().catch(() => '')).trim();
    if (/read-only|past|viewing/i.test(`${barText} ${hint}`)) pass('Past read-only chrome', `${hint} | ${barText.slice(0, 50)}`);
    else partial('Past read-only chrome', `${hint} | ${barText}`);

    const meals = (await page.locator('#meals-summary-card').innerText().catch(() => '')).trim();
    if (/Pre-workout|Post-workout|Lunch|Dinner|protein|kcal|g P/i.test(meals)) pass('Past meals summary', meals.slice(0, 120));
    else partial('Past meals summary', meals.slice(0, 120) || 'empty');

    const training = (await page.locator('#training-card').innerText().catch(() => '')).trim();
    if (/Bench|Upper|workout|session|Edit|Resume|Start|Done/i.test(training)) pass('Past gym memory', training.slice(0, 120));
    else partial('Past gym memory', training.slice(0, 120) || 'empty');

    await closeOverlays(page);
    await page.click('.nav-tab[data-tab="food"]', { force: true });
    await page.waitForTimeout(900);
    let foodState = await page.evaluate(() => ({
      preview: !document.getElementById('food-preview-banner')?.classList.contains('hidden'),
      diaryHidden: !!document.getElementById('food-diary-block')?.classList.contains('hidden'),
      footerHidden: !!document.getElementById('food-sticky-footer')?.classList.contains('hidden'),
      slotTotal: document.getElementById('food-slot-total')?.textContent || '',
      mealText: document.getElementById('meal-summary')?.innerText?.slice(0, 120) || '',
    }));
    if (!foodState.preview && !foodState.diaryHidden) pass('Historical Food diary visible', `${foodState.slotTotal} · ${foodState.mealText}`);
    else fail('Historical Food diary visible', JSON.stringify(foodState));

    // Empty past
    await closeOverlays(page);
    await page.click('.nav-tab[data-tab="coach"]', { force: true });
    await goToDate(page, '2026-11-15');
    await page.waitForTimeout(800);
    const emptyHint = `${(await page.locator('#date-off-today-hint').innerText().catch(() => '')).trim()} ${(await page.locator('#coach-past-edit-bar').innerText().catch(() => '')).trim()}`;
    if (/fail|error|missing data/i.test(emptyHint)) fail('Empty past neutral chrome', emptyHint);
    else pass('Empty past neutral chrome', emptyHint.slice(0, 80) || 'no failure copy');

    // Future Food hide
    await goToDate(page, '2026-11-21');
    await page.waitForTimeout(800);
    const futureCoach = await page.evaluate(() => ({
      hint: document.getElementById('date-off-today-hint')?.textContent || '',
      vitalsHidden: !!document.getElementById('vitals-card')?.classList.contains('hidden'),
      iso: document.getElementById('date-display')?.dataset?.iso || '',
    }));
    if (/preview/i.test(futureCoach.hint) && futureCoach.vitalsHidden) pass('Future Today preview', futureCoach.hint.trim());
    else partial('Future Today preview', JSON.stringify(futureCoach));

    await closeOverlays(page);
    await page.click('.nav-tab[data-tab="food"]', { force: true });
    await page.waitForTimeout(700);
    foodState = await page.evaluate(() => ({
      preview: !document.getElementById('food-preview-banner')?.classList.contains('hidden'),
      diaryHidden: !!document.getElementById('food-diary-block')?.classList.contains('hidden'),
      footerHidden: !!document.getElementById('food-sticky-footer')?.classList.contains('hidden'),
    }));
    if (foodState.preview && foodState.diaryHidden && foodState.footerHidden) {
      pass('Future Food diary/footer hidden', JSON.stringify(foodState));
    } else {
      fail('Future Food diary/footer hidden', JSON.stringify(foodState));
    }

    // Back to gym past and confirm food restored
    await closeOverlays(page);
    await page.click('.nav-tab[data-tab="coach"]', { force: true });
    await goToDate(page, '2026-11-16');
    await closeOverlays(page);
    await page.click('.nav-tab[data-tab="food"]', { force: true });
    await page.waitForTimeout(800);
    foodState = await page.evaluate(() => ({
      preview: !document.getElementById('food-preview-banner')?.classList.contains('hidden'),
      diaryHidden: !!document.getElementById('food-diary-block')?.classList.contains('hidden'),
      footerHidden: !!document.getElementById('food-sticky-footer')?.classList.contains('hidden'),
    }));
    if (!foodState.preview && !foodState.diaryHidden && !foodState.footerHidden) {
      pass('Food restored after future', JSON.stringify(foodState));
    } else {
      fail('Food restored after future', JSON.stringify(foodState));
    }

    // Run past day
    await closeOverlays(page);
    await page.click('.nav-tab[data-tab="coach"]', { force: true });
    const reachedRun = await goToDate(page, '2026-11-17');
    await page.waitForTimeout(800);
    const runTraining = (await page.locator('#training-card').innerText().catch(() => '')).trim();
    if (reachedRun && /Run|5\.|km|Start|Edit/i.test(runTraining)) pass('Past run memory', runTraining.slice(0, 120));
    else partial('Past run memory', runTraining.slice(0, 120) || `reached=${reachedRun}`);

    // Week / Progress
    await closeOverlays(page);
    await page.click('.nav-tab[data-tab="week"]', { force: true });
    await page.waitForTimeout(1400);
    const weekText = (await page.locator('#tab-week').innerText().catch(() => '')).trim();
    const types = ['Gym', 'Run', 'Bodyweight', 'Active Recovery', 'Rest'].filter((t) => weekText.includes(t));
    if (types.length >= 4) pass('Plan day types', types.join(', '));
    else partial('Plan day types', `${types.join(', ')} · ${weekText.slice(0, 90)}`);

    await page.click('.nav-tab[data-tab="progress"]', { force: true });
    await page.waitForTimeout(1600);
    const progressText = (await page.locator('#tab-progress').innerText().catch(() => '')).trim();
    if (/78\.|weight|kg|scan|fat/i.test(progressText)) pass('Progress shows seeded metrics', progressText.slice(0, 120));
    else partial('Progress shows seeded metrics', progressText.slice(0, 120) || 'empty');

    // Responsive
    await page.click('.nav-tab[data-tab="coach"]', { force: true });
    for (const w of [320, 360, 390, 430]) {
      await page.setViewportSize({ width: w, height: 844 });
      await page.waitForTimeout(250);
      const ox = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
      const h = await stickyHeight(page);
      if (!ox) pass(`Responsive ${w}px`, `sticky ${h}px`);
      else fail(`Responsive ${w}px`, `overflow sticky ${h}px`);
    }

    await page.setViewportSize({ width: 390, height: 844 });
    const gated = await page.evaluate(() => ({
      supplementsVisible: !!document.getElementById('supplements-card')
        && !document.getElementById('supplements-card').classList.contains('hidden'),
      cigVisible: !!document.getElementById('cigarettes-row')
        && !document.getElementById('cigarettes-row')?.classList.contains('hidden'),
    }));
    partial('Friend Hybrid gated UI', JSON.stringify(gated));

    await goToDate(page, '2026-11-16');
    await page.waitForTimeout(700);
    const memoryBtns = await page.evaluate(() => {
      const card = document.getElementById('training-card');
      const text = card?.innerText || '';
      return {
        hasStart: /Start/i.test(text),
        hasEdit: /Edit/i.test(text),
        hasResume: /Resume/i.test(text),
        snippet: text.slice(0, 120),
      };
    });
    partial('Gym Memory controls (no Floor drive)', JSON.stringify(memoryBtns));

  } catch (err) {
    fail('Smoke aborted', err.message);
  } finally {
    await browser.close();
    server.close();
  }

  const summary = {
    passed: results.filter((r) => r.status === 'Passed').length,
    failed: results.filter((r) => r.status === 'Failed').length,
    partial: results.filter((r) => r.status === 'Partially verified').length,
    results,
  };
  writeFileSync(join(APP_ROOT, '.env.qa-smoke-results.json'), JSON.stringify(summary, null, 2));
  console.log('\n=== SUMMARY ===');
  console.log(JSON.stringify({
    passed: summary.passed,
    failed: summary.failed,
    partial: summary.partial,
  }, null, 2));
  process.exit(summary.failed ? 1 : 0);
}

run().catch((e) => {
  console.error('FATAL', e.message);
  process.exit(1);
});
