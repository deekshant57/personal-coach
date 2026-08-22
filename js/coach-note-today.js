// Coach weekly report — compact card on Today tab
import { state, isViewingFuture } from './app.js';
import { fetchCoachDebriefForWeek } from './supabase.js';
import { getWeekMonday, formatDate } from './week-stats.js';
import { buildCoachNoteTodayHtml, wireCoachNoteToday } from './coach-debrief.js';

let cachedWeekStart = null;
let cachedDebrief = undefined;

function renderCoachNote(debrief, onOpenPlan) {
  const card = document.getElementById('coach-note-card');
  if (!card) return;

  if (!debrief) {
    card.classList.add('hidden');
    card.innerHTML = '';
    return;
  }

  card.classList.remove('hidden');
  card.innerHTML = buildCoachNoteTodayHtml(debrief);
  wireCoachNoteToday(card, { onOpenPlan });
}

export function invalidateCoachNoteCache() {
  cachedWeekStart = null;
  cachedDebrief = undefined;
}

export async function loadCoachNoteToday({ onOpenPlan } = {}) {
  const card = document.getElementById('coach-note-card');
  if (!card) return;

  if (isViewingFuture()) {
    card.classList.add('hidden');
    card.innerHTML = '';
    return;
  }

  const weekStart = formatDate(getWeekMonday(state.currentDate));

  if (cachedWeekStart === weekStart && cachedDebrief !== undefined) {
    renderCoachNote(cachedDebrief, onOpenPlan);
    return;
  }

  card.classList.remove('hidden');
  card.innerHTML = '<p class="coach-note-loading text-muted">Loading coach report…</p>';

  try {
    const debrief = await fetchCoachDebriefForWeek(weekStart);
    cachedWeekStart = weekStart;
    cachedDebrief = debrief;
    renderCoachNote(debrief, onOpenPlan);
  } catch (err) {
    console.error('loadCoachNoteToday:', err);
    card.classList.add('hidden');
    card.innerHTML = '';
  }
}
