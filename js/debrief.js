// Debrief tab — pre-flight checklist + single copy CTA (P3)
import { state, getToday, formatDayDisplayFromIso, isMonday, isViewingFuture, showToast } from './app.js';
import { SLOT_LABELS, formatFoodLabel } from './data.js';
import { computeDebriefReadiness } from './day-progress.js';
import { setButtonLoading } from './spinner.js';
import { expandVitalsCard } from './vitals-ui.js';

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
      text += `${runLog.actual_km || '-'} km / ${runLog.time_display || '-'} / ${runLog.avg_pace || '-'} / ${runLog.cadence || '-'} / ${runLog.rpe || '-'} / ${runLog.knee_status || '-'}\n`;
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
      text += `- **What I Did / RPE:** ${workoutLog.what_i_did} / RPE ${workoutLog.rpe || '-'}\n`;
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
    const label = SLOT_LABELS[slot] || slot;
    text += `  ${label}: ${names || data.customText || '(empty)'}`;
    if (data.customText && names) text += ` — ${data.customText}`;
    text += `\n`;
    totalProtein += data.totalProtein || 0;
    totalCalories += data.totalCalories || 0;
  }

  text += `- **Protein:** ${Math.round(totalProtein)}g (calculated) / **Calories:** ~${Math.round(totalCalories)} kcal\n`;
  text += `- **Sleep:** ${vitals.sleep_hours || '-'}h / **Cigs:** ${vitals.cigarettes ?? '-'} / **Weight:** ${vitals.weight_kg || '-'} kg\n`;

  const notes = document.getElementById('input-notes')?.value || vitals.notes || '';
  text += `\n## Notes / Deviations\n`;
  text += notes ? notes + '\n' : '(none)\n';

  if (isMonday(state.currentDate)) {
    text += `\n## Monday Check-in\n`;
    text += `- **Date:** ${dateLabel}\n`;
    text += `- **Weight / Waist / Longest run / Avg sleep / Knee / Cigs/day:** `;
    text += `${vitals.weight_kg || '-'} / ${vitals.waist_inches || '-'} / - / ${vitals.sleep_hours || '-'} / `;
    text += `${state.runLog?.knee_status || '-'} / ${vitals.cigarettes ?? '-'}\n`;
  }

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
  document.querySelector('.nav-tab[data-tab="today"]')?.click();
  requestAnimationFrame(() => {
    if (action === 'vitals') {
      expandVitalsCard();
      document.getElementById('vitals-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (action === 'training') {
      document.getElementById('training-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

export function refreshDebrief() {
  const preflight = document.getElementById('debrief-preflight');
  const list = document.getElementById('debrief-preflight-list');
  const status = document.getElementById('debrief-preflight-status');
  const preview = document.getElementById('debrief-preview');
  const copyBtn = document.getElementById('copy-debrief');
  const futureNote = document.getElementById('debrief-future-note');

  if (!preflight || !list || !copyBtn) return;

  if (isViewingFuture()) {
    preflight.classList.add('hidden');
    preview.classList.add('hidden');
    copyBtn.disabled = true;
    if (futureNote) futureNote.classList.remove('hidden');
    return;
  }

  if (futureNote) futureNote.classList.add('hidden');
  preflight.classList.remove('hidden');

  const { tasks, ready } = computeDebriefReadiness();

  status.textContent = ready
    ? 'All logging complete — ready to copy'
    : 'Finish logging before copying';
  status.classList.toggle('ready', ready);

  list.innerHTML = tasks.map((task) => `
    <li class="debrief-preflight-item${task.done ? ' done' : ''}">
      <span class="debrief-preflight-mark" aria-hidden="true">${task.done ? '✓' : '○'}</span>
      <span class="debrief-preflight-label">${task.label}</span>
      ${task.done ? '' : `<button type="button" class="debrief-preflight-go" data-action="${task.action}">Log</button>`}
    </li>
  `).join('');

  preview.textContent = buildDebriefText();
  preview.classList.remove('hidden');

  copyBtn.disabled = !ready;
  copyBtn.textContent = ready ? 'Copy Debrief to Clipboard' : 'Complete logging to copy';
}

export function refreshDebriefIfActive() {
  if (document.getElementById('tab-debrief')?.classList.contains('active')) {
    refreshDebrief();
  }
}

export function initDebrief() {
  document.getElementById('debrief-preflight-list')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.debrief-preflight-go');
    if (!btn) return;
    navigateToTask(btn.dataset.action);
  });

  document.getElementById('copy-debrief')?.addEventListener('click', async () => {
    const copyBtn = document.getElementById('copy-debrief');
    if (!computeDebriefReadiness().ready || copyBtn?.disabled) return;
    const idleLabel = copyBtn.textContent.trim();
    setButtonLoading(copyBtn, true, idleLabel);
    try {
      const text = buildDebriefText();
      await copyToClipboard(text);
      showToast('Copied — paste into Cursor');
    } finally {
      setButtonLoading(copyBtn, false, idleLabel);
    }
  });

  refreshDebrief();
}
