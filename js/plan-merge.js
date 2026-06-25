// Merge Supabase daily_plans with embedded fallback (run_km, cues, etc.)
import { getFallbackPlan, patchPlanWarmup } from './app.js';

export function mergePlanWithFallback(plan, date) {
  const patched = patchPlanWarmup(plan, date);
  if (!patched) return null;
  const fb = getFallbackPlan(date);
  if (!fb) return patched;

  const merged = { ...patched };
  if (fb.run_type && !merged.run_type) merged.run_type = fb.run_type;
  if (fb.run_km != null && (merged.run_km == null || merged.run_km === '')) {
    merged.run_km = fb.run_km;
  }
  if (fb.run_pace && !merged.run_pace) merged.run_pace = fb.run_pace;
  if (fb.run_cue && !merged.run_cue) merged.run_cue = fb.run_cue;
  if (fb.workout_plan && !merged.workout_plan) merged.workout_plan = fb.workout_plan;
  if (fb.workout_detail && !merged.workout_detail) merged.workout_detail = fb.workout_detail;
  if (fb.day_type && !merged.day_type) merged.day_type = fb.day_type;
  if (fb.protein_target && !merged.protein_target) merged.protein_target = fb.protein_target;
  return merged;
}

function enumerateDates(startIso, endIso) {
  const dates = [];
  const [sy, sm, sd] = startIso.split('-').map(Number);
  const [ey, em, ed] = endIso.split('-').map(Number);
  const cur = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);
  while (cur.getTime() <= end.getTime()) {
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

/** Resolved plans for a week — Supabase rows merged with fallback, or full fallback week. */
export function resolvePlansForRange(startIso, endIso, fetchedPlans) {
  let rows = fetchedPlans || [];
  if (!rows.length) {
    rows = enumerateDates(startIso, endIso)
      .map((date) => {
        const fb = getFallbackPlan(date);
        return fb ? { ...fb, date } : null;
      })
      .filter(Boolean);
  }
  return rows
    .map((p) => mergePlanWithFallback(p, p.date))
    .filter(Boolean);
}
