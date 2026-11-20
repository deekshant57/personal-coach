#!/usr/bin/env node
/**
 * Closing UX smoke: F2 footer clearance + UX-03 tab chrome + Food basics.
 * Read-only. Loads COACH_TEST_* from env / .env.qa. Never prints credentials.
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dir = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = join(__dir, '..');
const PORT = Number(process.env.QA_CLOSEOUT_PORT || 8779);
const BASE = `http://127.0.0.1:${PORT}`;

function loadEnvQa() {
  const p = join(APP_ROOT, '.env.qa');
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    if (!process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
loadEnvQa();

const EMAIL = process.env.COACH_TEST_EMAIL;
const PASSWORD = process.env.COACH_TEST_PASSWORD;
if (!EMAIL || !PASSWORD) {
  console.error('Missing COACH_TEST_EMAIL / COACH_TEST_PASSWORD');
  process.exit(1);
}

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
};

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
      res.writeHead(200, {
        'Content-Type': MIME[extname(filePath)] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      res.end(readFileSync(filePath));
    });
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok: !!ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} — ${name}${detail ? ` · ${detail}` : ''}`);
}

async function signIn(page) {
  await page.goto(`${BASE}/?v=39#tab=coach&date=2026-11-20`, { waitUntil: 'domcontentloaded' });
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
  await page.waitForTimeout(1200);
}

async function measureFooterClearance(page) {
  return page.evaluate(async () => {
    document.querySelector('.nav-tab[data-tab="food"]')?.click();
    await new Promise((r) => setTimeout(r, 900));
    const notes = document.getElementById('food-notes');
    const footer = document.getElementById('food-sticky-footer');
    const tab = document.getElementById('tab-food');
    const spacer = document.querySelector('.food-tab-spacer');
    notes?.scrollIntoView({ block: 'end', behavior: 'instant' });
    await new Promise((r) => setTimeout(r, 200));
    window.scrollTo(0, document.documentElement.scrollHeight);
    await new Promise((r) => setTimeout(r, 200));
    const nr = notes.getBoundingClientRect();
    const fr = footer.getBoundingClientRect();
    return {
      clear: nr.bottom <= fr.top + 1,
      gap: Math.round(fr.top - nr.bottom),
      spacerH: Math.round(spacer?.getBoundingClientRect().height || 0),
      space: getComputedStyle(tab).getPropertyValue('--food-footer-space').trim(),
      sheetOpen: document.getElementById('food-add-sheet')?.classList.contains('open'),
      dayProgressHidden: document.getElementById('day-progress')?.classList.contains('hidden'),
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      date: document.getElementById('date-display')?.textContent,
      vw: document.documentElement.clientWidth,
      vh: window.innerHeight,
    };
  });
}

async function run() {
  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  let failed = 0;
  try {
    const page = await browser.newPage({ viewport: { width: 320, height: 568 } });
    page.setDefaultTimeout(45000);
    await signIn(page);

    // Cold food load
    await page.goto(`${BASE}/?v=39#tab=food&date=2026-11-20`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    documentClick: {
      await page.evaluate(() => document.querySelector('.nav-tab[data-tab="food"]')?.click());
      await page.waitForTimeout(800);
    }

    // Settle after async loadTodayData / updateDayProgress races on cold Food boot.
    await page.waitForTimeout(600);
    const cold = await page.evaluate(() => ({
      tab: document.querySelector('.nav-tab.active')?.dataset.tab,
      dayProgressHidden: document.getElementById('day-progress')?.classList.contains('hidden'),
      sheetOpen: document.getElementById('food-add-sheet')?.classList.contains('open'),
      logged: !!document.querySelector('.food-logged-kicker'),
      planned: !!document.querySelector('#food-planned-block, .food-planned-block, .food-planned'),
      date: document.getElementById('date-display')?.textContent,
    }));
    check('UX-03 day-progress hidden on Food (cold)', cold.dayProgressHidden && cold.tab === 'food', `${cold.date} tab=${cold.tab}`);
    check('UX-04/F13 sheet not auto-open', !cold.sheetOpen);
    check('F1 Planned present', cold.planned);
    check('F1 Logged kicker present', cold.logged);

    const f2 = await measureFooterClearance(page);
    check('F2 notes clear sticky footer @320', f2.clear, `gap=${f2.gap}px space=${f2.space} spacer=${f2.spacerH}`);
    check('F2 no horizontal overflow @320', !f2.overflowX);

    // Date change must not re-show day-progress on Food
    await page.evaluate(() => {
      location.hash = '#tab=food&date=2026-11-19';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    await page.waitForTimeout(1400);
    await page.evaluate(() => document.querySelector('.nav-tab[data-tab="food"]')?.click());
    await page.waitForTimeout(700);
    const afterDate = await page.evaluate(() => ({
      dayProgressHidden: document.getElementById('day-progress')?.classList.contains('hidden'),
      date: document.getElementById('date-display')?.textContent,
      diary: document.getElementById('food-diary-title')?.textContent,
    }));
    check('UX-03 day-progress stays hidden after date change', afterDate.dayProgressHidden, afterDate.date);
    check('F11 historical meal title has date', /Nov/.test(afterDate.diary || ''), afterDate.diary);

    // Week AR label
    await page.evaluate(() => document.querySelector('.nav-tab[data-tab="week"]')?.click());
    await page.waitForTimeout(1000);
    const ar = await page.evaluate(() => {
      const card = [...document.querySelectorAll('.week-card')].find((c) => c.dataset.date === '2026-11-19');
      return {
        badge: card?.querySelector('.day-badge, .badge')?.textContent?.trim(),
        dayProgressHidden: document.getElementById('day-progress')?.classList.contains('hidden'),
      };
    });
    check('UX-09 Active Recovery not Rest', ar.badge === 'Active Recovery', ar.badge);
    check('UX-03 day-progress hidden on Plan', ar.dayProgressHidden);

    // Progress Account last
    await page.evaluate(() => document.querySelector('.nav-tab[data-tab="progress"]')?.click());
    await page.waitForTimeout(800);
    const prog = await page.evaluate(() => {
      const titles = [...document.querySelectorAll('#tab-progress .trends-domain-title')].map((t) => t.textContent.trim());
      return {
        accountLast: titles[titles.length - 1] === 'Account',
        titles,
        dayProgressHidden: document.getElementById('day-progress')?.classList.contains('hidden'),
      };
    });
    check('UX-07 Account at bottom of Progress', prog.accountLast, prog.titles.join(' > '));

    // Other viewports — overflow only
    for (const vp of [
      { w: 360, h: 740 },
      { w: 390, h: 844 },
      { w: 430, h: 932 },
    ]) {
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await page.evaluate(() => document.querySelector('.nav-tab[data-tab="food"]')?.click());
      await page.waitForTimeout(500);
      const m = await measureFooterClearance(page);
      check(`F2 notes clear @${vp.w}x${vp.h}`, m.clear, `gap=${m.gap}px`);
      check(`No overflow-x @${vp.w}`, !m.overflowX);
    }

    failed = results.filter((r) => !r.ok).length;
    console.log(`\n${results.length - failed}/${results.length} checks passed`);
  } finally {
    await browser.close();
    server.close();
  }
  process.exit(failed ? 1 : 0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
