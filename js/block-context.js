// Training block context — mirror coach/current-block.md until Supabase sync (Sprint 2+)
import { WEIGHT_GOAL_KG, WEIGHT_GOAL_LABEL } from './weight-trend.js';

export const BLOCK = {
  name: 'HM Build — Base Phase',
  shortName: 'HM Build Base',
  phase: 'Base',
  week: 2,
  raceDate: '2026-09-06',
  raceName: 'Vedanta Zinc City HM',
  weightGoalKg: WEIGHT_GOAL_KG,
  weightGoalLabel: WEIGHT_GOAL_LABEL,
};

export function formatBlockLabel() {
  return `${BLOCK.name} · Week ${BLOCK.week}`;
}

export function formatBlockChip(now = new Date()) {
  const weeks = getWeeksToRace(now);
  const weekLabel = weeks > 0 ? ` · ${weeks} wk to race` : '';
  return `${BLOCK.name} · Week ${BLOCK.week}${weekLabel}`;
}

export function getWeeksToRace(now = new Date()) {
  const race = new Date(`${BLOCK.raceDate}T00:00:00`);
  const ms = race - now;
  if (ms <= 0) return 0;
  return Math.ceil(ms / (7 * 86400000));
}

/** Level 1 facts only — rest day recovery block (S15.3). */
export function formatRecoveryTodayHtml({ plan, nextLabel }) {
  const protein = plan?.protein_target || 140;
  const lines = [
    `Protein floor: ${protein}g`,
    'Sleep floor: 7h',
    'Supplements: Supradyn, Creatine, Omega-3 (D3 on Thu)',
  ];
  if (nextLabel) lines.push(`Tomorrow: ${nextLabel}`);
  return lines.map((line) => `<p class="recovery-today-line">${line}</p>`).join('');
}

export function formatRestDayPlanTitle(nextSessionLabel) {
  const block = formatBlockLabel();
  if (nextSessionLabel) return `Rest day · ${block} · Next: ${nextSessionLabel}`;
  return `Rest day · ${block}`;
}

import { summarizePlanSession } from './plan-summary.js';

export { summarizePlanSession };
