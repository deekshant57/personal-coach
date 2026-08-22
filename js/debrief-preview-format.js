function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Readable preview — copy payload stays markdown via buildDebriefText(). */
export function formatDebriefPreviewHtml(text) {
  const lines = text.split('\n');
  const parts = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      parts.push('</ul>');
      inList = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const trimmed = line.trim();
    if (!trimmed) {
      closeList();
      continue;
    }

    if (trimmed.startsWith('End of day tracker upload')) {
      closeList();
      parts.push(`<p class="debrief-preview-title">${escapeHtml(trimmed)}</p>`);
      continue;
    }

    if (trimmed.startsWith('## ')) {
      closeList();
      parts.push(`<h3 class="debrief-preview-section">${escapeHtml(trimmed.slice(3))}</h3>`);
      continue;
    }

    const bulletMatch = trimmed.match(/^- \*\*(.+?)\*\*\s*:?\s*(.*)$/);
    if (bulletMatch) {
      if (!inList) {
        parts.push('<ul class="debrief-preview-list">');
        inList = true;
      }
      const label = bulletMatch[1];
      const value = bulletMatch[2].trim();
      const valueHtml = value
        ? `<span class="debrief-preview-val">${escapeHtml(value)}</span>`
        : '';
      parts.push(
        `<li><span class="debrief-preview-key">${escapeHtml(label)}</span>${valueHtml ? ` ${valueHtml}` : ''}</li>`,
      );
      continue;
    }

    if (/^\s{2,}\S/.test(line) && !trimmed.startsWith('-')) {
      if (!inList) {
        parts.push('<ul class="debrief-preview-list debrief-preview-meals">');
        inList = true;
      }
      parts.push(`<li class="debrief-preview-meal">${escapeHtml(trimmed)}</li>`);
      continue;
    }

    closeList();
    const muted = trimmed.startsWith('(') && trimmed.endsWith(')');
    parts.push(
      `<p class="debrief-preview-line${muted ? ' debrief-preview-muted' : ''}">${escapeHtml(trimmed)}</p>`,
    );
  }

  closeList();
  return parts.join('');
}
