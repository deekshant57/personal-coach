// Return-after-gap detection and banner — Bible S18.2 (Sprint 6)
import { formatDate, formatDayDisplayFromIso } from './week-stats.js';
import {
  fetchWeekVitals,
  fetchWeekFoodLogs,
  fetchWeekRunLogs,
  fetchWeekWorkoutLogs,
} from './supabase.js';
import { resetStaleEventsAfterGap } from './meaningful-events.js';
import { buildActivityDateSet, computeLoggingGap } from './gap-return-logic.js';

export { buildActivityDateSet, computeLoggingGap } from './gap-return-logic.js';

const GAP_THRESHOLD_DAYS = 5;
const LONG_GAP_DAYS = 14;
const LOOKBACK_DAYS = 90;
const DISMISS_KEY = 'gap_return_dismissed_for';

function calendarDate(d) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function isBannerDismissed(lastLoggedDate) {
  try {
    const stored = localStorage.getItem(DISMISS_KEY);
    return stored === (lastLoggedDate || '__none__');
  } catch {
    return false;
  }
}

export function dismissGapBanner(lastLoggedDate) {
  try {
    localStorage.setItem(DISMISS_KEY, lastLoggedDate || '__none__');
  } catch {
    /* private browsing */
  }
  renderGapReturnBanner(null);
}

export function clearGapDismissOnLog() {
  try {
    localStorage.removeItem(DISMISS_KEY);
  } catch {
    /* private browsing */
  }
}

export async function fetchRecentActivityDates(lookbackDays = LOOKBACK_DAYS) {
  const end = calendarDate(new Date());
  const start = new Date(end);
  start.setDate(start.getDate() - (lookbackDays - 1));
  const startIso = formatDate(start);
  const endIso = formatDate(end);

  const [vitals, foodLogs, runLogs, workoutLogs] = await Promise.all([
    fetchWeekVitals(startIso, endIso),
    fetchWeekFoodLogs(startIso, endIso),
    fetchWeekRunLogs(startIso, endIso),
    fetchWeekWorkoutLogs(startIso, endIso),
  ]);

  return buildActivityDateSet(vitals, foodLogs, runLogs, workoutLogs);
}

export async function checkAndRenderGapReturn({ viewingToday = true } = {}) {
  if (!viewingToday) {
    renderGapReturnBanner(null);
    return null;
  }

  try {
    const activityDates = await fetchRecentActivityDates();
    const gap = computeLoggingGap(activityDates);

    if (gap.gapDays >= GAP_THRESHOLD_DAYS) {
      resetStaleEventsAfterGap(gap.gapDays);
    }

    if (gap.gapDays < GAP_THRESHOLD_DAYS) {
      renderGapReturnBanner(null);
      return gap;
    }

    if (isBannerDismissed(gap.lastLoggedDate)) {
      renderGapReturnBanner(null);
      return gap;
    }

    renderGapReturnBanner(gap);
    return gap;
  } catch (err) {
    console.error('checkAndRenderGapReturn:', err);
    renderGapReturnBanner(null);
    return null;
  }
}

export function renderGapReturnBanner(gap) {
  const el = document.getElementById('gap-return-banner');
  if (!el) return;

  if (!gap || gap.gapDays < GAP_THRESHOLD_DAYS) {
    el.classList.add('hidden');
    el.innerHTML = '';
    return;
  }

  const longGapLine = gap.gapDays >= LONG_GAP_DAYS && gap.lastLoggedDate
    ? `<span class="gap-return-last-logged">Last logged: ${formatDayDisplayFromIso(gap.lastLoggedDate)}.</span>`
    : '';

  el.classList.remove('hidden');
  el.innerHTML = `
    <div class="gap-return-content">
      <div class="gap-return-copy">
        <span class="gap-return-text">Continuing from today.</span>
        ${longGapLine}
      </div>
      <button type="button" class="gap-return-dismiss" id="gap-return-dismiss" aria-label="Dismiss">Dismiss</button>
    </div>`;

  document.getElementById('gap-return-dismiss')?.addEventListener('click', () => {
    dismissGapBanner(gap.lastLoggedDate);
  });
}

export function setupGapReturn() {
  /* dismiss wired per render */
}
