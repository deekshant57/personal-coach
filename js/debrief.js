// Debrief export — pre-flight checklist + copy CTA (lives on Coach tab)
import { state, getToday, formatDayDisplayFromIso, isMonday, isViewingFuture, showToast } from './app.js';
import { formatFoodLabel } from './data.js';
import { formatSlotLabel } from './day-shift.js';
import { computeDebriefReadiness } from './day-progress.js';
import { buildBodyCompDebriefSection } from './progress.js';
import { getMondayCheckInLine } from './week-stats.js';
import { formatSupplementDebriefLine } from './supplements-data.js';
import { formatDebriefPreviewHtml } from './debrief-preview-format.js';
import { setButtonLoading } from './spinner.js';
import { expandVitalsCard } from './vitals-ui.js';

let mondayCheckInLine = null;
let mondayCheckInLoading = false;

async function loadMondayCheckInLine({ force = false } = {}) {
  if (!isMonday(state.currentDate)) {
    mondayCheckInLine = null;
    return;
  }
  mondayCheckInLoading = true;
  try {
    mondayCheckInLine = await getMondayCheckInLine(
      state.currentDate,
      state.vitals,
      { force },
    );
  } catch (err) {
    console.error('Monday check-in stats:', err);
    mondayCheckInLine = null;
  } finally {
    mondayCheckInLoading = false;
  }
}

function valOrMissing(value, suffix = '') {
  if (value == null || value === '') return 'not logged';
  return `${value}${suffix}`;
}

function renderDebriefPreview(text) {
  const preview = document.getElementById('debrief-preview');
  if (!preview) return;
  preview.innerHTML = formatDebriefPreviewHtml(text);
  preview.classList.remove('hidden');
}

function buildDebriefText() {
  const date = getToday();
  const dateLabel = formatDayDisplayFromIso(date);
  const plan = state.currentPlan;
  const vitals = state.vitals || {};
  const foodLogs = state.foodLogs || {};
  const runLog = state.runLog;
  const workoutLog = state.workoutLog;

  let text = `End of day tracker upload — ${dateLabel}\n`;

  if (plan?.run_type && runLog) {
    text += `\n## Run\n`;
    text += `- **Date:** ${dateLabel}\n`;
    text += `- **Planned:** ${plan.run_type} ${plan.run_km} km\n`;
    text += `- **Done?** ${runLog.done ? 'Yes' : 'No'}\n`;
    if (runLog.done) {
      text += `- **Actual km / Time / Pace / Cadence / RPE / Knee:** `;
      text += `${valOrMissing(runLog.actual_km, ' km')} / ${valOrMissing(runLog.time_display)} / ${valOrMissing(runLog.avg_pace)} / ${valOrMissing(runLog.cadence)} / ${valOrMissing(runLog.rpe)} / ${valOrMissing(runLog.knee_status)}\n`;
    }
    if (runLog.notes) text += `- **Notes:** ${runLog.notes}\n`;
  } else if (plan?.run_type) {
    text += `\n## Run\n`;
    text += `- **Date:** ${dateLabel}\n`;
    text += `- **Planned:** ${plan.run_type} ${plan.run_km} km\n`;
    text += `- **Done?** No (not logged)\n`;
  }

  if (plan?.workout_plan && workoutLog) {
    text += `\n## Workout\n`;
    text += `- **Date:** ${dateLabel}\n`;
    text += `- **Planned:** ${plan.workout_plan}\n`;
    text += `- **Done?** ${workoutLog.done ? 'Yes' : 'No'}\n`;
    if (workoutLog.done && workoutLog.what_i_did) {
      text += `- **What I Did / RPE:** ${workoutLog.what_i_did} / RPE ${valOrMissing(workoutLog.rpe)}\n`;
    }
    if (workoutLog.notes) text += `- **Notes:** ${workoutLog.notes}\n`;
  } else if (plan?.workout_plan) {
    text += `\n## Workout\n`;
    text += `- **Date:** ${dateLabel}\n`;
    text += `- **Planned:** ${plan.workout_plan}\n`;
    text += `- **Done?** No (not logged)\n`;
  }

  text += `\n## Food\n`;
  text += `- **Date:** ${dateLabel}\n`;
  text += `- **Everything I Ate:**\n`;

  let totalProtein = 0;
  let totalCalories = 0;

  const slotOrder = ['pre-run', 'pre-workout', 'post-run', 'post-workout', 'breakfast', 'lunch', 'snack', 'dinner'];

  for (const slot of slotOrder) {
    if (!foodLogs[slot]) continue;
    const data = foodLogs[slot];
    const items = data.items || [];
    const names = items.map((i) => formatFoodLabel(i, i.qty || 1).toLowerCase()).join(', ');
    const label = formatSlotLabel(slot);
    text += `  ${label}: ${names || data.customText || '(empty)'}`;
    if (data.customText && names) text += ` — ${data.customText}`;
    text += `\n`;
    totalProtein += data.totalProtein || 0;
    totalCalories += data.totalCalories || 0;
  }

  if (!Object.keys(foodLogs).length) {
    text += `  (no meals logged)\n`;
  }

  text += `- **Protein:** ${totalProtein ? Math.round(totalProtein) : 'not logged'}g (calculated) / **Calories:** ${totalCalories ? `~${Math.round(totalCalories)}` : 'not logged'} kcal\n`;
  text += `- **Sleep:** ${valOrMissing(vitals.sleep_hours, 'h')} / **Cigs:** ${valOrMissing(vitals.cigarettes)} / **Weight:** ${vitals.weight_kg != null ? `${vitals.weight_kg} kg` : 'not logged'}\n`;

  text += `\n## Supplements\n`;
  text += `- **Date:** ${dateLabel}\n`;
  text += `- **Taken:** ${state.supplementLog ? formatSupplementDebriefLine(state.supplementLog, date) : 'not logged'}\n`;

  const notes = document.getElementById('input-notes')?.value || vitals.notes || '';
  text += `\n## Notes\n`;
  text += notes ? notes + '\n' : '(none)\n';

  if (isMonday(state.currentDate)) {
    text += `\n## Monday Check-in\n`;
    text += `- **Date:** ${dateLabel}\n`;
    text += `- **Weight / Waist / Longest run / Avg sleep / Knee / Cigs/day:** `;
    text += `${mondayCheckInLoading ? 'Loading…' : (mondayCheckInLine || '—')}\n`;
  }

  text += buildBodyCompDebriefSection(state.bodyCompScanForDate);

  return text;
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

function navigateToTask(action) {
  if (action === 'meals') {
    document.querySelector('.nav-tab[data-tab="food"]')?.click();
    return;
  }
  document.querySelector('.nav-tab[data-tab="coach"]')?.click();
  requestAnimationFrame(() => {
    if (action === 'vitals') {
      expandVitalsCard();
      document.getElementById('vitals-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (action === 'training') {
      document.getElementById('training-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (action === 'supplements') {
      document.getElementById('supplements-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

function getIncompleteWarning(readiness) {
  const missing = readiness.tasks.filter((t) => !t.done);
  if (!missing.length) return '';
  const labels = missing.map((t) => t.label).join(', ');
  return `${missing.length} item${missing.length === 1 ? '' : 's'} not logged — ${labels}. Export anyway?`;
}

export async function refreshDebrief() {
  const preflight = document.getElementById('debrief-preflight');
  const list = document.getElementById('debrief-preflight-list');
  const status = document.getElementById('debrief-preflight-status');
  const preview = document.getElementById('debrief-preview');
  const copyBtn = document.getElementById('copy-debrief');
  const futureNote = document.getElementById('debrief-future-note');
  const warnEl = document.getElementById('debrief-incomplete-warning');
  const exportCard = document.getElementById('coach-debrief-export-card');

  if (!preflight || !list || !copyBtn) return;

  if (isViewingFuture()) {
    preflight.classList.add('hidden');
    preview?.classList.add('hidden');
    copyBtn.disabled = true;
    warnEl?.classList.add('hidden');
    exportCard?.classList.add('hidden');
    if (futureNote) futureNote.classList.remove('hidden');
    return;
  }

  exportCard?.classList.remove('hidden');
  if (futureNote) futureNote.classList.add('hidden');
  preflight.classList.remove('hidden');

  const { tasks, ready } = computeDebriefReadiness();

  status.textContent = ready
    ? 'All logging complete'
    : `${tasks.filter((t) => !t.done).length} item(s) still open`;
  status.classList.toggle('ready', ready);

  list.innerHTML = tasks.map((task) => `
    <li class="debrief-preflight-item${task.done ? ' done' : ''}">
      <span class="debrief-preflight-mark" aria-hidden="true">${task.done ? '✓' : '○'}</span>
      <span class="debrief-preflight-label">${task.label}</span>
      ${task.done ? '' : `<button type="button" class="debrief-preflight-go" data-action="${task.action}">Log</button>`}
    </li>
  `).join('');

  if (warnEl) {
    const warn = getIncompleteWarning({ tasks, ready });
    warnEl.textContent = warn;
    warnEl.classList.toggle('hidden', !warn);
  }

  if (isMonday(state.currentDate)) {
    mondayCheckInLine = null;
    renderDebriefPreview(buildDebriefText());
    await loadMondayCheckInLine();
  } else {
    mondayCheckInLine = null;
  }

  renderDebriefPreview(buildDebriefText());

  copyBtn.disabled = false;
  copyBtn.textContent = 'Copy Day Log';
}

export function refreshDebriefIfActive() {
  refreshDebrief();
}

export function scrollToDebriefExport() {
  document.getElementById('coach-debrief-export-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  refreshDebrief();
}

export function initDebrief() {
  document.getElementById('debrief-preflight-list')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.debrief-preflight-go');
    if (!btn) return;
    navigateToTask(btn.dataset.action);
  });

  document.getElementById('copy-debrief')?.addEventListener('click', async () => {
    const copyBtn = document.getElementById('copy-debrief');
    if (copyBtn?.disabled || isViewingFuture()) return;
    const idleLabel = 'Copy Day Log';
    setButtonLoading(copyBtn, true, idleLabel);
    try {
      if (isMonday(state.currentDate)) {
        await loadMondayCheckInLine({ force: true });
      }
      const text = buildDebriefText();
      await copyToClipboard(text);
      showToast('Copied — paste into Cursor');
      copyBtn.textContent = 'Copied';
      window.setTimeout(() => {
        copyBtn.textContent = idleLabel;
      }, 1500);
    } finally {
      setButtonLoading(copyBtn, false, idleLabel);
      copyBtn.disabled = false;
    }
  });

  refreshDebrief();
}
