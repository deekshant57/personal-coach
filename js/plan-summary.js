/** Level 1 plan session label — no heavy imports (testable in Node). */
export function summarizePlanSession(plan) {
  if (!plan) return null;
  const day = plan.day_name || '';
  if (plan.run_type && plan.run_km != null) {
    return `${day} ${plan.run_type} ${plan.run_km} km`.trim();
  }
  if (plan.workout_plan) {
    const short = String(plan.workout_plan).split('—')[0].trim();
    return `${day} ${short}`.trim();
  }
  if (plan.day_type === 'Rest') return `${day} Rest`.trim();
  return plan.day_type ? `${day} ${plan.day_type}`.trim() : null;
}
