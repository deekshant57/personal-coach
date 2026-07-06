// Coach screen observation UI + post-save wiring (Sprint 5)
import { state, isMonday, isViewingFuture } from './app.js';
import {
  getEventsSinceLastCheck,
  getActiveEvents,
  syncMeaningfulEvents,
} from './meaningful-events.js';
import {
  renderObservation,
  buildDaySummary,
  shouldShowPostSaveObservation,
} from './observation-engine.js';
import { getMondayCheckInLine } from './week-stats.js';
import { setPostSaveCallback } from './save-state.js';

let mondayLineCache = null;

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function showObservationBlock(text) {
  const block = document.getElementById('coach-observation-block');
  if (!block || !text) {
    hideObservationBlock();
    return;
  }
  block.textContent = text;
  block.classList.remove('hidden');
  block.classList.add('coach-observation--visible');
}

export function hideObservationBlock() {
  const block = document.getElementById('coach-observation-block');
  if (!block) return;
  block.textContent = '';
  block.classList.add('hidden');
  block.classList.remove('coach-observation--visible');
}

export function refreshCoachObservation({ fromPostSave = false } = {}) {
  if (isViewingFuture()) {
    hideObservationBlock();
    return;
  }

  const newEvents = fromPostSave ? getEventsSinceLastCheck() : [];
  if (shouldShowPostSaveObservation(newEvents)) {
    const text = renderObservation(newEvents, { plan: state.currentPlan });
    if (text) {
      showObservationBlock(text);
      return;
    }
  }

  if (!fromPostSave && getActiveEvents().length === 0) {
    hideObservationBlock();
  }
}

async function handlePostSaveObservation() {
  if (isViewingFuture()) return;
  try {
    await syncMeaningfulEvents();
    refreshCoachObservation({ fromPostSave: true });
  } catch (err) {
    console.error('handlePostSaveObservation:', err);
  }
}

export async function renderMondayReviewBlock() {
  const card = document.getElementById('monday-review-card');
  const body = document.getElementById('monday-review-content');
  if (!card || !body) return;

  const show = isMonday(state.currentDate) && !isViewingFuture();
  card.classList.toggle('hidden', !show);
  if (!show) return;

  body.innerHTML = '<p class="text-muted">Loading prior-week rollups…</p>';

  try {
    mondayLineCache = await getMondayCheckInLine(state.currentDate, state.vitals);
    const line = mondayLineCache || '—';
    body.innerHTML = `
      <p class="monday-review-intro">Prior week rollups for your Monday check-in paste:</p>
      <p class="monday-review-line">${escapeHtml(line)}</p>
      <p class="monday-review-hint text-muted">Weight / waist / longest run / avg sleep / knee / cigs per day</p>
    `;
  } catch (err) {
    console.error('renderMondayReviewBlock:', err);
    body.innerHTML = '<p class="text-muted">Could not load Monday rollups.</p>';
  }
}

export function renderDaySummaryPanel() {
  const panel = document.getElementById('day-summary-panel');
  const content = document.getElementById('day-summary-content');
  if (!panel || !content) return;

  const summary = buildDaySummary({
    vitals: state.vitals,
    foodLogs: state.foodLogs,
    proteinTarget: state.currentPlan?.protein_target,
  });

  if (!summary) {
    content.textContent = 'No facts logged yet today.';
    return;
  }
  content.textContent = summary;
}

export function setupObservationCoach() {
  setPostSaveCallback(() => {
    handlePostSaveObservation();
  });

  document.getElementById('day-summary-toggle')?.addEventListener('toggle', (e) => {
    if (e.target.open) renderDaySummaryPanel();
  });
}

export async function layoutCoachObservations() {
  renderDaySummaryPanel();
  await renderMondayReviewBlock();
  if (!getActiveEvents().length) hideObservationBlock();
}
