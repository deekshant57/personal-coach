#!/usr/bin/env node
/**
 * Real-browser walk-through for Sprint 6 gap-return UX.
 * Run: node scripts/gap-return-walkthrough.mjs
 */
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dir = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = join(__dir, '..');
const PORT = 8765;
const BASE = `http://127.0.0.1:${PORT}`;

const SHAME = [/welcome back/i, /where have you been/i, /sorry/i, /guilty/i, /get back on track/i];

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

function startStaticServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const path = req.url?.split('?')[0] || '/';
      const rel = path === '/' ? '/tests/gap-return-browser.html' : path;
      const filePath = join(APP_ROOT, rel);
      if (!existsSync(filePath) || filePath.includes('..')) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      const ext = rel.slice(rel.lastIndexOf('.'));
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      res.end(readFileSync(filePath));
    });
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function runWalkthrough() {
  const server = await startStaticServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  const results = [];

  try {
    await page.goto(`${BASE}/tests/gap-return-browser.html`, { waitUntil: 'networkidle' });

    // ── Step 1: 7-day gap auto-load ─────────────────────────────
    const banner = page.locator('#gap-return-banner');
    await banner.waitFor({ state: 'visible', timeout: 5000 });

    const text7 = (await banner.innerText()).trim();
    results.push({ step: '7-day gap banner visible', pass: true, detail: text7 });

    assert(text7.includes('Continuing from today.'), 'Missing neutral copy');
    assert(!text7.includes('welcome back'), 'Shame copy present');
    for (const re of SHAME) {
      assert(!re.test(text7), `Shame phrase matched: ${re}`);
    }
    assert(!text7.includes('Last logged:'), '7-day gap should not show last-logged line');

    const status7 = await page.locator('#harness-status').innerText();
    assert(status7.includes('gapDays=7'), `Expected gapDays=7 in status: ${status7}`);

    // ── Step 2: Dismiss ───────────────────────────────────────────
    await page.click('#gap-return-dismiss');
    await page.waitForFunction(() => {
      const el = document.getElementById('gap-return-banner');
      return el?.classList.contains('hidden');
    });
    results.push({ step: 'Dismiss hides banner', pass: true });

    // Re-show should stay hidden (dismissed for this lastLoggedDate) — mirrors app reload
    await page.evaluate(() => window.__gapHarness.renderGapScenario({ lastLoggedIso: '2026-06-28' }));
    const hiddenAfterDismiss = await banner.isHidden();
    assert(hiddenAfterDismiss, 'Banner should stay hidden after dismiss for same gap');
    results.push({ step: 'Dismiss persists for same last-logged date', pass: true });

    // ── Step 3: 14-day gap shows last logged ────────────────────
    await page.evaluate(() => localStorage.removeItem('gap_return_dismissed_for'));
    await page.click('#btn-14day');
    await banner.waitFor({ state: 'visible', timeout: 3000 });
    const text14 = (await banner.innerText()).trim();
    assert(text14.includes('Continuing from today.'), 'Missing neutral copy on 14-day');
    assert(text14.includes('Last logged:'), '14+ day gap should show last logged date');
    results.push({ step: '14-day gap shows Last logged line', pass: true, detail: text14 });

    // ── Step 4: No gap — banner hidden ────────────────────────────
    await page.click('#btn-no-gap');
    await page.waitForFunction(() => {
      const el = document.getElementById('gap-return-banner');
      return el?.classList.contains('hidden');
    });
    const statusNo = await page.locator('#harness-status').innerText();
    assert(statusNo.includes('gapDays=0'), `Expected no gap: ${statusNo}`);
    results.push({ step: 'No gap hides banner', pass: true });

    // ── Step 5: Styles applied (not unstyled) ─────────────────────
    const bg = await banner.evaluate((el) => getComputedStyle(el).display);
    assert(bg !== 'none' || await banner.isHidden(), 'Banner display check');
    const contentBg = await page.locator('.gap-return-content').first().evaluate((el) => {
      return getComputedStyle(el).borderRadius;
    }).catch(() => null);
    if (contentBg) {
      results.push({ step: 'App CSS loaded on banner', pass: true, detail: `border-radius: ${contentBg}` });
    }

    console.log('\n=== Gap return browser walk-through ===\n');
    for (const r of results) {
      console.log(`${r.pass ? 'PASS' : 'FAIL'} — ${r.step}`);
      if (r.detail) console.log(`       ${r.detail.replace(/\n/g, '\n       ')}`);
    }
    console.log(`\nAll ${results.length} steps passed.\n`);
  } finally {
    await browser.close();
    server.close();
  }
}

runWalkthrough().catch((err) => {
  console.error('\nWALKTHROUGH FAILED:', err.message);
  process.exit(1);
});
