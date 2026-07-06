#!/usr/bin/env node
/**
 * Full-app browser walk-through (real Supabase login).
 * Read-only: no writes to today, past, or future dates.
 *
 * Usage:
 *   COACH_TEST_EMAIL=you@example.com COACH_TEST_PASSWORD=secret \
 *     node scripts/full-app-walkthrough.mjs
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dir = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = join(__dir, '..');
const PORT = 8766;
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

const SHAME = [/welcome back/i, /where have you been/i, /get back on track/i, /guilty/i];

function startStaticServer() {
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

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function run() {
  if (!EMAIL || !PASSWORD) {
    throw new Error('Set COACH_TEST_EMAIL and COACH_TEST_PASSWORD env vars');
  }

  const server = await startStaticServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const results = [];

  try {
    await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle', timeout: 60000 });

    // ── Sign in ─────────────────────────────────────────────────
    await page.waitForSelector('#auth-screen.show', { timeout: 30000 });
    await page.fill('#auth-email', EMAIL);
    await page.fill('#auth-password', PASSWORD);
    await page.click('#auth-submit');

    await page.waitForFunction(() => !document.getElementById('auth-screen')?.classList.contains('show'), {
      timeout: 45000,
    });
    await page.waitForFunction(
      () => !document.querySelector('.app-container')?.classList.contains('is-content-loading'),
      { timeout: 45000 },
    );
    await page.waitForSelector('.nav-tab[data-tab="coach"]', { timeout: 30000 });
    results.push({ step: 'Login', pass: true });

    // ── Today: Coach tab ────────────────────────────────────────
    await page.waitForFunction(() => {
      const el = document.getElementById('plan-directive');
      const t = el?.textContent?.trim() || '';
      return t.length > 20 && !t.startsWith('Loading');
    }, { timeout: 30000 });
    const todayLabel = await page.locator('#date-display').innerText();
    assert(todayLabel.length > 0, 'Date display empty');
    results.push({ step: 'Coach tab loads (today)', pass: true, detail: todayLabel });

    const planText = await page.locator('#plan-directive').innerText();
    assert(planText.length > 0 && !planText.startsWith('Loading'), 'Plan not loaded');
    results.push({ step: 'Today plan loaded', pass: true, detail: planText.slice(0, 80) });

    const gapBanner = page.locator('#gap-return-banner');
    if (await gapBanner.isVisible()) {
      const gapText = (await gapBanner.innerText()).trim();
      for (const re of SHAME) assert(!re.test(gapText), `Gap banner shame copy: ${re}`);
      assert(gapText.includes('Continuing from today.'), 'Gap banner missing neutral copy');
      results.push({ step: 'Gap banner (if shown) is neutral', pass: true, detail: gapText });
    } else {
      results.push({ step: 'Gap banner hidden (no 5+ day gap)', pass: true });
    }

    // Coach sections visible on today
    await page.waitForSelector('#vitals-card:not(.hidden)', { timeout: 10000 });
    results.push({ step: 'Today logging sections visible', pass: true });

    // ── Future date preview (tomorrow) — read-only, no logging ───
    const nextBtn = page.locator('#date-next');
    if (await nextBtn.isEnabled()) {
      await nextBtn.click();
      await page.waitForFunction(() => {
        const sub = document.getElementById('date-off-today-hint');
        return sub?.textContent?.includes('Preview');
      }, { timeout: 15000 });
      await page.waitForFunction(
        () => document.getElementById('vitals-card')?.classList.contains('hidden'),
        { timeout: 15000 },
      );

      const previewHint = await page.locator('#date-off-today-hint').innerText();
      assert(previewHint.includes('Preview'), 'Future date hint missing');

      const vitalsHidden = await page.locator('#vitals-card').isHidden();
      assert(vitalsHidden, 'Vitals should be hidden on future preview');
      const copyDebrief = page.locator('#copy-debrief');
      const exportHidden = await page.locator('#coach-debrief-export-card').isHidden();
      assert(exportHidden || (await copyDebrief.isDisabled()), 'Debrief export should be off on future');
      const foodBanner = page.locator('#food-preview-banner');
      await page.click('.nav-tab[data-tab="food"]');
      await foodBanner.waitFor({ state: 'visible', timeout: 10000 });
      const foodPreview = await foodBanner.innerText();
      assert(foodPreview.includes('Preview only'), foodPreview);

      results.push({
        step: 'Future date preview (read-only)',
        pass: true,
        detail: `${previewHint} · ${foodPreview}`,
      });

      await page.click('.nav-tab[data-tab="coach"]');
      await page.click('#date-prev');
      await page.waitForFunction(
        () => !document.getElementById('vitals-card')?.classList.contains('hidden'),
        { timeout: 15000 },
      );
      results.push({ step: 'Return to today', pass: true });
    } else {
      results.push({ step: 'Future preview skipped (week boundary)', pass: true });
    }

    // ── Other tabs ──────────────────────────────────────────────
    await page.click('.nav-tab[data-tab="week"]');
    await page.waitForSelector('#week-cards:not(:empty)', { timeout: 20000 });
    results.push({ step: 'Week tab loads', pass: true });

    await page.click('.nav-tab[data-tab="progress"]');
    await page.waitForSelector('#tab-progress.active', { timeout: 5000 });
    await page.waitForSelector('#weight-trend-content', { timeout: 10000 });
    results.push({ step: 'Trends tab loads', pass: true });

    await page.click('.nav-tab[data-tab="coach"]');
    results.push({ step: 'Back to Coach tab', pass: true });

    // ── Debrief export card on Coach (today, no copy) ───────────
    const exportCard = page.locator('#coach-debrief-export-card');
    await exportCard.scrollIntoViewIfNeeded();
    assert(await exportCard.isVisible(), 'Debrief export card missing');
    const copyBtn = page.locator('#copy-debrief');
    assert(await copyBtn.isEnabled(), 'Copy should be enabled on today');
    results.push({ step: 'Debrief export available on today', pass: true });

    console.log('\n=== Full app walk-through (read-only) ===\n');
    for (const r of results) {
      console.log(`${r.pass ? 'PASS' : 'FAIL'} — ${r.step}`);
      if (r.detail) console.log(`       ${r.detail}`);
    }
    console.log(`\nAll ${results.length} steps passed. No data written.\n`);
  } finally {
    await browser.close();
    server.close();
  }
}

run().catch((err) => {
  console.error('\nWALKTHROUGH FAILED:', err.message);
  process.exit(1);
});
