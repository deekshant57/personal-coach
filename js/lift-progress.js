// Key-lift progression from workout_logs.exercises_json (Phase B)
import {
  DEFAULT_PROGRESS_LIFTS,
  findExerciseById,
  bestCompletedSet,
  formatSetLabel,
} from './exercise-library.js';
import { formatDayDisplayFromIso } from './week-stats.js';

function normalizeExercises(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Build time series of best set per session for selected lifts.
 * @returns {{ id: string, name: string, points: { date: string, kg: number, reps: number }[] }[]}
 */
export function buildLiftProgression(workoutLogs, liftIds = DEFAULT_PROGRESS_LIFTS) {
  const ids = liftIds.length ? liftIds : DEFAULT_PROGRESS_LIFTS;
  const series = ids.map((id) => ({
    id,
    name: findExerciseById(id)?.name || id,
    points: [],
  }));
  const byId = new Map(series.map((s) => [s.id, s]));

  const sorted = [...(workoutLogs || [])].sort((a, b) => (a.date > b.date ? 1 : -1));
  for (const log of sorted) {
    for (const ex of normalizeExercises(log.exercises_json)) {
      const id = ex.exercise_id;
      if (!id || !byId.has(id)) continue;
      const best = bestCompletedSet(ex);
      if (!best || !(best.kg > 0 || best.reps > 0)) continue;
      byId.get(id).points.push({
        date: log.date,
        kg: best.kg || 0,
        reps: best.reps || 0,
      });
    }
  }

  return series.filter((s) => s.points.length > 0);
}

export function renderLiftProgression(workoutLogs) {
  const el = document.getElementById('lift-progress-content');
  if (!el) return;

  const series = buildLiftProgression(workoutLogs);
  if (!series.length) {
    el.innerHTML = '<p class="text-muted">Log weighted sets on gym days — progression for key lifts appears here.</p>';
    return;
  }

  el.innerHTML = series.map((s) => {
    const latest = s.points[s.points.length - 1];
    const first = s.points[0];
    const deltaKg = latest.kg - first.kg;
    const deltaLabel = deltaKg === 0
      ? 'flat'
      : `${deltaKg > 0 ? '+' : ''}${deltaKg} kg since ${formatDayDisplayFromIso(first.date)}`;
    const maxKg = Math.max(...s.points.map((p) => p.kg), 1);
    const bars = s.points.slice(-8).map((p) => {
      const pct = Math.max(8, Math.round((p.kg / maxKg) * 100));
      return `
        <div class="lift-bar-col" title="${formatDayDisplayFromIso(p.date)}: ${formatSetLabel(p)}">
          <span class="lift-bar" style="height:${pct}%"></span>
          <span class="lift-bar-label">${p.kg || p.reps}</span>
        </div>`;
    }).join('');

    return `
      <div class="lift-progress-row">
        <div class="lift-progress-head">
          <span class="lift-progress-name">${s.name}</span>
          <span class="lift-progress-latest">${formatSetLabel(latest)}</span>
        </div>
        <p class="lift-progress-delta text-muted">${deltaLabel}</p>
        <div class="lift-bar-chart">${bars}</div>
      </div>`;
  }).join('');
}
