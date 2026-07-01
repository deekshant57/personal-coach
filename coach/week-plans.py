#!/usr/bin/env python3
"""Coach-authored week plans — source of truth for seed-plans.py."""

NA = "NA"

# ── Warm-up / cool-down templates ─────────────────────────────────────────────
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
GYM_PUSH_WARMUP = (
    "WARM-UP (8 min): 5 min treadmill walk at incline → "
    "arm circles 20 → band pull-aparts 1×15 → "
    "push-ups 1×10 (slow) → "
    "1 warm-up set bench at 50% working weight"
)
GYM_PULL_WARMUP = (
    "WARM-UP (8 min): 5 min treadmill walk at incline → "
    "arm circles 20 → hip circles 10/side → "
    "band pull-aparts 1×15 → dead hang 30s → "
    "1 warm-up set rows at 50% working weight"
)
GYM_COOLDOWN = (
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
SUPPL_DAILY = "Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch"
SUPPL_D3 = "Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch · Uprise D3 60K with fattiest meal (weekly)"

# ── Week plans ────────────────────────────────────────────────────────────────

WEEK_PLANS = {
    # ══════════════════════════════════════════════════════════════════════════
    # WEEK 1 — Base week · Bodyweight only · 12 km
    # ══════════════════════════════════════════════════════════════════════════
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
                "protein": 152, "calories": 2000, "water": "2L",
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
                    "+ veggies (3g) = ~152g ✓ · CALORIES ~1,950–2,050 —\n"
                    "6:30 Pre-workout — Water + black coffee\n"
                    "7:45 Post-workout — 4 eggs bhurji + 1 chapati + 1 scoop whey (water)\n"
                    "1:00 Lunch — 2 chapati + 1 bowl moong dal + 100g paneer + salad\n"
                    "4:30 Snack — 1 scoop whey (water) + 10 walnuts\n"
                    "8:30 Dinner — 3 eggs omelette + 1 bowl curd + sautéed veggies\n"
                    f"Supplements — {SUPPL_DAILY}\n"
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
                "protein": 148, "calories": 2050, "water": "2.5L",
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
                    "+ dal (12g) + veggies (3g) = ~148g ✓ · CALORIES ~2,000–2,100 —\n"
                    "6:20 Pre-run — 1 banana + 250ml water\n"
                    "6:40 Warm-up at park (see run cue)\n"
                    "~7:30 Post-run — 4 eggs + 2 whole wheat toast + 1 bowl curd "
                    "+ 500ml water with pinch salt + lemon\n"
                    "1:00 Lunch — 2 chapati + 1 bowl dal + 100g paneer + salad\n"
                    "4:00 Snack — 1 scoop whey (water) + small handful peanuts (30g)\n"
                    "8:30 Dinner — 3 eggs bhurji + 1 bowl dal + veggies\n"
                    f"Supplements — {SUPPL_DAILY}\n"
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
                "protein": 148, "calories": 1900, "water": "2L",
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
                    "+ veggies (3g) = ~148g ✓ · CALORIES ~1,850–1,950 —\n"
                    "8:00 Breakfast — 4 eggs + 1 scoop whey (water or milk)\n"
                    "1:00 Lunch — 1.5 chapati + 1 bowl dal + 150g curd + salad\n"
                    "4:30 Snack — 1 scoop whey (water) + 10 walnuts\n"
                    "8:30 Dinner — 3 eggs + 80g paneer + veggies (no rice)\n"
                    "Rest day — fewer carbs than run days, protein stays the same\n"
                    f"Supplements — {SUPPL_DAILY}\n"
                    "Avoid — refined carbs, sugary drinks, fried food"
                ),
                "directive": (
                    "Knee prep day — not a leg strength session. "
                    "Slow, controlled reps. If any knee discomfort, stop squats/lunges "
                    "and do glute bridges + calf raises only. "
                    "Foam rolling is mandatory. Sleep target: 7+ hours tonight. "
                    "After work (~7:45 PM): 25–30 min brisk walk — non-negotiable NEAT."
                ),
            },
            # ── THURSDAY ───────────────────────────────────────────
            {
                "date": "2026-06-25", "day": "Thu", "type": "Run",
                "protein": 148, "calories": 2050, "water": "2.5L",
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
                    "+ 3 eggs (21g) + dal (12g) + veggies (3g) = ~148g ✓ · CALORIES ~2,000–2,100 —\n"
                    "6:20 Pre-run — 1 banana + 250ml water\n"
                    "6:40 Warm-up at park (see run cue)\n"
                    "~7:40 Post-run — 4 eggs + 2 chapati + 1 bowl curd "
                    "+ 500ml water with pinch salt + lemon\n"
                    "1:00 Lunch — 2 chapati + 1 bowl dal + 100g paneer\n"
                    "4:00 Snack — 1 scoop whey + 1 tbsp flaxseed + handful peanuts (30g)\n"
                    "8:30 Dinner — 3 eggs + 1 bowl dal + salad\n"
                    f"Supplements — {SUPPL_D3}\n"
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
                "protein": 156, "calories": 2050, "water": "2L",
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
                    "+ 1 chapati (3g) + veggies (3g) = ~156g ✓ · CALORIES ~2,000–2,100 —\n"
                    "6:30 Pre-workout — Water + black coffee\n"
                    "7:45 Post-workout — 4 eggs + 1 chapati + 1 scoop whey (water)\n"
                    "1:00 Lunch — 2 chapati + 1 bowl chana/rajma + 100g paneer\n"
                    "4:30 Snack — 1 scoop whey (water) + 10 walnuts\n"
                    "8:30 Dinner — 3 eggs + 1 chapati + curd + veggies\n"
                    "PRE-LONG-RUN — +1 chapati vs normal rest dinner (~+80 kcal carbs)\n"
                    f"Supplements — {SUPPL_DAILY}"
                ),
                "directive": (
                    "Upper body only — keep legs fresh for tomorrow's long run. "
                    "Calf raises are light, not a strength set. "
                    "Carb-forward dinner tonight — not a light dinner. Sleep by 11 PM."
                ),
            },
            # ── SATURDAY ───────────────────────────────────────────
            {
                "date": "2026-06-27", "day": "Sat", "type": "Run",
                "protein": 149, "calories": 2100, "water": "2.5L+",
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
                    "+ 3 eggs (21g) + dal (12g) + veggies (3g) = ~149g ✓ · CALORIES ~2,050–2,150 —\n"
                    "6:20 Pre-run — 1 banana + 2 dates + 250ml water\n"
                    "6:40 Warm-up at park (see run cue) — take extra time today\n"
                    "~7:50 Post-run — 4 eggs + 2 chapati + curd "
                    "+ 500ml water with pinch salt + lemon\n"
                    "1:00 Lunch — 2–3 chapati + dal + 100g paneer (don't skip carbs)\n"
                    "4:00 Snack — 1 scoop whey + handful peanuts (30g)\n"
                    "8:30 Dinner — 3 eggs + dal + veggies\n"
                    f"Highest carb day of the week · {SUPPL_DAILY}\n"
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
                "protein": 149, "calories": 1850, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "NEAT walk + recovery",
                    "detail": (
                        "Mandatory: 25–30 min brisk walk (morning or ~7:45 PM) · "
                        "Foam roll quads + calves 5 min"
                    ),
                },
                "meals": (
                    "— PROTEIN MATH: 4 eggs (28g) + 1 whey (24g) + 2 chapati (6g) "
                    "+ dal (12g) + 100g paneer (18g) + salad (2g) "
                    "+ 1 whey (24g) + walnuts (3g) + 3 eggs (21g) + curd (8g) "
                    "+ veggies (3g) = ~149g ✓ · CALORIES ~1,800–1,900 —\n"
                    "8:00 Breakfast — 4 eggs + 1 scoop whey (water or milk)\n"
                    "1:00 Lunch — 2 chapati + dal + 100g paneer + salad\n"
                    "4:30 Snack — 1 scoop whey (water) + 10 walnuts\n"
                    "8:30 Dinner — 3 eggs + curd + veggies\n"
                    f"Supplements — {SUPPL_DAILY}\n"
                    "Monday AM — weigh before food, measure waist"
                ),
                "directive": (
                    "Mandatory 25–30 min brisk walk today — not optional. "
                    "Close the week clean. "
                    "If long run moved here due to rain, this becomes run day "
                    "and Monday becomes rest. Weigh Monday AM before food."
                ),
            },
        ],
    },

    # ══════════════════════════════════════════════════════════════════════════
    # WEEK 2 — Build on base · 12.5 km
    # ══════════════════════════════════════════════════════════════════════════
    2: {
        "label": "Week 2",
        "dates": "29 Jun – 5 Jul 2026",
        "focus": (
            "Build on 5 km long run · 12.5 km total (+10% cap) · "
            "Cadence: 150 BPM metronome — short quick steps, not slow shuffle · "
            "Upper-only bodyweight Mon/Fri · Mandatory Wed mobility + ankle drills · "
            "Meals: poha/chilla/upma at breakfast — chapati at lunch only · "
            "Legume rotation: chana, rajma, dal · Log from food grid (new items added) · "
            "Sleep floor 7h · Last caffeine 4 PM"
        ),
        "days": [
            {
                "date": "2026-06-29", "day": "Mon", "type": "Bodyweight",
                "protein": 152, "calories": 2000, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "Bodyweight — upper + core ONLY",
                    "detail": (
                        f"{WKT_WARMUP} · "
                        "Pull-ups 4×max · Push-ups 3×15 · "
                        "Rows 3×10 (park bench) · Dead hang 3×20s · "
                        "Plank 3×40s · Side plank 2×30s · "
                        "Glute bridges 2×12 (activation only — NOT strength) · "
                        "NO squats · NO lunges · 25–30 min · RPE 5 · "
                        f"{WKT_COOLDOWN}"
                    ),
                },
                "meals": (
                    "— PROTEIN MATH (verified): moong chilla 2 w/ paneer (20g) + 3 eggs (21g) "
                    "+ 2 chapati (6g) + chana (15g) + paneer (18g) + salad (2g) "
                    "+ whey (24g) + walnuts (3g) + tofu (12g) + hung curd (14g) "
                    "+ 2 eggs (14g) + veggies (3g) = ~152g · "
                    "CALORIES ~1,950–2,050 —\n"
                    "6:30 Pre-workout — Water + black coffee\n"
                    "7:45 Post-workout — 2 moong dal chillas with paneer + 3 eggs bhurji\n"
                    "1:00 Lunch — 2 chapati + 1 bowl chana masala + 100g paneer + salad\n"
                    "4:30 Snack — 1 scoop whey (water) + 10 walnuts\n"
                    "8:30 Dinner — 100g tofu bhurji + hung curd + 2 eggs + sautéed veggies\n"
                    f"Supplements — {SUPPL_DAILY}\n"
                    "Rule — breakfast = chilla (no chapati); chapati at lunch only"
                ),
                "directive": (
                    "Week 2 starts here. Upper body ONLY — zero squats/lunges. "
                    "You did leg work on Mon W1 and paid for it Tue. Not again. "
                    "Monday AM: weigh + waist before food. Log meals from food grid."
                ),
            },
            {
                "date": "2026-06-30", "day": "Tue", "type": "Run",
                "protein": 149, "calories": 2050, "water": "2.5L",
                "run": {
                    "type": "Easy", "km": 3, "pace": "8:00–8:30/km",
                    "cue": (
                        f"{RUN_WARMUP} · "
                        "Cadence: 150 BPM metronome — SHORT steps + fast turnover · "
                        "Land with soft knee, foot under hip · RPE 5–6 · "
                        f"{RUN_COOLDOWN}"
                    ),
                },
                "workout": {"plan": NA, "detail": NA},
                "meals": (
                    "— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + poha (4g) "
                    "+ curd (8g) + 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) "
                    "+ whey (24g) + roasted chana (8g) + 3 eggs (21g) + palak dal (14g) "
                    "+ veggies (3g) = ~149g · CALORIES ~2,000–2,100 —\n"
                    "6:20 Pre-run — 1 banana + 250ml water (or sattu drink on light-stomach days)\n"
                    "6:40 Warm-up at park\n"
                    "~7:30 Post-run — 4 eggs + 1 plate poha + 1 bowl curd "
                    "+ 500ml water with pinch salt + lemon\n"
                    "1:00 Lunch — 2 chapati + 1 bowl moong dal + 100g paneer + salad\n"
                    "4:00 Snack — 1 scoop whey (water) + roasted chana (30g)\n"
                    "8:30 Dinner — 3 eggs bhurji + 1 bowl palak dal + veggies\n"
                    f"Supplements — {SUPPL_DAILY}\n"
                    f"{MONSOON_NOTE}"
                ),
                "directive": (
                    "Morning run — not evening. Alarm 6:20. "
                    "Target 145–155 SPM with metronome — not slow shuffle at 124."
                ),
            },
            {
                "date": "2026-07-01", "day": "Wed", "type": "Active Recovery",
                "protein": 149, "calories": 1900, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "Knee prep + mobility — mandatory",
                    "detail": (
                        "WARM-UP (5 min): 5 min brisk walk · "
                        "Glute bridges 3×15 · Calf raises 3×20 · "
                        "Clamshells 2×12/side · "
                        "Ankle dorsiflexion drills: knee-to-wall 2×10/side — fix ankle lock · "
                        "Foam roll quads + calves + IT band 5 min · "
                        "20 min · RPE 4 · "
                        f"{MOBILITY_COOLDOWN}"
                    ),
                },
                "meals": (
                    "— PROTEIN MATH (verified): 4 eggs (28g) + besan chilla 1.5 w/ paneer (17g) "
                    "+ 1.5 chapati (5g) + rajma (15g) + curd (8g) + salad (2g) "
                    "+ whey (24g) + flaxseed (2g) + walnuts (3g) + 4 eggs (28g) "
                    "+ 80g paneer (14g) + veggies (3g) = ~149g · CALORIES ~1,850–1,950 —\n"
                    "8:00 Breakfast — 4 eggs + 1.5 besan chilla with grated paneer\n"
                    "1:00 Lunch — 1.5 chapati + 1 bowl rajma + cucumber raita + salad\n"
                    "4:30 Snack — 1 scoop whey (water) + 1 tbsp flaxseed + 10 walnuts\n"
                    "8:30 Dinner — 4 eggs + 80g paneer + veggies (no rice)\n"
                    "Rest day — fewer carbs than run days, protein stays the same\n"
                    f"Supplements — {SUPPL_DAILY}"
                ),
                "directive": (
                    "You skipped Wed W1 mobility. Not optional — protects knee for long run. "
                    "Do the ankle drills. Ankle lock on Sat run is a form fault this fixes. "
                    "After work (~7:45 PM): 25–30 min brisk walk — non-negotiable NEAT."
                ),
            },
            {
                "date": "2026-07-02", "day": "Thu", "type": "Run",
                "protein": 152, "calories": 2050, "water": "2.5L",
                "run": {
                    "type": "Easy", "km": 4, "pace": "8:00–8:30/km",
                    "cue": (
                        f"{RUN_WARMUP} · "
                        "Cadence: 150 BPM · Short quick steps · "
                        "Complete full 4 km — walk 1 min at 2 km if needed · "
                        "Knee check at 2 km · "
                        f"{RUN_COOLDOWN}"
                    ),
                },
                "workout": {"plan": NA, "detail": NA},
                "meals": (
                    "— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + 2 toast (6g) "
                    "+ curd (8g) + 2 chapati (6g) + dal (12g) + paneer (18g) "
                    "+ whey (24g) + flaxseed (2g) + peanuts (7g) + sprout chaat (10g) "
                    "+ 3 eggs (21g) + 1 egg (7g) + salad (2g) = ~152g · CALORIES ~2,000–2,100 —\n"
                    "6:20 Pre-run — 1 banana + 250ml water\n"
                    "6:40 Warm-up at park\n"
                    "~7:40 Post-run — 4 eggs + 2 whole wheat toast + 1 bowl curd "
                    "+ 500ml water with pinch salt + lemon\n"
                    "1:00 Lunch — 2 chapati + 1 bowl toor dal + 100g paneer\n"
                    "4:00 Snack — 1 scoop whey + 1 tbsp flaxseed + handful peanuts (30g)\n"
                    "8:30 Dinner — 1 bowl sprout chaat + 3 eggs + 1 egg + salad\n"
                    f"Supplements — {SUPPL_D3}\n"
                    f"{MONSOON_NOTE}"
                ),
                "directive": (
                    "Full 4 km this time — you stopped at 3.6 km W1. "
                    "Walk breaks are fine; quitting early is not."
                ),
            },
            {
                "date": "2026-07-03", "day": "Fri", "type": "Bodyweight",
                "protein": 154, "calories": 2050, "water": "2L",
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
                    "— PROTEIN MATH (verified): 4 eggs (28g) + poha (4g) + whey (24g) "
                    "+ 2 chapati (6g) + rajma (15g) + paneer (18g) "
                    "+ whey (24g) + walnuts (3g) + 3 eggs (21g) + curd (8g) "
                    "+ 1 chapati (3g) + veggies (3g) = ~154g · CALORIES ~2,000–2,100 —\n"
                    "6:30 Pre-workout — Water + black coffee\n"
                    "7:45 Post-workout — 4 eggs + 1 plate poha + 1 scoop whey (water)\n"
                    "1:00 Lunch — 2 chapati + 1 bowl rajma + 100g paneer\n"
                    "4:30 Snack — 1 scoop whey (water) + 10 walnuts\n"
                    "8:30 Dinner — 3 eggs + 1 chapati + curd + veggies\n"
                    "PRE-LONG-RUN — +1 chapati vs normal rest dinner (~+80 kcal carbs)\n"
                    f"Supplements — {SUPPL_DAILY}"
                ),
                "directive": (
                    "Complete pull-ups and rows this time — you skipped them Fri W1. "
                    "Upper body only. Carb-forward dinner tonight — not a light dinner. "
                    "Sleep by 11 PM before long run."
                ),
            },
            {
                "date": "2026-07-04", "day": "Sat", "type": "Run",
                "protein": 145, "calories": 2150, "water": "2.5L+",
                "run": {
                    "type": "Long Easy", "km": 5.5, "pace": "8:15–9:00/km",
                    "cue": (
                        f"{RUN_WARMUP} · "
                        "Cadence: 150 BPM — NON-NEGOTIABLE · "
                        "Short steps + fast turnover — not slow shuffle · "
                        "Walk 1 min at 2.5 km and 4 km if needed · RPE 6 max · "
                        f"{RUN_COOLDOWN} · "
                        "Post-run: foam roll quads + calves"
                    ),
                },
                "workout": {"plan": NA, "detail": NA},
                "meals": (
                    "— PROTEIN MATH (verified): banana (1g) + dates (1g) + 4 eggs (28g) "
                    "+ poha (4g) + curd (8g) + 2 chapati (6g) + dal (12g) + paneer (18g) "
                    "+ whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) "
                    "+ veggies (3g) = ~145g · CALORIES ~2,100–2,200 (highest carb day) —\n"
                    "6:20 Pre-run — 1 banana + 2 dates + 250ml water\n"
                    "6:40 Warm-up — extra 5 min today\n"
                    "~8:00 Post-run — 4 eggs + 1 plate poha (or upma) + curd + 1 scoop whey "
                    "+ 500ml water with pinch salt + lemon\n"
                    "1:00 Lunch — 2 chapati + dal + 100g paneer (don't skip carbs)\n"
                    "4:00 Snack — peanuts (30g)\n"
                    "8:30 Dinner — 3 eggs + dal + veggies\n"
                    f"{SUPPL_DAILY}\n"
                    f"{MONSOON_NOTE}"
                ),
                "directive": (
                    "5.5 km — +10% from 5 km W1. Metronome 150 BPM on. "
                    "Verify cadence manually once mid-run (count 30 sec × 2). "
                    "Finish feeling you could do 500m more."
                ),
            },
            {
                "date": "2026-07-05", "day": "Sun", "type": "Rest",
                "protein": 147, "calories": 1900, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "NEAT walk + recovery",
                    "detail": (
                        "Mandatory: 25–30 min brisk walk (morning or ~7:45 PM) · "
                        "Foam roll quads + calves 5 min"
                    ),
                },
                "meals": (
                    "— PROTEIN MATH (verified): paneer bhurji 80g (14g) + besan chilla 1.5 w/ paneer (17g) "
                    "+ 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) + curd (8g) "
                    "+ whey (24g) + roasted chana (8g) + 3 eggs (21g) + hung curd (14g) "
                    "+ veggies (3g) = ~147g · CALORIES ~1,850–1,950 —\n"
                    "8:00 Breakfast — 80g paneer bhurji + 1.5 besan chilla with paneer\n"
                    "1:00 Lunch — 2 chapati + dal + 100g paneer + salad + curd\n"
                    "4:30 Snack — 1 scoop whey (water) + roasted chana (30g)\n"
                    "8:30 Dinner — 3 eggs + hung curd + veggies\n"
                    f"Supplements — {SUPPL_DAILY}"
                ),
                "directive": (
                    "Mandatory 25–30 min brisk walk today — not optional. "
                    "Rest. Close Week 2 clean. "
                    "If long run moved here due to rain, swap with Sat and run today instead."
                ),
            },
        ],
    },

    # ══════════════════════════════════════════════════════════════════════════
    # WEEK 3 — Gym starts · Base + strength reintroduction · 14 km
    # ══════════════════════════════════════════════════════════════════════════
    3: {
        "label": "Week 3",
        "dates": "7 Jul – 13 Jul 2026",
        "focus": (
            "GYM STARTS — All Time Fitness, Lohegaon · 14 km total · "
            "Mon: Push + Core · Fri: Pull + Posterior Chain · "
            "Light weights — reintroduce barbell/DB, find working weights · "
            "No heavy squats/deadlifts — protect running legs · "
            "Cadence 150 BPM locked in · Sleep floor 7h · Last caffeine 4 PM"
        ),
        "days": [
            # ── MONDAY — Gym Push ──────────────────────────────────
            {
                "date": "2026-07-06", "day": "Mon", "type": "Gym",
                "protein": 160, "calories": 2150, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "Gym — Push + Core (reintroduction)",
                    "detail": (
                        f"{GYM_PUSH_WARMUP} · "
                        "Flat bench press 3×10 · Seated DB OHP 3×10 · "
                        "Incline DB press 3×10 · Cable face pulls 3×12 · "
                        "Plank 3×45s · Dead bugs 3×10 · "
                        "40 min · RPE 6 · "
                        "Mandatory: start light — find working weights today · "
                        f"{GYM_COOLDOWN}"
                    ),
                },
                "meals": (
                    "— PROTEIN MATH (verified): 4 eggs (28g) + 1 chapati (3g) + whey (24g) "
                    "+ 2 chapati (6g) + chana (15g) + paneer (18g) + salad (2g) "
                    "+ whey (24g) + walnuts (3g) + 3 eggs (21g) + paneer bhurji 80g (14g) "
                    "+ veggies (3g) = ~161g · CALORIES ~2,100–2,200 —\n"
                    "6:15 Pre-gym — Water + black coffee\n"
                    "8:00 Post-gym — 4 eggs bhurji + 1 chapati + 1 scoop whey (water)\n"
                    "1:00 Lunch — 2 chapati + 1 bowl chana masala + 100g paneer + salad\n"
                    "4:30 Snack — 1 scoop whey (water) + 10 walnuts\n"
                    "8:30 Dinner — 3 eggs + 80g paneer bhurji + sautéed veggies\n"
                    f"Supplements — {SUPPL_DAILY}\n"
                    "Monday AM: weigh + waist before food"
                ),
                "directive": (
                    "FIRST GYM DAY. Start with empty bar or light DBs to find working weights. "
                    "Ego check — you haven't lifted in months. "
                    "Push only — NO squats/deadlifts. Legs must be fresh for Tue run."
                ),
            },
            # ── TUESDAY — Run Easy ─────────────────────────────────
            {
                "date": "2026-07-07", "day": "Tue", "type": "Run",
                "protein": 150, "calories": 2100, "water": "2.5L",
                "run": {
                    "type": "Easy", "km": 3, "pace": "7:45–8:30/km",
                    "cue": (
                        f"{RUN_WARMUP} · "
                        "Cadence: 150 BPM · RPE 5–6 · "
                        "Chest may be sore from yesterday — that's fine, arms swing naturally · "
                        f"{RUN_COOLDOWN}"
                    ),
                },
                "workout": {"plan": NA, "detail": NA},
                "meals": (
                    "— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + 2 toast (6g) "
                    "+ curd (8g) + 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) "
                    "+ whey (24g) + peanuts (7g) + 3 eggs (21g) + palak dal (14g) "
                    "+ veggies (3g) = ~150g · CALORIES ~2,050–2,150 —\n"
                    "6:20 Pre-run — 1 banana + 250ml water\n"
                    "~7:30 Post-run — 4 eggs + 2 toast + curd + electrolyte water\n"
                    "1:00 Lunch — 2 chapati + dal + 100g paneer + salad\n"
                    "4:00 Snack — 1 scoop whey (water) + peanuts (30g)\n"
                    "8:30 Dinner — 3 eggs bhurji + 1 bowl palak dal + veggies\n"
                    f"Supplements — {SUPPL_DAILY}\n"
                    f"{MONSOON_NOTE}"
                ),
                "directive": (
                    "Easy 3 km. Don't push pace — your body is adjusting to gym + running. "
                    "Upper body DOMS is normal and doesn't affect running."
                ),
            },
            # ── WEDNESDAY — Active Recovery ────────────────────────
            {
                "date": "2026-07-08", "day": "Wed", "type": "Active Recovery",
                "protein": 149, "calories": 1900, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "Knee prep + mobility — mandatory",
                    "detail": (
                        "WARM-UP (5 min): 5 min brisk walk · "
                        "Glute bridges 3×15 · Calf raises 3×20 · "
                        "Clamshells 2×12/side · "
                        "Ankle dorsiflexion drills: knee-to-wall 2×10/side · "
                        "Foam roll quads + calves + IT band 5 min · "
                        "20 min · RPE 4 · "
                        f"{MOBILITY_COOLDOWN}"
                    ),
                },
                "meals": (
                    "— PROTEIN MATH (verified): 4 eggs (28g) + whey (24g) "
                    "+ 1.5 chapati (5g) + rajma (15g) + curd (8g) + salad (2g) "
                    "+ whey (24g) + flaxseed (2g) + walnuts (3g) + 3 eggs (21g) "
                    "+ paneer bhurji 80g (14g) + veggies (3g) = ~149g · CALORIES ~1,850–1,950 —\n"
                    "8:00 Breakfast — 4 eggs + 1 scoop whey (water)\n"
                    "1:00 Lunch — 1.5 chapati + 1 bowl rajma + curd + salad\n"
                    "4:30 Snack — 1 scoop whey (water) + 1 tbsp flaxseed + 10 walnuts\n"
                    "8:30 Dinner — 3 eggs + 80g paneer bhurji + veggies (no rice)\n"
                    f"Supplements — {SUPPL_DAILY}\n"
                    "After work: 25–30 min brisk walk — NEAT"
                ),
                "directive": (
                    "Mobility is non-negotiable. Your knees need this with gym + running now. "
                    "Foam rolling mandatory. Don't skip the evening walk."
                ),
            },
            # ── THURSDAY — Run Easy ────────────────────────────────
            {
                "date": "2026-07-09", "day": "Thu", "type": "Run",
                "protein": 150, "calories": 2100, "water": "2.5L",
                "run": {
                    "type": "Easy", "km": 4.5, "pace": "7:45–8:30/km",
                    "cue": (
                        f"{RUN_WARMUP} · "
                        "Cadence: 150 BPM · RPE 5–6 · "
                        "Knee check at 2.5 km · "
                        f"{RUN_COOLDOWN}"
                    ),
                },
                "workout": {"plan": NA, "detail": NA},
                "meals": (
                    "— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + poha (4g) "
                    "+ curd (8g) + 2 chapati (6g) + chana (15g) + paneer (18g) "
                    "+ whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) "
                    "+ veggies (3g) + flaxseed (2g) = ~149g · CALORIES ~2,050–2,150 —\n"
                    "6:20 Pre-run — 1 banana + 250ml water\n"
                    "~7:40 Post-run — 4 eggs + 1 plate poha + curd + electrolyte water\n"
                    "1:00 Lunch — 2 chapati + 1 bowl chana + 100g paneer\n"
                    "4:00 Snack — 1 scoop whey + 1 tbsp flaxseed + peanuts (30g)\n"
                    "8:30 Dinner — 3 eggs + 1 bowl dal + veggies\n"
                    f"Supplements — {SUPPL_D3}\n"
                    f"{MONSOON_NOTE}"
                ),
                "directive": (
                    "4.5 km — slight bump from 4 km. Hold easy pace. "
                    "Walk breaks are fine. Complete the distance."
                ),
            },
            # ── FRIDAY — Gym Pull ──────────────────────────────────
            {
                "date": "2026-07-10", "day": "Fri", "type": "Gym",
                "protein": 160, "calories": 2150, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "Gym — Pull + Posterior Chain (reintroduction)",
                    "detail": (
                        f"{GYM_PULL_WARMUP} · "
                        "Pull-ups 4×max · Barbell rows 3×10 · "
                        "Lat pulldown 3×10 · RDL 3×10 (light — bar only or +10kg) · "
                        "Cable face pulls 3×12 · "
                        "Glute bridges 3×15 · Calf raises 3×15 · "
                        "40 min · RPE 6 · "
                        f"{GYM_COOLDOWN}"
                    ),
                },
                "meals": (
                    "— PROTEIN MATH (verified): 4 eggs (28g) + poha (4g) + whey (24g) "
                    "+ 2 chapati (6g) + rajma (15g) + paneer (18g) + salad (2g) "
                    "+ whey (24g) + peanuts (7g) + 3 eggs (21g) + curd (8g) "
                    "+ 1 chapati (3g) + veggies (3g) = ~160g · CALORIES ~2,100–2,200 —\n"
                    "6:15 Pre-gym — Water + black coffee\n"
                    "8:00 Post-gym — 4 eggs + 1 plate poha + 1 scoop whey (water)\n"
                    "1:00 Lunch — 2 chapati + 1 bowl rajma + 100g paneer + salad\n"
                    "4:30 Snack — 1 scoop whey (water) + peanuts (30g)\n"
                    "8:30 Dinner — 3 eggs + 1 chapati + curd + veggies\n"
                    "PRE-LONG-RUN — +1 chapati vs normal rest dinner\n"
                    f"Supplements — {SUPPL_DAILY}"
                ),
                "directive": (
                    "First pull day at gym. RDL is LIGHT — learn the hip hinge pattern. "
                    "No ego on barbell rows either. "
                    "Carb-forward dinner — sleep by 11 PM before long run."
                ),
            },
            # ── SATURDAY — Long Run ────────────────────────────────
            {
                "date": "2026-07-11", "day": "Sat", "type": "Run",
                "protein": 150, "calories": 2100, "water": "2.5L+",
                "run": {
                    "type": "Long Easy", "km": 6.5, "pace": "8:00–8:45/km",
                    "cue": (
                        f"{RUN_WARMUP} · "
                        "Cadence: 150 BPM · RPE 6 max · "
                        "Walk 1 min at 3 km if needed · "
                        f"{RUN_COOLDOWN} · "
                        "Post-run: foam roll quads + calves"
                    ),
                },
                "workout": {"plan": NA, "detail": NA},
                "meals": (
                    "— PROTEIN MATH (verified): banana (1g) + dates (1g) + 4 eggs (28g) "
                    "+ 2 chapati (6g) + curd (8g) + 2 chapati (6g) + dal (12g) "
                    "+ paneer (18g) + whey (24g) + peanuts (7g) + 3 eggs (21g) "
                    "+ dal (12g) + veggies (3g) + salad (2g) = ~149g · "
                    "CALORIES ~2,050–2,150 (highest carb day) —\n"
                    "6:20 Pre-run — 1 banana + 2 dates + 250ml water\n"
                    "~8:00 Post-run — 4 eggs + 2 chapati + curd + electrolyte water\n"
                    "1:00 Lunch — 2 chapati + dal + 100g paneer + salad\n"
                    "4:00 Snack — 1 scoop whey + peanuts (30g)\n"
                    "8:30 Dinner — 3 eggs + dal + veggies\n"
                    f"{SUPPL_DAILY}\n"
                    f"{MONSOON_NOTE}"
                ),
                "directive": (
                    "6.5 km — new territory past your 5.5 km. "
                    "Walk breaks are allowed — walk 1 min, resume running. "
                    "Finish feeling you could do 500m more. "
                    "If monsoon blocks Sat, move to Sun."
                ),
            },
            # ── SUNDAY — Rest ──────────────────────────────────────
            {
                "date": "2026-07-12", "day": "Sun", "type": "Rest",
                "protein": 149, "calories": 1850, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "NEAT walk + recovery",
                    "detail": (
                        "Mandatory: 25–30 min brisk walk (morning or ~7:45 PM) · "
                        "Foam roll quads + calves + lats 5 min"
                    ),
                },
                "meals": (
                    "— PROTEIN MATH (verified): 4 eggs (28g) + whey (24g) "
                    "+ 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) "
                    "+ whey (24g) + walnuts (3g) + 3 eggs (21g) + curd (8g) "
                    "+ veggies (3g) = ~149g · CALORIES ~1,800–1,900 —\n"
                    "8:00 Breakfast — 4 eggs + 1 scoop whey (water)\n"
                    "1:00 Lunch — 2 chapati + dal + 100g paneer + salad\n"
                    "4:30 Snack — 1 scoop whey (water) + 10 walnuts\n"
                    "8:30 Dinner — 3 eggs + curd + veggies\n"
                    f"Supplements — {SUPPL_DAILY}"
                ),
                "directive": (
                    "Rest day. Mandatory walk. Body is adapting to gym + running combo. "
                    "Foam roll lats too — they'll be sore from pull day. "
                    "Monday AM: weigh + waist."
                ),
            },
        ],
    },

    # ══════════════════════════════════════════════════════════════════════════
    # WEEK 4 — Base + gym load increase · 15.5 km
    # ══════════════════════════════════════════════════════════════════════════
    4: {
        "label": "Week 4",
        "dates": "14 Jul – 20 Jul 2026",
        "focus": (
            "15.5 km total · Gym load increase — progress weights from W3 · "
            "Add Bulgarian split squat (Fri) for knee stability · "
            "Long run 7 km — approaching previous 10 km territory · "
            "Sleep floor 7h · Cadence 150 BPM"
        ),
        "days": [
            {
                "date": "2026-07-13", "day": "Mon", "type": "Gym",
                "protein": 164, "calories": 2150, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "Gym — Push + Core (progress weights)",
                    "detail": (
                        f"{GYM_PUSH_WARMUP} · "
                        "Flat bench press 3×10 · Seated DB OHP 3×10 · "
                        "Incline DB press 3×10 · Cable fly 3×12 · "
                        "Cable face pulls 3×12 · "
                        "Plank 3×60s · Hanging knee raises 3×8 · "
                        "45 min · RPE 6–7 · "
                        f"{GYM_COOLDOWN}"
                    ),
                },
                "meals": (
                    "— PROTEIN MATH (verified): 4 eggs (28g) + moong chilla 2 w/ paneer (20g) "
                    "+ 2 chapati (6g) + rajma (15g) + paneer (18g) + salad (2g) "
                    "+ whey (24g) + roasted chana (8g) + 2 eggs (14g) + tofu (12g) "
                    "+ hung curd (14g) + veggies (3g) = ~164g · CALORIES ~2,100–2,200 —\n"
                    "6:15 Pre-gym — Water + black coffee\n"
                    "8:00 Post-gym — 4 eggs + 2 moong chillas with paneer\n"
                    "1:00 Lunch — 2 chapati + 1 bowl rajma + 100g paneer + salad\n"
                    "4:30 Snack — 1 scoop whey (water) + roasted chana (30g)\n"
                    "8:30 Dinner — 100g tofu bhurji + hung curd + sautéed veggies\n"
                    f"Supplements — {SUPPL_DAILY}\n"
                    "Monday AM: weigh + waist before food"
                ),
                "directive": (
                    "Progress weights from W3 — add 2.5 kg to bench, 1–2 kg to OHP. "
                    "If W3 weight was too easy, jump more. If you struggled, repeat. "
                    "Cable fly added — controlled, squeeze at top."
                ),
            },
            {
                "date": "2026-07-14", "day": "Tue", "type": "Run",
                "protein": 150, "calories": 2100, "water": "2.5L",
                "run": {
                    "type": "Easy", "km": 3.5, "pace": "7:45–8:30/km",
                    "cue": (
                        f"{RUN_WARMUP} · "
                        "Cadence: 150 BPM · RPE 5–6 · "
                        f"{RUN_COOLDOWN}"
                    ),
                },
                "workout": {"plan": NA, "detail": NA},
                "meals": (
                    "— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + upma (4g) "
                    "+ curd (8g) + 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) "
                    "+ whey (24g) + peanuts (7g) + 3 eggs (21g) + rajma (15g) "
                    "+ veggies (3g) = ~149g · CALORIES ~2,050–2,150 —\n"
                    "6:20 Pre-run — 1 banana + 250ml water\n"
                    "~7:30 Post-run — 4 eggs + 1 plate upma + curd + electrolyte water\n"
                    "1:00 Lunch — 2 chapati + dal + 100g paneer + salad\n"
                    "4:00 Snack — 1 scoop whey + peanuts (30g)\n"
                    "8:30 Dinner — 3 eggs + 1 bowl rajma + veggies\n"
                    f"Supplements — {SUPPL_DAILY}\n"
                    f"{MONSOON_NOTE}"
                ),
                "directive": "Easy 3.5 km. Chest DOMS from yesterday is normal — run through it.",
            },
            {
                "date": "2026-07-15", "day": "Wed", "type": "Active Recovery",
                "protein": 142, "calories": 1900, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "Knee prep + mobility — mandatory",
                    "detail": (
                        "WARM-UP (5 min): 5 min brisk walk · "
                        "Glute bridges 3×15 · Calf raises 3×20 · "
                        "Clamshells 2×12/side · "
                        "Ankle dorsiflexion: knee-to-wall 2×10/side · "
                        "Foam roll quads + calves + IT band + lats 7 min · "
                        "20 min · RPE 4 · "
                        f"{MOBILITY_COOLDOWN}"
                    ),
                },
                "meals": (
                    "— PROTEIN MATH (verified): 4 eggs (28g) + besan chilla 1.5 w/ paneer (17g) "
                    "+ 1.5 chapati (5g) + chana (15g) + curd (8g) + salad (2g) "
                    "+ whey (24g) + flaxseed (2g) + walnuts (3g) + 3 eggs (21g) "
                    "+ paneer bhurji 80g (14g) + veggies (3g) = ~142g · CALORIES ~1,850–1,950 —\n"
                    "8:00 Breakfast — 4 eggs + 1.5 besan chilla with paneer\n"
                    "1:00 Lunch — 1.5 chapati + chana + curd + salad\n"
                    "4:30 Snack — 1 scoop whey + flaxseed + 10 walnuts\n"
                    "8:30 Dinner — 3 eggs + paneer bhurji + veggies\n"
                    f"Supplements — {SUPPL_DAILY}\n"
                    "After work: 25–30 min brisk walk"
                ),
                "directive": "Mobility day. Add lats to foam rolling since you're pulling now. Walk after work.",
            },
            {
                "date": "2026-07-16", "day": "Thu", "type": "Run",
                "protein": 150, "calories": 2100, "water": "2.5L",
                "run": {
                    "type": "Easy", "km": 5, "pace": "7:45–8:30/km",
                    "cue": (
                        f"{RUN_WARMUP} · "
                        "Cadence: 150 BPM · RPE 5–6 · "
                        "Knee check at 2.5 km · Walk 1 min at 3 km if needed · "
                        f"{RUN_COOLDOWN}"
                    ),
                },
                "workout": {"plan": NA, "detail": NA},
                "meals": (
                    "— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + 2 toast (6g) "
                    "+ curd (8g) + 2 chapati (6g) + palak dal (14g) + paneer (18g) "
                    "+ whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) "
                    "+ veggies (3g) + salad (2g) = ~150g · CALORIES ~2,050–2,150 —\n"
                    "6:20 Pre-run — 1 banana + 250ml water\n"
                    "~7:50 Post-run — 4 eggs + 2 toast + curd + electrolyte water\n"
                    "1:00 Lunch — 2 chapati + palak dal + 100g paneer + salad\n"
                    "4:00 Snack — 1 scoop whey + peanuts (30g)\n"
                    "8:30 Dinner — 3 eggs + dal + veggies\n"
                    f"Supplements — {SUPPL_D3}\n"
                    f"{MONSOON_NOTE}"
                ),
                "directive": (
                    "5 km mid-week run — matching your previous best distance. "
                    "This is easy pace, not a test. Walk breaks allowed."
                ),
            },
            {
                "date": "2026-07-17", "day": "Fri", "type": "Gym",
                "protein": 160, "calories": 2150, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "Gym — Pull + Posterior Chain (add split squat)",
                    "detail": (
                        f"{GYM_PULL_WARMUP} · "
                        "Pull-ups 4×max · Barbell rows 3×10 · "
                        "Lat pulldown 3×10 · RDL 3×10 · "
                        "Bulgarian split squat 2×8/leg · "
                        "Cable face pulls 3×12 · Calf raises 3×15 · "
                        "45 min · RPE 6–7 · "
                        f"{GYM_COOLDOWN}"
                    ),
                },
                "meals": (
                    "— PROTEIN MATH (verified): 4 eggs (28g) + 1 chapati (3g) + whey (24g) "
                    "+ 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) "
                    "+ whey (24g) + walnuts (3g) + 3 eggs (21g) + palak dal (14g) "
                    "+ 1 chapati (3g) + veggies (3g) = ~161g · CALORIES ~2,100–2,200 —\n"
                    "6:15 Pre-gym — Water + black coffee\n"
                    "8:00 Post-gym — 4 eggs + 1 chapati + 1 scoop whey (water)\n"
                    "1:00 Lunch — 2 chapati + dal + 100g paneer + salad\n"
                    "4:30 Snack — 1 scoop whey + 10 walnuts\n"
                    "8:30 Dinner — 3 eggs + 1 chapati + palak dal + veggies\n"
                    "PRE-LONG-RUN — +1 chapati at dinner\n"
                    f"Supplements — {SUPPL_DAILY}"
                ),
                "directive": (
                    "Bulgarian split squat NEW — bodyweight only, hold bench for balance. "
                    "This builds knee stability for long runs. "
                    "RDL: progress weight by 5 kg from W3. "
                    "Carb dinner for tomorrow's long run."
                ),
            },
            {
                "date": "2026-07-18", "day": "Sat", "type": "Run",
                "protein": 150, "calories": 2100, "water": "2.5L+",
                "run": {
                    "type": "Long Easy", "km": 7, "pace": "8:00–8:45/km",
                    "cue": (
                        f"{RUN_WARMUP} · "
                        "Cadence: 150 BPM · RPE 6 max · "
                        "Walk 1 min at 3.5 km · "
                        f"{RUN_COOLDOWN} · "
                        "Post-run: foam roll quads + calves + IT band"
                    ),
                },
                "workout": {"plan": NA, "detail": NA},
                "meals": (
                    "— PROTEIN MATH (verified): banana (1g) + dates (1g) + 4 eggs (28g) "
                    "+ poha (4g) + curd (8g) + 2 chapati (6g) + chana (15g) + paneer (18g) "
                    "+ whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) "
                    "+ veggies (3g) + salad (2g) = ~150g · CALORIES ~2,050–2,150 —\n"
                    "6:20 Pre-run — 1 banana + 2 dates + 250ml water\n"
                    "~8:10 Post-run — 4 eggs + poha + curd + electrolyte water\n"
                    "1:00 Lunch — 2 chapati + chana + 100g paneer + salad\n"
                    "4:00 Snack — 1 scoop whey + peanuts (30g)\n"
                    "8:30 Dinner — 3 eggs + dal + veggies\n"
                    f"{SUPPL_DAILY}\n"
                    f"{MONSOON_NOTE}"
                ),
                "directive": (
                    "7 km — you ran 10 km before, so this is familiar territory. "
                    "But that was months ago — respect the rebuild. "
                    "Walk break at 3.5 km. Finish strong."
                ),
            },
            {
                "date": "2026-07-19", "day": "Sun", "type": "Rest",
                "protein": 149, "calories": 1850, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "NEAT walk + recovery",
                    "detail": "Mandatory: 25–30 min brisk walk · Foam roll full body 7 min",
                },
                "meals": (
                    "— PROTEIN MATH (verified): paneer bhurji 80g (14g) + besan chilla 1.5 w/ paneer (17g) "
                    "+ 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) + curd (8g) "
                    "+ whey (24g) + roasted chana (8g) + 3 eggs (21g) + hung curd (14g) "
                    "+ veggies (3g) = ~147g · CALORIES ~1,800–1,900 —\n"
                    "8:00 Breakfast — paneer bhurji + besan chilla with paneer\n"
                    "1:00 Lunch — 2 chapati + dal + paneer + salad + curd\n"
                    "4:30 Snack — 1 scoop whey + roasted chana (30g)\n"
                    "8:30 Dinner — 3 eggs + hung curd + veggies\n"
                    f"Supplements — {SUPPL_DAILY}"
                ),
                "directive": "Rest. Walk. Foam roll. Monday AM: weigh + waist.",
            },
        ],
    },

    # ══════════════════════════════════════════════════════════════════════════
    # WEEK 5 — Build phase · Tempo introduced · 17 km
    # ══════════════════════════════════════════════════════════════════════════
    5: {
        "label": "Week 5",
        "dates": "21 Jul – 27 Jul 2026",
        "focus": (
            "Build phase begins · 17 km total · TEMPO RUN introduced Thursday · "
            "Thu: 1 km warm-up + 2 km @ 7:00/km + 2 km cool-down · "
            "Long run 8.5 km — new distance record · "
            "Gym: progressive overload, add dips (Mon) + Bulgarian to 10 reps (Fri) · "
            "Sleep floor 7h · Cadence 150 BPM"
        ),
        "days": [
            {
                "date": "2026-07-20", "day": "Mon", "type": "Gym",
                "protein": 160, "calories": 2150, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "Gym — Push + Core (build)",
                    "detail": (
                        f"{GYM_PUSH_WARMUP} · "
                        "Flat bench press 4×8 · Seated DB OHP 3×10 · "
                        "Incline DB press 3×10 · Dips 3×max · "
                        "Cable face pulls 3×12 · "
                        "Plank 3×60s · Hanging knee raises 3×10 · "
                        "45 min · RPE 7 · "
                        f"{GYM_COOLDOWN}"
                    ),
                },
                "meals": (
                    "— PROTEIN MATH (verified): 4 eggs (28g) + 1 chapati (3g) + whey (24g) "
                    "+ 2 chapati (6g) + chana (15g) + paneer (18g) + salad (2g) "
                    "+ whey (24g) + walnuts (3g) + 3 eggs (21g) + paneer bhurji 80g (14g) "
                    "+ veggies (3g) = ~161g · CALORIES ~2,100–2,200 —\n"
                    "6:15 Pre-gym — Water + black coffee\n"
                    "8:00 Post-gym — 4 eggs bhurji + 1 chapati + 1 scoop whey\n"
                    "1:00 Lunch — 2 chapati + chana + 100g paneer + salad\n"
                    "4:30 Snack — 1 scoop whey + 10 walnuts\n"
                    "8:30 Dinner — 3 eggs + paneer bhurji + veggies\n"
                    f"Supplements — {SUPPL_DAILY}\n"
                    "Monday AM: weigh + waist"
                ),
                "directive": (
                    "Bench to 4×8 — increase weight if 3×10 was easy. "
                    "Dips added — use assisted machine if needed. "
                    "Build phase: RPE 7 is OK now."
                ),
            },
            {
                "date": "2026-07-21", "day": "Tue", "type": "Run",
                "protein": 150, "calories": 2100, "water": "2.5L",
                "run": {
                    "type": "Easy", "km": 3.5, "pace": "7:45–8:30/km",
                    "cue": (
                        f"{RUN_WARMUP} · "
                        "Cadence: 150 BPM · RPE 5–6 · "
                        f"{RUN_COOLDOWN}"
                    ),
                },
                "workout": {"plan": NA, "detail": NA},
                "meals": (
                    "— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + 2 toast (6g) "
                    "+ curd (8g) + 2 chapati (6g) + palak dal (14g) + paneer (18g) + salad (2g) "
                    "+ whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) "
                    "+ veggies (3g) = ~150g · CALORIES ~2,050–2,150 —\n"
                    "6:20 Pre-run — 1 banana + 250ml water\n"
                    "~7:30 Post-run — 4 eggs + 2 toast + curd + electrolyte water\n"
                    "1:00 Lunch — 2 chapati + palak dal + paneer + salad\n"
                    "4:00 Snack — 1 scoop whey + peanuts (30g)\n"
                    "8:30 Dinner — 3 eggs + dal + veggies\n"
                    f"Supplements — {SUPPL_DAILY}\n"
                    f"{MONSOON_NOTE}"
                ),
                "directive": "Recovery run. Easy 3.5 km. Save legs for Thursday's first tempo.",
            },
            {
                "date": "2026-07-22", "day": "Wed", "type": "Active Recovery",
                "protein": 149, "calories": 1900, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "Knee prep + mobility",
                    "detail": (
                        "WARM-UP (5 min): 5 min brisk walk · "
                        "Glute bridges 3×15 · Calf raises 3×20 · "
                        "Clamshells 2×12/side · "
                        "Ankle dorsiflexion: knee-to-wall 2×10/side · "
                        "Foam roll full body 7 min · "
                        "20 min · RPE 4 · "
                        f"{MOBILITY_COOLDOWN}"
                    ),
                },
                "meals": (
                    "— PROTEIN MATH (verified): 4 eggs (28g) + whey (24g) "
                    "+ 1.5 chapati (5g) + dal (12g) + curd (8g) + salad (2g) "
                    "+ whey (24g) + flaxseed (2g) + walnuts (3g) + 3 eggs (21g) "
                    "+ paneer bhurji 80g (14g) + veggies (3g) = ~149g · CALORIES ~1,850–1,950 —\n"
                    "8:00 Breakfast — 4 eggs + 1 scoop whey\n"
                    "1:00 Lunch — 1.5 chapati + dal + curd + salad\n"
                    "4:30 Snack — 1 scoop whey + flaxseed + 10 walnuts\n"
                    "8:30 Dinner — 3 eggs + paneer bhurji + veggies\n"
                    f"Supplements — {SUPPL_DAILY}\n"
                    "After work: 25–30 min brisk walk"
                ),
                "directive": "Mobility before tempo tomorrow. Extra ankle work. Don't skip.",
            },
            {
                "date": "2026-07-23", "day": "Thu", "type": "Run",
                "protein": 150, "calories": 2100, "water": "2.5L",
                "run": {
                    "type": "Tempo", "km": 5, "pace": "7:00/km tempo · 8:00/km easy",
                    "cue": (
                        f"{RUN_WARMUP} · "
                        "1 km easy warm-up jog (8:00/km) → "
                        "2 km TEMPO @ 7:00/km (this is race pace — feel it) → "
                        "2 km easy cool-down jog (8:00–8:30/km) · "
                        "Cadence: 155–160 BPM during tempo · RPE 7 during tempo · "
                        f"{RUN_COOLDOWN}"
                    ),
                },
                "workout": {"plan": NA, "detail": NA},
                "meals": (
                    "— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + poha (4g) "
                    "+ curd (8g) + 2 chapati (6g) + chana (15g) + paneer (18g) "
                    "+ whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) "
                    "+ veggies (3g) + salad (2g) = ~149g · CALORIES ~2,050–2,150 —\n"
                    "6:20 Pre-run — 1 banana + 250ml water\n"
                    "~7:50 Post-run — 4 eggs + poha + curd + electrolyte water\n"
                    "1:00 Lunch — 2 chapati + chana + paneer + salad\n"
                    "4:00 Snack — 1 scoop whey + peanuts (30g)\n"
                    "8:30 Dinner — 3 eggs + dal + veggies\n"
                    f"Supplements — {SUPPL_D3}\n"
                    f"{MONSOON_NOTE}"
                ),
                "directive": (
                    "FIRST TEMPO RUN. 2 km at 7:00/km = race pace preview. "
                    "It should feel 'comfortably hard' — RPE 7, not 9. "
                    "If you can't hold 7:00, do 7:15. The effort matters more than the number."
                ),
            },
            {
                "date": "2026-07-24", "day": "Fri", "type": "Gym",
                "protein": 160, "calories": 2150, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "Gym — Pull + Posterior Chain",
                    "detail": (
                        f"{GYM_PULL_WARMUP} · "
                        "Pull-ups 4×max · Barbell rows 3×10 · "
                        "Lat pulldown 3×10 · RDL 3×10 · "
                        "Bulgarian split squat 2×10/leg · "
                        "Cable face pulls 3×12 · "
                        "45 min · RPE 6–7 · "
                        f"{GYM_COOLDOWN}"
                    ),
                },
                "meals": (
                    "— PROTEIN MATH (verified): 4 eggs (28g) + upma (4g) + whey (24g) "
                    "+ 2 chapati (6g) + rajma (15g) + paneer (18g) + salad (2g) "
                    "+ whey (24g) + peanuts (7g) + 3 eggs (21g) + curd (8g) "
                    "+ 1 chapati (3g) + veggies (3g) = ~160g · CALORIES ~2,100–2,200 —\n"
                    "6:15 Pre-gym — Water + black coffee\n"
                    "8:00 Post-gym — 4 eggs + upma + 1 scoop whey\n"
                    "1:00 Lunch — 2 chapati + rajma + paneer + salad\n"
                    "4:30 Snack — 1 scoop whey + peanuts (30g)\n"
                    "8:30 Dinner — 3 eggs + 1 chapati + curd + veggies\n"
                    "PRE-LONG-RUN — +1 chapati at dinner\n"
                    f"Supplements — {SUPPL_DAILY}"
                ),
                "directive": (
                    "Bulgarian split squat to 2×10/leg now. "
                    "RDL: progress weight. Keep moderate — not heavy. "
                    "Carb dinner for tomorrow's 8.5 km."
                ),
            },
            {
                "date": "2026-07-25", "day": "Sat", "type": "Run",
                "protein": 150, "calories": 2100, "water": "3L",
                "run": {
                    "type": "Long Easy", "km": 8.5, "pace": "8:00–8:45/km",
                    "cue": (
                        f"{RUN_WARMUP} · "
                        "Cadence: 150 BPM · RPE 6 max · "
                        "Walk 1 min at 4 km and 6.5 km if needed · "
                        "Carry water if possible (8.5 km = ~70 min) · "
                        f"{RUN_COOLDOWN} · "
                        "Post-run: foam roll + cold water on legs"
                    ),
                },
                "workout": {"plan": NA, "detail": NA},
                "meals": (
                    "— PROTEIN MATH (verified): banana (1g) + dates (1g) + 4 eggs (28g) "
                    "+ 2 chapati (6g) + curd (8g) + 3 chapati (9g) + dal (12g) + paneer (18g) "
                    "+ whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) "
                    "+ veggies (3g) = ~150g · CALORIES ~2,100–2,200 —\n"
                    "6:10 Pre-run — 1 banana + 2 dates + 250ml water\n"
                    "~7:30 Warm-up — extra 5 min today\n"
                    "~8:20 Post-run — 4 eggs + 2 chapati + curd + 500ml electrolyte water\n"
                    "1:00 Lunch — 3 chapati + dal + paneer (extra carbs — highest carb day)\n"
                    "4:00 Snack — 1 scoop whey + peanuts (30g)\n"
                    "8:30 Dinner — 3 eggs + dal + veggies\n"
                    f"{SUPPL_DAILY}\n"
                    f"{MONSOON_NOTE}"
                ),
                "directive": (
                    "8.5 km — NEW DISTANCE RECORD. Past your 5 km comfort zone. "
                    "Walk breaks are EXPECTED at this distance. No shame. "
                    "Carry a small water bottle. Finish strong, not fast."
                ),
            },
            {
                "date": "2026-07-26", "day": "Sun", "type": "Rest",
                "protein": 149, "calories": 1850, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "NEAT walk + recovery",
                    "detail": "Mandatory: 25–30 min brisk walk · Foam roll full body 7 min",
                },
                "meals": (
                    "— PROTEIN MATH (verified): 4 eggs (28g) + whey (24g) "
                    "+ 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) "
                    "+ whey (24g) + walnuts (3g) + 3 eggs (21g) + curd (8g) "
                    "+ veggies (3g) = ~149g · CALORIES ~1,800–1,900 —\n"
                    "8:00 Breakfast — 4 eggs + 1 scoop whey\n"
                    "1:00 Lunch — 2 chapati + dal + paneer + salad\n"
                    "4:30 Snack — 1 scoop whey + 10 walnuts\n"
                    "8:30 Dinner — 3 eggs + curd + veggies\n"
                    f"Supplements — {SUPPL_DAILY}"
                ),
                "directive": "Rest after your longest run ever. Walk. Foam roll. Monday AM: weigh + waist.",
            },
        ],
    },

    # ══════════════════════════════════════════════════════════════════════════
    # WEEK 6 — Build phase · 19 km · Long run 10 km milestone
    # ══════════════════════════════════════════════════════════════════════════
    6: {
        "label": "Week 6",
        "dates": "28 Jul – 3 Aug 2026",
        "focus": (
            "19 km total · Tempo grows to 3 km @ 7:00/km · "
            "LONG RUN 10 km — matching previous max · "
            "Gym: maintain progressive overload · "
            "TDEE check: if weekly km hit 25+, bump all calorie targets by 100 kcal · "
            "Sleep floor 7h · Hydration critical for 10 km"
        ),
        "days": [
            {
                "date": "2026-07-27", "day": "Mon", "type": "Gym",
                "protein": 166, "calories": 2150, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "Gym — Push + Core",
                    "detail": (
                        f"{GYM_PUSH_WARMUP} · "
                        "Flat bench press 4×8 · Seated DB OHP 3×8 · "
                        "Incline DB press 3×10 · Dips 3×max · "
                        "Cable fly 3×12 · "
                        "Plank 3×60s · Hanging knee raises 3×12 · "
                        "45 min · RPE 7 · "
                        f"{GYM_COOLDOWN}"
                    ),
                },
                "meals": (
                    "— PROTEIN MATH (verified): 4 eggs (28g) + poha (4g) + whey (24g) "
                    "+ 2 chapati (6g) + rajma (15g) + paneer (18g) + salad (2g) "
                    "+ whey (24g) + peanuts (7g) + 3 eggs (21g) + palak dal (14g) "
                    "+ veggies (3g) = ~166g · CALORIES ~2,100–2,200 —\n"
                    "6:15 Pre-gym — Water + black coffee\n"
                    "8:00 Post-gym — 4 eggs + poha + 1 scoop whey\n"
                    "1:00 Lunch — 2 chapati + rajma + paneer + salad\n"
                    "4:30 Snack — 1 scoop whey + peanuts (30g)\n"
                    "8:30 Dinner — 3 eggs + palak dal + veggies\n"
                    f"Supplements — {SUPPL_DAILY}\n"
                    "Monday AM: weigh + waist"
                ),
                "directive": "OHP to 3×8 — increase weight. Cable fly for chest volume. Push hard — deload next week.",
            },
            {
                "date": "2026-07-28", "day": "Tue", "type": "Run",
                "protein": 150, "calories": 2100, "water": "2.5L",
                "run": {
                    "type": "Easy", "km": 4, "pace": "7:45–8:30/km",
                    "cue": (
                        f"{RUN_WARMUP} · Cadence: 150 BPM · RPE 5–6 · "
                        f"{RUN_COOLDOWN}"
                    ),
                },
                "workout": {"plan": NA, "detail": NA},
                "meals": (
                    "— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + 2 toast (6g) "
                    "+ curd (8g) + 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) "
                    "+ whey (24g) + roasted chana (8g) + 3 eggs (21g) + rajma (15g) "
                    "+ veggies (3g) = ~152g · CALORIES ~2,050–2,150 —\n"
                    "6:20 Pre-run — 1 banana + 250ml water\n"
                    "~7:40 Post-run — 4 eggs + 2 toast + curd + electrolyte water\n"
                    "1:00 Lunch — 2 chapati + dal + paneer + salad\n"
                    "4:00 Snack — 1 scoop whey + roasted chana (30g)\n"
                    "8:30 Dinner — 3 eggs + rajma + veggies\n"
                    f"Supplements — {SUPPL_DAILY}\n"
                    f"{MONSOON_NOTE}"
                ),
                "directive": "Easy 4 km. Save energy for Thursday tempo and Saturday's 10 km.",
            },
            {
                "date": "2026-07-29", "day": "Wed", "type": "Active Recovery",
                "protein": 142, "calories": 1900, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "Knee prep + mobility",
                    "detail": (
                        "WARM-UP (5 min): 5 min brisk walk · "
                        "Glute bridges 3×15 · Calf raises 3×20 · "
                        "Clamshells 2×12/side · Ankle dorsiflexion 2×10/side · "
                        "Foam roll full body 7 min · 20 min · RPE 4 · "
                        f"{MOBILITY_COOLDOWN}"
                    ),
                },
                "meals": (
                    "— PROTEIN MATH (verified): 4 eggs (28g) + besan chilla 1.5 w/ paneer (17g) "
                    "+ 1.5 chapati (5g) + chana (15g) + curd (8g) + salad (2g) "
                    "+ whey (24g) + flaxseed (2g) + walnuts (3g) + 3 eggs (21g) "
                    "+ paneer bhurji 80g (14g) + veggies (3g) = ~142g · CALORIES ~1,850–1,950 —\n"
                    "8:00 Breakfast — 4 eggs + besan chilla with paneer\n"
                    "1:00 Lunch — 1.5 chapati + chana + curd + salad\n"
                    "4:30 Snack — 1 scoop whey + flaxseed + 10 walnuts\n"
                    "8:30 Dinner — 3 eggs + paneer bhurji + veggies\n"
                    f"Supplements — {SUPPL_DAILY}\n"
                    "After work: 25–30 min brisk walk"
                ),
                "directive": "Mobility before tempo. Extra knee attention — 10 km this Saturday.",
            },
            {
                "date": "2026-07-30", "day": "Thu", "type": "Run",
                "protein": 150, "calories": 2100, "water": "2.5L",
                "run": {
                    "type": "Tempo", "km": 5, "pace": "7:00/km tempo · 8:00/km easy",
                    "cue": (
                        f"{RUN_WARMUP} · "
                        "1 km easy warm-up jog → "
                        "3 km TEMPO @ 7:00/km → "
                        "1 km easy cool-down jog · "
                        "Cadence: 155–160 BPM during tempo · RPE 7 · "
                        f"{RUN_COOLDOWN}"
                    ),
                },
                "workout": {"plan": NA, "detail": NA},
                "meals": (
                    "— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + upma (4g) "
                    "+ curd (8g) + 2 chapati (6g) + palak dal (14g) + paneer (18g) "
                    "+ whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) "
                    "+ veggies (3g) + salad (2g) = ~148g · CALORIES ~2,050–2,150 —\n"
                    "6:20 Pre-run — 1 banana + 250ml water\n"
                    "~7:50 Post-run — 4 eggs + upma + curd + electrolyte water\n"
                    "1:00 Lunch — 2 chapati + palak dal + paneer + salad\n"
                    "4:00 Snack — 1 scoop whey + peanuts (30g)\n"
                    "8:30 Dinner — 3 eggs + dal + veggies\n"
                    f"Supplements — {SUPPL_D3}\n"
                    f"{MONSOON_NOTE}"
                ),
                "directive": (
                    "3 km tempo — 1 km more than last week. "
                    "Hold 7:00/km. If it's too hard, 7:10 is fine. "
                    "The tempo block should feel like 'strong but sustainable'."
                ),
            },
            {
                "date": "2026-07-31", "day": "Fri", "type": "Gym",
                "protein": 160, "calories": 2150, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "Gym — Pull + Posterior Chain",
                    "detail": (
                        f"{GYM_PULL_WARMUP} · "
                        "Pull-ups 4×max · Barbell rows 4×8 · "
                        "Lat pulldown 3×10 · RDL 3×10 · "
                        "Bulgarian split squat 2×10/leg · "
                        "Cable face pulls 3×12 · Calf raises 3×15 · "
                        "45 min · RPE 7 · "
                        f"{GYM_COOLDOWN}"
                    ),
                },
                "meals": (
                    "— PROTEIN MATH (verified): 4 eggs (28g) + 1 chapati (3g) + whey (24g) "
                    "+ 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) "
                    "+ whey (24g) + walnuts (3g) + 3 eggs (21g) + curd (8g) "
                    "+ 1 chapati (3g) + veggies (3g) + flaxseed (2g) = ~160g · CALORIES ~2,100–2,200 —\n"
                    "6:15 Pre-gym — Water + black coffee\n"
                    "8:00 Post-gym — 4 eggs + 1 chapati + 1 scoop whey\n"
                    "1:00 Lunch — 2 chapati + dal + paneer + salad\n"
                    "4:30 Snack — 1 scoop whey + 10 walnuts + flaxseed\n"
                    "8:30 Dinner — 3 eggs + 1 chapati + curd + veggies\n"
                    "PRE-LONG-RUN — +1 chapati at dinner · Extra carbs tonight\n"
                    f"Supplements — {SUPPL_DAILY}"
                ),
                "directive": (
                    "Rows to 4×8 — progress weight. Last hard gym session before deload next week. "
                    "Carb-load dinner — 10 km tomorrow. Sleep by 11 PM."
                ),
            },
            {
                "date": "2026-08-01", "day": "Sat", "type": "Run",
                "protein": 153, "calories": 2150, "water": "3L+",
                "run": {
                    "type": "Long Easy", "km": 10, "pace": "8:00–8:45/km",
                    "cue": (
                        f"{RUN_WARMUP} · "
                        "Cadence: 150 BPM · RPE 6–7 max · "
                        "Walk 1 min at 5 km and 7.5 km · "
                        "CARRY WATER — 10 km = ~85 min · "
                        "If knee pain at any point, walk 2 min. If it persists, stop at pain-free distance · "
                        f"{RUN_COOLDOWN} · "
                        "Post-run: foam roll + cold water on legs"
                    ),
                },
                "workout": {"plan": NA, "detail": NA},
                "meals": (
                    "— PROTEIN MATH (verified): banana (1g) + dates (1g) + 4 eggs (28g) "
                    "+ 2 chapati (6g) + curd (8g) + whey (24g) + 3 chapati (9g) "
                    "+ chana (15g) + paneer (18g) + peanuts (7g) "
                    "+ 3 eggs (21g) + dal (12g) + veggies (3g) = ~153g · "
                    "CALORIES ~2,200–2,300 (highest carb day — earned it) —\n"
                    "6:00 Pre-run — 1 banana + 2 dates + 250ml water\n"
                    "~7:40 Warm-up — full 10 min today\n"
                    "~8:40 Post-run — 4 eggs + 2 chapati + curd + 1 scoop whey "
                    "+ 500ml electrolyte water\n"
                    "1:00 Lunch — 3 chapati + chana + paneer (extra carbs)\n"
                    "4:00 Snack — peanuts (30g)\n"
                    "8:30 Dinner — 3 eggs + dal + veggies\n"
                    f"{SUPPL_DAILY}\n"
                    f"{MONSOON_NOTE}"
                ),
                "directive": (
                    "10 KM MILESTONE. You ran this distance before — your body knows how. "
                    "Walk breaks every 2.5 km are PLANNED, not failure. "
                    "Carry water. Start slower than you think. "
                    "If monsoon blocks Saturday, move to Sunday — this run matters."
                ),
            },
            {
                "date": "2026-08-02", "day": "Sun", "type": "Rest",
                "protein": 144, "calories": 1850, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "NEAT walk + recovery",
                    "detail": "Mandatory: 25–30 min brisk walk · Foam roll full body 10 min · Light stretching",
                },
                "meals": (
                    "— PROTEIN MATH (verified): 4 eggs (28g) "
                    "+ 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) + curd (8g) "
                    "+ whey (24g) + roasted chana (8g) + 3 eggs (21g) + hung curd (14g) "
                    "+ veggies (3g) = ~144g · CALORIES ~1,800–1,900 —\n"
                    "8:00 Breakfast — 4 eggs\n"
                    "1:00 Lunch — 2 chapati + dal + paneer + salad + curd\n"
                    "4:30 Snack — 1 scoop whey + roasted chana (30g)\n"
                    "8:30 Dinner — 3 eggs + hung curd + veggies\n"
                    f"Supplements — {SUPPL_DAILY}"
                ),
                "directive": "Recovery after 10 km. Walk. Foam roll. Eat well. DELOAD WEEK STARTS TOMORROW.",
            },
        ],
    },

    # ══════════════════════════════════════════════════════════════════════════
    # WEEK 7 — DELOAD · Recovery · 13 km
    # ══════════════════════════════════════════════════════════════════════════
    7: {
        "label": "Week 7",
        "dates": "4 Aug – 10 Aug 2026",
        "focus": (
            "DELOAD WEEK — volume -30%, gym -40% · 13 km total · "
            "Purpose: let body absorb 4 weeks of training · "
            "Reduce gym weight 20%, cut sets · All runs easy · No tempo · "
            "Sleep 7.5+ hours · Extra foam rolling · "
            "You should feel fresh and eager by Sunday"
        ),
        "days": [
            {
                "date": "2026-08-03", "day": "Mon", "type": "Gym",
                "protein": 155, "calories": 2050, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "Gym — Push DELOAD",
                    "detail": (
                        f"{GYM_PUSH_WARMUP} · "
                        "Flat bench press 2×10 (reduce weight 20%) · "
                        "Seated DB OHP 2×10 (light) · "
                        "Push-ups 2×15 · Plank 2×45s · "
                        "25 min · RPE 5 · "
                        f"{GYM_COOLDOWN}"
                    ),
                },
                "meals": (
                    "— PROTEIN MATH (verified): 4 eggs (28g) + 1 chapati (3g) + whey (24g) "
                    "+ 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) "
                    "+ whey (24g) + walnuts (3g) + 3 eggs (21g) + curd (8g) "
                    "+ veggies (3g) + flaxseed (2g) = ~154g · CALORIES ~2,000–2,100 —\n"
                    "6:30 Pre-gym — Water + black coffee\n"
                    "8:00 Post-gym — 4 eggs + 1 chapati + 1 scoop whey\n"
                    "1:00 Lunch — 2 chapati + dal + paneer + salad\n"
                    "4:30 Snack — 1 scoop whey + 10 walnuts + flaxseed\n"
                    "8:30 Dinner — 3 eggs + curd + veggies\n"
                    f"Supplements — {SUPPL_DAILY}\n"
                    "Monday AM: weigh + waist"
                ),
                "directive": (
                    "DELOAD — not lazy, strategic. Reduce weight 20%, cut sets. "
                    "You should leave gym feeling 'I could do more'. That's the point. "
                    "Sleep 7.5+ hours this week."
                ),
            },
            {
                "date": "2026-08-04", "day": "Tue", "type": "Run",
                "protein": 150, "calories": 2050, "water": "2.5L",
                "run": {
                    "type": "Easy", "km": 3, "pace": "8:00–8:30/km",
                    "cue": (
                        f"{RUN_WARMUP} · Cadence: 150 BPM · RPE 5 max · "
                        f"{RUN_COOLDOWN}"
                    ),
                },
                "workout": {"plan": NA, "detail": NA},
                "meals": (
                    "— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + poha (4g) "
                    "+ curd (8g) + 2 chapati (6g) + chana (15g) + paneer (18g) + salad (2g) "
                    "+ whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) "
                    "+ veggies (3g) = ~149g · CALORIES ~2,000–2,100 —\n"
                    "6:20 Pre-run — 1 banana + 250ml water\n"
                    "~7:20 Post-run — 4 eggs + poha + curd + electrolyte water\n"
                    "1:00 Lunch — 2 chapati + chana + paneer + salad\n"
                    "4:00 Snack — 1 scoop whey + peanuts (30g)\n"
                    "8:30 Dinner — 3 eggs + dal + veggies\n"
                    f"Supplements — {SUPPL_DAILY}\n"
                    f"{MONSOON_NOTE}"
                ),
                "directive": "Easy 3 km. Deload run — keep it light. RPE 5 max.",
            },
            {
                "date": "2026-08-05", "day": "Wed", "type": "Active Recovery",
                "protein": 149, "calories": 1900, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "Extended mobility + foam rolling",
                    "detail": (
                        "WARM-UP (5 min): 5 min brisk walk · "
                        "Glute bridges 2×15 · Calf raises 2×20 · "
                        "Clamshells 2×10/side · Ankle dorsiflexion 2×10/side · "
                        "EXTENDED foam roll: quads, calves, IT band, lats, upper back 10 min · "
                        "20 min · RPE 3 · "
                        f"{MOBILITY_COOLDOWN}"
                    ),
                },
                "meals": (
                    "— PROTEIN MATH (verified): 4 eggs (28g) + whey (24g) "
                    "+ 1.5 chapati (5g) + rajma (15g) + curd (8g) + salad (2g) "
                    "+ whey (24g) + flaxseed (2g) + walnuts (3g) + 3 eggs (21g) "
                    "+ paneer bhurji 80g (14g) + veggies (3g) = ~149g · CALORIES ~1,850–1,950 —\n"
                    "8:00 Breakfast — 4 eggs + 1 scoop whey\n"
                    "1:00 Lunch — 1.5 chapati + rajma + curd + salad\n"
                    "4:30 Snack — 1 scoop whey + flaxseed + 10 walnuts\n"
                    "8:30 Dinner — 3 eggs + paneer bhurji + veggies\n"
                    f"Supplements — {SUPPL_DAILY}\n"
                    "After work: 25–30 min brisk walk"
                ),
                "directive": "Extended foam rolling today — 10 min minimum. Body absorbs training during deload.",
            },
            {
                "date": "2026-08-06", "day": "Thu", "type": "Run",
                "protein": 150, "calories": 2050, "water": "2.5L",
                "run": {
                    "type": "Easy", "km": 3, "pace": "8:00–8:30/km",
                    "cue": (
                        f"{RUN_WARMUP} · Cadence: 150 BPM · RPE 5 max · "
                        f"{RUN_COOLDOWN}"
                    ),
                },
                "workout": {"plan": NA, "detail": NA},
                "meals": (
                    "— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + 2 toast (6g) "
                    "+ curd (8g) + 2 chapati (6g) + palak dal (14g) + paneer (18g) "
                    "+ whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) "
                    "+ veggies (3g) + salad (2g) = ~150g · CALORIES ~2,000–2,100 —\n"
                    "6:20 Pre-run — 1 banana + 250ml water\n"
                    "~7:20 Post-run — 4 eggs + 2 toast + curd + electrolyte water\n"
                    "1:00 Lunch — 2 chapati + palak dal + paneer + salad\n"
                    "4:00 Snack — 1 scoop whey + peanuts (30g)\n"
                    "8:30 Dinner — 3 eggs + dal + veggies\n"
                    f"Supplements — {SUPPL_D3}\n"
                    f"{MONSOON_NOTE}"
                ),
                "directive": "Easy 3 km. No tempo this week — recovery only.",
            },
            {
                "date": "2026-08-07", "day": "Fri", "type": "Gym",
                "protein": 155, "calories": 2050, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "Gym — Pull DELOAD",
                    "detail": (
                        f"{GYM_PULL_WARMUP} · "
                        "Pull-ups 3×max · Barbell rows 2×10 (light) · "
                        "Lat pulldown 2×10 · RDL 2×10 (light) · "
                        "Glute bridges 2×15 · "
                        "25 min · RPE 5 · "
                        f"{GYM_COOLDOWN}"
                    ),
                },
                "meals": (
                    "— PROTEIN MATH (verified): 4 eggs (28g) + upma (4g) + whey (24g) "
                    "+ 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) "
                    "+ whey (24g) + roasted chana (8g) + 3 eggs (21g) + curd (8g) "
                    "+ veggies (3g) = ~155g · CALORIES ~2,000–2,100 —\n"
                    "6:30 Pre-gym — Water + black coffee\n"
                    "8:00 Post-gym — 4 eggs + upma + 1 scoop whey\n"
                    "1:00 Lunch — 2 chapati + dal + paneer + salad\n"
                    "4:30 Snack — 1 scoop whey + roasted chana (30g)\n"
                    "8:30 Dinner — 3 eggs + curd + veggies\n"
                    f"Supplements — {SUPPL_DAILY}"
                ),
                "directive": "Deload pull. Light everything. Carb dinner for tomorrow's long run.",
            },
            {
                "date": "2026-08-08", "day": "Sat", "type": "Run",
                "protein": 150, "calories": 2100, "water": "2.5L+",
                "run": {
                    "type": "Long Easy", "km": 7, "pace": "8:00–8:45/km",
                    "cue": (
                        f"{RUN_WARMUP} · Cadence: 150 BPM · RPE 5–6 · "
                        "Walk 1 min at 3.5 km if needed · "
                        f"{RUN_COOLDOWN} · Post-run foam roll"
                    ),
                },
                "workout": {"plan": NA, "detail": NA},
                "meals": (
                    "— PROTEIN MATH (verified): banana (1g) + dates (1g) + 4 eggs (28g) "
                    "+ 2 chapati (6g) + curd (8g) + 2 chapati (6g) + dal (12g) + paneer (18g) "
                    "+ whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) "
                    "+ veggies (3g) + salad (2g) = ~149g · CALORIES ~2,050–2,150 —\n"
                    "6:20 Pre-run — banana + dates + water\n"
                    "~8:00 Post-run — 4 eggs + 2 chapati + curd + electrolyte water\n"
                    "1:00 Lunch — 2 chapati + dal + paneer + salad\n"
                    "4:00 Snack — 1 scoop whey + peanuts (30g)\n"
                    "8:30 Dinner — 3 eggs + dal + veggies\n"
                    f"{SUPPL_DAILY}\n"
                    f"{MONSOON_NOTE}"
                ),
                "directive": (
                    "7 km deload long run — shorter than last week's 10 km. "
                    "This should feel EASY. If it doesn't, your body needed this deload."
                ),
            },
            {
                "date": "2026-08-09", "day": "Sun", "type": "Rest",
                "protein": 149, "calories": 1850, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "NEAT walk + recovery",
                    "detail": "Mandatory: 25–30 min brisk walk · Foam roll 7 min",
                },
                "meals": (
                    "— PROTEIN MATH (verified): paneer bhurji 80g (14g) + moong chilla 2 w/ paneer (20g) "
                    "+ 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) + curd (8g) "
                    "+ whey (24g) + walnuts (3g) + 3 eggs (21g) + hung curd (14g) "
                    "+ veggies (3g) = ~145g · CALORIES ~1,800–1,900 —\n"
                    "8:00 Breakfast — paneer bhurji + moong chilla with paneer\n"
                    "1:00 Lunch — 2 chapati + dal + paneer + salad + curd\n"
                    "4:30 Snack — 1 scoop whey + 10 walnuts\n"
                    "8:30 Dinner — 3 eggs + hung curd + veggies\n"
                    f"Supplements — {SUPPL_DAILY}"
                ),
                "directive": "End of deload. You should feel rested and hungry to train. PEAK PHASE STARTS MONDAY.",
            },
        ],
    },

    # ══════════════════════════════════════════════════════════════════════════
    # WEEK 8 — Peak phase 1 · 20 km · Long run 11 km
    # ══════════════════════════════════════════════════════════════════════════
    8: {
        "label": "Week 8",
        "dates": "11 Aug – 17 Aug 2026",
        "focus": (
            "PEAK PHASE 1 · 20 km total · Fresh from deload — hit it hard · "
            "Tempo 4 km @ 7:00/km · Long run 11 km — new territory · "
            "Gym: back to full intensity · "
            "Aug 15 (Fri) = Independence Day — gym may be closed, bodyweight backup · "
            "26 days to race"
        ),
        "days": [
            {
                "date": "2026-08-10", "day": "Mon", "type": "Gym",
                "protein": 161, "calories": 2150, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "Gym — Push + Core (peak)",
                    "detail": (
                        f"{GYM_PUSH_WARMUP} · "
                        "Flat bench press 4×8 · Seated DB OHP 3×8 · "
                        "Incline DB press 3×8 · Dips 3×max · "
                        "Cable fly 3×12 · "
                        "Plank 3×60s · Hanging knee raises 3×12 · "
                        "45 min · RPE 7–8 · "
                        f"{GYM_COOLDOWN}"
                    ),
                },
                "meals": (
                    "— PROTEIN MATH (verified): 4 eggs (28g) + moong chilla 2 w/ paneer (20g) "
                    "+ 2 chapati (6g) + chana (15g) + paneer (18g) + salad (2g) "
                    "+ whey (24g) + peanuts (7g) + 3 eggs (21g) + palak dal (14g) "
                    "+ veggies (3g) + flaxseed (2g) = ~160g · CALORIES ~2,100–2,200 —\n"
                    "6:15 Pre-gym — Water + black coffee\n"
                    "8:00 Post-gym — 4 eggs + moong chilla with paneer\n"
                    "1:00 Lunch — 2 chapati + chana + paneer + salad\n"
                    "4:30 Snack — 1 scoop whey + peanuts (30g) + flaxseed\n"
                    "8:30 Dinner — 3 eggs + palak dal + veggies\n"
                    f"Supplements — {SUPPL_DAILY}\n"
                    "Monday AM: weigh + waist"
                ),
                "directive": "Post-deload — you should feel strong. Push weights back to W6 levels or higher.",
            },
            {
                "date": "2026-08-11", "day": "Tue", "type": "Run",
                "protein": 150, "calories": 2100, "water": "2.5L",
                "run": {
                    "type": "Easy", "km": 4, "pace": "7:45–8:30/km",
                    "cue": (
                        f"{RUN_WARMUP} · Cadence: 150 BPM · RPE 5–6 · "
                        f"{RUN_COOLDOWN}"
                    ),
                },
                "workout": {"plan": NA, "detail": NA},
                "meals": (
                    "— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + 2 toast (6g) "
                    "+ curd (8g) + 2 chapati (6g) + rajma (15g) + paneer (18g) + salad (2g) "
                    "+ whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) "
                    "+ veggies (3g) = ~151g · CALORIES ~2,050–2,150 —\n"
                    "6:20 Pre-run — 1 banana + 250ml water\n"
                    "~7:40 Post-run — 4 eggs + 2 toast + curd + electrolyte water\n"
                    "1:00 Lunch — 2 chapati + rajma + paneer + salad\n"
                    "4:00 Snack — 1 scoop whey + peanuts (30g)\n"
                    "8:30 Dinner — 3 eggs + dal + veggies\n"
                    f"Supplements — {SUPPL_DAILY}\n"
                    f"{MONSOON_NOTE}"
                ),
                "directive": "Easy 4 km. Save legs for Thursday's 4 km tempo.",
            },
            {
                "date": "2026-08-12", "day": "Wed", "type": "Active Recovery",
                "protein": 139, "calories": 1900, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "Knee prep + mobility",
                    "detail": (
                        "WARM-UP (5 min): 5 min brisk walk · "
                        "Glute bridges 3×15 · Calf raises 3×20 · "
                        "Clamshells 2×12/side · Ankle dorsiflexion 2×10/side · "
                        "Foam roll full body 7 min · 20 min · RPE 4 · "
                        f"{MOBILITY_COOLDOWN}"
                    ),
                },
                "meals": (
                    "— PROTEIN MATH (verified): 4 eggs (28g) + besan chilla 1.5 w/ paneer (17g) "
                    "+ 1.5 chapati (5g) + dal (12g) + curd (8g) + salad (2g) "
                    "+ whey (24g) + flaxseed (2g) + walnuts (3g) + 3 eggs (21g) "
                    "+ paneer bhurji 80g (14g) + veggies (3g) = ~139g · CALORIES ~1,850–1,950 —\n"
                    "8:00 Breakfast — 4 eggs + besan chilla with paneer\n"
                    "1:00 Lunch — 1.5 chapati + dal + curd + salad\n"
                    "4:30 Snack — 1 scoop whey + flaxseed + 10 walnuts\n"
                    "8:30 Dinner — 3 eggs + paneer bhurji + veggies\n"
                    f"Supplements — {SUPPL_DAILY}\n"
                    "After work: 25–30 min brisk walk"
                ),
                "directive": "Mobility before longest tempo session. Don't skip ankle work.",
            },
            {
                "date": "2026-08-13", "day": "Thu", "type": "Run",
                "protein": 150, "calories": 2100, "water": "2.5L",
                "run": {
                    "type": "Tempo", "km": 5, "pace": "7:00/km tempo · 8:00/km easy",
                    "cue": (
                        f"{RUN_WARMUP} · "
                        "0.5 km easy warm-up jog → "
                        "4 km TEMPO @ 7:00/km → "
                        "0.5 km easy cool-down jog · "
                        "Cadence: 158–162 BPM during tempo · RPE 7–8 · "
                        f"{RUN_COOLDOWN}"
                    ),
                },
                "workout": {"plan": NA, "detail": NA},
                "meals": (
                    "— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + upma (4g) "
                    "+ curd (8g) + 2 chapati (6g) + chana (15g) + paneer (18g) "
                    "+ whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) "
                    "+ veggies (3g) + salad (2g) = ~149g · CALORIES ~2,050–2,150 —\n"
                    "6:20 Pre-run — 1 banana + 250ml water\n"
                    "~7:50 Post-run — 4 eggs + upma + curd + electrolyte water\n"
                    "1:00 Lunch — 2 chapati + chana + paneer + salad\n"
                    "4:00 Snack — 1 scoop whey + peanuts (30g)\n"
                    "8:30 Dinner — 3 eggs + dal + veggies\n"
                    f"Supplements — {SUPPL_D3}\n"
                    f"{MONSOON_NOTE}"
                ),
                "directive": (
                    "4 km tempo — longest tempo block yet. "
                    "This is 80% of race pace for 4 km. "
                    "If you can hold 7:00/km for 4 km, you can hold it for 21.1 km with training."
                ),
            },
            {
                "date": "2026-08-14", "day": "Fri", "type": "Gym",
                "protein": 160, "calories": 2150, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "Gym — Pull + Posterior Chain (Aug 15 backup: bodyweight at home)",
                    "detail": (
                        f"{GYM_PULL_WARMUP} · "
                        "Pull-ups 4×max · Barbell rows 4×8 · "
                        "Lat pulldown 3×10 · RDL 3×8 · "
                        "Bulgarian split squat 2×10/leg · "
                        "Cable face pulls 3×12 · Calf raises 3×15 · "
                        "45 min · RPE 7 · "
                        "BACKUP (if gym closed for Independence Day): "
                        "Pull-ups 4×max + Rows 3×10 (table) + "
                        "RDL bodyweight 3×15 + Glute bridges 3×15 + Plank 3×60s · "
                        f"{GYM_COOLDOWN}"
                    ),
                },
                "meals": (
                    "— PROTEIN MATH (verified): 4 eggs (28g) + 1 chapati (3g) + whey (24g) "
                    "+ 2 chapati (6g) + palak dal (14g) + paneer (18g) + salad (2g) "
                    "+ whey (24g) + walnuts (3g) + 3 eggs (21g) + curd (8g) "
                    "+ 1 chapati (3g) + veggies (3g) + flaxseed (2g) = ~160g · CALORIES ~2,100–2,200 —\n"
                    "6:15 Pre-gym — Water + black coffee\n"
                    "8:00 Post-gym — 4 eggs + 1 chapati + 1 scoop whey\n"
                    "1:00 Lunch — 2 chapati + palak dal + paneer + salad\n"
                    "4:30 Snack — 1 scoop whey + 10 walnuts + flaxseed\n"
                    "8:30 Dinner — 3 eggs + 1 chapati + curd + veggies\n"
                    "PRE-LONG-RUN — extra carbs tonight\n"
                    f"Supplements — {SUPPL_DAILY}"
                ),
                "directive": (
                    "Aug 15 Independence Day — gym may close. Check hours. "
                    "If closed, do bodyweight backup at home. Don't skip. "
                    "Carb dinner for 11 km tomorrow."
                ),
            },
            {
                "date": "2026-08-15", "day": "Sat", "type": "Run",
                "protein": 150, "calories": 2150, "water": "3L+",
                "run": {
                    "type": "Long Easy", "km": 11, "pace": "8:00–8:45/km",
                    "cue": (
                        f"{RUN_WARMUP} · "
                        "Cadence: 150 BPM · RPE 6–7 · "
                        "Walk 1 min every 3 km (at 3, 6, 9 km) · "
                        "CARRY WATER — 11 km = ~90 min · "
                        f"{RUN_COOLDOWN} · "
                        "Post-run: foam roll + cold water + electrolytes"
                    ),
                },
                "workout": {"plan": NA, "detail": NA},
                "meals": (
                    "— PROTEIN MATH (verified): banana (1g) + dates (1g) + 4 eggs (28g) "
                    "+ 2 chapati (6g) + curd (8g) + whey (24g) + 3 chapati (9g) + dal (12g) "
                    "+ paneer (18g) + peanuts (7g) + 3 eggs (21g) "
                    "+ dal (12g) + veggies (3g) = ~150g · CALORIES ~2,200–2,300 —\n"
                    "6:00 Pre-run — banana + dates + water\n"
                    "~8:00 Warm-up — full 10 min\n"
                    "~9:00 Post-run — 4 eggs + 2 chapati + curd + 1 scoop whey + electrolytes\n"
                    "1:00 Lunch — 3 chapati + dal + paneer (extra carbs)\n"
                    "4:00 Snack — peanuts (30g)\n"
                    "8:30 Dinner — 3 eggs + dal + veggies\n"
                    f"{SUPPL_DAILY}\n"
                    f"{MONSOON_NOTE}"
                ),
                "directive": (
                    "11 KM — new personal distance record. "
                    "Independence Day — park may be busy, start early. "
                    "Walk breaks at 3/6/9 km are PLANNED. Carry water. "
                    "Finish feeling you could do 1 more km."
                ),
            },
            {
                "date": "2026-08-16", "day": "Sun", "type": "Rest",
                "protein": 144, "calories": 1850, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "NEAT walk + recovery",
                    "detail": "Mandatory: 25–30 min walk · Foam roll full body 10 min",
                },
                "meals": (
                    "— PROTEIN MATH (verified): 4 eggs (28g) "
                    "+ 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) + curd (8g) "
                    "+ whey (24g) + roasted chana (8g) + 3 eggs (21g) + hung curd (14g) "
                    "+ veggies (3g) = ~144g · CALORIES ~1,800–1,900 —\n"
                    "8:00 Breakfast — 4 eggs\n"
                    "1:00 Lunch — 2 chapati + dal + paneer + salad + curd\n"
                    "4:30 Snack — 1 scoop whey + roasted chana (30g)\n"
                    "8:30 Dinner — 3 eggs + hung curd + veggies\n"
                    f"Supplements — {SUPPL_DAILY}"
                ),
                "directive": "Recovery after 11 km. Walk, foam roll, sleep well. One more hard week then taper.",
            },
        ],
    },

    # ══════════════════════════════════════════════════════════════════════════
    # WEEK 9 — Peak phase 2 · PEAK LONG RUN 14 km · Last hard week
    # ══════════════════════════════════════════════════════════════════════════
    9: {
        "label": "Week 9",
        "dates": "18 Aug – 24 Aug 2026",
        "focus": (
            "LAST HARD WEEK · 22 km total · Peak long run 14 km · "
            "Tempo: 3 km @ 6:50/km — race pace sharpener · "
            "Last heavy gym session · "
            "After this week: taper begins, no more new distance records · "
            "19 days to race · Sleep 7.5+ hours"
        ),
        "days": [
            {
                "date": "2026-08-17", "day": "Mon", "type": "Gym",
                "protein": 161, "calories": 2150, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "Gym — Push + Core (last hard session)",
                    "detail": (
                        f"{GYM_PUSH_WARMUP} · "
                        "Flat bench press 4×8 · Seated DB OHP 3×8 · "
                        "Incline DB press 3×8 · Dips 3×max · "
                        "Cable fly 3×12 · "
                        "Plank 3×60s · Hanging knee raises 3×12 · "
                        "45 min · RPE 7–8 · "
                        f"{GYM_COOLDOWN}"
                    ),
                },
                "meals": (
                    "— PROTEIN MATH (verified): 4 eggs (28g) + 1 chapati (3g) + whey (24g) "
                    "+ 2 chapati (6g) + rajma (15g) + paneer (18g) + salad (2g) "
                    "+ whey (24g) + walnuts (3g) + 3 eggs (21g) + paneer bhurji 80g (14g) "
                    "+ veggies (3g) = ~161g · CALORIES ~2,100–2,200 —\n"
                    "6:15 Pre-gym — Water + black coffee\n"
                    "8:00 Post-gym — 4 eggs + 1 chapati + 1 scoop whey\n"
                    "1:00 Lunch — 2 chapati + rajma + paneer + salad\n"
                    "4:30 Snack — 1 scoop whey + 10 walnuts\n"
                    "8:30 Dinner — 3 eggs + paneer bhurji + veggies\n"
                    f"Supplements — {SUPPL_DAILY}\n"
                    "Monday AM: weigh + waist"
                ),
                "directive": (
                    "Last hard push session. Give it everything. "
                    "After this week, gym becomes maintenance only."
                ),
            },
            {
                "date": "2026-08-18", "day": "Tue", "type": "Run",
                "protein": 150, "calories": 2100, "water": "2.5L",
                "run": {
                    "type": "Easy", "km": 4, "pace": "7:45–8:30/km",
                    "cue": (
                        f"{RUN_WARMUP} · Cadence: 150 BPM · RPE 5–6 · "
                        f"{RUN_COOLDOWN}"
                    ),
                },
                "workout": {"plan": NA, "detail": NA},
                "meals": (
                    "— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + poha (4g) "
                    "+ curd (8g) + 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) "
                    "+ whey (24g) + roasted chana (8g) + 3 eggs (21g) + rajma (15g) "
                    "+ veggies (3g) = ~150g · CALORIES ~2,050–2,150 —\n"
                    "6:20 Pre-run — 1 banana + 250ml water\n"
                    "~7:40 Post-run — 4 eggs + poha + curd + electrolyte water\n"
                    "1:00 Lunch — 2 chapati + dal + paneer + salad\n"
                    "4:00 Snack — 1 scoop whey + roasted chana (30g)\n"
                    "8:30 Dinner — 3 eggs + rajma + veggies\n"
                    f"Supplements — {SUPPL_DAILY}\n"
                    f"{MONSOON_NOTE}"
                ),
                "directive": "Easy 4 km. Save energy for Thursday's race-pace tempo.",
            },
            {
                "date": "2026-08-19", "day": "Wed", "type": "Active Recovery",
                "protein": 149, "calories": 1900, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "Knee prep + mobility",
                    "detail": (
                        "WARM-UP (5 min): 5 min brisk walk · "
                        "Glute bridges 3×15 · Calf raises 3×20 · "
                        "Clamshells 2×12/side · Ankle dorsiflexion 2×10/side · "
                        "Foam roll full body 7 min · 20 min · RPE 4 · "
                        f"{MOBILITY_COOLDOWN}"
                    ),
                },
                "meals": (
                    "— PROTEIN MATH (verified): 4 eggs (28g) + whey (24g) "
                    "+ 1.5 chapati (5g) + chana (15g) + curd (8g) + salad (2g) "
                    "+ whey (24g) + flaxseed (2g) + walnuts (3g) + 3 eggs (21g) "
                    "+ paneer bhurji 80g (14g) + veggies (3g) = ~149g · CALORIES ~1,850–1,950 —\n"
                    "8:00 Breakfast — 4 eggs + 1 scoop whey\n"
                    "1:00 Lunch — 1.5 chapati + chana + curd + salad\n"
                    "4:30 Snack — 1 scoop whey + flaxseed + 10 walnuts\n"
                    "8:30 Dinner — 3 eggs + paneer bhurji + veggies\n"
                    f"Supplements — {SUPPL_DAILY}\n"
                    "After work: 25–30 min brisk walk"
                ),
                "directive": "Mobility before race-pace tempo. Extra focus on ankles and calves.",
            },
            {
                "date": "2026-08-20", "day": "Thu", "type": "Run",
                "protein": 150, "calories": 2100, "water": "2.5L",
                "run": {
                    "type": "Tempo", "km": 4, "pace": "6:50/km tempo · 8:00/km easy",
                    "cue": (
                        f"{RUN_WARMUP} · "
                        "0.5 km easy warm-up jog → "
                        "3 km TEMPO @ 6:50/km — RACE PACE SHARPENER → "
                        "0.5 km easy cool-down jog · "
                        "Cadence: 160+ BPM during tempo · RPE 8 · "
                        "This is the hardest run of the entire plan · "
                        f"{RUN_COOLDOWN}"
                    ),
                },
                "workout": {"plan": NA, "detail": NA},
                "meals": (
                    "— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + 2 toast (6g) "
                    "+ curd (8g) + 2 chapati (6g) + palak dal (14g) + paneer (18g) "
                    "+ whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) "
                    "+ veggies (3g) + salad (2g) = ~150g · CALORIES ~2,050–2,150 —\n"
                    "6:20 Pre-run — 1 banana + 250ml water\n"
                    "~7:30 Post-run — 4 eggs + 2 toast + curd + electrolyte water\n"
                    "1:00 Lunch — 2 chapati + palak dal + paneer + salad\n"
                    "4:00 Snack — 1 scoop whey + peanuts (30g)\n"
                    "8:30 Dinner — 3 eggs + dal + veggies\n"
                    f"Supplements — {SUPPL_D3}\n"
                    f"{MONSOON_NOTE}"
                ),
                "directive": (
                    "RACE PACE SHARPENER — 3 km at 6:50/km. "
                    "This is faster than race pace (7:06/km). If you can hold this for 3 km, "
                    "you can hold 7:06 for 21 km. RPE 8 is expected. "
                    "LAST HARD TEMPO. After this, taper."
                ),
            },
            {
                "date": "2026-08-21", "day": "Fri", "type": "Gym",
                "protein": 160, "calories": 2150, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "Gym — Pull + Posterior Chain (last heavy session)",
                    "detail": (
                        f"{GYM_PULL_WARMUP} · "
                        "Pull-ups 4×max · Barbell rows 4×8 · "
                        "Lat pulldown 3×10 · RDL 3×8 · "
                        "Bulgarian split squat 2×10/leg · "
                        "Cable face pulls 3×12 · Calf raises 3×15 · "
                        "45 min · RPE 7 · "
                        f"{GYM_COOLDOWN}"
                    ),
                },
                "meals": (
                    "— PROTEIN MATH (verified): 4 eggs (28g) + upma (4g) + whey (24g) "
                    "+ 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) "
                    "+ whey (24g) + peanuts (7g) + 3 eggs (21g) + curd (8g) "
                    "+ 1 chapati (3g) + veggies (3g) = ~160g · CALORIES ~2,100–2,200 —\n"
                    "6:15 Pre-gym — Water + black coffee\n"
                    "8:00 Post-gym — 4 eggs + upma + 1 scoop whey\n"
                    "1:00 Lunch — 2 chapati + dal + paneer + salad\n"
                    "4:30 Snack — 1 scoop whey + peanuts (30g)\n"
                    "8:30 Dinner — 3 eggs + 1 chapati + curd + veggies\n"
                    "PRE-LONG-RUN — extra carbs tonight · Sleep by 10:30 PM\n"
                    f"Supplements — {SUPPL_DAILY}"
                ),
                "directive": (
                    "LAST HEAVY GYM SESSION. After this, gym is maintenance only. "
                    "Give it your best. Extra carbs for tomorrow's peak long run. "
                    "Sleep early — 14 km tomorrow."
                ),
            },
            {
                "date": "2026-08-22", "day": "Sat", "type": "Run",
                "protein": 153, "calories": 2200, "water": "3L+",
                "run": {
                    "type": "Long Easy", "km": 14, "pace": "8:00–8:45/km",
                    "cue": (
                        f"{RUN_WARMUP} · "
                        "Cadence: 150 BPM · RPE 6–7 · "
                        "Walk 1 min every 3 km (at 3, 6, 9, 12 km) · "
                        "CARRY WATER — 14 km = ~2 hours · "
                        "Carry a small snack (2 dates) for km 10 · "
                        f"{RUN_COOLDOWN} · "
                        "Post-run: foam roll + cold water + full electrolyte rehydration"
                    ),
                },
                "workout": {"plan": NA, "detail": NA},
                "meals": (
                    "— PROTEIN MATH (verified): banana (1g) + dates (1g) + 4 eggs (28g) "
                    "+ 2 chapati (6g) + curd (8g) + whey (24g) + 3 chapati (9g) + chana (15g) "
                    "+ paneer (18g) + peanuts (7g) + 3 eggs (21g) + dal (12g) "
                    "+ veggies (3g) = ~153g · "
                    "CALORIES ~2,300–2,400 (highest of entire plan — earned it) —\n"
                    "5:45 Pre-run — 1 banana + 2 dates + 250ml water\n"
                    "~6:00 Warm-up — full 10 min\n"
                    "~8:30 Post-run — 4 eggs + 2 chapati + curd + 1 scoop whey + electrolytes\n"
                    "1:00 Lunch — 3 chapati + chana + paneer (extra carbs — refuel)\n"
                    "4:00 Snack — peanuts (30g)\n"
                    "8:30 Dinner — 3 eggs + dal + veggies\n"
                    f"{SUPPL_DAILY}\n"
                    f"{MONSOON_NOTE}"
                ),
                "directive": (
                    "PEAK LONG RUN — 14 KM. Longest run of the entire plan. "
                    "Start at 5:45 AM — it will take ~2 hours. "
                    "Walk breaks every 3 km are MANDATORY, not optional. "
                    "Carry water AND 2 dates for fuel at km 10. "
                    "After this: no more new distance records. Taper begins. "
                    "If you finish 14 km, you WILL finish 21.1 km on race day."
                ),
            },
            {
                "date": "2026-08-23", "day": "Sun", "type": "Rest",
                "protein": 149, "calories": 1900, "water": "2.5L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "NEAT walk + extended recovery",
                    "detail": "Mandatory: 30 min easy walk · Foam roll full body 10 min · Light stretching 10 min",
                },
                "meals": (
                    "— PROTEIN MATH (verified): paneer bhurji 80g (14g) + moong chilla 2 w/ paneer (20g) "
                    "+ 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) + curd (8g) "
                    "+ whey (24g) + walnuts (3g) + 3 eggs (21g) + hung curd (14g) "
                    "+ veggies (3g) = ~145g · CALORIES ~1,850–1,950 —\n"
                    "8:00 Breakfast — paneer bhurji + moong chilla with paneer\n"
                    "1:00 Lunch — 2 chapati + dal + paneer + salad + curd\n"
                    "4:30 Snack — 1 scoop whey + 10 walnuts\n"
                    "8:30 Dinner — 3 eggs + hung curd + veggies\n"
                    f"Supplements — {SUPPL_DAILY}"
                ),
                "directive": (
                    "Recovery after peak long run. Extra calories today — don't cut aggressively. "
                    "Walk, foam roll, stretch. TAPER STARTS TOMORROW. "
                    "Monday AM: weigh + waist."
                ),
            },
        ],
    },

    # ══════════════════════════════════════════════════════════════════════════
    # WEEK 10 — TAPER · 14 km · Maintain fitness, shed fatigue
    # ══════════════════════════════════════════════════════════════════════════
    10: {
        "label": "Week 10",
        "dates": "25 Aug – 31 Aug 2026",
        "focus": (
            "TAPER WEEK — volume -40% · 14 km total · "
            "Keep intensity, cut volume · 1 short tempo · Long run 8 km (dress rehearsal) · "
            "Gym: maintenance only — keep weight, cut sets · "
            "Sleep 8 hours · Zero stress · Zero ego · "
            "12 days to race"
        ),
        "days": [
            {
                "date": "2026-08-24", "day": "Mon", "type": "Gym",
                "protein": 155, "calories": 2100, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "Gym — Push TAPER (maintenance)",
                    "detail": (
                        f"{GYM_PUSH_WARMUP} · "
                        "Flat bench press 2×8 (keep weight, cut volume) · "
                        "Seated DB OHP 2×8 · Push-ups 2×15 · "
                        "Plank 2×60s · "
                        "30 min · RPE 6 · "
                        f"{GYM_COOLDOWN}"
                    ),
                },
                "meals": (
                    "— PROTEIN MATH (verified): 4 eggs (28g) + poha (4g) + whey (24g) "
                    "+ 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) "
                    "+ whey (24g) + peanuts (7g) + 3 eggs (21g) + curd (8g) "
                    "+ veggies (3g) = ~154g · CALORIES ~2,050–2,150 —\n"
                    "6:30 Pre-gym — Water + black coffee\n"
                    "8:00 Post-gym — 4 eggs + poha + 1 scoop whey\n"
                    "1:00 Lunch — 2 chapati + dal + paneer + salad\n"
                    "4:30 Snack — 1 scoop whey + peanuts (30g)\n"
                    "8:30 Dinner — 3 eggs + curd + veggies\n"
                    f"Supplements — {SUPPL_DAILY}\n"
                    "Monday AM: weigh + waist"
                ),
                "directive": (
                    "TAPER — same weight, half the sets. You should feel 'too easy'. "
                    "That's the point. Your body is shedding fatigue while keeping fitness."
                ),
            },
            {
                "date": "2026-08-25", "day": "Tue", "type": "Run",
                "protein": 150, "calories": 2050, "water": "2.5L",
                "run": {
                    "type": "Easy", "km": 3, "pace": "7:45–8:15/km",
                    "cue": (
                        f"{RUN_WARMUP} · Cadence: 150 BPM · RPE 5 · "
                        f"{RUN_COOLDOWN}"
                    ),
                },
                "workout": {"plan": NA, "detail": NA},
                "meals": (
                    "— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + 2 toast (6g) "
                    "+ curd (8g) + 2 chapati (6g) + chana (15g) + paneer (18g) + salad (2g) "
                    "+ whey (24g) + peanuts (7g) + 3 eggs (21g) + palak dal (14g) "
                    "+ veggies (3g) = ~153g · CALORIES ~2,000–2,100 —\n"
                    "6:20 Pre-run — 1 banana + 250ml water\n"
                    "~7:15 Post-run — 4 eggs + 2 toast + curd + water\n"
                    "1:00 Lunch — 2 chapati + chana + paneer + salad\n"
                    "4:00 Snack — 1 scoop whey + peanuts (30g)\n"
                    "8:30 Dinner — 3 eggs + palak dal + veggies\n"
                    f"Supplements — {SUPPL_DAILY}\n"
                    f"{MONSOON_NOTE}"
                ),
                "directive": "Short easy run. Feel the legs — they should feel fresh and springy from taper.",
            },
            {
                "date": "2026-08-26", "day": "Wed", "type": "Active Recovery",
                "protein": 149, "calories": 1900, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "Light mobility + foam rolling",
                    "detail": (
                        "5 min brisk walk · Glute bridges 2×15 · Calf raises 2×20 · "
                        "Ankle dorsiflexion 2×10/side · "
                        "Foam roll full body 10 min · Light stretching · "
                        "15 min · RPE 3 · "
                        f"{MOBILITY_COOLDOWN}"
                    ),
                },
                "meals": (
                    "— PROTEIN MATH (verified): 4 eggs (28g) + whey (24g) "
                    "+ 1.5 chapati (5g) + rajma (15g) + curd (8g) + salad (2g) "
                    "+ whey (24g) + flaxseed (2g) + walnuts (3g) + 3 eggs (21g) "
                    "+ paneer bhurji 80g (14g) + veggies (3g) = ~149g · CALORIES ~1,850–1,950 —\n"
                    "8:00 Breakfast — 4 eggs + 1 scoop whey\n"
                    "1:00 Lunch — 1.5 chapati + rajma + curd + salad\n"
                    "4:30 Snack — 1 scoop whey + flaxseed + 10 walnuts\n"
                    "8:30 Dinner — 3 eggs + paneer bhurji + veggies\n"
                    f"Supplements — {SUPPL_DAILY}\n"
                    "Walk after work"
                ),
                "directive": "Light mobility. Extra foam rolling. Rest is productive during taper.",
            },
            {
                "date": "2026-08-27", "day": "Thu", "type": "Run",
                "protein": 150, "calories": 2050, "water": "2.5L",
                "run": {
                    "type": "Tempo", "km": 3, "pace": "7:00/km tempo · 8:00/km easy",
                    "cue": (
                        f"{RUN_WARMUP} · "
                        "1 km easy warm-up jog → "
                        "1.5 km TEMPO @ 7:00/km — feel race pace one last time → "
                        "0.5 km easy cool-down jog · "
                        "Cadence: 158–162 BPM · RPE 6–7 · "
                        f"{RUN_COOLDOWN}"
                    ),
                },
                "workout": {"plan": NA, "detail": NA},
                "meals": (
                    "— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + upma (4g) "
                    "+ curd (8g) + 2 chapati (6g) + dal (12g) + paneer (18g) "
                    "+ whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) "
                    "+ veggies (3g) + salad (2g) = ~146g · CALORIES ~2,000–2,100 —\n"
                    "6:20 Pre-run — 1 banana + 250ml water\n"
                    "~7:15 Post-run — 4 eggs + upma + curd + water\n"
                    "1:00 Lunch — 2 chapati + dal + paneer + salad\n"
                    "4:00 Snack — 1 scoop whey + peanuts (30g)\n"
                    "8:30 Dinner — 3 eggs + dal + veggies\n"
                    f"Supplements — {SUPPL_D3}\n"
                    f"{MONSOON_NOTE}"
                ),
                "directive": (
                    "LAST TEMPO before race. Short and sharp — 1.5 km at race pace. "
                    "The purpose is to remind your legs what 7:00/km feels like. "
                    "Should feel easy — that's the taper working."
                ),
            },
            {
                "date": "2026-08-28", "day": "Fri", "type": "Gym",
                "protein": 155, "calories": 2100, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "Gym — Pull TAPER (last gym before race)",
                    "detail": (
                        f"{GYM_PULL_WARMUP} · "
                        "Pull-ups 3×max · Barbell rows 2×8 (moderate) · "
                        "Lat pulldown 2×10 · Light RDL 2×10 · "
                        "Glute bridges 2×15 · "
                        "30 min · RPE 5–6 · "
                        f"{GYM_COOLDOWN}"
                    ),
                },
                "meals": (
                    "— PROTEIN MATH (verified): 4 eggs (28g) + 1 chapati (3g) + whey (24g) "
                    "+ 2 chapati (6g) + chana (15g) + paneer (18g) + salad (2g) "
                    "+ whey (24g) + walnuts (3g) + 3 eggs (21g) + curd (8g) "
                    "+ 1 chapati (3g) + veggies (3g) = ~158g · CALORIES ~2,050–2,150 —\n"
                    "6:30 Pre-gym — Water + black coffee\n"
                    "8:00 Post-gym — 4 eggs + 1 chapati + 1 scoop whey\n"
                    "1:00 Lunch — 2 chapati + chana + paneer + salad\n"
                    "4:30 Snack — 1 scoop whey + 10 walnuts\n"
                    "8:30 Dinner — 3 eggs + 1 chapati + curd + veggies\n"
                    "PRE-LONG-RUN — carb dinner\n"
                    f"Supplements — {SUPPL_DAILY}"
                ),
                "directive": (
                    "LAST GYM SESSION before race. Light pull. "
                    "No DOMS allowed going into race week. "
                    "Carb dinner for tomorrow's dress rehearsal run."
                ),
            },
            {
                "date": "2026-08-29", "day": "Sat", "type": "Run",
                "protein": 150, "calories": 2100, "water": "2.5L+",
                "run": {
                    "type": "Long Easy", "km": 8, "pace": "7:45–8:30/km",
                    "cue": (
                        f"{RUN_WARMUP} · "
                        "Cadence: 150 BPM · RPE 5–6 · "
                        "DRESS REHEARSAL — wear race-day shoes, clothes, carry water · "
                        "Practice race-day nutrition (banana + dates pre-run) · "
                        "Walk 1 min at 4 km · "
                        f"{RUN_COOLDOWN}"
                    ),
                },
                "workout": {"plan": NA, "detail": NA},
                "meals": (
                    "— PROTEIN MATH (verified): banana (1g) + dates (1g) + 4 eggs (28g) "
                    "+ 2 chapati (6g) + curd (8g) + 2 chapati (6g) + dal (12g) + paneer (18g) "
                    "+ whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) "
                    "+ veggies (3g) + salad (2g) = ~149g · CALORIES ~2,050–2,150 —\n"
                    "6:20 Pre-run — banana + dates + water (EXACTLY what you'll eat race morning)\n"
                    "~7:30 Post-run — 4 eggs + 2 chapati + curd + electrolyte water\n"
                    "1:00 Lunch — 2 chapati + dal + paneer + salad\n"
                    "4:00 Snack — 1 scoop whey + peanuts (30g)\n"
                    "8:30 Dinner — 3 eggs + dal + veggies\n"
                    f"{SUPPL_DAILY}\n"
                    f"{MONSOON_NOTE}"
                ),
                "directive": (
                    "DRESS REHEARSAL — 8 km at easy pace wearing race-day gear. "
                    "Test everything: shoes, shorts, hydration, pre-run nutrition. "
                    "Nothing new on race day. This run should feel comfortable — that's taper magic."
                ),
            },
            {
                "date": "2026-08-30", "day": "Sun", "type": "Rest",
                "protein": 144, "calories": 1900, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "NEAT walk + recovery",
                    "detail": "Easy 20 min walk · Light stretching · No foam rolling (save it for race week)",
                },
                "meals": (
                    "— PROTEIN MATH (verified): 4 eggs (28g) "
                    "+ 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) + curd (8g) "
                    "+ whey (24g) + roasted chana (8g) + 3 eggs (21g) + hung curd (14g) "
                    "+ veggies (3g) = ~144g · CALORIES ~1,850–1,950 —\n"
                    "8:00 Breakfast — 4 eggs\n"
                    "1:00 Lunch — 2 chapati + dal + paneer + salad + curd\n"
                    "4:30 Snack — 1 scoop whey + roasted chana (30g)\n"
                    "8:30 Dinner — 3 eggs + hung curd + veggies\n"
                    f"Supplements — {SUPPL_DAILY}"
                ),
                "directive": "Rest. RACE WEEK STARTS TOMORROW. Sleep 8 hours tonight.",
            },
        ],
    },

    # ══════════════════════════════════════════════════════════════════════════
    # WEEK 11 — RACE WEEK · Vedanta Zinc City Half Marathon · 6 Sep 2026
    # ══════════════════════════════════════════════════════════════════════════
    11: {
        "label": "Week 11",
        "dates": "1 Sep – 7 Sep 2026",
        "focus": (
            "RACE WEEK — Vedanta Zinc City Half Marathon, 6 Sep 2026, 05:00 AM · "
            "5 km running only (shakeout runs) · No hard efforts · No new foods · "
            "Sleep 8+ hours · Hydrate well all week · "
            "Carb-load Thu/Fri dinner · Race morning: banana + dates + water · "
            "Target: 2:30:00 (7:06/km)"
        ),
        "days": [
            {
                "date": "2026-09-01", "day": "Mon", "type": "Gym",
                "protein": 150, "calories": 2050, "water": "2L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "Light movement only — 15 min",
                    "detail": (
                        "Push-ups 2×10 · Plank 2×30s · "
                        "Glute bridges 2×10 · Light stretching · "
                        "15 min · RPE 3 · NO gym — do at home"
                    ),
                },
                "meals": (
                    "— PROTEIN MATH (verified): 4 eggs (28g) + poha (4g) + whey (24g) "
                    "+ 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) "
                    "+ whey (24g) + walnuts (3g) + 3 eggs (21g) + curd (8g) "
                    "+ veggies (3g) = ~150g · CALORIES ~2,000–2,100 —\n"
                    "8:00 Breakfast — 4 eggs + poha + 1 scoop whey\n"
                    "1:00 Lunch — 2 chapati + dal + paneer + salad\n"
                    "4:30 Snack — 1 scoop whey + 10 walnuts\n"
                    "8:30 Dinner — 3 eggs + curd + veggies\n"
                    f"Supplements — {SUPPL_DAILY}\n"
                    "Monday AM: weigh + waist (final check)"
                ),
                "directive": (
                    "NO GYM this week. Light movement at home only. "
                    "Do NOT try anything new. Normal meals. "
                    "Monday AM: final weigh + waist. 5 DAYS TO RACE."
                ),
            },
            {
                "date": "2026-09-02", "day": "Tue", "type": "Run",
                "protein": 150, "calories": 2050, "water": "2.5L",
                "run": {
                    "type": "Shakeout", "km": 3, "pace": "7:45–8:15/km",
                    "cue": (
                        f"{RUN_WARMUP} · "
                        "Cadence: 150 BPM · RPE 4–5 · "
                        "Include 4×20s strides at the end (accelerate to fast pace, decelerate) · "
                        f"{RUN_COOLDOWN}"
                    ),
                },
                "workout": {"plan": NA, "detail": NA},
                "meals": (
                    "— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + 2 toast (6g) "
                    "+ curd (8g) + 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) "
                    "+ whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) "
                    "+ veggies (3g) = ~148g · CALORIES ~2,000–2,100 —\n"
                    "6:20 Pre-run — 1 banana + 250ml water\n"
                    "~7:15 Post-run — 4 eggs + 2 toast + curd + water\n"
                    "1:00 Lunch — 2 chapati + dal + paneer + salad\n"
                    "4:00 Snack — 1 scoop whey + peanuts (30g)\n"
                    "8:30 Dinner — 3 eggs + dal + veggies\n"
                    f"Supplements — {SUPPL_DAILY}\n"
                    f"{MONSOON_NOTE}"
                ),
                "directive": (
                    "Shakeout run + strides. 3 km easy then 4×20 second strides. "
                    "Strides = accelerate to fast pace for 20 sec, then decelerate. "
                    "Keeps legs sharp without fatigue."
                ),
            },
            {
                "date": "2026-09-03", "day": "Wed", "type": "Rest",
                "protein": 150, "calories": 2000, "water": "2.5L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "Complete rest + walk",
                    "detail": "20 min easy walk · Light stretching only · No exercises",
                },
                "meals": (
                    "— PROTEIN MATH (verified): 4 eggs (28g) + whey (24g) "
                    "+ 2 chapati (6g) + chana (15g) + paneer (18g) + salad (2g) "
                    "+ whey (24g) + walnuts (3g) + 3 eggs (21g) + curd (8g) "
                    "+ veggies (3g) = ~152g · CALORIES ~1,950–2,050 —\n"
                    "8:00 Breakfast — 4 eggs + 1 scoop whey\n"
                    "1:00 Lunch — 2 chapati + chana + paneer + salad\n"
                    "4:30 Snack — 1 scoop whey + 10 walnuts\n"
                    "8:30 Dinner — 3 eggs + curd + veggies\n"
                    f"Supplements — {SUPPL_DAILY}\n"
                    "3 DAYS TO RACE — sleep 8+ hours"
                ),
                "directive": "Complete rest. No running, no gym, no exercises. Walk and stretch only. Sleep 8 hours.",
            },
            {
                "date": "2026-09-04", "day": "Thu", "type": "Run",
                "protein": 150, "calories": 2100, "water": "2.5L",
                "run": {
                    "type": "Shakeout", "km": 2, "pace": "7:45–8:00/km",
                    "cue": (
                        "Light 5 min walk warm-up → "
                        "2 km easy jog · Cadence: 150 BPM · RPE 4 · "
                        "Include 3×15s strides · "
                        "Cool-down walk 5 min"
                    ),
                },
                "workout": {"plan": NA, "detail": NA},
                "meals": (
                    "— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + upma (4g) "
                    "+ curd (8g) + 2 chapati (6g) + dal (12g) + paneer (18g) "
                    "+ whey (24g) + peanuts (7g) + 3 eggs (21g) + rajma (15g) "
                    "+ veggies (3g) + 1 chapati (3g) = ~150g · "
                    "CALORIES ~2,050–2,200 — CARB LOADING starts tonight —\n"
                    "6:30 Pre-run — 1 banana + 250ml water\n"
                    "~7:00 Post-run — 4 eggs + upma + curd + water\n"
                    "1:00 Lunch — 2 chapati + dal + paneer\n"
                    "4:00 Snack — 1 scoop whey + peanuts (30g)\n"
                    "8:30 Dinner — 3 eggs + rajma + 1 chapati + veggies\n"
                    "CARB LOAD — extra chapati at dinner, don't go light\n"
                    f"Supplements — {SUPPL_D3}"
                ),
                "directive": (
                    "Last run before race. 2 km shakeout + 3 strides. "
                    "Legs should feel bouncy and impatient. "
                    "CARB LOADING tonight — extra chapati at dinner. "
                    "Don't try any new food. 2 DAYS TO RACE."
                ),
            },
            {
                "date": "2026-09-05", "day": "Fri", "type": "Rest",
                "protein": 163, "calories": 2200, "water": "3L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "Complete rest — race prep",
                    "detail": "15 min easy walk · Lay out race gear · Charge watch · Set 3 alarms for 4:00 AM",
                },
                "meals": (
                    "— PROTEIN MATH (verified): 4 eggs (28g) + poha (4g) + whey (24g) "
                    "+ 3 chapati (9g) + dal (12g) + paneer (18g) + salad (2g) "
                    "+ whey (24g) + peanuts (7g) + 3 eggs (21g) + curd (8g) "
                    "+ 1 chapati (3g) + veggies (3g) = ~163g · "
                    "CALORIES ~2,200–2,350 — CARB LOADING DAY —\n"
                    "8:00 Breakfast — 4 eggs + poha + 1 scoop whey\n"
                    "1:00 Lunch — 3 chapati + dal + paneer + salad (extra carbs)\n"
                    "4:00 Snack — 1 scoop whey + peanuts (30g)\n"
                    "8:00 Dinner — 3 eggs + 1 chapati + curd + veggies "
                    "(dinner by 8 PM — early, not heavy, carb-rich)\n"
                    f"Supplements — {SUPPL_DAILY}\n"
                    "BED BY 9:30 PM — alarm at 4:00 AM"
                ),
                "directive": (
                    "RACE EVE. Complete rest. "
                    "Lay out: race bib, shoes (Nike Pegasus 40), shorts, t-shirt, watch. "
                    "Dinner by 8 PM — familiar food, extra carbs, not heavy. "
                    "No alcohol, no smoking tonight. "
                    "Set 3 alarms for 4:00 AM. Bed by 9:30 PM. "
                    "Pre-race breakfast ready: banana, dates, water."
                ),
            },
            {
                "date": "2026-09-06", "day": "Sat", "type": "Run",
                "protein": 155, "calories": 2500, "water": "3L+",
                "run": {
                    "type": "RACE — Half Marathon", "km": 21.1, "pace": "7:06/km (target 2:30:00)",
                    "cue": (
                        "4:00 AM — Wake up · "
                        "4:15 AM — 1 banana + 2 dates + 250ml water + 1 black coffee · "
                        "4:45 AM — Reach venue · Use bathroom · Light jog 5 min · "
                        "5:00 AM — RACE START · "
                        "Strategy: START SLOW — first 3 km at 7:30/km, settle into 7:06 by km 5 · "
                        "Walk through EVERY water station — drink, don't skip · "
                        "Planned walk breaks: 1 min at km 7, 14 if needed · "
                        "km 15-21: focus on cadence 155+ and finishing strong · "
                        "If you feel good at km 18, push pace slightly · "
                        "FINISH LINE — you did it"
                    ),
                },
                "workout": {"plan": NA, "detail": NA},
                "meals": (
                    "— RACE DAY NUTRITION —\n"
                    "4:15 Pre-race — 1 banana + 2 dates + 250ml water + 1 black coffee\n"
                    "~7:30 Post-race — Whatever is available at finish line + 500ml water + electrolytes\n"
                    "9:00 Breakfast — 4 eggs + chapati + curd + whey — CELEBRATE\n"
                    "1:00 Lunch — Eat whatever you want — you earned it\n"
                    "8:30 Dinner — Normal meal + extra carbs for recovery\n"
                    "HYDRATE ALL DAY — 3L+ water with electrolytes\n"
                    f"Supplements — {SUPPL_DAILY}"
                ),
                "directive": (
                    "RACE DAY — Vedanta Zinc City Half Marathon. "
                    "You trained for 11 weeks. You ran 14 km. You held 6:50/km tempo. "
                    "START SLOW — resist the crowd adrenaline. First 3 km at 7:30, then settle. "
                    "Walk through every water station. "
                    "You WILL finish. Target: 2:30:00. "
                    "Mission: arrive, run, finish, celebrate."
                ),
            },
            {
                "date": "2026-09-07", "day": "Sun", "type": "Rest",
                "protein": 150, "calories": 2300, "water": "3L",
                "run": {"type": NA, "km": NA, "pace": NA, "cue": NA},
                "workout": {
                    "plan": "Post-race recovery",
                    "detail": "15–20 min very easy walk · Light stretching · Foam roll GENTLY if not too sore · No running",
                },
                "meals": (
                    "— POST-RACE RECOVERY — No deficit today · Eat at maintenance ~2,200–2,400 kcal —\n"
                    "8:00 Breakfast — 4 eggs + poha + 1 scoop whey\n"
                    "1:00 Lunch — Normal meal + extra carbs + paneer\n"
                    "4:30 Snack — 1 scoop whey + whatever you want\n"
                    "8:30 Dinner — Normal dinner — no restrictions today\n"
                    f"Supplements — {SUPPL_DAILY}\n"
                    "NO DEFICIT TODAY — maintenance calories, let your body recover"
                ),
                "directive": (
                    "POST-RACE. Congratulations. You finished a half marathon. "
                    "No running for 3-5 days. Easy walking only. "
                    "Eat at maintenance (~2,200–2,400 kcal) for the next 2 weeks. "
                    "No deficit. Let your body recover. "
                    "Next phase: reassess body comp → lean bulk or maintenance hold."
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
