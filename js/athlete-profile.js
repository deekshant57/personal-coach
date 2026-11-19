// Per-athlete UI chrome + Supabase athlete_profiles (Phase A + sport presets)
import {
  getCurrentUserId,
  fetchAthleteProfileRow,
  upsertAthleteProfile,
} from './supabase.js';
import { getSession, getProfile } from './auth.js';
import { defaultWeekTemplate, deriveSportMode } from './plan-seed.js';

export const DEEKSHANT_USER_ID = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139';
export const NAMRATA_USER_ID = '9e6a0d55-b63f-4857-b318-122e0c337ef4';

const PROFILES = {
  [DEEKSHANT_USER_ID]: {
    key: 'deekshant',
    displayName: 'Deekshant',
    sportMode: 'hybrid',
    block: {
      name: 'Hybrid Cardio + Gym — Restart',
      shortName: 'Hybrid Restart',
      phase: 'Restart',
      week: 1,
      raceDate: null,
      raceName: null,
    },
    weightGoalKg: 73.5,
    weightGoalLabel: '73–74 kg',
    weightGoalStatLabel: 'Weight goal',
    showRunningTrends: true,
    showLifts: true,
    showRaceCountdown: false,
    showKneeTracking: true,
    showCigarettes: true,
    showSupplementsCard: true,
    // Uprise D3 60K course complete (last logged dose 30 Jul 2026) — retest Vit D before restarting
    supplementKeys: ['supradyn', 'creatine', 'omega_3'],
    recoveryLines: [
      'Sleep floor: 7h',
      'Supplements: Supradyn, Creatine, Omega-3 (D3 course done — retest before restart)',
    ],
  },
  [NAMRATA_USER_ID]: {
    key: 'namrata',
    displayName: 'Namrata',
    sportMode: 'gym',
    block: {
      name: 'Foundation — Strength + Cardio (re-entry)',
      shortName: 'Foundation',
      phase: 'Re-entry',
      week: 1,
      raceDate: null,
      raceName: null,
    },
    weightGoalKg: null,
    weightGoalLabel: null,
    weightGoalStatLabel: null,
    showRunningTrends: false,
    showLifts: true,
    showRaceCountdown: false,
    showKneeTracking: false,
    showCigarettes: false,
    showSupplementsCard: true,
    supplementKeys: ['supradyn', 'uprise_d3_60k'],
    recoveryLines: [
      'Sleep: aim earlier than 11:30 PM when possible',
      'Supplements: Supradyn daily · Uprise D3 60K Thu · whey post-gym',
      'Thursday: milk / fruit / dry fruit / whey; solid meal at dinner only',
    ],
  },
};

/** Defaults used when backfilling known athletes into athlete_profiles. */
const SETUP_BACKFILL = {
  [DEEKSHANT_USER_ID]: {
    display_name: 'Deekshant',
    goal_primary: 'endurance',
    sport_mode: 'hybrid',
    diet_style: 'eggetarian',
    protein_target_g: 145,
    calorie_target_training: 2100,
    calorie_target_rest: 1900,
    default_session_window: 'morning',
    week_template: [
      { weekday: 1, day_type: 'Gym', session_window: 'morning', label: 'Gym' },
      { weekday: 2, day_type: 'Run', session_window: 'morning', label: 'Easy run' },
      { weekday: 3, day_type: 'Gym', session_window: 'morning', label: 'Gym' },
      { weekday: 4, day_type: 'Run', session_window: 'morning', label: 'Easy run' },
      { weekday: 5, day_type: 'Gym', session_window: 'morning', label: 'Gym' },
      { weekday: 6, day_type: 'Run', session_window: 'morning', label: 'Long run' },
      { weekday: 0, day_type: 'Rest', session_window: null, label: null },
    ],
    ui_flags: {
      showRunningTrends: true,
      showLifts: true,
      showKneeTracking: true,
    },
  },
  [NAMRATA_USER_ID]: {
    display_name: 'Namrata',
    goal_primary: 'strength',
    sport_mode: 'gym',
    diet_style: 'veg',
    protein_target_g: 100,
    calorie_target_training: 1800,
    calorie_target_rest: 1650,
    calorie_target_special: 1450,
    special_day_weekday: 4,
    default_session_window: 'morning',
    week_template: defaultWeekTemplate('morning'),
    ui_flags: {
      showRunningTrends: false,
      showLifts: true,
      showKneeTracking: false,
    },
  },
};

let cachedDbProfile = null;

/** Resolve signed-in athlete. Falls back to session if uid() not set yet. */
export function resolveAthleteUserId(userId = getCurrentUserId()) {
  return userId || getSession()?.user?.id || null;
}

/** Build chrome flags from sport mode + optional ui_flags overrides. */
export function chromeFlagsForSportMode(sportMode, uiFlags = {}) {
  const flags = uiFlags && typeof uiFlags === 'object' ? uiFlags : {};
  const mode = sportMode === 'run' || sportMode === 'hybrid' || sportMode === 'gym'
    ? sportMode
    : 'gym';
  const defaults = {
    gym: {
      showRunningTrends: false,
      showLifts: true,
      showKneeTracking: false,
      showRaceCountdown: false,
    },
    run: {
      showRunningTrends: true,
      showLifts: false,
      showKneeTracking: false,
      showRaceCountdown: false,
    },
    hybrid: {
      showRunningTrends: true,
      showLifts: true,
      showKneeTracking: false,
      showRaceCountdown: false,
    },
  }[mode];

  return {
    sportMode: mode,
    showRunningTrends: flags.showRunningTrends ?? defaults.showRunningTrends,
    showLifts: flags.showLifts ?? defaults.showLifts,
    showKneeTracking: flags.showKneeTracking ?? defaults.showKneeTracking,
    showRaceCountdown: flags.showRaceCountdown ?? defaults.showRaceCountdown,
  };
}

/** UI chrome profile — hard-coded flags with generic fallback for friends. */
export function getAthleteProfile(userId = resolveAthleteUserId()) {
  if (userId && PROFILES[userId]) return PROFILES[userId];
  const name = cachedDbProfile?.display_name
    || getProfile()?.display_name
    || 'Athlete';
  const sportMode = deriveSportMode(cachedDbProfile);
  const chrome = chromeFlagsForSportMode(sportMode, cachedDbProfile?.ui_flags);
  return {
    key: 'friend',
    displayName: name,
    sportMode: chrome.sportMode,
    block: {
      name: 'Training',
      shortName: 'Training',
      phase: 'Training',
      week: null,
      raceDate: null,
      raceName: null,
    },
    weightGoalKg: cachedDbProfile?.starting_weight_kg
      ? Number(cachedDbProfile.starting_weight_kg) - 2
      : null,
    weightGoalLabel: null,
    weightGoalStatLabel: null,
    showRunningTrends: chrome.showRunningTrends,
    showLifts: chrome.showLifts,
    showRaceCountdown: chrome.showRaceCountdown,
    showKneeTracking: chrome.showKneeTracking,
    showCigarettes: false,
    showSupplementsCard: false,
    supplementKeys: [],
    recoveryLines: [],
  };
}

export function isNamrata(userId = resolveAthleteUserId()) {
  return userId === NAMRATA_USER_ID;
}

export function getDbAthleteProfile() {
  return cachedDbProfile;
}

export function clearDbAthleteProfileCache() {
  cachedDbProfile = null;
}

/**
 * Load athlete_profiles row. Backfills known athletes once.
 * @returns {{ profile: object|null, needsSetup: boolean }}
 */
export async function ensureAthleteProfileReady() {
  const userId = resolveAthleteUserId();
  if (!userId) return { profile: null, needsSetup: true };

  let row = await fetchAthleteProfileRow(userId);

  if (!row && SETUP_BACKFILL[userId]) {
    const ok = await upsertAthleteProfile({
      ...SETUP_BACKFILL[userId],
      setup_completed_at: new Date().toISOString(),
    });
    if (ok) row = await fetchAthleteProfileRow(userId);
  }

  cachedDbProfile = row;

  if (!row || !row.setup_completed_at) {
    // Don't block coached athletes if migration hasn't been run yet
    if (PROFILES[userId]) {
      return { profile: row, needsSetup: false };
    }
    return { profile: row, needsSetup: true };
  }
  return { profile: row, needsSetup: false };
}

export async function refreshDbAthleteProfile() {
  const userId = resolveAthleteUserId();
  cachedDbProfile = userId ? await fetchAthleteProfileRow(userId) : null;
  return cachedDbProfile;
}
