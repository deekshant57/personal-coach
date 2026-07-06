// Level 1–2 observations only — Bible S9, S11 (Sprint 5)
import { eventLabel } from './meaningful-event-labels.js';
import { summarizePlanSession } from './plan-summary.js';

export const FORBIDDEN_PATTERNS = [
  /\byou should\b/i,
  /\bconsider reducing\b/i,
  /\bconsider increasing\b/i,
  /\breduce\b/i,
  /\bdeload\b/i,
  /\bskip\b/i,
  /\bovertraining\b/i,
  /\bgood job\b/i,
  /\bgreat work\b/i,
  /\bdon'?t worry\b/i,
  /\bincrease calories\b/i,
  /\bdecrease\b/i,
  /\bmust\b/i,
  /\bneed to\b/i,
];

export function isLevel3Violation(text) {
  if (!text?.trim()) return false;
  return FORBIDDEN_PATTERNS.some((re) => re.test(text));
}

export function validateObservation(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return { valid: false, reason: 'empty' };
  if (isLevel3Violation(trimmed)) return { valid: false, reason: 'level3' };
  return { valid: true, text: trimmed };
}

function formatPlanDemand(plan) {
  const session = summarizePlanSession(plan);
  if (!session) return null;
  return `Today's session: ${session}.`;
}

/**
 * Render observation from newly active meaningful events.
 * Max 2 sentences. Level 2 adds plan demand when available.
 */
export function renderObservation(events, { plan = null } = {}) {
  if (!events?.length) return null;

  const primary = events[0];
  const fact = eventLabel(primary);
  const demand = formatPlanDemand(plan);

  let text = fact;
  if (demand && primary.type !== 'milestone') {
    text = `${fact.replace(/\.$/, '')}. ${demand}`;
  }

  const { valid, text: safeText } = validateObservation(text);
  return valid ? safeText : fact;
}

/** Factual day summary — no praise, Level 1 only. */
export function buildDaySummary({ vitals, foodLogs, proteinTarget = 145 } = {}) {
  const parts = [];

  let totalP = 0;
  let totalC = 0;
  for (const row of Object.values(foodLogs || {})) {
    totalP += row.totalProtein || 0;
    totalC += row.totalCalories || 0;
  }
  if (totalP > 0) parts.push(`${Math.round(totalP)}g protein`);
  if (totalC > 0) parts.push(`${Math.round(totalC).toLocaleString()} kcal`);
  if (vitals?.sleep_hours != null) parts.push(`${vitals.sleep_hours}h sleep`);

  if (!parts.length) return null;
  return parts.join(' · ');
}

export function shouldShowPostSaveObservation(newEvents) {
  return Array.isArray(newEvents) && newEvents.length > 0;
}

export function shouldStaySilent({ newEvents, activeEvents, daySummaryRequested = false } = {}) {
  if (daySummaryRequested) return false;
  if (newEvents?.length) return false;
  if (activeEvents?.length) return false;
  return true;
}
