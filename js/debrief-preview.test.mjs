import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDebriefPreviewHtml } from './debrief-preview-format.js';

test('formatDebriefPreviewHtml renders sections and bullets', () => {
  const text = `End of day tracker upload — Sat, 22 Aug,26

## Run
- **Date:** Sat, 22 Aug,26
- **Done?** Yes

## Food
- **Date:** Sat, 22 Aug,26
- **Everything I Ate:**
  breakfast: oats, banana
- **Protein:** 140g (calculated) / **Calories:** ~2000 kcal

(none)`;

  const html = formatDebriefPreviewHtml(text);
  assert.ok(html.includes('debrief-preview-title'));
  assert.ok(html.includes('Run</h3>'));
  assert.ok(html.includes('debrief-preview-key'));
  assert.ok(html.includes('breakfast: oats, banana'));
  assert.ok(!html.includes('## Run'));
  assert.ok(!html.includes('**Done?**'));
});
