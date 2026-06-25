// Week tab — browse plans, navigate weeks, open day on Today tab
import {
  state,
  formatDate,
  formatToday,
  formatDayDisplay,
  formatDayDisplayFromIso,
  getToday,
} from './app.js';
import { fetchWeekPlans, fetchCoachDebriefForWeek } from './supabase.js';
import { renderDayBadge } from './data.js';
import { buildCoachDebriefCardHtml, wireCoachDebriefCard } from './coach-debrief.js';
import { resolvePlansForRange } from './plan-merge.js';
import { extractWarmupCooldown, extractRunCues } from './plan-templates.js';
import { loadingCenterHtml, setOverlayLoading } from './spinner.js';
import {
  getWeekStats,
  getPriorWeekRange,
  formatKm,
  getTenPercentCapKm,
  getRaceCountdownDays,
} from './week-stats.js';

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

function renderWeekMileageSummary(stats, priorStats) {
  const el = document.getElementById('week-mileage-summary');
  if (!el || !stats) return;

  const actual = stats.actualKm || 0;
  const planned = stats.plannedKm || 0;
  const cap = getTenPercentCapKm(priorStats?.actualKm);
  const daysToRace = getRaceCountdownDays();

  let html = `
    <div class="week-mileage-row">
      <span class="week-mileage-label">Weekly mileage</span>
      <span class="week-mileage-value">
        <strong>${formatKm(actual)}</strong> / ${formatKm(planned)} km
      </span>
    </div>`;

  if (stats.runDaysPlanned > 0) {
    html += `<div class="week-mileage-meta">${stats.runDaysLogged} of ${stats.runDaysPlanned} runs logged</div>`;
  }

  if (stats.longestRun != null) {
    html += `<div class="week-mileage-meta">Longest this week: ${formatKm(stats.longestRun)} km (${formatDayDisplayFromIso(stats.longestRunDate)})</div>`;
  }

  if (cap != null) {
    html += `<div class="week-mileage-meta">+10% cap from prior week: ${formatKm(cap)} km</div>`;
    if (planned > cap + 0.05) {
      html += `<div class="week-mileage-warn">Planned ${formatKm(planned)} km exceeds +10% rule</div>`;
    }
  }

  if (daysToRace > 0) {
    html += `<div class="week-mileage-race">${daysToRace} days to half marathon</div>`;
  }

  el.innerHTML = html;
  el.classList.remove('hidden');
}

function getDayCompletion(weekStats, date) {
  return weekStats?.dayCompletion?.find((d) => d.date === date) || null;
}

function renderCompletionBadges(dayStatus, plan) {
  if (!dayStatus) return '';

  const chips = [
    { label: 'Vitals', done: dayStatus.vitals },
  ];

  if (dayStatus.training !== null) {
    chips.push({
      label: plan.run_type ? 'Run' : 'Workout',
      done: dayStatus.training,
    });
  }

  chips.push({ label: 'Meals', done: dayStatus.meals });

  return `<div class="week-card-completion">${chips.map((chip) => `
      <span class="week-completion-chip${chip.done ? ' done' : ''}">
        <span class="week-completion-mark" aria-hidden="true">${chip.done ? '✓' : '○'}</span>
        <span>${chip.label}</span>
      </span>
    `).join('')}</div>`;
}

function renderCoachDebriefSection(debrief) {
  const card = document.getElementById('coach-debrief-card');
  if (!card) return;

  if (!debrief) {
    card.classList.add('hidden');
    card.innerHTML = '';
    return;
  }

  card.classList.remove('hidden');
  card.innerHTML = buildCoachDebriefCardHtml(debrief);
  wireCoachDebriefCard(card);
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
  document.getElementById('week-mileage-summary')?.classList.add('hidden');
  renderCoachDebriefSection(null);

  try {
    const range = { startIso: startDate, endIso: endDate };
    const priorRange = getPriorWeekRange(monday);

    const [fetchedPlans, priorFetched, coachDebrief] = await Promise.all([
      fetchWeekPlans(startDate, endDate),
      fetchWeekPlans(priorRange.startIso, priorRange.endIso),
      fetchCoachDebriefForWeek(startDate),
    ]);

    const plans = resolvePlansForRange(startDate, endDate, fetchedPlans);
    const priorPlans = resolvePlansForRange(priorRange.startIso, priorRange.endIso, priorFetched);

    const [weekStats, priorWeekStats] = await Promise.all([
      getWeekStats(range, { plans }),
      getWeekStats(priorRange, { plans: priorPlans }),
    ]);

    container.innerHTML = '';

    if (plans.length === 0) {
      container.innerHTML = '<p class="text-muted empty-state-pad">No plan for this week</p>';
      renderWeekMileageSummary(weekStats, priorWeekStats);
      renderCoachDebriefSection(coachDebrief);
      return;
    }

    renderWeekMileageSummary(weekStats, priorWeekStats);
    renderCoachDebriefSection(coachDebrief);

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
      const dayStatus = getDayCompletion(weekStats, plan.date);
      const completionHtml = renderCompletionBadges(dayStatus, plan);

      const card = document.createElement('article');
      card.className = `week-card${isExpanded ? ' expanded' : ''}${isViewing ? ' viewing' : ''}${dayStatus?.complete ? ' complete' : ''}`;
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
      ${completionHtml}
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
