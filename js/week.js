// Week tab — browse plans, navigate weeks, open day on Today tab
import {
  state,
  formatDate,
  formatToday,
  formatDayDisplay,
  formatDayDisplayFromIso,
  getToday,
  getFallbackPlan,
  patchPlanWarmup,
} from './app.js';
import { fetchWeekPlans } from './supabase.js';
import { renderDayBadge } from './data.js';
import { extractWarmupCooldown, extractRunCues } from './plan-templates.js';
import { loadingCenterHtml, setOverlayLoading } from './spinner.js';

const TRAINING_BLOCK_START = new Date(2026, 5, 22); // Mon 22 Jun 2026 — Week 1

let weekViewMonday = null;
let openDayHandler = null;

function getWeekMonday(d) {
  const copy = new Date(d);
  const dayOfWeek = copy.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function syncWeekViewMonday() {
  weekViewMonday = getWeekMonday(state.currentDate);
}

function getWeekLabel(monday) {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const blockMonday = getWeekMonday(TRAINING_BLOCK_START);
  const weekNum = Math.floor((monday - blockMonday) / (7 * 86400000)) + 1;
  const numLabel = weekNum > 0 ? `Week ${weekNum} · ` : '';
  return `${numLabel}${formatDayDisplay(monday)} – ${formatDayDisplay(sunday)}`;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function initWeek(onOpenDay) {
  openDayHandler = onOpenDay;
  syncWeekViewMonday();

  document.getElementById('week-prev')?.addEventListener('click', () => {
    weekViewMonday.setDate(weekViewMonday.getDate() - 7);
    loadWeekView();
  });
  document.getElementById('week-next')?.addEventListener('click', () => {
    weekViewMonday.setDate(weekViewMonday.getDate() + 7);
    loadWeekView();
  });

  loadWeekView();
}

function setWeekNavLoading(loading) {
  document.getElementById('week-prev')?.classList.toggle('is-loading', loading);
  document.getElementById('week-next')?.classList.toggle('is-loading', loading);
  setOverlayLoading('week-loading-overlay', loading);
}

export async function loadWeekView() {
  const container = document.getElementById('week-cards');
  const labelEl = document.getElementById('week-nav-label');
  if (!container) return;

  if (!weekViewMonday) syncWeekViewMonday();

  const viewingDate = getToday();
  const actualToday = formatToday();

  const monday = new Date(weekViewMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const startDate = formatDate(monday);
  const endDate = formatDate(sunday);

  if (labelEl) labelEl.textContent = getWeekLabel(monday);

  setWeekNavLoading(true);
  container.innerHTML = loadingCenterHtml('Loading week…');

  try {
    let plans = await fetchWeekPlans(startDate, endDate);

    if (plans.length === 0) {
      plans = getFallbackWeekPlans().filter((p) => p.date >= startDate && p.date <= endDate);
    } else {
      plans = plans.map((p) => patchPlanWarmup(p, p.date));
    }

    container.innerHTML = '';

    if (plans.length === 0) {
      container.innerHTML = '<p class="text-muted empty-state-pad">No plan for this week</p>';
      return;
    }

    plans.forEach((plan) => {
      const isViewing = plan.date === viewingDate;
      const isActualToday = plan.date === actualToday;
      const isExpanded = isActualToday || isViewing;

      let summary = '';
      if (plan.run_type) {
        summary = `${plan.run_type} ${plan.run_km} km @ ${plan.run_pace}`;
      } else if (plan.workout_plan) {
        summary = plan.workout_plan;
      } else {
        summary = plan.workout_detail || 'Rest';
      }

      const detailParts = [];
      if (plan.directive) detailParts.push(`Coach: ${plan.directive}`);
      const runCues = extractRunCues(plan.run_cue);
      if (runCues) detailParts.push(`Run cue: ${runCues}`);
      const warmupDetail = extractWarmupCooldown(plan.run_cue) || extractWarmupCooldown(plan.workout_detail);
      if (warmupDetail) detailParts.push(`Warm-up / cool-down:\n${warmupDetail}`);
      const mainWorkout = plan.workout_detail && !warmupDetail ? plan.workout_detail : '';
      if (plan.workout_detail && warmupDetail) {
        const main = plan.workout_detail
          .split(' · ')
          .filter((s) => !/^WARM-UP/i.test(s.trim()) && !/^COOL-DOWN/i.test(s.trim()))
          .join(' · ');
        if (main) detailParts.push(`Workout: ${main}`);
      } else if (mainWorkout) {
        detailParts.push(`Workout: ${mainWorkout}`);
      }
      const detailText = detailParts.join('\n\n');

      const card = document.createElement('article');
      card.className = `week-card${isExpanded ? ' expanded' : ''}${isViewing ? ' viewing' : ''}`;
      card.dataset.date = plan.date;

      card.innerHTML = `
      <button type="button" class="week-card-header" aria-expanded="${isExpanded}">
        <span class="week-card-header-left">
          <span class="week-card-chevron" aria-hidden="true"></span>
          <span class="week-card-date">${plan.day_name} · ${formatDayDisplayFromIso(plan.date)}</span>
          ${isActualToday ? '<span class="week-today-pill">Today</span>' : ''}
          ${renderDayBadge(plan.day_type, { small: true })}
        </span>
        <span class="text-muted week-card-protein">${plan.protein_target || 145}g P</span>
      </button>
      <div class="week-card-summary">${escapeHtml(summary)}</div>
      ${plan.meals_plan ? `<div class="week-card-meals">${escapeHtml(plan.meals_plan)}</div>` : ''}
      ${detailText ? `<div class="week-card-detail">${escapeHtml(detailText)}</div>` : ''}
      <button type="button" class="week-open-day-btn">Open day &rarr;</button>
    `;

      const headerBtn = card.querySelector('.week-card-header');
    headerBtn.addEventListener('click', () => {
      card.classList.add('week-card-animate');
      const expanded = card.classList.toggle('expanded');
      headerBtn.setAttribute('aria-expanded', String(expanded));
    });

      card.querySelector('.week-open-day-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        openDayHandler?.(plan.date);
      });

      container.appendChild(card);
    });
  } finally {
    setWeekNavLoading(false);
  }
}

function getFallbackWeekPlans() {
  const dates = [
    '2026-06-22', '2026-06-23', '2026-06-24', '2026-06-25',
    '2026-06-26', '2026-06-27', '2026-06-28',
  ];
  return dates
    .map((d) => {
      const plan = getFallbackPlan(d);
      return plan ? { ...plan, date: d } : null;
    })
    .filter(Boolean);
}
