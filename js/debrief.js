// Debrief tab — generate paste text + clipboard copy
import { state, getToday, formatDisplay, isMonday } from './app.js';
import { SLOT_LABELS } from './data.js';

export function initDebrief() {
  document.getElementById('generate-debrief').addEventListener('click', generateDebrief);
  document.getElementById('copy-debrief').addEventListener('click', copyDebrief);
}

function generateDebrief() {
  const date = getToday();
  const plan = state.currentPlan;
  const vitals = state.vitals || {};
  const foodLogs = state.foodLogs || {};
  const runLog = state.runLog;
  const workoutLog = state.workoutLog;

  let text = `End of day tracker upload — ${date}\n`;

  // ── Run section ──────────────────────────────────────────
  if (plan?.run_type && runLog) {
    text += `\n## Run\n`;
    text += `- **Date:** ${date}\n`;
    text += `- **Planned:** ${plan.run_type} ${plan.run_km} km\n`;
    text += `- **Done?** ${runLog.done ? 'Yes' : 'No'}\n`;
    if (runLog.done) {
      text += `- **Actual km / Time / Pace / Cadence / RPE / Knee:** `;
      text += `${runLog.actual_km || '-'} km / ${runLog.time_display || '-'} / ${runLog.avg_pace || '-'} / ${runLog.cadence || '-'} / ${runLog.rpe || '-'} / ${runLog.knee_status || '-'}\n`;
    }
    if (runLog.notes) text += `- **Notes:** ${runLog.notes}\n`;
  } else if (plan?.run_type) {
    text += `\n## Run\n`;
    text += `- **Date:** ${date}\n`;
    text += `- **Planned:** ${plan.run_type} ${plan.run_km} km\n`;
    text += `- **Done?** No (not logged)\n`;
  }

  // ── Workout section ──────────────────────────────────────
  if (plan?.workout_plan && workoutLog) {
    text += `\n## Workout\n`;
    text += `- **Date:** ${date}\n`;
    text += `- **Planned:** ${plan.workout_plan}\n`;
    text += `- **Done?** ${workoutLog.done ? 'Yes' : 'No'}\n`;
    if (workoutLog.done && workoutLog.what_i_did) {
      text += `- **What I Did / RPE:** ${workoutLog.what_i_did} / RPE ${workoutLog.rpe || '-'}\n`;
    }
    if (workoutLog.notes) text += `- **Notes:** ${workoutLog.notes}\n`;
  } else if (plan?.workout_plan) {
    text += `\n## Workout\n`;
    text += `- **Date:** ${date}\n`;
    text += `- **Planned:** ${plan.workout_plan}\n`;
    text += `- **Done?** No (not logged)\n`;
  }

  // ── Food section ─────────────────────────────────────────
  text += `\n## Food\n`;
  text += `- **Date:** ${date}\n`;
  text += `- **Everything I Ate:**\n`;

  let totalProtein = 0;
  let totalCalories = 0;

  const slotOrder = ['pre-run', 'pre-workout', 'post-run', 'post-workout', 'breakfast', 'lunch', 'snack', 'dinner'];
  const loggedSlots = Object.keys(foodLogs);

  for (const slot of slotOrder) {
    if (!foodLogs[slot]) continue;
    const data = foodLogs[slot];
    const items = data.items || [];
    const names = items.map(i => `${i.qty > 1 ? i.qty + ' ' : ''}${i.name.toLowerCase()}`).join(', ');
    const label = SLOT_LABELS[slot] || slot;
    text += `  ${label}: ${names || data.customText || '(empty)'}`;
    if (data.customText && names) text += ` — ${data.customText}`;
    text += `\n`;
    totalProtein += data.totalProtein || 0;
    totalCalories += data.totalCalories || 0;
  }

  text += `- **Protein:** ${Math.round(totalProtein)}g (calculated) / **Calories:** ~${Math.round(totalCalories)} kcal\n`;
  text += `- **Sleep:** ${vitals.sleep_hours || '-'}h / **Cigs:** ${vitals.cigarettes ?? '-'} / **Weight:** ${vitals.weight_kg || '-'} kg\n`;

  // ── Notes ────────────────────────────────────────────────
  const notes = document.getElementById('input-notes')?.value || vitals.notes || '';
  text += `\n## Notes / Deviations\n`;
  text += notes ? notes + '\n' : '(none)\n';

  // ── Monday Check-in ──────────────────────────────────────
  if (isMonday(state.currentDate)) {
    text += `\n## Monday Check-in\n`;
    text += `- **Date:** ${date}\n`;
    text += `- **Weight / Waist / Longest run / Avg sleep / Knee / Cigs/day:** `;
    text += `${vitals.weight_kg || '-'} / ${vitals.waist_inches || '-'} / - / ${vitals.sleep_hours || '-'} / `;
    // Knee from run log if available
    const knee = state.runLog?.knee_status || '-';
    text += `${knee} / ${vitals.cigarettes ?? '-'}\n`;
  }

  // ── Display ──────────────────────────────────────────────
  const preview = document.getElementById('debrief-preview');
  preview.textContent = text;
  preview.classList.remove('hidden');
  document.getElementById('copy-debrief').classList.remove('hidden');
}

async function copyDebrief() {
  const text = document.getElementById('debrief-preview').textContent;
  try {
    await navigator.clipboard.writeText(text);
    const success = document.getElementById('copy-success');
    success.classList.add('show');
    setTimeout(() => success.classList.remove('show'), 2000);
  } catch (err) {
    // Fallback for iOS
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    const success = document.getElementById('copy-success');
    success.classList.add('show');
    setTimeout(() => success.classList.remove('show'), 2000);
  }
}
