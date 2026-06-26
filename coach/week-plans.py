#!/usr/bin/env python3
"""Coach-authored week plans — source of truth for seed-plans.py."""

NA = "NA"

# ── Week plans ─────────────────────────────────────────────────────────────────
# Warm-up / cool-down templates (referenced in day details)
RUN_WARMUP = (
    "WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → "
    "bodyweight squats 1×10 (slow) → calf raises 1×15 → "
    "leg swings 10/side → hip circles 10/side → ankle circles → "
    "1 min easy jog to start"
)
RUN_COOLDOWN = (
    "COOL-DOWN (8 min): 5 min walk (don't stop abruptly) → "
    "standing wall calf stretch 30s/side → "
    "standing quad pull (hand on foot) 30s/side → "
    "kneeling hip flexor stretch 30s/side → "
    "seated hamstring stretch 30s/side → "
    "figure-4 glute / IT band stretch 30s/side"
)
MOBILITY_COOLDOWN = (
    "COOL-DOWN (5 min): kneeling hip flexor stretch 30s/side → "
    "seated hamstring stretch 30s/side → "
    "figure-4 glute stretch 30s/side → "
    "standing wall calf stretch 30s/side"
)
WKT_WARMUP = (
    "WARM-UP (5 min): brisk walk or jog in place 2 min → "
    "arm circles 20 → hip circles 10/side → "
    "bodyweight squats 1×10 (slow) → push-ups 1×5 (slow)"
)
WKT_COOLDOWN = (
    "COOL-DOWN (5 min): chest doorway stretch 30s/side → "
    "lat stretch 30s/side → shoulder cross-body 30s/side → "
    "hip flexor stretch 30s/side → child's pose 30s"
)
MONSOON_NOTE = (
    "MONSOON BACKUP: If heavy rain at run time — do 20 min indoor bodyweight cardio "
    "(jumping jacks 3×1 min + high knees 3×1 min + mountain climbers 3×30s + "
    "burpees 3×8). Reschedule the run to next available dry slot within 48h. "
    "Don't skip — substitute."
)
CADENCE_NOTE = (
    "CADENCE: Current 142, target 150+. Use a free metronome app (150 BPM). "
    "Focus on shorter, quicker steps — not longer strides. "
    "Week 1 goal: just awareness. Don't force it if form breaks down."
)

WEEK_PLANS = {
    1: {
        "label": "Week 1",
        "dates": "22 Jun – 28 Jun 2026",
        "focus": (
            "Base week · No gym · Easy runs only · 12 km total · "
            "Set alarm 6:20 AM on training days (Mon/Tue/Thu/Fri/Sat) · "
            "Sleep floor: 7h minimum every night · Last caffeine by 4 PM · Screens off by 11 PM"
        ),
        "days": [
            # ── MONDAY ─────────────────────────────────────────────
            {
                "date": "2026-06-22", "day": "Mon", "type": "Bodyweight",
                "protein": 150, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "Bodyweight — upper + core + light knee activation",
                    "detail": (
                        f"{WKT_WARMUP} · "
                        "Pull-ups 4×max · Push-ups 3×15 · "
                        "Rows 3×10 (park bench) · Dead hang 3×20s · "
                        "Plank 3×40s · Side plank 2×30s · "
                        "Glute bridges 2×12 (light activation only — not strength) · "
                        "25–30 min · RPE 5 · "
                        f"{WKT_COOLDOWN}"
                    ),
                },
                "meals": (
                    "— PROTEIN MATH: 4 eggs (28g) + 1 chapati (3g) + 1 whey (24g) "
                    "+ 2 chapati (6g) + dal (12g) + 100g paneer (18g) + salad (2g) "
                    "+ 1 whey (24g) + walnuts (3g) + 3 eggs (21g) + curd (8g) "
                    "+ veggies (3g) = ~152g ✓ —\n"
                    "6:30 Pre-workout — Water + black coffee\n"
                    "7:45 Post-workout — 4 eggs bhurji + 1 chapati + 1 scoop whey (water)\n"
                    "1:00 Lunch — 2 chapati + 1 bowl moong dal + 100g paneer + salad\n"
                    "4:30 Snack — 1 scoop whey (water) + 10 walnuts\n"
                    "8:30 Dinner — 3 eggs omelette + 1 bowl curd + sautéed veggies\n"
                    "Supplements — Supradyn after post-workout meal · "
                    "Creatine 5g with lunch\n"
                    "Avoid — sweets, juice, fried snacks (triglycerides)"
                ),
                "directive": (
                    "First day. Upper body only — NO squats/lunges today. "
                    "Legs must be fresh for tomorrow's run. "
                    "Glute bridges are activation, not a strength set."
                ),
            },
            # ── TUESDAY ────────────────────────────────────────────
            {
                "date": "2026-06-23", "day": "Tue", "type": "Run",
                "protein": 148, "water": "2.5L",
                "run": {
                    "type": "Easy", "km": 3, "pace": "8:00–8:30/km",
                    "cue": (
                        f"{RUN_WARMUP} · "
                        "Cadence: use 150 BPM metronome · RPE 5–6 · "
                        "Oxygen Park · "
                        f"{RUN_COOLDOWN}"
                    ),
                },
                "workout": {"plan": NA, "detail": NA},
                "meals": (
                    "— PROTEIN MATH: banana (1g) + 4 eggs (28g) + 2 toast (6g) "
                    "+ curd (8g) + 2 chapati (6g) + dal (12g) + 100g paneer (18g) "
                    "+ salad (2g) + 1 whey (24g) + peanuts (7g) + 3 eggs (21g) "
                    "+ dal (12g) + veggies (3g) = ~148g ✓ —\n"
                    "6:20 Pre-run — 1 banana + 250ml water\n"
                    "6:40 Warm-up at park (see run cue)\n"
                    "~7:30 Post-run — 4 eggs + 2 whole wheat toast + 1 bowl curd "
                    "+ 500ml water with pinch salt + lemon\n"
                    "1:00 Lunch — 2 chapati + 1 bowl dal + 100g paneer + salad\n"
                    "4:00 Snack — 1 scoop whey (water) + small handful peanuts (30g)\n"
                    "8:30 Dinner — 3 eggs bhurji + 1 bowl dal + veggies\n"
                    "Supplements — Supradyn after post-run meal · Creatine 5g with lunch\n"
                    f"{MONSOON_NOTE}"
                ),
                "directive": (
                    "Easy means easy — slower than your 5 km pace. "
                    "Warm-up is mandatory, not optional. "
                    "If knee feels off during warm-up squats, walk today instead. "
                    f"{CADENCE_NOTE}"
                ),
            },
            # ── WEDNESDAY ──────────────────────────────────────────
            {
                "date": "2026-06-24", "day": "Wed", "type": "Active Recovery",
                "protein": 149, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "Knee prep + mobility",
                    "detail": (
                        "WARM-UP (5 min): 5 min brisk walk · "
                        "Squats 3×15 (slow, controlled) · Lunges 2×10/leg · "
                        "Glute bridges 3×15 · Calf raises 3×20 · "
                        "Foam roll quads + calves + IT band 5 min · "
                        "20–25 min · RPE 4–5 · Keep it light — this is prep, not a leg day · "
                        f"{MOBILITY_COOLDOWN}"
                    ),
                },
                "meals": (
                    "— PROTEIN MATH: 4 eggs (28g) + 1 whey (24g) + 1.5 chapati (5g) "
                    "+ dal (12g) + 150g curd (12g) + salad (2g) + 1 whey (24g) "
                    "+ walnuts (3g) + 3 eggs (21g) + 80g paneer (14g) "
                    "+ veggies (3g) = ~148g ✓ —\n"
                    "8:00 Breakfast — 4 eggs + 1 scoop whey (water or milk)\n"
                    "1:00 Lunch — 1.5 chapati + 1 bowl dal + 150g curd + salad\n"
                    "4:30 Snack — 1 scoop whey (water) + 10 walnuts\n"
                    "8:30 Dinner — 3 eggs + 80g paneer + veggies (no rice)\n"
                    "Rest day — fewer carbs than run days, protein stays the same\n"
                    "Supplements — Supradyn after breakfast · Creatine 5g with lunch\n"
                    "Avoid — refined carbs, sugary drinks, fried food"
                ),
                "directive": (
                    "Knee prep day — not a leg strength session. "
                    "Slow, controlled reps. If any knee discomfort, stop squats/lunges "
                    "and do glute bridges + calf raises only. "
                    "Foam rolling is mandatory. Sleep target: 7+ hours tonight."
                ),
            },
            # ── THURSDAY ───────────────────────────────────────────
            {
                "date": "2026-06-25", "day": "Thu", "type": "Run",
                "protein": 148, "water": "2.5L",
                "run": {
                    "type": "Easy", "km": 4, "pace": "8:00–8:30/km",
                    "cue": (
                        f"{RUN_WARMUP} · "
                        "Cadence: 150 BPM metronome · RPE 5–6 · "
                        "Knee check at 2 km — if pain, walk home · "
                        f"{RUN_COOLDOWN}"
                    ),
                },
                "workout": {"plan": NA, "detail": NA},
                "meals": (
                    "— PROTEIN MATH: banana (1g) + 4 eggs (28g) + 2 chapati (6g) "
                    "+ curd (8g) + 2 chapati (6g) + dal (12g) + 100g paneer (18g) "
                    "+ 1 whey (24g) + flaxseed (2g) + peanuts (7g) "
                    "+ 3 eggs (21g) + dal (12g) + veggies (3g) = ~148g ✓ —\n"
                    "6:20 Pre-run — 1 banana + 250ml water\n"
                    "6:40 Warm-up at park (see run cue)\n"
                    "~7:40 Post-run — 4 eggs + 2 chapati + 1 bowl curd "
                    "+ 500ml water with pinch salt + lemon\n"
                    "1:00 Lunch — 2 chapati + 1 bowl dal + 100g paneer\n"
                    "4:00 Snack — 1 scoop whey + 1 tbsp flaxseed + handful peanuts (30g)\n"
                    "8:30 Dinner — 3 eggs + 1 bowl dal + salad\n"
                    "Supplements — Supradyn after post-run meal · Creatine 5g with lunch · "
                    "Uprise D3 60K with fattiest meal (weekly)\n"
                    f"{MONSOON_NOTE}"
                ),
                "directive": (
                    "Longest mid-week run. Hold the pace ceiling. "
                    "Warm-up is non-negotiable — your knees need it. "
                    "If heavy rain, do monsoon backup and reschedule to Fri AM."
                ),
            },
            # ── FRIDAY ─────────────────────────────────────────────
            {
                "date": "2026-06-26", "day": "Fri", "type": "Bodyweight",
                "protein": 150, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "Bodyweight — upper + core",
                    "detail": (
                        f"{WKT_WARMUP} · "
                        "Pull-ups 4×max · Push-ups 3×max · "
                        "Rows 3×10 (park bench) · Dead hang 3×20s · "
                        "Plank 3×40s · Side plank 2×30s · "
                        "Calf raises 2×15 (light) · "
                        "25–30 min · RPE 5–6 · "
                        f"{WKT_COOLDOWN}"
                    ),
                },
                "meals": (
                    "— PROTEIN MATH: 4 eggs (28g) + 1 chapati (3g) + 1 whey (24g) "
                    "+ 2 chapati (6g) + chana (15g) + 100g paneer (18g) "
                    "+ 1 whey (24g) + walnuts (3g) + 3 eggs (21g) + curd (8g) "
                    "+ veggies (3g) = ~153g ✓ —\n"
                    "6:30 Pre-workout — Water + black coffee\n"
                    "7:45 Post-workout — 4 eggs + 1 chapati + 1 scoop whey (water)\n"
                    "1:00 Lunch — 2 chapati + 1 bowl chana/rajma + 100g paneer\n"
                    "4:30 Snack — 1 scoop whey (water) + 10 walnuts\n"
                    "8:30 Dinner — 3 eggs + curd + veggies\n"
                    "Supplements — Supradyn after post-workout meal · Creatine 5g with lunch\n"
                    "Avoid — fried snacks, heavy dinner (long run tomorrow)"
                ),
                "directive": (
                    "Upper body only — keep legs fresh for tomorrow's long run. "
                    "Calf raises are light, not a strength set. "
                    "Quality reps over ego. Sleep early tonight — 7h minimum."
                ),
            },
            # ── SATURDAY ───────────────────────────────────────────
            {
                "date": "2026-06-27", "day": "Sat", "type": "Run",
                "protein": 150, "water": "2.5L+",
                "run": {
                    "type": "Long Easy", "km": 5, "pace": "8:00–8:45/km",
                    "cue": (
                        f"{RUN_WARMUP} · "
                        "Cadence: 150 BPM metronome · RPE 6 max · "
                        "Walk 1 min at 2.5 km if needed · "
                        f"{RUN_COOLDOWN} · "
                        "Extra: foam roll quads + calves post-shower if available"
                    ),
                },
                "workout": {"plan": NA, "detail": NA},
                "meals": (
                    "— PROTEIN MATH: banana (1g) + dates (1g) + 4 eggs (28g) "
                    "+ 2 chapati (6g) + curd (8g) + 2.5 chapati (8g) + dal (12g) "
                    "+ 100g paneer (18g) + 1 whey (24g) + peanuts (7g) "
                    "+ 3 eggs (21g) + dal (12g) + veggies (3g) = ~149g ✓ —\n"
                    "6:20 Pre-run — 1 banana + 2 dates + 250ml water\n"
                    "6:40 Warm-up at park (see run cue) — take extra time today\n"
                    "~7:50 Post-run — 4 eggs + 2 chapati + curd "
                    "+ 500ml water with pinch salt + lemon\n"
                    "1:00 Lunch — 2–3 chapati + dal + 100g paneer (don't skip carbs)\n"
                    "4:00 Snack — 1 scoop whey + handful peanuts (30g)\n"
                    "8:30 Dinner — 3 eggs + dal + veggies\n"
                    "Highest carb day of the week · Supradyn after post-run · "
                    "Creatine 5g with lunch\n"
                    f"{MONSOON_NOTE}"
                ),
                "directive": (
                    "Week's key run. Consolidate 5 km. "
                    "Finish feeling you could do 1 more km. "
                    "Full warm-up, full cool-down, no shortcuts. "
                    "If monsoon blocks Sat, move to Sun — don't skip the long run."
                ),
            },
            # ── SUNDAY ─────────────────────────────────────────────
            {
                "date": "2026-06-28", "day": "Sun", "type": "Rest",
                "protein": 149, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {"plan": NA, "detail": "Optional: 20 min gentle walk + foam roll legs"},
                "meals": (
                    "— PROTEIN MATH: 4 eggs (28g) + 1 whey (24g) + 2 chapati (6g) "
                    "+ dal (12g) + 100g paneer (18g) + salad (2g) "
                    "+ 1 whey (24g) + walnuts (3g) + 3 eggs (21g) + curd (8g) "
                    "+ veggies (3g) = ~149g ✓ —\n"
                    "8:00 Breakfast — 4 eggs + 1 scoop whey (water or milk)\n"
                    "1:00 Lunch — 2 chapati + dal + 100g paneer + salad\n"
                    "4:30 Snack — 1 scoop whey (water) + 10 walnuts\n"
                    "8:30 Dinner — 3 eggs + curd + veggies\n"
                    "Supplements — Supradyn after breakfast · Creatine 5g with lunch\n"
                    "Monday AM — weigh before food, measure waist"
                ),
                "directive": (
                    "Close the week clean. "
                    "If long run moved here due to rain, this becomes run day "
                    "and Monday becomes rest. Weigh Monday AM before food."
                ),
            },
        ],
    },
}

MONDAY_DATES = [
    "2026-06-22", "2026-06-29", "2026-07-06", "2026-07-13", "2026-07-20",
    "2026-07-27", "2026-08-03", "2026-08-10", "2026-08-17", "2026-08-24",
    "2026-08-31",
]
