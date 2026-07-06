// Week tab — browse plans, navigate weeks, open day on Today tab
import {
  state,
  formatDate,
  formatToday,
  formatDayDisplay,
  formatDayDisplayFromIso,
  getToday,
} from './app.js';
import { fetchWeekPlans, fetchCoachDebriefForWeek, fetchWeekFoodLogs } from './supabase.js';
import { renderDayBadge } from './data.js';
import { buildCoachDebriefCardHtml, wireCoachDebriefCard } from './coach-debrief.js';
import { resolvePlansForRange } from './plan-merge.js';
import { extractWarmupCooldown, extractRunCues } from './plan-templates.js';
import { skeletonWeekCardsHtml, setOverlayLoading } from './spinner.js';
import { formatBlockChip } from './block-context.js';
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

function renderCompactDots(dayStatus, plan) {
  if (!dayStatus) return '';

  const vitalsMark = dayStatus.vitals ? '✓' : '○';
  const trainingMark = dayStatus.training === null ? '—' : (dayStatus.training ? '✓' : '○');
  const mealsMark = dayStatus.meals ? '✓' : '○';

  const vitalsCls = dayStatus.vitals ? 'week-dot--done' : '';
  const trainingCls = dayStatus.training === true ? 'week-dot--done' : dayStatus.training === null ? 'week-dot--na' : '';
  const mealsCls = dayStatus.meals ? 'week-dot--done' : '';

  return `<span class="week-completion-dots" aria-label="Completion">
    <span class="week-dot ${vitalsCls}" title="Vitals">${vitalsMark}</span>
    <span class="week-dot ${trainingCls}" title="${plan?.run_type ? 'Run' : plan?.workout_plan ? 'Workout' : 'Training'}">${trainingMark}</span>
    <span class="week-dot ${mealsCls}" title="Meals">${mealsMark}</span>
  </span>`;
}

function computeNutritionSummary(plans, foodLogs) {
  const byDate = new Map();
  for (const row of foodLogs || []) {
    if (!row.date) continue;
    const prev = byDate.get(row.date) || { protein: 0, calories: 0 };
    prev.protein += Number(row.total_protein) || 0;
    prev.calories += Number(row.total_calories) || 0;
    byDate.set(row.date, prev);
  }

  let daysWithFood = 0;
  let totalProtein = 0;
  let totalCalories = 0;
  let daysOnTarget = 0;

  for (const plan of plans || []) {
    const macros = byDate.get(plan.date);
    if (!macros || (macros.protein === 0 && macros.calories === 0)) continue;
    daysWithFood += 1;
    totalProtein += macros.protein;
    totalCalories += macros.calories;
    const target = plan.protein_target ?? 140;
    if (macros.protein >= target) daysOnTarget += 1;
  }

  return {
    avgProtein: daysWithFood ? Math.round(totalProtein / daysWithFood) : null,
    avgCalories: daysWithFood ? Math.round(totalCalories / daysWithFood) : null,
    daysOnTarget,
    daysWithFood,
    daysInWeek: (plans || []).length,
  };
}

function renderWeekNutritionSummary(plans, foodLogs) {
  const el = document.getElementById('week-nutrition-summary');
  if (!el) return;

  const stats = computeNutritionSummary(plans, foodLogs);
  if (!stats.daysWithFood) {
    el.classList.add('hidden');
    el.innerHTML = '';
    return;
  }

  const pct = stats.daysInWeek
    ? Math.round((stats.daysOnTarget / stats.daysInWeek) * 100)
    : 0;

  el.innerHTML = `
    <div class="week-mileage-row">
      <span class="week-mileage-label">Nutrition</span>
      <span class="week-mileage-value">
        avg <strong>${stats.avgProtein}g P</strong> · ~${stats.avgCalories.toLocaleString()} kcal
      </span>
    </div>
    <div class="week-mileage-meta">${stats.daysOnTarget}/${stats.daysInWeek} days on protein floor</div>
    <div class="week-nutrition-bar" aria-hidden="true">
      <span class="week-nutrition-bar-fill" style="width:${pct}%"></span>
    </div>`;
  el.classList.remove('hidden');
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

  const planChip = document.getElementById('plan-block-context-chip');
  if (planChip) {
    planChip.textContent = formatBlockChip(new Date(`${getToday()}T12:00:00`));
  }

  const viewingDate = getToday();
  const actualToday = formatToday();

  const monday = new Date(weekViewMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const startDate = formatDate(monday);
  const endDate = formatDate(sunday);

  if (labelEl) labelEl.textContent = getWeekLabel(monday);

  setWeekNavLoading(true);
  container.innerHTML = skeletonWeekCardsHtml();
  document.getElementById('week-mileage-summary')?.classList.add('hidden');
  document.getElementById('week-nutrition-summary')?.classList.add('hidden');
  renderCoachDebriefSection(null);

  try {
    const range = { startIso: startDate, endIso: endDate };
    const priorRange = getPriorWeekRange(monday);

    const [fetchedPlans, priorFetched, coachDebrief, foodLogs] = await Promise.all([
      fetchWeekPlans(startDate, endDate),
      fetchWeekPlans(priorRange.startIso, priorRange.endIso),
      fetchCoachDebriefForWeek(startDate),
      fetchWeekFoodLogs(startDate, endDate),
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
    renderWeekNutritionSummary(plans, foodLogs);
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
      const dotsHtml = renderCompactDots(dayStatus, plan);

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
        <span class="week-card-header-right">
          ${dotsHtml}
          <span class="text-muted week-card-protein">${plan.protein_target || 145}g P</span>
        </span>
      </button>
      <div class="week-card-summary">${escapeHtml(summary)}</div>
      ${plan.meals_plan ? `<div class="week-card-meals">${escapeHtml(plan.meals_plan)}</div>` : ''}
      ${detailText ? `<div class="week-card-detail">${escapeHtml(detailText)}</div>` : ''}
      <button type="button" class="week-open-day-btn">Open day &rarr;</button>
    `;

      const headerBtn = card.querySelector('.week-card-header');
    headerBtn.addEventListener('click', () => {
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
