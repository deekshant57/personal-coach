// Training block context — per signed-in athlete (see athlete-profile.js)
import { getAthleteProfile } from './athlete-profile.js';
import { summarizePlanSession } from './plan-summary.js';

function blockFromProfile(profile = getAthleteProfile()) {
  return profile.block;
}

/** @deprecated Prefer getAthleteProfile().block — kept for any legacy imports. */
export const BLOCK = {
  name: 'Phase 1 — Hypertrophy + Base',
  shortName: 'Hypertrophy',
  phase: 'Hypertrophy',
  week: 1,
  raceDate: '2026-12-13',
  raceName: 'Half Marathon (Dec 13)',
  weightGoalKg: 73,
  weightGoalLabel: '~73 kg',
};

export function formatBlockLabel(profile = getAthleteProfile()) {
  const b = blockFromProfile(profile);
  return `${b.name} · Week ${b.week}`;
}

export function formatBlockChip(now = new Date(), profile = getAthleteProfile()) {
  const b = blockFromProfile(profile);
  const weeks = getWeeksToRace(now, profile);
  const weekLabel = profile.showRaceCountdown && weeks > 0
    ? ` · ${weeks} wk to race`
    : '';
  return `${b.name} · Week ${b.week}${weekLabel}`;
}

export function getWeeksToRace(now = new Date(), profile = getAthleteProfile()) {
  const raceDate = blockFromProfile(profile).raceDate;
  if (!raceDate) return 0;
  const race = new Date(`${raceDate}T00:00:00`);
  const ms = race - now;
  if (ms <= 0) return 0;
  return Math.ceil(ms / (7 * 86400000));
}

/** Level 1 facts only — rest day recovery block (S15.3). */
export function formatRecoveryTodayHtml({ plan, nextLabel }, profile = getAthleteProfile()) {
  const protein = plan?.protein_target || 140;
  const lines = [
    `Protein floor: ${protein}g`,
    ...(profile.recoveryLines || []),
  ];
  if (nextLabel) lines.push(`Tomorrow: ${nextLabel}`);
  return lines.map((line) => `<p class="recovery-today-line">${line}</p>`).join('');
}

export function formatRestDayPlanTitle(nextSessionLabel, profile = getAthleteProfile()) {
  const block = formatBlockLabel(profile);
  if (nextSessionLabel) return `Rest day · ${block} · Next: ${nextSessionLabel}`;
  return `Rest day · ${block}`;
}

export { summarizePlanSession };
