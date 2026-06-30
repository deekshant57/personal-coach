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
                    "Foam rolling is mandatory. Sleep target: 7+ hours tonight. "
                    "After work (~7:45 PM): 25–30 min brisk walk — non-negotiable NEAT."
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
                    "+ 1 chapati (3g) + veggies (3g) = ~156g ✓ —\n"
                    "6:30 Pre-workout — Water + black coffee\n"
                    "7:45 Post-workout — 4 eggs + 1 chapati + 1 scoop whey (water)\n"
                    "1:00 Lunch — 2 chapati + 1 bowl chana/rajma + 100g paneer\n"
                    "4:30 Snack — 1 scoop whey (water) + 10 walnuts\n"
                    "8:30 Dinner — 3 eggs + 1 chapati + curd + veggies\n"
                    "PRE-LONG-RUN — +1 chapati vs normal rest dinner (~+80 kcal carbs) · "
                    "CALORIES ~2,000–2,100 —\n"
                    "Supplements — Supradyn after post-workout meal · Creatine 5g with lunch"
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
                    "+ veggies (3g) = ~149g ✓ —\n"
                    "8:00 Breakfast — 4 eggs + 1 scoop whey (water or milk)\n"
                    "1:00 Lunch — 2 chapati + dal + 100g paneer + salad\n"
                    "4:30 Snack — 1 scoop whey (water) + 10 walnuts\n"
                    "8:30 Dinner — 3 eggs + curd + veggies\n"
                    "Supplements — Supradyn after breakfast · Creatine 5g with lunch\n"
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
                "protein": 152, "water": "2L",
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
                    "Supplements — Supradyn after post-workout · Creatine 5g with lunch\n"
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
                "protein": 149, "water": "2.5L",
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
                    "Supplements — Supradyn after post-run · Creatine 5g with lunch\n"
                    f"{MONSOON_NOTE}"
                ),
                "directive": (
                    "Morning run — not evening. Alarm 6:20. "
                    "Target 145–155 SPM with metronome — not slow shuffle at 124."
                ),
            },
            {
                "date": "2026-07-01", "day": "Wed", "type": "Active Recovery",
                "protein": 149, "water": "2L",
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
                    "+ whey (24g) + flaxseed (2g) + walnuts (3g) + 3 eggs (21g) "
                    "+ 80g paneer (14g) + veggies (3g) = ~142g · "
                    "Add 1 egg at dinner → 149g · CALORIES ~1,850–1,950 —\n"
                    "8:00 Breakfast — 4 eggs + 1.5 besan chilla with grated paneer\n"
                    "1:00 Lunch — 1.5 chapati + 1 bowl rajma + cucumber raita + salad\n"
                    "4:30 Snack — 1 scoop whey (water) + 1 tbsp flaxseed + 10 walnuts\n"
                    "8:30 Dinner — 3 eggs + 80g paneer + veggies (no rice)\n"
                    "Rest day — fewer carbs than run days, protein stays the same\n"
                    "Supplements — Supradyn after breakfast · Creatine 5g with lunch"
                ),
                "directive": (
                    "You skipped Wed W1 mobility. Not optional — protects knee for long run. "
                    "Do the ankle drills. Ankle lock on Sat run is a form fault this fixes. "
                    "After work (~7:45 PM): 25–30 min brisk walk — non-negotiable NEAT."
                ),
            },
            {
                "date": "2026-07-02", "day": "Thu", "type": "Run",
                "protein": 152, "water": "2.5L",
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
                    "Supplements — Supradyn after post-run · Creatine 5g with lunch\n"
                    f"{MONSOON_NOTE}"
                ),
                "directive": (
                    "Full 4 km this time — you stopped at 3.6 km W1. "
                    "Walk breaks are fine; quitting early is not."
                ),
            },
            {
                "date": "2026-07-03", "day": "Fri", "type": "Bodyweight",
                "protein": 151, "water": "2L",
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
                    "PRE-LONG-RUN — +1 chapati vs normal rest dinner (~+80 kcal carbs) —\n"
                    "Supplements — Supradyn after post-workout · Creatine 5g with lunch"
                ),
                "directive": (
                    "Complete pull-ups and rows this time — you skipped them Fri W1. "
                    "Upper body only. Carb-forward dinner tonight — not a light dinner. "
                    "Sleep by 11 PM before long run."
                ),
            },
            {
                "date": "2026-07-04", "day": "Sat", "type": "Run",
                "protein": 152, "water": "2.5L+",
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
                    "+ whey (24g) + whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) "
                    "+ veggies (3g) = ~152g · CALORIES ~2,100–2,200 (highest carb day) —\n"
                    "6:20 Pre-run — 1 banana + 2 dates + 250ml water\n"
                    "6:40 Warm-up — extra 5 min today\n"
                    "~8:00 Post-run — 4 eggs + 1 plate poha (or upma) + curd + 1 scoop whey "
                    "+ 500ml water with pinch salt + lemon\n"
                    "1:00 Lunch — 2 chapati + dal + 100g paneer (don't skip carbs)\n"
                    "4:00 Snack — 1 scoop whey + handful peanuts (30g)\n"
                    "8:30 Dinner — 3 eggs + dal + veggies\n"
                    "Supplements — Supradyn after post-run · Creatine 5g with lunch\n"
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
                "protein": 147, "water": "2L",
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
                    "Supplements — Supradyn after breakfast · Creatine 5g with lunch"
                ),
                "directive": (
                    "Mandatory 25–30 min brisk walk today — not optional. "
                    "Rest. Close Week 2 clean. "
                    "If long run moved here due to rain, swap with Sat and run today instead."
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
