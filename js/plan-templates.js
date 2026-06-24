// Warm-up / cool-down templates — keep in sync with generate-tracker.py

export const RUN_WARMUP =
  'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → ' +
  'bodyweight squats 1×10 (slow) → calf raises 1×15 → ' +
  'leg swings 10/side → hip circles 10/side → ankle circles → ' +
  '1 min easy jog to start';

export const RUN_COOLDOWN =
  "COOL-DOWN (8 min): 5 min walk (don't stop abruptly) → " +
  'standing wall calf stretch 30s/side → ' +
  'standing quad pull (hand on foot) 30s/side → ' +
  'kneeling hip flexor stretch 30s/side → ' +
  'seated hamstring stretch 30s/side → ' +
  'figure-4 glute / IT band stretch 30s/side';

export const WKT_WARMUP =
  'WARM-UP (5 min): brisk walk or jog in place 2 min → ' +
  'arm circles 20 → hip circles 10/side → ' +
  'bodyweight squats 1×10 (slow) → push-ups 1×5 (slow)';

export const WKT_COOLDOWN =
  'COOL-DOWN (5 min): chest doorway stretch 30s/side → ' +
  'lat stretch 30s/side → shoulder cross-body 30s/side → ' +
  'hip flexor stretch 30s/side → child\'s pose 30s';

export const MOBILITY_COOLDOWN =
  'COOL-DOWN (5 min): kneeling hip flexor stretch 30s/side → ' +
  'seated hamstring stretch 30s/side → ' +
  'figure-4 glute stretch 30s/side → ' +
  'standing wall calf stretch 30s/side';

/** Pull WARM-UP / COOL-DOWN lines out of a plan detail string. */
export function extractWarmupCooldown(text) {
  if (!text) return '';
  return text
    .split(' · ')
    .map((s) => s.trim())
    .filter((s) => /^WARM-UP/i.test(s) || /^COOL-DOWN/i.test(s) || /^Extra:/i.test(s))
    .join('\n\n');
}

/** Run cues only — cadence, RPE, location (not warm-up / cool-down). */
export function extractRunCues(runCue) {
  if (!runCue) return '';
  return runCue
    .split(' · ')
    .map((s) => s.trim())
    .filter((s) => s && !/^WARM-UP/i.test(s) && !/^COOL-DOWN/i.test(s) && !/^Extra:/i.test(s))
    .join(' · ');
}
