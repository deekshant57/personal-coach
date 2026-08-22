"""Week plan constants (Deekshant).

Source of truth for scheduled days: Supabase ``daily_plans``.

This file no longer stores historical or upcoming week rows. The cancelled
Vedanta Zinc City HM (6 Sep 2026) peak/taper plans were removed 21 Aug 2026.

Coach workflow for Deekshant:
1. Author Week N+1 in the Monday debrief (chat)
2. Write/PATCH rows directly in Supabase ``daily_plans`` (or a one-off patch script)
3. Verify with ``python3 audit-week-plan.py --week-of YYYY-MM-DD``

``WEEK_PLANS`` stays empty so ``seed-plans.py`` cannot overwrite the DB with stale
file data. Namrata still uses ``athletes/namrata/coach/week-plans.py``.

Shared warm-up / cool-down strings below are reference only for coaching copy.
"""

NA = "NA"

RUN_WARMUP = (
    "WARM-UP (8–10 min): 3 min brisk walk → 2 min easy jog → "
    "leg swings 10/side → walking lunges 8/side → "
    "high knees 20s → butt kicks 20s → "
    "standing quad pull (hand on foot) 30s/side → "
    "ankle circles 10/side"
)

RUN_COOLDOWN = (
    "COOL-DOWN (5 min): 2 min walk → "
    "standing calf stretch 30s/side → "
    "standing quad pull 30s/side → "
    "hip flexor stretch 30s/side → "
    "hamstring stretch 30s/side"
)

MOBILITY_COOLDOWN = (
    "COOL-DOWN: gentle walk 2 min → "
    "hip flexor stretch 30s/side → child's pose 30s"
)

GYM_PUSH_WARMUP = (
    "WARM-UP (8 min): 5 min treadmill walk at incline → "
    "arm circles 20 → band pull-aparts 1×15 → "
    "push-ups 1×10 (slow) → "
    "1 warm-up set bench at 50% working weight"
)

GYM_PULL_WARMUP = (
    "WARM-UP (8 min): 5 min treadmill walk at incline → "
    "band pull-aparts 1×15 → dead hang 30s → "
    "1 warm-up set of first pull movement"
)

GYM_LEGS_WARMUP = (
    "WARM-UP (8 min): 5 min treadmill walk → bodyweight squats 2×10 → "
    "hip circles 10/side → leg swings 10/side → glute bridges 1×15 → "
    "1 light warm-up set of first lift"
)

GYM_COOLDOWN = (
    "COOL-DOWN (5 min): chest doorway stretch 30s/side → "
    "lat stretch 30s/side → shoulder cross-body 30s/side → "
    "hip flexor stretch 30s/side → child's pose 30s"
)

# Intentionally empty — live plans live in Supabase daily_plans.
WEEK_PLANS = {}

MONDAY_DATES = []
