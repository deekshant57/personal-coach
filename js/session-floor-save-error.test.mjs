/**
 * Floor save-error Retry visibility — compact date strip must not hide Retry.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(__dir, '..', 'css/style.css'), 'utf8');
const html = readFileSync(join(__dir, '..', 'index.html'), 'utf8');
const saveState = readFileSync(join(__dir, 'save-state.js'), 'utf8');
const todayJs = readFileSync(join(__dir, 'today.js'), 'utf8');

function ruleBody(selectorStart) {
  const idx = css.indexOf(selectorStart);
  assert.ok(idx >= 0, `missing rule starting ${selectorStart}`);
  const open = css.indexOf('{', idx);
  const close = css.indexOf('}', open);
  return css.slice(idx, close + 1);
}

test('save-error banner and Retry live in sticky context', () => {
  assert.match(html, /id="save-error-banner"/);
  assert.match(html, /id="save-error-retry"/);
  const sticky = html.slice(
    html.indexOf('class="app-sticky-context'),
    html.indexOf('class="app-header-secondary"'),
  );
  assert.match(sticky, /id="save-error-banner"/);
  assert.match(sticky, /id="save-error-retry"/);
  assert.match(sticky, /id="date-header"/);
  assert.match(sticky, /id="macro-spine"/);
});

test('Floor hide rule excepts date header and save-error banner only', () => {
  const rule = ruleBody('body.session-floor-active .app-sticky-context > :not(');
  assert.match(rule, /:not\(#date-header,\s*#save-error-banner\)/);
  assert.match(rule, /display:\s*none\s*!important/);
  assert.doesNotMatch(rule, /#macro-spine/);
});

test('Floor still hides idle save-error banner and shows it only when not .hidden', () => {
  const hidden = ruleBody('body.session-floor-active #save-error-banner.hidden');
  assert.match(hidden, /display:\s*none\s*!important/);
  const shown = ruleBody('body.session-floor-active #save-error-banner:not(.hidden)');
  assert.match(shown, /display:\s*flex\s*!important/);
});

test('Floor compact strip still hides macros and secondary header', () => {
  const hideKids = ruleBody('body.session-floor-active .app-sticky-context > :not(');
  assert.match(hideKids, /display:\s*none\s*!important/);
  const secondary = ruleBody('body.session-floor-active .app-header-secondary');
  assert.match(secondary, /display:\s*none\s*!important/);
});

test('Floor bar stays on compact-strip offset unless save-error is visible', () => {
  const bar = ruleBody('body.session-floor-active #session-floor-bar:not(.hidden)');
  assert.match(bar, /top:\s*calc\(48px \+ env\(safe-area-inset-top/);
  const withBanner = ruleBody(
    'body.session-floor-active:has(#save-error-banner:not(.hidden)) #session-floor-bar:not(.hidden)',
  );
  assert.match(withBanner, /top:\s*calc\(112px \+ env\(safe-area-inset-top/);
});

test('Retry still uses the existing save-state retry, not a second machine', () => {
  assert.match(saveState, /getElementById\('save-error-retry'\)\?\.addEventListener\('click'/);
  assert.match(saveState, /export async function retryAllFailed/);
  assert.match(saveState, /retry:\s*\(\)\s*=>\s*trackSave\(/);
  assert.match(todayJs, /pendingCompletion = \{ exitWhenSaved \}/);
  assert.match(todayJs, /async function settlePendingCompletion/);
  assert.equal((todayJs.match(/function retryAllFailed/g) || []).length, 0);
});
