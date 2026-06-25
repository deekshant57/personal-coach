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
