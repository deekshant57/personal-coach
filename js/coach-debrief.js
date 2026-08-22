// Coach debrief — read-only Week tab display
import { formatDayDisplayFromIso } from './app.js';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatInline(text) {
  return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

export function renderCoachMarkdown(markdown) {
  const lines = String(markdown || '').split('\n');
  let html = '';
  let inList = false;

  const closeList = () => {
    if (inList) {
      html += '</ul>';
      inList = false;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      closeList();
      continue;
    }

    if (/^##\s+/.test(trimmed)) {
      closeList();
      html += `<h3 class="coach-md-h">${formatInline(trimmed.replace(/^##\s+/, ''))}</h3>`;
      continue;
    }

    if (/^#\s+/.test(trimmed)) {
      closeList();
      html += `<h2 class="coach-md-h coach-md-h--main">${formatInline(trimmed.replace(/^#\s+/, ''))}</h2>`;
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      if (!inList) {
        html += '<ul class="coach-md-ul">';
        inList = true;
      }
      html += `<li>${formatInline(trimmed.replace(/^[-*]\s+/, ''))}</li>`;
      continue;
    }

    if (/^\|.+\|$/.test(trimmed)) {
      closeList();
      html += `<p class="coach-md-p coach-md-table-row">${formatInline(trimmed)}</p>`;
      continue;
    }

    closeList();
    html += `<p class="coach-md-p">${formatInline(trimmed)}</p>`;
  }

  closeList();
  return html || '<p class="text-muted">Empty report</p>';
}

export function formatDebriefWeekRange(startIso, endIso) {
  return `${formatDayDisplayFromIso(startIso)} – ${formatDayDisplayFromIso(endIso)}`;
}

/** First readable paragraph(s) for collapsed Today card. */
export function extractDebriefExcerpt(markdown, maxLen = 280) {
  const lines = String(markdown || '').split('\n');
  const parts = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || /^#/.test(trimmed) || /^\|.+\|$/.test(trimmed)) continue;
    const cleaned = trimmed
      .replace(/^[-*]\s+/, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .trim();
    if (!cleaned || cleaned === '---') continue;
    parts.push(cleaned);
    if (parts.join(' ').length >= maxLen) break;
  }

  let text = parts.join(' ').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  if (text.length > maxLen) return `${text.slice(0, maxLen - 1).trim()}…`;
  return text;
}

export function buildCoachNoteTodayHtml(debrief) {
  const range = formatDebriefWeekRange(debrief.week_covered_start, debrief.week_covered_end);
  const savedOn = formatDayDisplayFromIso(debrief.debrief_monday);
  const composite = debrief.scores?.composite;
  const excerpt = extractDebriefExcerpt(debrief.markdown);

  let meta = `Week ${range} · saved ${savedOn}`;
  if (composite != null) meta += ` · ${composite}/10`;

  return `
    <button type="button" class="coach-note-header" id="coach-note-toggle" aria-expanded="false">
      <span class="coach-note-header-text">
        <span class="coach-note-label">Coach report</span>
        <span class="coach-note-meta">${escapeHtml(meta)}</span>
        ${excerpt ? `<span class="coach-note-excerpt">${escapeHtml(excerpt)}</span>` : ''}
      </span>
      <span class="coach-debrief-chevron" aria-hidden="true"></span>
    </button>
    <div class="coach-note-body hidden" id="coach-note-body">
      <div class="coach-md">${renderCoachMarkdown(debrief.markdown)}</div>
    </div>
    <div class="coach-note-actions">
      <button type="button" class="btn btn-secondary btn-sm" id="coach-note-plan-btn">Full report on Plan</button>
    </div>
  `;
}

export function wireCoachNoteToday(root, { onOpenPlan } = {}) {
  const toggle = root.querySelector('#coach-note-toggle');
  const body = root.querySelector('#coach-note-body');
  toggle?.addEventListener('click', () => {
    if (!body) return;
    body.classList.toggle('hidden');
    const expanded = !body.classList.contains('hidden');
    toggle.setAttribute('aria-expanded', String(expanded));
    root.classList.toggle('expanded', expanded);
  });

  root.querySelector('#coach-note-plan-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    onOpenPlan?.();
  });
}

export function buildCoachDebriefCardHtml(debrief) {
  const range = formatDebriefWeekRange(debrief.week_covered_start, debrief.week_covered_end);
  const savedOn = formatDayDisplayFromIso(debrief.debrief_monday);
  const composite = debrief.scores?.composite;

  let meta = `Week ${range} · saved ${savedOn}`;
  if (composite != null) {
    meta += ` · ${composite}/10`;
  }

  return `
    <button type="button" class="coach-debrief-header" id="coach-debrief-toggle" aria-expanded="false">
      <span class="coach-debrief-header-text">
        <span class="coach-debrief-title">Coach report</span>
        <span class="coach-debrief-meta">${escapeHtml(meta)}</span>
      </span>
      <span class="coach-debrief-chevron" aria-hidden="true"></span>
    </button>
    <div class="coach-debrief-body hidden" id="coach-debrief-body">
      <div class="coach-md">${renderCoachMarkdown(debrief.markdown)}</div>
    </div>
  `;
}

export function wireCoachDebriefCard(root) {
  const toggle = root.querySelector('#coach-debrief-toggle');
  const body = root.querySelector('#coach-debrief-body');
  if (!toggle || !body) return;

  toggle.addEventListener('click', () => {
    body.classList.toggle('hidden');
    const isExpanded = !body.classList.contains('hidden');
    toggle.setAttribute('aria-expanded', String(isExpanded));
    root.classList.toggle('expanded', isExpanded);
  });
}
