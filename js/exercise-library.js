// Starter exercise library for Gym / Bodyweight logging (Phase B)
// Keep list focused — custom exercises cover the rest.

export const EXERCISE_LIBRARY = [
  // Lower
  { id: 'goblet_squat', name: 'Goblet squat', muscle: 'legs', equipment: 'dumbbell' },
  { id: 'back_squat', name: 'Back squat', muscle: 'legs', equipment: 'barbell' },
  { id: 'romanian_deadlift', name: 'Romanian deadlift', muscle: 'hamstrings', equipment: 'barbell' },
  { id: 'conventional_deadlift', name: 'Deadlift', muscle: 'posterior', equipment: 'barbell' },
  { id: 'leg_press', name: 'Leg press', muscle: 'legs', equipment: 'machine' },
  { id: 'walking_lunge', name: 'Walking lunge', muscle: 'legs', equipment: 'dumbbell' },
  { id: 'bulgarian_split_squat', name: 'Bulgarian split squat', muscle: 'legs', equipment: 'dumbbell' },
  { id: 'leg_curl', name: 'Leg curl', muscle: 'hamstrings', equipment: 'machine' },
  { id: 'leg_extension', name: 'Leg extension', muscle: 'quads', equipment: 'machine' },
  { id: 'hip_thrust', name: 'Hip thrust', muscle: 'glutes', equipment: 'barbell' },
  { id: 'cable_kickback', name: 'Cable kickback', muscle: 'glutes', equipment: 'cable' },
  { id: 'calf_raise', name: 'Calf raise', muscle: 'calves', equipment: 'machine' },
  // Upper push
  { id: 'bench_press', name: 'Bench press', muscle: 'chest', equipment: 'barbell' },
  { id: 'incline_db_press', name: 'Incline DB press', muscle: 'chest', equipment: 'dumbbell' },
  { id: 'push_up', name: 'Push-up', muscle: 'chest', equipment: 'bodyweight' },
  { id: 'overhead_press', name: 'Overhead press', muscle: 'shoulders', equipment: 'barbell' },
  { id: 'db_shoulder_press', name: 'DB shoulder press', muscle: 'shoulders', equipment: 'dumbbell' },
  { id: 'lateral_raise', name: 'Lateral raise', muscle: 'shoulders', equipment: 'dumbbell' },
  { id: 'tricep_pushdown', name: 'Tricep pushdown', muscle: 'triceps', equipment: 'cable' },
  { id: 'skull_crusher', name: 'Skull crusher', muscle: 'triceps', equipment: 'barbell' },
  // Upper pull
  { id: 'lat_pulldown', name: 'Lat pulldown', muscle: 'back', equipment: 'cable' },
  { id: 'pull_up', name: 'Pull-up', muscle: 'back', equipment: 'bodyweight' },
  { id: 'seated_row', name: 'Seated row', muscle: 'back', equipment: 'cable' },
  { id: 'db_row', name: 'One-arm DB row', muscle: 'back', equipment: 'dumbbell' },
  { id: 'face_pull', name: 'Face pull', muscle: 'rear delts', equipment: 'cable' },
  { id: 'barbell_row', name: 'Barbell row', muscle: 'back', equipment: 'barbell' },
  { id: 'bicep_curl', name: 'Bicep curl', muscle: 'biceps', equipment: 'dumbbell' },
  { id: 'hammer_curl', name: 'Hammer curl', muscle: 'biceps', equipment: 'dumbbell' },
  // Core / cardio accessories
  { id: 'plank', name: 'Plank', muscle: 'core', equipment: 'bodyweight' },
  { id: 'hanging_knee_raise', name: 'Hanging knee raise', muscle: 'core', equipment: 'bodyweight' },
  { id: 'cable_crunch', name: 'Cable crunch', muscle: 'core', equipment: 'cable' },
  { id: 'farmers_carry', name: "Farmer's carry", muscle: 'full', equipment: 'dumbbell' },
  { id: 'kettlebell_swing', name: 'Kettlebell swing', muscle: 'posterior', equipment: 'kettlebell' },
  { id: 'treadmill_walk', name: 'Treadmill walk', muscle: 'cardio', equipment: 'machine' },
  { id: 'stationary_bike', name: 'Stationary bike', muscle: 'cardio', equipment: 'machine' },
  { id: 'elliptical', name: 'Elliptical', muscle: 'cardio', equipment: 'machine' },
];

/** Lifts shown on Progress by default (best set over time). */
export const DEFAULT_PROGRESS_LIFTS = [
  'goblet_squat',
  'romanian_deadlift',
  'bench_press',
  'lat_pulldown',
  'hip_thrust',
];

const BODYWEIGHT_IDS = new Set([
  'push_up', 'pull_up', 'plank', 'hanging_knee_raise',
]);

export function findExerciseById(id) {
  return EXERCISE_LIBRARY.find((e) => e.id === id) || null;
}

export function findExerciseByName(name) {
  const key = (name || '').trim().toLowerCase();
  if (!key) return null;
  return EXERCISE_LIBRARY.find((e) => e.name.toLowerCase() === key)
    || EXERCISE_LIBRARY.find((e) => e.name.toLowerCase().includes(key));
}

export function createWeightedExercise(libOrCustom, { sets = 3, kg = null, reps = 10 } = {}) {
  const isLib = typeof libOrCustom === 'object' && libOrCustom?.id;
  const id = isLib ? libOrCustom.id : `custom_${Date.now()}`;
  const name = isLib ? libOrCustom.name : String(libOrCustom || 'Custom').trim();
  const bodyweight = isLib && BODYWEIGHT_IDS.has(libOrCustom.id);

  return {
    exercise_id: id,
    name,
    type: bodyweight ? 'reps' : 'weighted',
    setCount: sets,
    targetReps: reps,
    sets: Array.from({ length: sets }, () => ({
      done: false,
      reps,
      kg: bodyweight ? null : kg,
    })),
  };
}

export function searchExercises(query, { limit = 12 } = {}) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return EXERCISE_LIBRARY.slice(0, limit);
  return EXERCISE_LIBRARY
    .filter((e) => e.name.toLowerCase().includes(q) || e.muscle.includes(q) || e.equipment.includes(q))
    .slice(0, limit);
}

/** Best completed set for an exercise entry (highest kg, then reps). */
export function bestCompletedSet(exercise) {
  const sets = (exercise?.sets || []).filter((s) => s.done || s.kg != null || s.reps != null);
  if (!sets.length) return null;
  const scored = sets.map((s) => ({
    kg: s.kg != null ? Number(s.kg) : 0,
    reps: s.reps != null ? Number(s.reps) : 0,
    done: !!s.done,
  }));
  scored.sort((a, b) => (b.kg - a.kg) || (b.reps - a.reps));
  return scored[0];
}

export function formatSetLabel(set) {
  if (!set) return '—';
  if (set.kg != null && set.kg > 0) {
    return `${set.kg} kg × ${set.reps ?? '—'}`;
  }
  if (set.reps != null) return `${set.reps} reps`;
  return '—';
}
