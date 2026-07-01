-- Sync daily_plans from coach/week-plans.py
-- Run in Supabase SQL Editor
-- User: d6f25dae-4cc8-48dd-9822-fbccf9a92139

UPDATE daily_plans SET day_name = 'Mon', day_type = 'Bodyweight', protein_target = 152, calorie_target = 2000, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Bodyweight — upper + core + light knee activation', workout_detail = 'WARM-UP (5 min): brisk walk or jog in place 2 min → arm circles 20 → hip circles 10/side → bodyweight squats 1×10 (slow) → push-ups 1×5 (slow) · Pull-ups 4×max · Push-ups 3×15 · Rows 3×10 (park bench) · Dead hang 3×20s · Plank 3×40s · Side plank 2×30s · Glute bridges 2×12 (light activation only — not strength) · 25–30 min · RPE 5 · COOL-DOWN (5 min): chest doorway stretch 30s/side → lat stretch 30s/side → shoulder cross-body 30s/side → hip flexor stretch 30s/side → child''s pose 30s', meals_plan = '— PROTEIN MATH: 4 eggs (28g) + 1 chapati (3g) + 1 whey (24g) + 2 chapati (6g) + dal (12g) + 100g paneer (18g) + salad (2g) + 1 whey (24g) + walnuts (3g) + 3 eggs (21g) + curd (8g) + veggies (3g) = ~152g ✓ · CALORIES ~1,950–2,050 —
6:30 Pre-workout — Water + black coffee
7:45 Post-workout — 4 eggs bhurji + 1 chapati + 1 scoop whey (water)
1:00 Lunch — 2 chapati + 1 bowl moong dal + 100g paneer + salad
4:30 Snack — 1 scoop whey (water) + 10 walnuts
8:30 Dinner — 3 eggs omelette + 1 bowl curd + sautéed veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
Avoid — sweets, juice, fried snacks (triglycerides)', directive = 'First day. Upper body only — NO squats/lunges today. Legs must be fresh for tomorrow''s run. Glute bridges are activation, not a strength set.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-06-22';

UPDATE daily_plans SET day_name = 'Tue', day_type = 'Run', protein_target = 148, calorie_target = 2050, water_target = '2.5L', run_type = 'Easy', run_km = 3, run_pace = '8:00–8:30/km', run_cue = 'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → bodyweight squats 1×10 (slow) → calf raises 1×15 → leg swings 10/side → hip circles 10/side → ankle circles → 1 min easy jog to start · Cadence: use 150 BPM metronome · RPE 5–6 · Oxygen Park · COOL-DOWN (8 min): 5 min walk (don''t stop abruptly) → standing wall calf stretch 30s/side → standing quad pull (hand on foot) 30s/side → kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute / IT band stretch 30s/side', workout_plan = NULL, workout_detail = NULL, meals_plan = '— PROTEIN MATH: banana (1g) + 4 eggs (28g) + 2 toast (6g) + curd (8g) + 2 chapati (6g) + dal (12g) + 100g paneer (18g) + salad (2g) + 1 whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) + veggies (3g) = ~148g ✓ · CALORIES ~2,000–2,100 —
6:20 Pre-run — 1 banana + 250ml water
6:40 Warm-up at park (see run cue)
~7:30 Post-run — 4 eggs + 2 whole wheat toast + 1 bowl curd + 500ml water with pinch salt + lemon
1:00 Lunch — 2 chapati + 1 bowl dal + 100g paneer + salad
4:00 Snack — 1 scoop whey (water) + small handful peanuts (30g)
8:30 Dinner — 3 eggs bhurji + 1 bowl dal + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
MONSOON BACKUP: If heavy rain at run time — do 20 min indoor bodyweight cardio (jumping jacks 3×1 min + high knees 3×1 min + mountain climbers 3×30s + burpees 3×8). Reschedule the run to next available dry slot within 48h. Don''t skip — substitute.', directive = 'Easy means easy — slower than your 5 km pace. Warm-up is mandatory, not optional. If knee feels off during warm-up squats, walk today instead. CADENCE: Current 142, target 150+. Use a free metronome app (150 BPM). Focus on shorter, quicker steps — not longer strides. Week 1 goal: just awareness. Don''t force it if form breaks down.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-06-23';

UPDATE daily_plans SET day_name = 'Wed', day_type = 'Active Recovery', protein_target = 148, calorie_target = 1900, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Knee prep + mobility', workout_detail = 'WARM-UP (5 min): 5 min brisk walk · Squats 3×15 (slow, controlled) · Lunges 2×10/leg · Glute bridges 3×15 · Calf raises 3×20 · Foam roll quads + calves + IT band 5 min · 20–25 min · RPE 4–5 · Keep it light — this is prep, not a leg day · COOL-DOWN (5 min): kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute stretch 30s/side → standing wall calf stretch 30s/side', meals_plan = '— PROTEIN MATH: 4 eggs (28g) + 1 whey (24g) + 1.5 chapati (5g) + dal (12g) + 150g curd (12g) + salad (2g) + 1 whey (24g) + walnuts (3g) + 3 eggs (21g) + 80g paneer (14g) + veggies (3g) = ~148g ✓ · CALORIES ~1,850–1,950 —
8:00 Breakfast — 4 eggs + 1 scoop whey (water or milk)
1:00 Lunch — 1.5 chapati + 1 bowl dal + 150g curd + salad
4:30 Snack — 1 scoop whey (water) + 10 walnuts
8:30 Dinner — 3 eggs + 80g paneer + veggies (no rice)
Rest day — fewer carbs than run days, protein stays the same
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
Avoid — refined carbs, sugary drinks, fried food', directive = 'Knee prep day — not a leg strength session. Slow, controlled reps. If any knee discomfort, stop squats/lunges and do glute bridges + calf raises only. Foam rolling is mandatory. Sleep target: 7+ hours tonight. After work (~7:45 PM): 25–30 min brisk walk — non-negotiable NEAT.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-06-24';

UPDATE daily_plans SET day_name = 'Thu', day_type = 'Run', protein_target = 148, calorie_target = 2050, water_target = '2.5L', run_type = 'Easy', run_km = 4, run_pace = '8:00–8:30/km', run_cue = 'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → bodyweight squats 1×10 (slow) → calf raises 1×15 → leg swings 10/side → hip circles 10/side → ankle circles → 1 min easy jog to start · Cadence: 150 BPM metronome · RPE 5–6 · Knee check at 2 km — if pain, walk home · COOL-DOWN (8 min): 5 min walk (don''t stop abruptly) → standing wall calf stretch 30s/side → standing quad pull (hand on foot) 30s/side → kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute / IT band stretch 30s/side', workout_plan = NULL, workout_detail = NULL, meals_plan = '— PROTEIN MATH: banana (1g) + 4 eggs (28g) + 2 chapati (6g) + curd (8g) + 2 chapati (6g) + dal (12g) + 100g paneer (18g) + 1 whey (24g) + flaxseed (2g) + peanuts (7g) + 3 eggs (21g) + dal (12g) + veggies (3g) = ~148g ✓ · CALORIES ~2,000–2,100 —
6:20 Pre-run — 1 banana + 250ml water
6:40 Warm-up at park (see run cue)
~7:40 Post-run — 4 eggs + 2 chapati + 1 bowl curd + 500ml water with pinch salt + lemon
1:00 Lunch — 2 chapati + 1 bowl dal + 100g paneer
4:00 Snack — 1 scoop whey + 1 tbsp flaxseed + handful peanuts (30g)
8:30 Dinner — 3 eggs + 1 bowl dal + salad
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch · Uprise D3 60K with fattiest meal (weekly)
MONSOON BACKUP: If heavy rain at run time — do 20 min indoor bodyweight cardio (jumping jacks 3×1 min + high knees 3×1 min + mountain climbers 3×30s + burpees 3×8). Reschedule the run to next available dry slot within 48h. Don''t skip — substitute.', directive = 'Longest mid-week run. Hold the pace ceiling. Warm-up is non-negotiable — your knees need it. If heavy rain, do monsoon backup and reschedule to Fri AM.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-06-25';

UPDATE daily_plans SET day_name = 'Fri', day_type = 'Bodyweight', protein_target = 156, calorie_target = 2050, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Bodyweight — upper + core', workout_detail = 'WARM-UP (5 min): brisk walk or jog in place 2 min → arm circles 20 → hip circles 10/side → bodyweight squats 1×10 (slow) → push-ups 1×5 (slow) · Pull-ups 4×max · Push-ups 3×max · Rows 3×10 (park bench) · Dead hang 3×20s · Plank 3×40s · Side plank 2×30s · Calf raises 2×15 (light) · 25–30 min · RPE 5–6 · COOL-DOWN (5 min): chest doorway stretch 30s/side → lat stretch 30s/side → shoulder cross-body 30s/side → hip flexor stretch 30s/side → child''s pose 30s', meals_plan = '— PROTEIN MATH: 4 eggs (28g) + 1 chapati (3g) + 1 whey (24g) + 2 chapati (6g) + chana (15g) + 100g paneer (18g) + 1 whey (24g) + walnuts (3g) + 3 eggs (21g) + curd (8g) + 1 chapati (3g) + veggies (3g) = ~156g ✓ · CALORIES ~2,000–2,100 —
6:30 Pre-workout — Water + black coffee
7:45 Post-workout — 4 eggs + 1 chapati + 1 scoop whey (water)
1:00 Lunch — 2 chapati + 1 bowl chana/rajma + 100g paneer
4:30 Snack — 1 scoop whey (water) + 10 walnuts
8:30 Dinner — 3 eggs + 1 chapati + curd + veggies
PRE-LONG-RUN — +1 chapati vs normal rest dinner (~+80 kcal carbs)
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch', directive = 'Upper body only — keep legs fresh for tomorrow''s long run. Calf raises are light, not a strength set. Carb-forward dinner tonight — not a light dinner. Sleep by 11 PM.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-06-26';

UPDATE daily_plans SET day_name = 'Sat', day_type = 'Run', protein_target = 149, calorie_target = 2100, water_target = '2.5L+', run_type = 'Long Easy', run_km = 5, run_pace = '8:00–8:45/km', run_cue = 'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → bodyweight squats 1×10 (slow) → calf raises 1×15 → leg swings 10/side → hip circles 10/side → ankle circles → 1 min easy jog to start · Cadence: 150 BPM metronome · RPE 6 max · Walk 1 min at 2.5 km if needed · COOL-DOWN (8 min): 5 min walk (don''t stop abruptly) → standing wall calf stretch 30s/side → standing quad pull (hand on foot) 30s/side → kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute / IT band stretch 30s/side · Extra: foam roll quads + calves post-shower if available', workout_plan = NULL, workout_detail = NULL, meals_plan = '— PROTEIN MATH: banana (1g) + dates (1g) + 4 eggs (28g) + 2 chapati (6g) + curd (8g) + 2.5 chapati (8g) + dal (12g) + 100g paneer (18g) + 1 whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) + veggies (3g) = ~149g ✓ · CALORIES ~2,050–2,150 —
6:20 Pre-run — 1 banana + 2 dates + 250ml water
6:40 Warm-up at park (see run cue) — take extra time today
~7:50 Post-run — 4 eggs + 2 chapati + curd + 500ml water with pinch salt + lemon
1:00 Lunch — 2–3 chapati + dal + 100g paneer (don''t skip carbs)
4:00 Snack — 1 scoop whey + handful peanuts (30g)
8:30 Dinner — 3 eggs + dal + veggies
Highest carb day of the week · Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
MONSOON BACKUP: If heavy rain at run time — do 20 min indoor bodyweight cardio (jumping jacks 3×1 min + high knees 3×1 min + mountain climbers 3×30s + burpees 3×8). Reschedule the run to next available dry slot within 48h. Don''t skip — substitute.', directive = 'Week''s key run. Consolidate 5 km. Finish feeling you could do 1 more km. Full warm-up, full cool-down, no shortcuts. If monsoon blocks Sat, move to Sun — don''t skip the long run.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-06-27';

UPDATE daily_plans SET day_name = 'Sun', day_type = 'Rest', protein_target = 149, calorie_target = 1850, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'NEAT walk + recovery', workout_detail = 'Mandatory: 25–30 min brisk walk (morning or ~7:45 PM) · Foam roll quads + calves 5 min', meals_plan = '— PROTEIN MATH: 4 eggs (28g) + 1 whey (24g) + 2 chapati (6g) + dal (12g) + 100g paneer (18g) + salad (2g) + 1 whey (24g) + walnuts (3g) + 3 eggs (21g) + curd (8g) + veggies (3g) = ~149g ✓ · CALORIES ~1,800–1,900 —
8:00 Breakfast — 4 eggs + 1 scoop whey (water or milk)
1:00 Lunch — 2 chapati + dal + 100g paneer + salad
4:30 Snack — 1 scoop whey (water) + 10 walnuts
8:30 Dinner — 3 eggs + curd + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
Monday AM — weigh before food, measure waist', directive = 'Mandatory 25–30 min brisk walk today — not optional. Close the week clean. If long run moved here due to rain, this becomes run day and Monday becomes rest. Weigh Monday AM before food.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-06-28';

UPDATE daily_plans SET day_name = 'Mon', day_type = 'Bodyweight', protein_target = 152, calorie_target = 2000, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Bodyweight — upper + core ONLY', workout_detail = 'WARM-UP (5 min): brisk walk or jog in place 2 min → arm circles 20 → hip circles 10/side → bodyweight squats 1×10 (slow) → push-ups 1×5 (slow) · Pull-ups 4×max · Push-ups 3×15 · Rows 3×10 (park bench) · Dead hang 3×20s · Plank 3×40s · Side plank 2×30s · Glute bridges 2×12 (activation only — NOT strength) · NO squats · NO lunges · 25–30 min · RPE 5 · COOL-DOWN (5 min): chest doorway stretch 30s/side → lat stretch 30s/side → shoulder cross-body 30s/side → hip flexor stretch 30s/side → child''s pose 30s', meals_plan = '— PROTEIN MATH (verified): moong chilla 2 w/ paneer (20g) + 3 eggs (21g) + 2 chapati (6g) + chana (15g) + paneer (18g) + salad (2g) + whey (24g) + walnuts (3g) + tofu (12g) + hung curd (14g) + 2 eggs (14g) + veggies (3g) = ~152g · CALORIES ~1,950–2,050 —
6:30 Pre-workout — Water + black coffee
7:45 Post-workout — 2 moong dal chillas with paneer + 3 eggs bhurji
1:00 Lunch — 2 chapati + 1 bowl chana masala + 100g paneer + salad
4:30 Snack — 1 scoop whey (water) + 10 walnuts
8:30 Dinner — 100g tofu bhurji + hung curd + 2 eggs + sautéed veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
Rule — breakfast = chilla (no chapati); chapati at lunch only', directive = 'Week 2 starts here. Upper body ONLY — zero squats/lunges. You did leg work on Mon W1 and paid for it Tue. Not again. Monday AM: weigh + waist before food. Log meals from food grid.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-06-29';

UPDATE daily_plans SET day_name = 'Tue', day_type = 'Run', protein_target = 149, calorie_target = 2050, water_target = '2.5L', run_type = 'Easy', run_km = 3, run_pace = '8:00–8:30/km', run_cue = 'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → bodyweight squats 1×10 (slow) → calf raises 1×15 → leg swings 10/side → hip circles 10/side → ankle circles → 1 min easy jog to start · Cadence: 150 BPM metronome — SHORT steps + fast turnover · Land with soft knee, foot under hip · RPE 5–6 · COOL-DOWN (8 min): 5 min walk (don''t stop abruptly) → standing wall calf stretch 30s/side → standing quad pull (hand on foot) 30s/side → kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute / IT band stretch 30s/side', workout_plan = NULL, workout_detail = NULL, meals_plan = '— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + poha (4g) + curd (8g) + 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) + whey (24g) + roasted chana (8g) + 3 eggs (21g) + palak dal (14g) + veggies (3g) = ~149g · CALORIES ~2,000–2,100 —
6:20 Pre-run — 1 banana + 250ml water (or sattu drink on light-stomach days)
6:40 Warm-up at park
~7:30 Post-run — 4 eggs + 1 plate poha + 1 bowl curd + 500ml water with pinch salt + lemon
1:00 Lunch — 2 chapati + 1 bowl moong dal + 100g paneer + salad
4:00 Snack — 1 scoop whey (water) + roasted chana (30g)
8:30 Dinner — 3 eggs bhurji + 1 bowl palak dal + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
MONSOON BACKUP: If heavy rain at run time — do 20 min indoor bodyweight cardio (jumping jacks 3×1 min + high knees 3×1 min + mountain climbers 3×30s + burpees 3×8). Reschedule the run to next available dry slot within 48h. Don''t skip — substitute.', directive = 'Morning run — not evening. Alarm 6:20. Target 145–155 SPM with metronome — not slow shuffle at 124.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-06-30';

UPDATE daily_plans SET day_name = 'Wed', day_type = 'Active Recovery', protein_target = 149, calorie_target = 1900, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Knee prep + mobility — mandatory', workout_detail = 'WARM-UP (5 min): 5 min brisk walk · Glute bridges 3×15 · Calf raises 3×20 · Clamshells 2×12/side · Ankle dorsiflexion drills: knee-to-wall 2×10/side — fix ankle lock · Foam roll quads + calves + IT band 5 min · 20 min · RPE 4 · COOL-DOWN (5 min): kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute stretch 30s/side → standing wall calf stretch 30s/side', meals_plan = '— PROTEIN MATH (verified): 4 eggs (28g) + besan chilla 1.5 w/ paneer (17g) + 1.5 chapati (5g) + rajma (15g) + curd (8g) + salad (2g) + whey (24g) + flaxseed (2g) + walnuts (3g) + 4 eggs (28g) + 80g paneer (14g) + veggies (3g) = ~149g · CALORIES ~1,850–1,950 —
8:00 Breakfast — 4 eggs + 1.5 besan chilla with grated paneer
1:00 Lunch — 1.5 chapati + 1 bowl rajma + cucumber raita + salad
4:30 Snack — 1 scoop whey (water) + 1 tbsp flaxseed + 10 walnuts
8:30 Dinner — 4 eggs + 80g paneer + veggies (no rice)
Rest day — fewer carbs than run days, protein stays the same
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch', directive = 'You skipped Wed W1 mobility. Not optional — protects knee for long run. Do the ankle drills. Ankle lock on Sat run is a form fault this fixes. After work (~7:45 PM): 25–30 min brisk walk — non-negotiable NEAT.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-07-01';

UPDATE daily_plans SET day_name = 'Thu', day_type = 'Run', protein_target = 152, calorie_target = 2050, water_target = '2.5L', run_type = 'Easy', run_km = 4, run_pace = '8:00–8:30/km', run_cue = 'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → bodyweight squats 1×10 (slow) → calf raises 1×15 → leg swings 10/side → hip circles 10/side → ankle circles → 1 min easy jog to start · Cadence: 150 BPM · Short quick steps · Complete full 4 km — walk 1 min at 2 km if needed · Knee check at 2 km · COOL-DOWN (8 min): 5 min walk (don''t stop abruptly) → standing wall calf stretch 30s/side → standing quad pull (hand on foot) 30s/side → kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute / IT band stretch 30s/side', workout_plan = NULL, workout_detail = NULL, meals_plan = '— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + 2 toast (6g) + curd (8g) + 2 chapati (6g) + dal (12g) + paneer (18g) + whey (24g) + flaxseed (2g) + peanuts (7g) + sprout chaat (10g) + 3 eggs (21g) + 1 egg (7g) + salad (2g) = ~152g · CALORIES ~2,000–2,100 —
6:20 Pre-run — 1 banana + 250ml water
6:40 Warm-up at park
~7:40 Post-run — 4 eggs + 2 whole wheat toast + 1 bowl curd + 500ml water with pinch salt + lemon
1:00 Lunch — 2 chapati + 1 bowl toor dal + 100g paneer
4:00 Snack — 1 scoop whey + 1 tbsp flaxseed + handful peanuts (30g)
8:30 Dinner — 1 bowl sprout chaat + 3 eggs + 1 egg + salad
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch · Uprise D3 60K with fattiest meal (weekly)
MONSOON BACKUP: If heavy rain at run time — do 20 min indoor bodyweight cardio (jumping jacks 3×1 min + high knees 3×1 min + mountain climbers 3×30s + burpees 3×8). Reschedule the run to next available dry slot within 48h. Don''t skip — substitute.', directive = 'Full 4 km this time — you stopped at 3.6 km W1. Walk breaks are fine; quitting early is not.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-07-02';

UPDATE daily_plans SET day_name = 'Fri', day_type = 'Bodyweight', protein_target = 154, calorie_target = 2050, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Bodyweight — upper + core', workout_detail = 'WARM-UP (5 min): brisk walk or jog in place 2 min → arm circles 20 → hip circles 10/side → bodyweight squats 1×10 (slow) → push-ups 1×5 (slow) · Pull-ups 4×max · Push-ups 3×max · Rows 3×10 (park bench) · Dead hang 3×20s · Plank 3×40s · Side plank 2×30s · Calf raises 2×15 (light) · 25–30 min · RPE 5–6 · COOL-DOWN (5 min): chest doorway stretch 30s/side → lat stretch 30s/side → shoulder cross-body 30s/side → hip flexor stretch 30s/side → child''s pose 30s', meals_plan = '— PROTEIN MATH (verified): 4 eggs (28g) + poha (4g) + whey (24g) + 2 chapati (6g) + rajma (15g) + paneer (18g) + whey (24g) + walnuts (3g) + 3 eggs (21g) + curd (8g) + 1 chapati (3g) + veggies (3g) = ~154g · CALORIES ~2,000–2,100 —
6:30 Pre-workout — Water + black coffee
7:45 Post-workout — 4 eggs + 1 plate poha + 1 scoop whey (water)
1:00 Lunch — 2 chapati + 1 bowl rajma + 100g paneer
4:30 Snack — 1 scoop whey (water) + 10 walnuts
8:30 Dinner — 3 eggs + 1 chapati + curd + veggies
PRE-LONG-RUN — +1 chapati vs normal rest dinner (~+80 kcal carbs)
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch', directive = 'Complete pull-ups and rows this time — you skipped them Fri W1. Upper body only. Carb-forward dinner tonight — not a light dinner. Sleep by 11 PM before long run.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-07-03';

UPDATE daily_plans SET day_name = 'Sat', day_type = 'Run', protein_target = 152, calorie_target = 2150, water_target = '2.5L+', run_type = 'Long Easy', run_km = 5.5, run_pace = '8:15–9:00/km', run_cue = 'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → bodyweight squats 1×10 (slow) → calf raises 1×15 → leg swings 10/side → hip circles 10/side → ankle circles → 1 min easy jog to start · Cadence: 150 BPM — NON-NEGOTIABLE · Short steps + fast turnover — not slow shuffle · Walk 1 min at 2.5 km and 4 km if needed · RPE 6 max · COOL-DOWN (8 min): 5 min walk (don''t stop abruptly) → standing wall calf stretch 30s/side → standing quad pull (hand on foot) 30s/side → kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute / IT band stretch 30s/side · Post-run: foam roll quads + calves', workout_plan = NULL, workout_detail = NULL, meals_plan = '— PROTEIN MATH (verified): banana (1g) + dates (1g) + 4 eggs (28g) + poha (4g) + curd (8g) + 2 chapati (6g) + dal (12g) + paneer (18g) + whey (24g) + whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) + veggies (3g) = ~152g · CALORIES ~2,100–2,200 (highest carb day) —
6:20 Pre-run — 1 banana + 2 dates + 250ml water
6:40 Warm-up — extra 5 min today
~8:00 Post-run — 4 eggs + 1 plate poha (or upma) + curd + 1 scoop whey + 500ml water with pinch salt + lemon
1:00 Lunch — 2 chapati + dal + 100g paneer (don''t skip carbs)
4:00 Snack — 1 scoop whey + handful peanuts (30g)
8:30 Dinner — 3 eggs + dal + veggies
Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
MONSOON BACKUP: If heavy rain at run time — do 20 min indoor bodyweight cardio (jumping jacks 3×1 min + high knees 3×1 min + mountain climbers 3×30s + burpees 3×8). Reschedule the run to next available dry slot within 48h. Don''t skip — substitute.', directive = '5.5 km — +10% from 5 km W1. Metronome 150 BPM on. Verify cadence manually once mid-run (count 30 sec × 2). Finish feeling you could do 500m more.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-07-04';

UPDATE daily_plans SET day_name = 'Sun', day_type = 'Rest', protein_target = 147, calorie_target = 1900, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'NEAT walk + recovery', workout_detail = 'Mandatory: 25–30 min brisk walk (morning or ~7:45 PM) · Foam roll quads + calves 5 min', meals_plan = '— PROTEIN MATH (verified): paneer bhurji 80g (14g) + besan chilla 1.5 w/ paneer (17g) + 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) + curd (8g) + whey (24g) + roasted chana (8g) + 3 eggs (21g) + hung curd (14g) + veggies (3g) = ~147g · CALORIES ~1,850–1,950 —
8:00 Breakfast — 80g paneer bhurji + 1.5 besan chilla with paneer
1:00 Lunch — 2 chapati + dal + 100g paneer + salad + curd
4:30 Snack — 1 scoop whey (water) + roasted chana (30g)
8:30 Dinner — 3 eggs + hung curd + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch', directive = 'Mandatory 25–30 min brisk walk today — not optional. Rest. Close Week 2 clean. If long run moved here due to rain, swap with Sat and run today instead.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-07-05';

UPDATE daily_plans SET day_name = 'Mon', day_type = 'Gym', protein_target = 160, calorie_target = 2150, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Gym — Push + Core (reintroduction)', workout_detail = 'WARM-UP (8 min): 5 min treadmill walk at incline → arm circles 20 → band pull-aparts 1×15 → push-ups 1×10 (slow) → 1 warm-up set bench at 50% working weight · Flat bench press 3×10 · Seated DB OHP 3×10 · Incline DB press 3×10 · Cable face pulls 3×12 · Plank 3×45s · Dead bugs 3×10 · 40 min · RPE 6 · Mandatory: start light — find working weights today · COOL-DOWN (5 min): chest doorway stretch 30s/side → lat stretch 30s/side → shoulder cross-body 30s/side → hip flexor stretch 30s/side → child''s pose 30s', meals_plan = '— PROTEIN MATH (verified): 4 eggs (28g) + 1 chapati (3g) + whey (24g) + 2 chapati (6g) + chana (15g) + paneer (18g) + salad (2g) + whey (24g) + walnuts (3g) + 3 eggs (21g) + paneer bhurji 80g (14g) + veggies (3g) = ~161g · CALORIES ~2,100–2,200 —
6:15 Pre-gym — Water + black coffee
8:00 Post-gym — 4 eggs bhurji + 1 chapati + 1 scoop whey (water)
1:00 Lunch — 2 chapati + 1 bowl chana masala + 100g paneer + salad
4:30 Snack — 1 scoop whey (water) + 10 walnuts
8:30 Dinner — 3 eggs + 80g paneer bhurji + sautéed veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
Monday AM: weigh + waist before food', directive = 'FIRST GYM DAY. Start with empty bar or light DBs to find working weights. Ego check — you haven''t lifted in months. Push only — NO squats/deadlifts. Legs must be fresh for Tue run.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-07-06';

UPDATE daily_plans SET day_name = 'Tue', day_type = 'Run', protein_target = 150, calorie_target = 2100, water_target = '2.5L', run_type = 'Easy', run_km = 3, run_pace = '7:45–8:30/km', run_cue = 'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → bodyweight squats 1×10 (slow) → calf raises 1×15 → leg swings 10/side → hip circles 10/side → ankle circles → 1 min easy jog to start · Cadence: 150 BPM · RPE 5–6 · Chest may be sore from yesterday — that''s fine, arms swing naturally · COOL-DOWN (8 min): 5 min walk (don''t stop abruptly) → standing wall calf stretch 30s/side → standing quad pull (hand on foot) 30s/side → kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute / IT band stretch 30s/side', workout_plan = NULL, workout_detail = NULL, meals_plan = '— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + 2 toast (6g) + curd (8g) + 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) + whey (24g) + peanuts (7g) + 3 eggs (21g) + palak dal (14g) + veggies (3g) = ~150g · CALORIES ~2,050–2,150 —
6:20 Pre-run — 1 banana + 250ml water
~7:30 Post-run — 4 eggs + 2 toast + curd + electrolyte water
1:00 Lunch — 2 chapati + dal + 100g paneer + salad
4:00 Snack — 1 scoop whey (water) + peanuts (30g)
8:30 Dinner — 3 eggs bhurji + 1 bowl palak dal + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
MONSOON BACKUP: If heavy rain at run time — do 20 min indoor bodyweight cardio (jumping jacks 3×1 min + high knees 3×1 min + mountain climbers 3×30s + burpees 3×8). Reschedule the run to next available dry slot within 48h. Don''t skip — substitute.', directive = 'Easy 3 km. Don''t push pace — your body is adjusting to gym + running. Upper body DOMS is normal and doesn''t affect running.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-07-07';

UPDATE daily_plans SET day_name = 'Wed', day_type = 'Active Recovery', protein_target = 149, calorie_target = 1900, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Knee prep + mobility — mandatory', workout_detail = 'WARM-UP (5 min): 5 min brisk walk · Glute bridges 3×15 · Calf raises 3×20 · Clamshells 2×12/side · Ankle dorsiflexion drills: knee-to-wall 2×10/side · Foam roll quads + calves + IT band 5 min · 20 min · RPE 4 · COOL-DOWN (5 min): kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute stretch 30s/side → standing wall calf stretch 30s/side', meals_plan = '— PROTEIN MATH (verified): 4 eggs (28g) + whey (24g) + 1.5 chapati (5g) + rajma (15g) + curd (8g) + salad (2g) + whey (24g) + flaxseed (2g) + walnuts (3g) + 3 eggs (21g) + paneer bhurji 80g (14g) + veggies (3g) = ~149g · CALORIES ~1,850–1,950 —
8:00 Breakfast — 4 eggs + 1 scoop whey (water)
1:00 Lunch — 1.5 chapati + 1 bowl rajma + curd + salad
4:30 Snack — 1 scoop whey (water) + 1 tbsp flaxseed + 10 walnuts
8:30 Dinner — 3 eggs + 80g paneer bhurji + veggies (no rice)
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
After work: 25–30 min brisk walk — NEAT', directive = 'Mobility is non-negotiable. Your knees need this with gym + running now. Foam rolling mandatory. Don''t skip the evening walk.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-07-08';

UPDATE daily_plans SET day_name = 'Thu', day_type = 'Run', protein_target = 150, calorie_target = 2100, water_target = '2.5L', run_type = 'Easy', run_km = 4.5, run_pace = '7:45–8:30/km', run_cue = 'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → bodyweight squats 1×10 (slow) → calf raises 1×15 → leg swings 10/side → hip circles 10/side → ankle circles → 1 min easy jog to start · Cadence: 150 BPM · RPE 5–6 · Knee check at 2.5 km · COOL-DOWN (8 min): 5 min walk (don''t stop abruptly) → standing wall calf stretch 30s/side → standing quad pull (hand on foot) 30s/side → kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute / IT band stretch 30s/side', workout_plan = NULL, workout_detail = NULL, meals_plan = '— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + poha (4g) + curd (8g) + 2 chapati (6g) + chana (15g) + paneer (18g) + whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) + veggies (3g) + flaxseed (2g) = ~149g · CALORIES ~2,050–2,150 —
6:20 Pre-run — 1 banana + 250ml water
~7:40 Post-run — 4 eggs + 1 plate poha + curd + electrolyte water
1:00 Lunch — 2 chapati + 1 bowl chana + 100g paneer
4:00 Snack — 1 scoop whey + 1 tbsp flaxseed + peanuts (30g)
8:30 Dinner — 3 eggs + 1 bowl dal + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch · Uprise D3 60K with fattiest meal (weekly)
MONSOON BACKUP: If heavy rain at run time — do 20 min indoor bodyweight cardio (jumping jacks 3×1 min + high knees 3×1 min + mountain climbers 3×30s + burpees 3×8). Reschedule the run to next available dry slot within 48h. Don''t skip — substitute.', directive = '4.5 km — slight bump from 4 km. Hold easy pace. Walk breaks are fine. Complete the distance.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-07-09';

UPDATE daily_plans SET day_name = 'Fri', day_type = 'Gym', protein_target = 160, calorie_target = 2150, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Gym — Pull + Posterior Chain (reintroduction)', workout_detail = 'WARM-UP (8 min): 5 min treadmill walk at incline → arm circles 20 → hip circles 10/side → band pull-aparts 1×15 → dead hang 30s → 1 warm-up set rows at 50% working weight · Pull-ups 4×max · Barbell rows 3×10 · Lat pulldown 3×10 · RDL 3×10 (light — bar only or +10kg) · Cable face pulls 3×12 · Glute bridges 3×15 · Calf raises 3×15 · 40 min · RPE 6 · COOL-DOWN (5 min): chest doorway stretch 30s/side → lat stretch 30s/side → shoulder cross-body 30s/side → hip flexor stretch 30s/side → child''s pose 30s', meals_plan = '— PROTEIN MATH (verified): 4 eggs (28g) + poha (4g) + whey (24g) + 2 chapati (6g) + rajma (15g) + paneer (18g) + salad (2g) + whey (24g) + peanuts (7g) + 3 eggs (21g) + curd (8g) + 1 chapati (3g) + veggies (3g) = ~160g · CALORIES ~2,100–2,200 —
6:15 Pre-gym — Water + black coffee
8:00 Post-gym — 4 eggs + 1 plate poha + 1 scoop whey (water)
1:00 Lunch — 2 chapati + 1 bowl rajma + 100g paneer + salad
4:30 Snack — 1 scoop whey (water) + peanuts (30g)
8:30 Dinner — 3 eggs + 1 chapati + curd + veggies
PRE-LONG-RUN — +1 chapati vs normal rest dinner
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch', directive = 'First pull day at gym. RDL is LIGHT — learn the hip hinge pattern. No ego on barbell rows either. Carb-forward dinner — sleep by 11 PM before long run.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-07-10';

UPDATE daily_plans SET day_name = 'Sat', day_type = 'Run', protein_target = 150, calorie_target = 2100, water_target = '2.5L+', run_type = 'Long Easy', run_km = 6.5, run_pace = '8:00–8:45/km', run_cue = 'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → bodyweight squats 1×10 (slow) → calf raises 1×15 → leg swings 10/side → hip circles 10/side → ankle circles → 1 min easy jog to start · Cadence: 150 BPM · RPE 6 max · Walk 1 min at 3 km if needed · COOL-DOWN (8 min): 5 min walk (don''t stop abruptly) → standing wall calf stretch 30s/side → standing quad pull (hand on foot) 30s/side → kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute / IT band stretch 30s/side · Post-run: foam roll quads + calves', workout_plan = NULL, workout_detail = NULL, meals_plan = '— PROTEIN MATH (verified): banana (1g) + dates (1g) + 4 eggs (28g) + 2 chapati (6g) + curd (8g) + 2 chapati (6g) + dal (12g) + paneer (18g) + whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) + veggies (3g) + salad (2g) = ~149g · CALORIES ~2,050–2,150 (highest carb day) —
6:20 Pre-run — 1 banana + 2 dates + 250ml water
~8:00 Post-run — 4 eggs + 2 chapati + curd + electrolyte water
1:00 Lunch — 2 chapati + dal + 100g paneer + salad
4:00 Snack — 1 scoop whey + peanuts (30g)
8:30 Dinner — 3 eggs + dal + veggies
Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
MONSOON BACKUP: If heavy rain at run time — do 20 min indoor bodyweight cardio (jumping jacks 3×1 min + high knees 3×1 min + mountain climbers 3×30s + burpees 3×8). Reschedule the run to next available dry slot within 48h. Don''t skip — substitute.', directive = '6.5 km — new territory past your 5.5 km. Walk breaks are allowed — walk 1 min, resume running. Finish feeling you could do 500m more. If monsoon blocks Sat, move to Sun.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-07-11';

UPDATE daily_plans SET day_name = 'Sun', day_type = 'Rest', protein_target = 149, calorie_target = 1850, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'NEAT walk + recovery', workout_detail = 'Mandatory: 25–30 min brisk walk (morning or ~7:45 PM) · Foam roll quads + calves + lats 5 min', meals_plan = '— PROTEIN MATH (verified): 4 eggs (28g) + whey (24g) + 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) + whey (24g) + walnuts (3g) + 3 eggs (21g) + curd (8g) + veggies (3g) = ~149g · CALORIES ~1,800–1,900 —
8:00 Breakfast — 4 eggs + 1 scoop whey (water)
1:00 Lunch — 2 chapati + dal + 100g paneer + salad
4:30 Snack — 1 scoop whey (water) + 10 walnuts
8:30 Dinner — 3 eggs + curd + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch', directive = 'Rest day. Mandatory walk. Body is adapting to gym + running combo. Foam roll lats too — they''ll be sore from pull day. Monday AM: weigh + waist.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-07-12';

UPDATE daily_plans SET day_name = 'Mon', day_type = 'Gym', protein_target = 161, calorie_target = 2150, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Gym — Push + Core (progress weights)', workout_detail = 'WARM-UP (8 min): 5 min treadmill walk at incline → arm circles 20 → band pull-aparts 1×15 → push-ups 1×10 (slow) → 1 warm-up set bench at 50% working weight · Flat bench press 3×10 · Seated DB OHP 3×10 · Incline DB press 3×10 · Cable fly 3×12 · Cable face pulls 3×12 · Plank 3×60s · Hanging knee raises 3×8 · 45 min · RPE 6–7 · COOL-DOWN (5 min): chest doorway stretch 30s/side → lat stretch 30s/side → shoulder cross-body 30s/side → hip flexor stretch 30s/side → child''s pose 30s', meals_plan = '— PROTEIN MATH (verified): 4 eggs (28g) + moong chilla 2 w/ paneer (20g) + 2 chapati (6g) + rajma (15g) + paneer (18g) + salad (2g) + whey (24g) + roasted chana (8g) + 3 eggs (21g) + tofu (12g) + hung curd (14g) + veggies (3g) = ~161g · CALORIES ~2,100–2,200 —
6:15 Pre-gym — Water + black coffee
8:00 Post-gym — 4 eggs + 2 moong chillas with paneer
1:00 Lunch — 2 chapati + 1 bowl rajma + 100g paneer + salad
4:30 Snack — 1 scoop whey (water) + roasted chana (30g)
8:30 Dinner — 100g tofu bhurji + hung curd + sautéed veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
Monday AM: weigh + waist before food', directive = 'Progress weights from W3 — add 2.5 kg to bench, 1–2 kg to OHP. If W3 weight was too easy, jump more. If you struggled, repeat. Cable fly added — controlled, squeeze at top.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-07-13';

UPDATE daily_plans SET day_name = 'Tue', day_type = 'Run', protein_target = 150, calorie_target = 2100, water_target = '2.5L', run_type = 'Easy', run_km = 3.5, run_pace = '7:45–8:30/km', run_cue = 'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → bodyweight squats 1×10 (slow) → calf raises 1×15 → leg swings 10/side → hip circles 10/side → ankle circles → 1 min easy jog to start · Cadence: 150 BPM · RPE 5–6 · COOL-DOWN (8 min): 5 min walk (don''t stop abruptly) → standing wall calf stretch 30s/side → standing quad pull (hand on foot) 30s/side → kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute / IT band stretch 30s/side', workout_plan = NULL, workout_detail = NULL, meals_plan = '— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + upma (4g) + curd (8g) + 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) + whey (24g) + peanuts (7g) + 3 eggs (21g) + rajma (15g) + veggies (3g) = ~149g · CALORIES ~2,050–2,150 —
6:20 Pre-run — 1 banana + 250ml water
~7:30 Post-run — 4 eggs + 1 plate upma + curd + electrolyte water
1:00 Lunch — 2 chapati + dal + 100g paneer + salad
4:00 Snack — 1 scoop whey + peanuts (30g)
8:30 Dinner — 3 eggs + 1 bowl rajma + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
MONSOON BACKUP: If heavy rain at run time — do 20 min indoor bodyweight cardio (jumping jacks 3×1 min + high knees 3×1 min + mountain climbers 3×30s + burpees 3×8). Reschedule the run to next available dry slot within 48h. Don''t skip — substitute.', directive = 'Easy 3.5 km. Chest DOMS from yesterday is normal — run through it.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-07-14';

UPDATE daily_plans SET day_name = 'Wed', day_type = 'Active Recovery', protein_target = 149, calorie_target = 1900, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Knee prep + mobility — mandatory', workout_detail = 'WARM-UP (5 min): 5 min brisk walk · Glute bridges 3×15 · Calf raises 3×20 · Clamshells 2×12/side · Ankle dorsiflexion: knee-to-wall 2×10/side · Foam roll quads + calves + IT band + lats 7 min · 20 min · RPE 4 · COOL-DOWN (5 min): kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute stretch 30s/side → standing wall calf stretch 30s/side', meals_plan = '— PROTEIN MATH (verified): 4 eggs (28g) + besan chilla 1.5 w/ paneer (17g) + 1.5 chapati (5g) + chana (15g) + curd (8g) + salad (2g) + whey (24g) + flaxseed (2g) + walnuts (3g) + 3 eggs (21g) + paneer bhurji 80g (14g) + veggies (3g) = ~149g · CALORIES ~1,850–1,950 —
8:00 Breakfast — 4 eggs + 1.5 besan chilla with paneer
1:00 Lunch — 1.5 chapati + chana + curd + salad
4:30 Snack — 1 scoop whey + flaxseed + 10 walnuts
8:30 Dinner — 3 eggs + paneer bhurji + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
After work: 25–30 min brisk walk', directive = 'Mobility day. Add lats to foam rolling since you''re pulling now. Walk after work.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-07-15';

UPDATE daily_plans SET day_name = 'Thu', day_type = 'Run', protein_target = 150, calorie_target = 2100, water_target = '2.5L', run_type = 'Easy', run_km = 5, run_pace = '7:45–8:30/km', run_cue = 'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → bodyweight squats 1×10 (slow) → calf raises 1×15 → leg swings 10/side → hip circles 10/side → ankle circles → 1 min easy jog to start · Cadence: 150 BPM · RPE 5–6 · Knee check at 2.5 km · Walk 1 min at 3 km if needed · COOL-DOWN (8 min): 5 min walk (don''t stop abruptly) → standing wall calf stretch 30s/side → standing quad pull (hand on foot) 30s/side → kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute / IT band stretch 30s/side', workout_plan = NULL, workout_detail = NULL, meals_plan = '— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + 2 toast (6g) + curd (8g) + 2 chapati (6g) + palak dal (14g) + paneer (18g) + whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) + veggies (3g) + salad (2g) = ~150g · CALORIES ~2,050–2,150 —
6:20 Pre-run — 1 banana + 250ml water
~7:50 Post-run — 4 eggs + 2 toast + curd + electrolyte water
1:00 Lunch — 2 chapati + palak dal + 100g paneer + salad
4:00 Snack — 1 scoop whey + peanuts (30g)
8:30 Dinner — 3 eggs + dal + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch · Uprise D3 60K with fattiest meal (weekly)
MONSOON BACKUP: If heavy rain at run time — do 20 min indoor bodyweight cardio (jumping jacks 3×1 min + high knees 3×1 min + mountain climbers 3×30s + burpees 3×8). Reschedule the run to next available dry slot within 48h. Don''t skip — substitute.', directive = '5 km mid-week run — matching your previous best distance. This is easy pace, not a test. Walk breaks allowed.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-07-16';

UPDATE daily_plans SET day_name = 'Fri', day_type = 'Gym', protein_target = 160, calorie_target = 2150, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Gym — Pull + Posterior Chain (add split squat)', workout_detail = 'WARM-UP (8 min): 5 min treadmill walk at incline → arm circles 20 → hip circles 10/side → band pull-aparts 1×15 → dead hang 30s → 1 warm-up set rows at 50% working weight · Pull-ups 4×max · Barbell rows 3×10 · Lat pulldown 3×10 · RDL 3×10 · Bulgarian split squat 2×8/leg · Cable face pulls 3×12 · Calf raises 3×15 · 45 min · RPE 6–7 · COOL-DOWN (5 min): chest doorway stretch 30s/side → lat stretch 30s/side → shoulder cross-body 30s/side → hip flexor stretch 30s/side → child''s pose 30s', meals_plan = '— PROTEIN MATH (verified): 4 eggs (28g) + 1 chapati (3g) + whey (24g) + 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) + whey (24g) + walnuts (3g) + 3 eggs (21g) + palak dal (14g) + 1 chapati (3g) + veggies (3g) = ~161g · CALORIES ~2,100–2,200 —
6:15 Pre-gym — Water + black coffee
8:00 Post-gym — 4 eggs + 1 chapati + 1 scoop whey (water)
1:00 Lunch — 2 chapati + dal + 100g paneer + salad
4:30 Snack — 1 scoop whey + 10 walnuts
8:30 Dinner — 3 eggs + 1 chapati + palak dal + veggies
PRE-LONG-RUN — +1 chapati at dinner
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch', directive = 'Bulgarian split squat NEW — bodyweight only, hold bench for balance. This builds knee stability for long runs. RDL: progress weight by 5 kg from W3. Carb dinner for tomorrow''s long run.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-07-17';

UPDATE daily_plans SET day_name = 'Sat', day_type = 'Run', protein_target = 150, calorie_target = 2100, water_target = '2.5L+', run_type = 'Long Easy', run_km = 7, run_pace = '8:00–8:45/km', run_cue = 'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → bodyweight squats 1×10 (slow) → calf raises 1×15 → leg swings 10/side → hip circles 10/side → ankle circles → 1 min easy jog to start · Cadence: 150 BPM · RPE 6 max · Walk 1 min at 3.5 km · COOL-DOWN (8 min): 5 min walk (don''t stop abruptly) → standing wall calf stretch 30s/side → standing quad pull (hand on foot) 30s/side → kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute / IT band stretch 30s/side · Post-run: foam roll quads + calves + IT band', workout_plan = NULL, workout_detail = NULL, meals_plan = '— PROTEIN MATH (verified): banana (1g) + dates (1g) + 4 eggs (28g) + poha (4g) + curd (8g) + 2 chapati (6g) + chana (15g) + paneer (18g) + whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) + veggies (3g) + salad (2g) = ~150g · CALORIES ~2,050–2,150 —
6:20 Pre-run — 1 banana + 2 dates + 250ml water
~8:10 Post-run — 4 eggs + poha + curd + electrolyte water
1:00 Lunch — 2 chapati + chana + 100g paneer + salad
4:00 Snack — 1 scoop whey + peanuts (30g)
8:30 Dinner — 3 eggs + dal + veggies
Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
MONSOON BACKUP: If heavy rain at run time — do 20 min indoor bodyweight cardio (jumping jacks 3×1 min + high knees 3×1 min + mountain climbers 3×30s + burpees 3×8). Reschedule the run to next available dry slot within 48h. Don''t skip — substitute.', directive = '7 km — you ran 10 km before, so this is familiar territory. But that was months ago — respect the rebuild. Walk break at 3.5 km. Finish strong.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-07-18';

UPDATE daily_plans SET day_name = 'Sun', day_type = 'Rest', protein_target = 149, calorie_target = 1850, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'NEAT walk + recovery', workout_detail = 'Mandatory: 25–30 min brisk walk · Foam roll full body 7 min', meals_plan = '— PROTEIN MATH (verified): paneer bhurji 80g (14g) + besan chilla 1.5 w/ paneer (17g) + 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) + curd (8g) + whey (24g) + roasted chana (8g) + 3 eggs (21g) + hung curd (14g) + veggies (3g) = ~147g · CALORIES ~1,800–1,900 —
8:00 Breakfast — paneer bhurji + besan chilla with paneer
1:00 Lunch — 2 chapati + dal + paneer + salad + curd
4:30 Snack — 1 scoop whey + roasted chana (30g)
8:30 Dinner — 3 eggs + hung curd + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch', directive = 'Rest. Walk. Foam roll. Monday AM: weigh + waist.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-07-19';

UPDATE daily_plans SET day_name = 'Mon', day_type = 'Gym', protein_target = 160, calorie_target = 2150, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Gym — Push + Core (build)', workout_detail = 'WARM-UP (8 min): 5 min treadmill walk at incline → arm circles 20 → band pull-aparts 1×15 → push-ups 1×10 (slow) → 1 warm-up set bench at 50% working weight · Flat bench press 4×8 · Seated DB OHP 3×10 · Incline DB press 3×10 · Dips 3×max · Cable face pulls 3×12 · Plank 3×60s · Hanging knee raises 3×10 · 45 min · RPE 7 · COOL-DOWN (5 min): chest doorway stretch 30s/side → lat stretch 30s/side → shoulder cross-body 30s/side → hip flexor stretch 30s/side → child''s pose 30s', meals_plan = '— PROTEIN MATH (verified): 4 eggs (28g) + 1 chapati (3g) + whey (24g) + 2 chapati (6g) + chana (15g) + paneer (18g) + salad (2g) + whey (24g) + walnuts (3g) + 3 eggs (21g) + paneer bhurji 80g (14g) + veggies (3g) = ~161g · CALORIES ~2,100–2,200 —
6:15 Pre-gym — Water + black coffee
8:00 Post-gym — 4 eggs bhurji + 1 chapati + 1 scoop whey
1:00 Lunch — 2 chapati + chana + 100g paneer + salad
4:30 Snack — 1 scoop whey + 10 walnuts
8:30 Dinner — 3 eggs + paneer bhurji + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
Monday AM: weigh + waist', directive = 'Bench to 4×8 — increase weight if 3×10 was easy. Dips added — use assisted machine if needed. Build phase: RPE 7 is OK now.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-07-20';

UPDATE daily_plans SET day_name = 'Tue', day_type = 'Run', protein_target = 150, calorie_target = 2100, water_target = '2.5L', run_type = 'Easy', run_km = 3.5, run_pace = '7:45–8:30/km', run_cue = 'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → bodyweight squats 1×10 (slow) → calf raises 1×15 → leg swings 10/side → hip circles 10/side → ankle circles → 1 min easy jog to start · Cadence: 150 BPM · RPE 5–6 · COOL-DOWN (8 min): 5 min walk (don''t stop abruptly) → standing wall calf stretch 30s/side → standing quad pull (hand on foot) 30s/side → kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute / IT band stretch 30s/side', workout_plan = NULL, workout_detail = NULL, meals_plan = '— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + 2 toast (6g) + curd (8g) + 2 chapati (6g) + palak dal (14g) + paneer (18g) + salad (2g) + whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) + veggies (3g) = ~150g · CALORIES ~2,050–2,150 —
6:20 Pre-run — 1 banana + 250ml water
~7:30 Post-run — 4 eggs + 2 toast + curd + electrolyte water
1:00 Lunch — 2 chapati + palak dal + paneer + salad
4:00 Snack — 1 scoop whey + peanuts (30g)
8:30 Dinner — 3 eggs + dal + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
MONSOON BACKUP: If heavy rain at run time — do 20 min indoor bodyweight cardio (jumping jacks 3×1 min + high knees 3×1 min + mountain climbers 3×30s + burpees 3×8). Reschedule the run to next available dry slot within 48h. Don''t skip — substitute.', directive = 'Recovery run. Easy 3.5 km. Save legs for Thursday''s first tempo.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-07-21';

UPDATE daily_plans SET day_name = 'Wed', day_type = 'Active Recovery', protein_target = 149, calorie_target = 1900, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Knee prep + mobility', workout_detail = 'WARM-UP (5 min): 5 min brisk walk · Glute bridges 3×15 · Calf raises 3×20 · Clamshells 2×12/side · Ankle dorsiflexion: knee-to-wall 2×10/side · Foam roll full body 7 min · 20 min · RPE 4 · COOL-DOWN (5 min): kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute stretch 30s/side → standing wall calf stretch 30s/side', meals_plan = '— PROTEIN MATH (verified): 4 eggs (28g) + whey (24g) + 1.5 chapati (5g) + dal (12g) + curd (8g) + salad (2g) + whey (24g) + flaxseed (2g) + walnuts (3g) + 3 eggs (21g) + paneer bhurji 80g (14g) + veggies (3g) = ~149g · CALORIES ~1,850–1,950 —
8:00 Breakfast — 4 eggs + 1 scoop whey
1:00 Lunch — 1.5 chapati + dal + curd + salad
4:30 Snack — 1 scoop whey + flaxseed + 10 walnuts
8:30 Dinner — 3 eggs + paneer bhurji + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
After work: 25–30 min brisk walk', directive = 'Mobility before tempo tomorrow. Extra ankle work. Don''t skip.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-07-22';

UPDATE daily_plans SET day_name = 'Thu', day_type = 'Run', protein_target = 150, calorie_target = 2100, water_target = '2.5L', run_type = 'Tempo', run_km = 5, run_pace = '7:00/km tempo · 8:00/km easy', run_cue = 'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → bodyweight squats 1×10 (slow) → calf raises 1×15 → leg swings 10/side → hip circles 10/side → ankle circles → 1 min easy jog to start · 1 km easy warm-up jog (8:00/km) → 2 km TEMPO @ 7:00/km (this is race pace — feel it) → 2 km easy cool-down jog (8:00–8:30/km) · Cadence: 155–160 BPM during tempo · RPE 7 during tempo · COOL-DOWN (8 min): 5 min walk (don''t stop abruptly) → standing wall calf stretch 30s/side → standing quad pull (hand on foot) 30s/side → kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute / IT band stretch 30s/side', workout_plan = NULL, workout_detail = NULL, meals_plan = '— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + poha (4g) + curd (8g) + 2 chapati (6g) + chana (15g) + paneer (18g) + whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) + veggies (3g) + salad (2g) = ~149g · CALORIES ~2,050–2,150 —
6:20 Pre-run — 1 banana + 250ml water
~7:50 Post-run — 4 eggs + poha + curd + electrolyte water
1:00 Lunch — 2 chapati + chana + paneer + salad
4:00 Snack — 1 scoop whey + peanuts (30g)
8:30 Dinner — 3 eggs + dal + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch · Uprise D3 60K with fattiest meal (weekly)
MONSOON BACKUP: If heavy rain at run time — do 20 min indoor bodyweight cardio (jumping jacks 3×1 min + high knees 3×1 min + mountain climbers 3×30s + burpees 3×8). Reschedule the run to next available dry slot within 48h. Don''t skip — substitute.', directive = 'FIRST TEMPO RUN. 2 km at 7:00/km = race pace preview. It should feel ''comfortably hard'' — RPE 7, not 9. If you can''t hold 7:00, do 7:15. The effort matters more than the number.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-07-23';

UPDATE daily_plans SET day_name = 'Fri', day_type = 'Gym', protein_target = 160, calorie_target = 2150, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Gym — Pull + Posterior Chain', workout_detail = 'WARM-UP (8 min): 5 min treadmill walk at incline → arm circles 20 → hip circles 10/side → band pull-aparts 1×15 → dead hang 30s → 1 warm-up set rows at 50% working weight · Pull-ups 4×max · Barbell rows 3×10 · Lat pulldown 3×10 · RDL 3×10 · Bulgarian split squat 2×10/leg · Cable face pulls 3×12 · 45 min · RPE 6–7 · COOL-DOWN (5 min): chest doorway stretch 30s/side → lat stretch 30s/side → shoulder cross-body 30s/side → hip flexor stretch 30s/side → child''s pose 30s', meals_plan = '— PROTEIN MATH (verified): 4 eggs (28g) + upma (4g) + whey (24g) + 2 chapati (6g) + rajma (15g) + paneer (18g) + salad (2g) + whey (24g) + peanuts (7g) + 3 eggs (21g) + curd (8g) + 1 chapati (3g) + veggies (3g) = ~160g · CALORIES ~2,100–2,200 —
6:15 Pre-gym — Water + black coffee
8:00 Post-gym — 4 eggs + upma + 1 scoop whey
1:00 Lunch — 2 chapati + rajma + paneer + salad
4:30 Snack — 1 scoop whey + peanuts (30g)
8:30 Dinner — 3 eggs + 1 chapati + curd + veggies
PRE-LONG-RUN — +1 chapati at dinner
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch', directive = 'Bulgarian split squat to 2×10/leg now. RDL: progress weight. Keep moderate — not heavy. Carb dinner for tomorrow''s 8.5 km.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-07-24';

UPDATE daily_plans SET day_name = 'Sat', day_type = 'Run', protein_target = 150, calorie_target = 2100, water_target = '3L', run_type = 'Long Easy', run_km = 8.5, run_pace = '8:00–8:45/km', run_cue = 'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → bodyweight squats 1×10 (slow) → calf raises 1×15 → leg swings 10/side → hip circles 10/side → ankle circles → 1 min easy jog to start · Cadence: 150 BPM · RPE 6 max · Walk 1 min at 4 km and 6.5 km if needed · Carry water if possible (8.5 km = ~70 min) · COOL-DOWN (8 min): 5 min walk (don''t stop abruptly) → standing wall calf stretch 30s/side → standing quad pull (hand on foot) 30s/side → kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute / IT band stretch 30s/side · Post-run: foam roll + cold water on legs', workout_plan = NULL, workout_detail = NULL, meals_plan = '— PROTEIN MATH (verified): banana (1g) + dates (1g) + 4 eggs (28g) + 2 chapati (6g) + curd (8g) + 3 chapati (9g) + dal (12g) + paneer (18g) + whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) + veggies (3g) = ~150g · CALORIES ~2,100–2,200 —
6:10 Pre-run — 1 banana + 2 dates + 250ml water
~7:30 Warm-up — extra 5 min today
~8:20 Post-run — 4 eggs + 2 chapati + curd + 500ml electrolyte water
1:00 Lunch — 3 chapati + dal + paneer (extra carbs — highest carb day)
4:00 Snack — 1 scoop whey + peanuts (30g)
8:30 Dinner — 3 eggs + dal + veggies
Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
MONSOON BACKUP: If heavy rain at run time — do 20 min indoor bodyweight cardio (jumping jacks 3×1 min + high knees 3×1 min + mountain climbers 3×30s + burpees 3×8). Reschedule the run to next available dry slot within 48h. Don''t skip — substitute.', directive = '8.5 km — NEW DISTANCE RECORD. Past your 5 km comfort zone. Walk breaks are EXPECTED at this distance. No shame. Carry a small water bottle. Finish strong, not fast.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-07-25';

UPDATE daily_plans SET day_name = 'Sun', day_type = 'Rest', protein_target = 149, calorie_target = 1850, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'NEAT walk + recovery', workout_detail = 'Mandatory: 25–30 min brisk walk · Foam roll full body 7 min', meals_plan = '— PROTEIN MATH (verified): 4 eggs (28g) + whey (24g) + 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) + whey (24g) + walnuts (3g) + 3 eggs (21g) + curd (8g) + veggies (3g) = ~149g · CALORIES ~1,800–1,900 —
8:00 Breakfast — 4 eggs + 1 scoop whey
1:00 Lunch — 2 chapati + dal + paneer + salad
4:30 Snack — 1 scoop whey + 10 walnuts
8:30 Dinner — 3 eggs + curd + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch', directive = 'Rest after your longest run ever. Walk. Foam roll. Monday AM: weigh + waist.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-07-26';

UPDATE daily_plans SET day_name = 'Mon', day_type = 'Gym', protein_target = 161, calorie_target = 2150, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Gym — Push + Core', workout_detail = 'WARM-UP (8 min): 5 min treadmill walk at incline → arm circles 20 → band pull-aparts 1×15 → push-ups 1×10 (slow) → 1 warm-up set bench at 50% working weight · Flat bench press 4×8 · Seated DB OHP 3×8 · Incline DB press 3×10 · Dips 3×max · Cable fly 3×12 · Plank 3×60s · Hanging knee raises 3×12 · 45 min · RPE 7 · COOL-DOWN (5 min): chest doorway stretch 30s/side → lat stretch 30s/side → shoulder cross-body 30s/side → hip flexor stretch 30s/side → child''s pose 30s', meals_plan = '— PROTEIN MATH (verified): 4 eggs (28g) + poha (4g) + whey (24g) + 2 chapati (6g) + rajma (15g) + paneer (18g) + salad (2g) + whey (24g) + peanuts (7g) + 3 eggs (21g) + palak dal (14g) + veggies (3g) = ~162g · CALORIES ~2,100–2,200 —
6:15 Pre-gym — Water + black coffee
8:00 Post-gym — 4 eggs + poha + 1 scoop whey
1:00 Lunch — 2 chapati + rajma + paneer + salad
4:30 Snack — 1 scoop whey + peanuts (30g)
8:30 Dinner — 3 eggs + palak dal + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
Monday AM: weigh + waist', directive = 'OHP to 3×8 — increase weight. Cable fly for chest volume. Push hard — deload next week.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-07-27';

UPDATE daily_plans SET day_name = 'Tue', day_type = 'Run', protein_target = 150, calorie_target = 2100, water_target = '2.5L', run_type = 'Easy', run_km = 4, run_pace = '7:45–8:30/km', run_cue = 'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → bodyweight squats 1×10 (slow) → calf raises 1×15 → leg swings 10/side → hip circles 10/side → ankle circles → 1 min easy jog to start · Cadence: 150 BPM · RPE 5–6 · COOL-DOWN (8 min): 5 min walk (don''t stop abruptly) → standing wall calf stretch 30s/side → standing quad pull (hand on foot) 30s/side → kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute / IT band stretch 30s/side', workout_plan = NULL, workout_detail = NULL, meals_plan = '— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + 2 toast (6g) + curd (8g) + 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) + whey (24g) + roasted chana (8g) + 3 eggs (21g) + rajma (15g) + veggies (3g) = ~152g · CALORIES ~2,050–2,150 —
6:20 Pre-run — 1 banana + 250ml water
~7:40 Post-run — 4 eggs + 2 toast + curd + electrolyte water
1:00 Lunch — 2 chapati + dal + paneer + salad
4:00 Snack — 1 scoop whey + roasted chana (30g)
8:30 Dinner — 3 eggs + rajma + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
MONSOON BACKUP: If heavy rain at run time — do 20 min indoor bodyweight cardio (jumping jacks 3×1 min + high knees 3×1 min + mountain climbers 3×30s + burpees 3×8). Reschedule the run to next available dry slot within 48h. Don''t skip — substitute.', directive = 'Easy 4 km. Save energy for Thursday tempo and Saturday''s 10 km.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-07-28';

UPDATE daily_plans SET day_name = 'Wed', day_type = 'Active Recovery', protein_target = 149, calorie_target = 1900, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Knee prep + mobility', workout_detail = 'WARM-UP (5 min): 5 min brisk walk · Glute bridges 3×15 · Calf raises 3×20 · Clamshells 2×12/side · Ankle dorsiflexion 2×10/side · Foam roll full body 7 min · 20 min · RPE 4 · COOL-DOWN (5 min): kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute stretch 30s/side → standing wall calf stretch 30s/side', meals_plan = '— PROTEIN MATH (verified): 4 eggs (28g) + besan chilla 1.5 w/ paneer (17g) + 1.5 chapati (5g) + chana (15g) + curd (8g) + salad (2g) + whey (24g) + flaxseed (2g) + walnuts (3g) + 3 eggs (21g) + paneer bhurji 80g (14g) + veggies (3g) = ~149g · CALORIES ~1,850–1,950 —
8:00 Breakfast — 4 eggs + besan chilla with paneer
1:00 Lunch — 1.5 chapati + chana + curd + salad
4:30 Snack — 1 scoop whey + flaxseed + 10 walnuts
8:30 Dinner — 3 eggs + paneer bhurji + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
After work: 25–30 min brisk walk', directive = 'Mobility before tempo. Extra knee attention — 10 km this Saturday.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-07-29';

UPDATE daily_plans SET day_name = 'Thu', day_type = 'Run', protein_target = 150, calorie_target = 2100, water_target = '2.5L', run_type = 'Tempo', run_km = 5, run_pace = '7:00/km tempo · 8:00/km easy', run_cue = 'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → bodyweight squats 1×10 (slow) → calf raises 1×15 → leg swings 10/side → hip circles 10/side → ankle circles → 1 min easy jog to start · 1 km easy warm-up jog → 3 km TEMPO @ 7:00/km → 1 km easy cool-down jog · Cadence: 155–160 BPM during tempo · RPE 7 · COOL-DOWN (8 min): 5 min walk (don''t stop abruptly) → standing wall calf stretch 30s/side → standing quad pull (hand on foot) 30s/side → kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute / IT band stretch 30s/side', workout_plan = NULL, workout_detail = NULL, meals_plan = '— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + upma (4g) + curd (8g) + 2 chapati (6g) + palak dal (14g) + paneer (18g) + whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) + veggies (3g) + salad (2g) = ~148g · CALORIES ~2,050–2,150 —
6:20 Pre-run — 1 banana + 250ml water
~7:50 Post-run — 4 eggs + upma + curd + electrolyte water
1:00 Lunch — 2 chapati + palak dal + paneer + salad
4:00 Snack — 1 scoop whey + peanuts (30g)
8:30 Dinner — 3 eggs + dal + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch · Uprise D3 60K with fattiest meal (weekly)
MONSOON BACKUP: If heavy rain at run time — do 20 min indoor bodyweight cardio (jumping jacks 3×1 min + high knees 3×1 min + mountain climbers 3×30s + burpees 3×8). Reschedule the run to next available dry slot within 48h. Don''t skip — substitute.', directive = '3 km tempo — 1 km more than last week. Hold 7:00/km. If it''s too hard, 7:10 is fine. The tempo block should feel like ''strong but sustainable''.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-07-30';

UPDATE daily_plans SET day_name = 'Fri', day_type = 'Gym', protein_target = 160, calorie_target = 2150, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Gym — Pull + Posterior Chain', workout_detail = 'WARM-UP (8 min): 5 min treadmill walk at incline → arm circles 20 → hip circles 10/side → band pull-aparts 1×15 → dead hang 30s → 1 warm-up set rows at 50% working weight · Pull-ups 4×max · Barbell rows 4×8 · Lat pulldown 3×10 · RDL 3×10 · Bulgarian split squat 2×10/leg · Cable face pulls 3×12 · Calf raises 3×15 · 45 min · RPE 7 · COOL-DOWN (5 min): chest doorway stretch 30s/side → lat stretch 30s/side → shoulder cross-body 30s/side → hip flexor stretch 30s/side → child''s pose 30s', meals_plan = '— PROTEIN MATH (verified): 4 eggs (28g) + 1 chapati (3g) + whey (24g) + 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) + whey (24g) + walnuts (3g) + 3 eggs (21g) + curd (8g) + 1 chapati (3g) + veggies (3g) + flaxseed (2g) = ~160g · CALORIES ~2,100–2,200 —
6:15 Pre-gym — Water + black coffee
8:00 Post-gym — 4 eggs + 1 chapati + 1 scoop whey
1:00 Lunch — 2 chapati + dal + paneer + salad
4:30 Snack — 1 scoop whey + 10 walnuts + flaxseed
8:30 Dinner — 3 eggs + 1 chapati + curd + veggies
PRE-LONG-RUN — +1 chapati at dinner · Extra carbs tonight
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch', directive = 'Rows to 4×8 — progress weight. Last hard gym session before deload next week. Carb-load dinner — 10 km tomorrow. Sleep by 11 PM.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-07-31';

UPDATE daily_plans SET day_name = 'Sat', day_type = 'Run', protein_target = 152, calorie_target = 2150, water_target = '3L+', run_type = 'Long Easy', run_km = 10, run_pace = '8:00–8:45/km', run_cue = 'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → bodyweight squats 1×10 (slow) → calf raises 1×15 → leg swings 10/side → hip circles 10/side → ankle circles → 1 min easy jog to start · Cadence: 150 BPM · RPE 6–7 max · Walk 1 min at 5 km and 7.5 km · CARRY WATER — 10 km = ~85 min · If knee pain at any point, walk 2 min. If it persists, stop at pain-free distance · COOL-DOWN (8 min): 5 min walk (don''t stop abruptly) → standing wall calf stretch 30s/side → standing quad pull (hand on foot) 30s/side → kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute / IT band stretch 30s/side · Post-run: foam roll + cold water on legs', workout_plan = NULL, workout_detail = NULL, meals_plan = '— PROTEIN MATH (verified): banana (1g) + dates (1g) + 4 eggs (28g) + 2 chapati (6g) + curd (8g) + whey (24g) + 3 chapati (9g) + chana (15g) + paneer (18g) + whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) + veggies (3g) = ~152g · CALORIES ~2,200–2,300 (highest carb day — earned it) —
6:00 Pre-run — 1 banana + 2 dates + 250ml water
~7:40 Warm-up — full 10 min today
~8:40 Post-run — 4 eggs + 2 chapati + curd + 1 scoop whey + 500ml electrolyte water
1:00 Lunch — 3 chapati + chana + paneer (extra carbs)
4:00 Snack — 1 scoop whey + peanuts (30g)
8:30 Dinner — 3 eggs + dal + veggies
Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
MONSOON BACKUP: If heavy rain at run time — do 20 min indoor bodyweight cardio (jumping jacks 3×1 min + high knees 3×1 min + mountain climbers 3×30s + burpees 3×8). Reschedule the run to next available dry slot within 48h. Don''t skip — substitute.', directive = '10 KM MILESTONE. You ran this distance before — your body knows how. Walk breaks every 2.5 km are PLANNED, not failure. Carry water. Start slower than you think. If monsoon blocks Saturday, move to Sunday — this run matters.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-08-01';

UPDATE daily_plans SET day_name = 'Sun', day_type = 'Rest', protein_target = 149, calorie_target = 1850, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'NEAT walk + recovery', workout_detail = 'Mandatory: 25–30 min brisk walk · Foam roll full body 10 min · Light stretching', meals_plan = '— PROTEIN MATH (verified): 4 eggs (28g) + whey (24g) + 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) + curd (8g) + whey (24g) + roasted chana (8g) + 3 eggs (21g) + hung curd (14g) + veggies (3g) = ~152g · CALORIES ~1,800–1,900 —
8:00 Breakfast — 4 eggs + 1 scoop whey
1:00 Lunch — 2 chapati + dal + paneer + salad + curd
4:30 Snack — 1 scoop whey + roasted chana (30g)
8:30 Dinner — 3 eggs + hung curd + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch', directive = 'Recovery after 10 km. Walk. Foam roll. Eat well. DELOAD WEEK STARTS TOMORROW.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-08-02';

UPDATE daily_plans SET day_name = 'Mon', day_type = 'Gym', protein_target = 155, calorie_target = 2050, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Gym — Push DELOAD', workout_detail = 'WARM-UP (8 min): 5 min treadmill walk at incline → arm circles 20 → band pull-aparts 1×15 → push-ups 1×10 (slow) → 1 warm-up set bench at 50% working weight · Flat bench press 2×10 (reduce weight 20%) · Seated DB OHP 2×10 (light) · Push-ups 2×15 · Plank 2×45s · 25 min · RPE 5 · COOL-DOWN (5 min): chest doorway stretch 30s/side → lat stretch 30s/side → shoulder cross-body 30s/side → hip flexor stretch 30s/side → child''s pose 30s', meals_plan = '— PROTEIN MATH (verified): 4 eggs (28g) + 1 chapati (3g) + whey (24g) + 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) + whey (24g) + walnuts (3g) + 3 eggs (21g) + curd (8g) + veggies (3g) + flaxseed (2g) = ~154g · CALORIES ~2,000–2,100 —
6:30 Pre-gym — Water + black coffee
8:00 Post-gym — 4 eggs + 1 chapati + 1 scoop whey
1:00 Lunch — 2 chapati + dal + paneer + salad
4:30 Snack — 1 scoop whey + 10 walnuts + flaxseed
8:30 Dinner — 3 eggs + curd + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
Monday AM: weigh + waist', directive = 'DELOAD — not lazy, strategic. Reduce weight 20%, cut sets. You should leave gym feeling ''I could do more''. That''s the point. Sleep 7.5+ hours this week.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-08-03';

UPDATE daily_plans SET day_name = 'Tue', day_type = 'Run', protein_target = 150, calorie_target = 2050, water_target = '2.5L', run_type = 'Easy', run_km = 3, run_pace = '8:00–8:30/km', run_cue = 'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → bodyweight squats 1×10 (slow) → calf raises 1×15 → leg swings 10/side → hip circles 10/side → ankle circles → 1 min easy jog to start · Cadence: 150 BPM · RPE 5 max · COOL-DOWN (8 min): 5 min walk (don''t stop abruptly) → standing wall calf stretch 30s/side → standing quad pull (hand on foot) 30s/side → kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute / IT band stretch 30s/side', workout_plan = NULL, workout_detail = NULL, meals_plan = '— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + poha (4g) + curd (8g) + 2 chapati (6g) + chana (15g) + paneer (18g) + salad (2g) + whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) + veggies (3g) = ~149g · CALORIES ~2,000–2,100 —
6:20 Pre-run — 1 banana + 250ml water
~7:20 Post-run — 4 eggs + poha + curd + electrolyte water
1:00 Lunch — 2 chapati + chana + paneer + salad
4:00 Snack — 1 scoop whey + peanuts (30g)
8:30 Dinner — 3 eggs + dal + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
MONSOON BACKUP: If heavy rain at run time — do 20 min indoor bodyweight cardio (jumping jacks 3×1 min + high knees 3×1 min + mountain climbers 3×30s + burpees 3×8). Reschedule the run to next available dry slot within 48h. Don''t skip — substitute.', directive = 'Easy 3 km. Deload run — keep it light. RPE 5 max.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-08-04';

UPDATE daily_plans SET day_name = 'Wed', day_type = 'Active Recovery', protein_target = 149, calorie_target = 1900, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Extended mobility + foam rolling', workout_detail = 'WARM-UP (5 min): 5 min brisk walk · Glute bridges 2×15 · Calf raises 2×20 · Clamshells 2×10/side · Ankle dorsiflexion 2×10/side · EXTENDED foam roll: quads, calves, IT band, lats, upper back 10 min · 20 min · RPE 3 · COOL-DOWN (5 min): kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute stretch 30s/side → standing wall calf stretch 30s/side', meals_plan = '— PROTEIN MATH (verified): 4 eggs (28g) + whey (24g) + 1.5 chapati (5g) + rajma (15g) + curd (8g) + salad (2g) + whey (24g) + flaxseed (2g) + walnuts (3g) + 3 eggs (21g) + paneer bhurji 80g (14g) + veggies (3g) = ~149g · CALORIES ~1,850–1,950 —
8:00 Breakfast — 4 eggs + 1 scoop whey
1:00 Lunch — 1.5 chapati + rajma + curd + salad
4:30 Snack — 1 scoop whey + flaxseed + 10 walnuts
8:30 Dinner — 3 eggs + paneer bhurji + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
After work: 25–30 min brisk walk', directive = 'Extended foam rolling today — 10 min minimum. Body absorbs training during deload.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-08-05';

UPDATE daily_plans SET day_name = 'Thu', day_type = 'Run', protein_target = 150, calorie_target = 2050, water_target = '2.5L', run_type = 'Easy', run_km = 3, run_pace = '8:00–8:30/km', run_cue = 'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → bodyweight squats 1×10 (slow) → calf raises 1×15 → leg swings 10/side → hip circles 10/side → ankle circles → 1 min easy jog to start · Cadence: 150 BPM · RPE 5 max · COOL-DOWN (8 min): 5 min walk (don''t stop abruptly) → standing wall calf stretch 30s/side → standing quad pull (hand on foot) 30s/side → kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute / IT band stretch 30s/side', workout_plan = NULL, workout_detail = NULL, meals_plan = '— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + 2 toast (6g) + curd (8g) + 2 chapati (6g) + palak dal (14g) + paneer (18g) + whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) + veggies (3g) + salad (2g) = ~150g · CALORIES ~2,000–2,100 —
6:20 Pre-run — 1 banana + 250ml water
~7:20 Post-run — 4 eggs + 2 toast + curd + electrolyte water
1:00 Lunch — 2 chapati + palak dal + paneer + salad
4:00 Snack — 1 scoop whey + peanuts (30g)
8:30 Dinner — 3 eggs + dal + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch · Uprise D3 60K with fattiest meal (weekly)
MONSOON BACKUP: If heavy rain at run time — do 20 min indoor bodyweight cardio (jumping jacks 3×1 min + high knees 3×1 min + mountain climbers 3×30s + burpees 3×8). Reschedule the run to next available dry slot within 48h. Don''t skip — substitute.', directive = 'Easy 3 km. No tempo this week — recovery only.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-08-06';

UPDATE daily_plans SET day_name = 'Fri', day_type = 'Gym', protein_target = 155, calorie_target = 2050, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Gym — Pull DELOAD', workout_detail = 'WARM-UP (8 min): 5 min treadmill walk at incline → arm circles 20 → hip circles 10/side → band pull-aparts 1×15 → dead hang 30s → 1 warm-up set rows at 50% working weight · Pull-ups 3×max · Barbell rows 2×10 (light) · Lat pulldown 2×10 · RDL 2×10 (light) · Glute bridges 2×15 · 25 min · RPE 5 · COOL-DOWN (5 min): chest doorway stretch 30s/side → lat stretch 30s/side → shoulder cross-body 30s/side → hip flexor stretch 30s/side → child''s pose 30s', meals_plan = '— PROTEIN MATH (verified): 4 eggs (28g) + upma (4g) + whey (24g) + 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) + whey (24g) + roasted chana (8g) + 3 eggs (21g) + curd (8g) + veggies (3g) = ~155g · CALORIES ~2,000–2,100 —
6:30 Pre-gym — Water + black coffee
8:00 Post-gym — 4 eggs + upma + 1 scoop whey
1:00 Lunch — 2 chapati + dal + paneer + salad
4:30 Snack — 1 scoop whey + roasted chana (30g)
8:30 Dinner — 3 eggs + curd + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch', directive = 'Deload pull. Light everything. Carb dinner for tomorrow''s long run.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-08-07';

UPDATE daily_plans SET day_name = 'Sat', day_type = 'Run', protein_target = 150, calorie_target = 2100, water_target = '2.5L+', run_type = 'Long Easy', run_km = 7, run_pace = '8:00–8:45/km', run_cue = 'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → bodyweight squats 1×10 (slow) → calf raises 1×15 → leg swings 10/side → hip circles 10/side → ankle circles → 1 min easy jog to start · Cadence: 150 BPM · RPE 5–6 · Walk 1 min at 3.5 km if needed · COOL-DOWN (8 min): 5 min walk (don''t stop abruptly) → standing wall calf stretch 30s/side → standing quad pull (hand on foot) 30s/side → kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute / IT band stretch 30s/side · Post-run foam roll', workout_plan = NULL, workout_detail = NULL, meals_plan = '— PROTEIN MATH (verified): banana (1g) + dates (1g) + 4 eggs (28g) + 2 chapati (6g) + curd (8g) + 2 chapati (6g) + dal (12g) + paneer (18g) + whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) + veggies (3g) + salad (2g) = ~149g · CALORIES ~2,050–2,150 —
6:20 Pre-run — banana + dates + water
~8:00 Post-run — 4 eggs + 2 chapati + curd + electrolyte water
1:00 Lunch — 2 chapati + dal + paneer + salad
4:00 Snack — 1 scoop whey + peanuts (30g)
8:30 Dinner — 3 eggs + dal + veggies
Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
MONSOON BACKUP: If heavy rain at run time — do 20 min indoor bodyweight cardio (jumping jacks 3×1 min + high knees 3×1 min + mountain climbers 3×30s + burpees 3×8). Reschedule the run to next available dry slot within 48h. Don''t skip — substitute.', directive = '7 km deload long run — shorter than last week''s 10 km. This should feel EASY. If it doesn''t, your body needed this deload.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-08-08';

UPDATE daily_plans SET day_name = 'Sun', day_type = 'Rest', protein_target = 149, calorie_target = 1850, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'NEAT walk + recovery', workout_detail = 'Mandatory: 25–30 min brisk walk · Foam roll 7 min', meals_plan = '— PROTEIN MATH (verified): paneer bhurji 80g (14g) + moong chilla 2 w/ paneer (20g) + 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) + curd (8g) + whey (24g) + walnuts (3g) + 3 eggs (21g) + hung curd (14g) + veggies (3g) = ~145g · CALORIES ~1,800–1,900 —
8:00 Breakfast — paneer bhurji + moong chilla with paneer
1:00 Lunch — 2 chapati + dal + paneer + salad + curd
4:30 Snack — 1 scoop whey + 10 walnuts
8:30 Dinner — 3 eggs + hung curd + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch', directive = 'End of deload. You should feel rested and hungry to train. PEAK PHASE STARTS MONDAY.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-08-09';

UPDATE daily_plans SET day_name = 'Mon', day_type = 'Gym', protein_target = 161, calorie_target = 2150, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Gym — Push + Core (peak)', workout_detail = 'WARM-UP (8 min): 5 min treadmill walk at incline → arm circles 20 → band pull-aparts 1×15 → push-ups 1×10 (slow) → 1 warm-up set bench at 50% working weight · Flat bench press 4×8 · Seated DB OHP 3×8 · Incline DB press 3×8 · Dips 3×max · Cable fly 3×12 · Plank 3×60s · Hanging knee raises 3×12 · 45 min · RPE 7–8 · COOL-DOWN (5 min): chest doorway stretch 30s/side → lat stretch 30s/side → shoulder cross-body 30s/side → hip flexor stretch 30s/side → child''s pose 30s', meals_plan = '— PROTEIN MATH (verified): 4 eggs (28g) + moong chilla 2 w/ paneer (20g) + 2 chapati (6g) + chana (15g) + paneer (18g) + salad (2g) + whey (24g) + peanuts (7g) + 3 eggs (21g) + palak dal (14g) + veggies (3g) + flaxseed (2g) = ~160g · CALORIES ~2,100–2,200 —
6:15 Pre-gym — Water + black coffee
8:00 Post-gym — 4 eggs + moong chilla with paneer
1:00 Lunch — 2 chapati + chana + paneer + salad
4:30 Snack — 1 scoop whey + peanuts (30g) + flaxseed
8:30 Dinner — 3 eggs + palak dal + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
Monday AM: weigh + waist', directive = 'Post-deload — you should feel strong. Push weights back to W6 levels or higher.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-08-10';

UPDATE daily_plans SET day_name = 'Tue', day_type = 'Run', protein_target = 150, calorie_target = 2100, water_target = '2.5L', run_type = 'Easy', run_km = 4, run_pace = '7:45–8:30/km', run_cue = 'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → bodyweight squats 1×10 (slow) → calf raises 1×15 → leg swings 10/side → hip circles 10/side → ankle circles → 1 min easy jog to start · Cadence: 150 BPM · RPE 5–6 · COOL-DOWN (8 min): 5 min walk (don''t stop abruptly) → standing wall calf stretch 30s/side → standing quad pull (hand on foot) 30s/side → kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute / IT band stretch 30s/side', workout_plan = NULL, workout_detail = NULL, meals_plan = '— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + 2 toast (6g) + curd (8g) + 2 chapati (6g) + rajma (15g) + paneer (18g) + salad (2g) + whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) + veggies (3g) = ~151g · CALORIES ~2,050–2,150 —
6:20 Pre-run — 1 banana + 250ml water
~7:40 Post-run — 4 eggs + 2 toast + curd + electrolyte water
1:00 Lunch — 2 chapati + rajma + paneer + salad
4:00 Snack — 1 scoop whey + peanuts (30g)
8:30 Dinner — 3 eggs + dal + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
MONSOON BACKUP: If heavy rain at run time — do 20 min indoor bodyweight cardio (jumping jacks 3×1 min + high knees 3×1 min + mountain climbers 3×30s + burpees 3×8). Reschedule the run to next available dry slot within 48h. Don''t skip — substitute.', directive = 'Easy 4 km. Save legs for Thursday''s 4 km tempo.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-08-11';

UPDATE daily_plans SET day_name = 'Wed', day_type = 'Active Recovery', protein_target = 149, calorie_target = 1900, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Knee prep + mobility', workout_detail = 'WARM-UP (5 min): 5 min brisk walk · Glute bridges 3×15 · Calf raises 3×20 · Clamshells 2×12/side · Ankle dorsiflexion 2×10/side · Foam roll full body 7 min · 20 min · RPE 4 · COOL-DOWN (5 min): kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute stretch 30s/side → standing wall calf stretch 30s/side', meals_plan = '— PROTEIN MATH (verified): 4 eggs (28g) + besan chilla 1.5 w/ paneer (17g) + 1.5 chapati (5g) + dal (12g) + curd (8g) + salad (2g) + whey (24g) + flaxseed (2g) + walnuts (3g) + 3 eggs (21g) + paneer bhurji 80g (14g) + veggies (3g) = ~146g · CALORIES ~1,850–1,950 —
8:00 Breakfast — 4 eggs + besan chilla with paneer
1:00 Lunch — 1.5 chapati + dal + curd + salad
4:30 Snack — 1 scoop whey + flaxseed + 10 walnuts
8:30 Dinner — 3 eggs + paneer bhurji + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
After work: 25–30 min brisk walk', directive = 'Mobility before longest tempo session. Don''t skip ankle work.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-08-12';

UPDATE daily_plans SET day_name = 'Thu', day_type = 'Run', protein_target = 150, calorie_target = 2100, water_target = '2.5L', run_type = 'Tempo', run_km = 5, run_pace = '7:00/km tempo · 8:00/km easy', run_cue = 'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → bodyweight squats 1×10 (slow) → calf raises 1×15 → leg swings 10/side → hip circles 10/side → ankle circles → 1 min easy jog to start · 0.5 km easy warm-up jog → 4 km TEMPO @ 7:00/km → 0.5 km easy cool-down jog · Cadence: 158–162 BPM during tempo · RPE 7–8 · COOL-DOWN (8 min): 5 min walk (don''t stop abruptly) → standing wall calf stretch 30s/side → standing quad pull (hand on foot) 30s/side → kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute / IT band stretch 30s/side', workout_plan = NULL, workout_detail = NULL, meals_plan = '— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + upma (4g) + curd (8g) + 2 chapati (6g) + chana (15g) + paneer (18g) + whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) + veggies (3g) + salad (2g) = ~149g · CALORIES ~2,050–2,150 —
6:20 Pre-run — 1 banana + 250ml water
~7:50 Post-run — 4 eggs + upma + curd + electrolyte water
1:00 Lunch — 2 chapati + chana + paneer + salad
4:00 Snack — 1 scoop whey + peanuts (30g)
8:30 Dinner — 3 eggs + dal + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch · Uprise D3 60K with fattiest meal (weekly)
MONSOON BACKUP: If heavy rain at run time — do 20 min indoor bodyweight cardio (jumping jacks 3×1 min + high knees 3×1 min + mountain climbers 3×30s + burpees 3×8). Reschedule the run to next available dry slot within 48h. Don''t skip — substitute.', directive = '4 km tempo — longest tempo block yet. This is 80% of race pace for 4 km. If you can hold 7:00/km for 4 km, you can hold it for 21.1 km with training.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-08-13';

UPDATE daily_plans SET day_name = 'Fri', day_type = 'Gym', protein_target = 160, calorie_target = 2150, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Gym — Pull + Posterior Chain (Aug 15 backup: bodyweight at home)', workout_detail = 'WARM-UP (8 min): 5 min treadmill walk at incline → arm circles 20 → hip circles 10/side → band pull-aparts 1×15 → dead hang 30s → 1 warm-up set rows at 50% working weight · Pull-ups 4×max · Barbell rows 4×8 · Lat pulldown 3×10 · RDL 3×8 · Bulgarian split squat 2×10/leg · Cable face pulls 3×12 · Calf raises 3×15 · 45 min · RPE 7 · BACKUP (if gym closed for Independence Day): Pull-ups 4×max + Rows 3×10 (table) + RDL bodyweight 3×15 + Glute bridges 3×15 + Plank 3×60s · COOL-DOWN (5 min): chest doorway stretch 30s/side → lat stretch 30s/side → shoulder cross-body 30s/side → hip flexor stretch 30s/side → child''s pose 30s', meals_plan = '— PROTEIN MATH (verified): 4 eggs (28g) + 1 chapati (3g) + whey (24g) + 2 chapati (6g) + palak dal (14g) + paneer (18g) + salad (2g) + whey (24g) + walnuts (3g) + 3 eggs (21g) + curd (8g) + 1 chapati (3g) + veggies (3g) + flaxseed (2g) = ~160g · CALORIES ~2,100–2,200 —
6:15 Pre-gym — Water + black coffee
8:00 Post-gym — 4 eggs + 1 chapati + 1 scoop whey
1:00 Lunch — 2 chapati + palak dal + paneer + salad
4:30 Snack — 1 scoop whey + 10 walnuts + flaxseed
8:30 Dinner — 3 eggs + 1 chapati + curd + veggies
PRE-LONG-RUN — extra carbs tonight
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch', directive = 'Aug 15 Independence Day — gym may close. Check hours. If closed, do bodyweight backup at home. Don''t skip. Carb dinner for 11 km tomorrow.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-08-14';

UPDATE daily_plans SET day_name = 'Sat', day_type = 'Run', protein_target = 152, calorie_target = 2150, water_target = '3L+', run_type = 'Long Easy', run_km = 11, run_pace = '8:00–8:45/km', run_cue = 'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → bodyweight squats 1×10 (slow) → calf raises 1×15 → leg swings 10/side → hip circles 10/side → ankle circles → 1 min easy jog to start · Cadence: 150 BPM · RPE 6–7 · Walk 1 min every 3 km (at 3, 6, 9 km) · CARRY WATER — 11 km = ~90 min · COOL-DOWN (8 min): 5 min walk (don''t stop abruptly) → standing wall calf stretch 30s/side → standing quad pull (hand on foot) 30s/side → kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute / IT band stretch 30s/side · Post-run: foam roll + cold water + electrolytes', workout_plan = NULL, workout_detail = NULL, meals_plan = '— PROTEIN MATH (verified): banana (1g) + dates (1g) + 4 eggs (28g) + 2 chapati (6g) + curd (8g) + whey (24g) + 3 chapati (9g) + dal (12g) + paneer (18g) + whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) + veggies (3g) = ~152g · CALORIES ~2,200–2,300 —
6:00 Pre-run — banana + dates + water
~8:00 Warm-up — full 10 min
~9:00 Post-run — 4 eggs + 2 chapati + curd + 1 scoop whey + electrolytes
1:00 Lunch — 3 chapati + dal + paneer (extra carbs)
4:00 Snack — 1 scoop whey + peanuts (30g)
8:30 Dinner — 3 eggs + dal + veggies
Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
MONSOON BACKUP: If heavy rain at run time — do 20 min indoor bodyweight cardio (jumping jacks 3×1 min + high knees 3×1 min + mountain climbers 3×30s + burpees 3×8). Reschedule the run to next available dry slot within 48h. Don''t skip — substitute.', directive = '11 KM — new personal distance record. Independence Day — park may be busy, start early. Walk breaks at 3/6/9 km are PLANNED. Carry water. Finish feeling you could do 1 more km.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-08-15';

UPDATE daily_plans SET day_name = 'Sun', day_type = 'Rest', protein_target = 149, calorie_target = 1850, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'NEAT walk + recovery', workout_detail = 'Mandatory: 25–30 min walk · Foam roll full body 10 min', meals_plan = '— PROTEIN MATH (verified): 4 eggs (28g) + whey (24g) + 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) + curd (8g) + whey (24g) + roasted chana (8g) + 3 eggs (21g) + hung curd (14g) + veggies (3g) = ~152g · CALORIES ~1,800–1,900 —
8:00 Breakfast — 4 eggs + 1 scoop whey
1:00 Lunch — 2 chapati + dal + paneer + salad + curd
4:30 Snack — 1 scoop whey + roasted chana (30g)
8:30 Dinner — 3 eggs + hung curd + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch', directive = 'Recovery after 11 km. Walk, foam roll, sleep well. One more hard week then taper.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-08-16';

UPDATE daily_plans SET day_name = 'Mon', day_type = 'Gym', protein_target = 161, calorie_target = 2150, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Gym — Push + Core (last hard session)', workout_detail = 'WARM-UP (8 min): 5 min treadmill walk at incline → arm circles 20 → band pull-aparts 1×15 → push-ups 1×10 (slow) → 1 warm-up set bench at 50% working weight · Flat bench press 4×8 · Seated DB OHP 3×8 · Incline DB press 3×8 · Dips 3×max · Cable fly 3×12 · Plank 3×60s · Hanging knee raises 3×12 · 45 min · RPE 7–8 · COOL-DOWN (5 min): chest doorway stretch 30s/side → lat stretch 30s/side → shoulder cross-body 30s/side → hip flexor stretch 30s/side → child''s pose 30s', meals_plan = '— PROTEIN MATH (verified): 4 eggs (28g) + 1 chapati (3g) + whey (24g) + 2 chapati (6g) + rajma (15g) + paneer (18g) + salad (2g) + whey (24g) + walnuts (3g) + 3 eggs (21g) + paneer bhurji 80g (14g) + veggies (3g) = ~161g · CALORIES ~2,100–2,200 —
6:15 Pre-gym — Water + black coffee
8:00 Post-gym — 4 eggs + 1 chapati + 1 scoop whey
1:00 Lunch — 2 chapati + rajma + paneer + salad
4:30 Snack — 1 scoop whey + 10 walnuts
8:30 Dinner — 3 eggs + paneer bhurji + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
Monday AM: weigh + waist', directive = 'Last hard push session. Give it everything. After this week, gym becomes maintenance only.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-08-17';

UPDATE daily_plans SET day_name = 'Tue', day_type = 'Run', protein_target = 150, calorie_target = 2100, water_target = '2.5L', run_type = 'Easy', run_km = 4, run_pace = '7:45–8:30/km', run_cue = 'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → bodyweight squats 1×10 (slow) → calf raises 1×15 → leg swings 10/side → hip circles 10/side → ankle circles → 1 min easy jog to start · Cadence: 150 BPM · RPE 5–6 · COOL-DOWN (8 min): 5 min walk (don''t stop abruptly) → standing wall calf stretch 30s/side → standing quad pull (hand on foot) 30s/side → kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute / IT band stretch 30s/side', workout_plan = NULL, workout_detail = NULL, meals_plan = '— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + poha (4g) + curd (8g) + 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) + whey (24g) + roasted chana (8g) + 3 eggs (21g) + rajma (15g) + veggies (3g) = ~150g · CALORIES ~2,050–2,150 —
6:20 Pre-run — 1 banana + 250ml water
~7:40 Post-run — 4 eggs + poha + curd + electrolyte water
1:00 Lunch — 2 chapati + dal + paneer + salad
4:00 Snack — 1 scoop whey + roasted chana (30g)
8:30 Dinner — 3 eggs + rajma + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
MONSOON BACKUP: If heavy rain at run time — do 20 min indoor bodyweight cardio (jumping jacks 3×1 min + high knees 3×1 min + mountain climbers 3×30s + burpees 3×8). Reschedule the run to next available dry slot within 48h. Don''t skip — substitute.', directive = 'Easy 4 km. Save energy for Thursday''s race-pace tempo.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-08-18';

UPDATE daily_plans SET day_name = 'Wed', day_type = 'Active Recovery', protein_target = 149, calorie_target = 1900, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Knee prep + mobility', workout_detail = 'WARM-UP (5 min): 5 min brisk walk · Glute bridges 3×15 · Calf raises 3×20 · Clamshells 2×12/side · Ankle dorsiflexion 2×10/side · Foam roll full body 7 min · 20 min · RPE 4 · COOL-DOWN (5 min): kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute stretch 30s/side → standing wall calf stretch 30s/side', meals_plan = '— PROTEIN MATH (verified): 4 eggs (28g) + whey (24g) + 1.5 chapati (5g) + chana (15g) + curd (8g) + salad (2g) + whey (24g) + flaxseed (2g) + walnuts (3g) + 3 eggs (21g) + paneer bhurji 80g (14g) + veggies (3g) = ~149g · CALORIES ~1,850–1,950 —
8:00 Breakfast — 4 eggs + 1 scoop whey
1:00 Lunch — 1.5 chapati + chana + curd + salad
4:30 Snack — 1 scoop whey + flaxseed + 10 walnuts
8:30 Dinner — 3 eggs + paneer bhurji + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
After work: 25–30 min brisk walk', directive = 'Mobility before race-pace tempo. Extra focus on ankles and calves.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-08-19';

UPDATE daily_plans SET day_name = 'Thu', day_type = 'Run', protein_target = 150, calorie_target = 2100, water_target = '2.5L', run_type = 'Tempo', run_km = 4, run_pace = '6:50/km tempo · 8:00/km easy', run_cue = 'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → bodyweight squats 1×10 (slow) → calf raises 1×15 → leg swings 10/side → hip circles 10/side → ankle circles → 1 min easy jog to start · 0.5 km easy warm-up jog → 3 km TEMPO @ 6:50/km — RACE PACE SHARPENER → 0.5 km easy cool-down jog · Cadence: 160+ BPM during tempo · RPE 8 · This is the hardest run of the entire plan · COOL-DOWN (8 min): 5 min walk (don''t stop abruptly) → standing wall calf stretch 30s/side → standing quad pull (hand on foot) 30s/side → kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute / IT band stretch 30s/side', workout_plan = NULL, workout_detail = NULL, meals_plan = '— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + 2 toast (6g) + curd (8g) + 2 chapati (6g) + palak dal (14g) + paneer (18g) + whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) + veggies (3g) + salad (2g) = ~150g · CALORIES ~2,050–2,150 —
6:20 Pre-run — 1 banana + 250ml water
~7:30 Post-run — 4 eggs + 2 toast + curd + electrolyte water
1:00 Lunch — 2 chapati + palak dal + paneer + salad
4:00 Snack — 1 scoop whey + peanuts (30g)
8:30 Dinner — 3 eggs + dal + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch · Uprise D3 60K with fattiest meal (weekly)
MONSOON BACKUP: If heavy rain at run time — do 20 min indoor bodyweight cardio (jumping jacks 3×1 min + high knees 3×1 min + mountain climbers 3×30s + burpees 3×8). Reschedule the run to next available dry slot within 48h. Don''t skip — substitute.', directive = 'RACE PACE SHARPENER — 3 km at 6:50/km. This is faster than race pace (7:06/km). If you can hold this for 3 km, you can hold 7:06 for 21 km. RPE 8 is expected. LAST HARD TEMPO. After this, taper.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-08-20';

UPDATE daily_plans SET day_name = 'Fri', day_type = 'Gym', protein_target = 160, calorie_target = 2150, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Gym — Pull + Posterior Chain (last heavy session)', workout_detail = 'WARM-UP (8 min): 5 min treadmill walk at incline → arm circles 20 → hip circles 10/side → band pull-aparts 1×15 → dead hang 30s → 1 warm-up set rows at 50% working weight · Pull-ups 4×max · Barbell rows 4×8 · Lat pulldown 3×10 · RDL 3×8 · Bulgarian split squat 2×10/leg · Cable face pulls 3×12 · Calf raises 3×15 · 45 min · RPE 7 · COOL-DOWN (5 min): chest doorway stretch 30s/side → lat stretch 30s/side → shoulder cross-body 30s/side → hip flexor stretch 30s/side → child''s pose 30s', meals_plan = '— PROTEIN MATH (verified): 4 eggs (28g) + upma (4g) + whey (24g) + 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) + whey (24g) + peanuts (7g) + 3 eggs (21g) + curd (8g) + 1 chapati (3g) + veggies (3g) = ~160g · CALORIES ~2,100–2,200 —
6:15 Pre-gym — Water + black coffee
8:00 Post-gym — 4 eggs + upma + 1 scoop whey
1:00 Lunch — 2 chapati + dal + paneer + salad
4:30 Snack — 1 scoop whey + peanuts (30g)
8:30 Dinner — 3 eggs + 1 chapati + curd + veggies
PRE-LONG-RUN — extra carbs tonight · Sleep by 10:30 PM
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch', directive = 'LAST HEAVY GYM SESSION. After this, gym is maintenance only. Give it your best. Extra carbs for tomorrow''s peak long run. Sleep early — 14 km tomorrow.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-08-21';

UPDATE daily_plans SET day_name = 'Sat', day_type = 'Run', protein_target = 155, calorie_target = 2200, water_target = '3L+', run_type = 'Long Easy', run_km = 14, run_pace = '8:00–8:45/km', run_cue = 'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → bodyweight squats 1×10 (slow) → calf raises 1×15 → leg swings 10/side → hip circles 10/side → ankle circles → 1 min easy jog to start · Cadence: 150 BPM · RPE 6–7 · Walk 1 min every 3 km (at 3, 6, 9, 12 km) · CARRY WATER — 14 km = ~2 hours · Carry a small snack (2 dates) for km 10 · COOL-DOWN (8 min): 5 min walk (don''t stop abruptly) → standing wall calf stretch 30s/side → standing quad pull (hand on foot) 30s/side → kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute / IT band stretch 30s/side · Post-run: foam roll + cold water + full electrolyte rehydration', workout_plan = NULL, workout_detail = NULL, meals_plan = '— PROTEIN MATH (verified): banana (1g) + dates (1g) + 4 eggs (28g) + 2 chapati (6g) + curd (8g) + whey (24g) + 3 chapati (9g) + chana (15g) + paneer (18g) + whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) + veggies (3g) = ~155g · CALORIES ~2,300–2,400 (highest of entire plan — earned it) —
5:45 Pre-run — 1 banana + 2 dates + 250ml water
~6:00 Warm-up — full 10 min
~8:30 Post-run — 4 eggs + 2 chapati + curd + 1 scoop whey + electrolytes
1:00 Lunch — 3 chapati + chana + paneer (extra carbs — refuel)
4:00 Snack — 1 scoop whey + peanuts (30g)
8:30 Dinner — 3 eggs + dal + veggies
Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
MONSOON BACKUP: If heavy rain at run time — do 20 min indoor bodyweight cardio (jumping jacks 3×1 min + high knees 3×1 min + mountain climbers 3×30s + burpees 3×8). Reschedule the run to next available dry slot within 48h. Don''t skip — substitute.', directive = 'PEAK LONG RUN — 14 KM. Longest run of the entire plan. Start at 5:45 AM — it will take ~2 hours. Walk breaks every 3 km are MANDATORY, not optional. Carry water AND 2 dates for fuel at km 10. After this: no more new distance records. Taper begins. If you finish 14 km, you WILL finish 21.1 km on race day.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-08-22';

UPDATE daily_plans SET day_name = 'Sun', day_type = 'Rest', protein_target = 149, calorie_target = 1900, water_target = '2.5L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'NEAT walk + extended recovery', workout_detail = 'Mandatory: 30 min easy walk · Foam roll full body 10 min · Light stretching 10 min', meals_plan = '— PROTEIN MATH (verified): paneer bhurji 80g (14g) + moong chilla 2 w/ paneer (20g) + 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) + curd (8g) + whey (24g) + walnuts (3g) + 3 eggs (21g) + hung curd (14g) + veggies (3g) = ~145g · CALORIES ~1,850–1,950 —
8:00 Breakfast — paneer bhurji + moong chilla with paneer
1:00 Lunch — 2 chapati + dal + paneer + salad + curd
4:30 Snack — 1 scoop whey + 10 walnuts
8:30 Dinner — 3 eggs + hung curd + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch', directive = 'Recovery after peak long run. Extra calories today — don''t cut aggressively. Walk, foam roll, stretch. TAPER STARTS TOMORROW. Monday AM: weigh + waist.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-08-23';

UPDATE daily_plans SET day_name = 'Mon', day_type = 'Gym', protein_target = 155, calorie_target = 2100, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Gym — Push TAPER (maintenance)', workout_detail = 'WARM-UP (8 min): 5 min treadmill walk at incline → arm circles 20 → band pull-aparts 1×15 → push-ups 1×10 (slow) → 1 warm-up set bench at 50% working weight · Flat bench press 2×8 (keep weight, cut volume) · Seated DB OHP 2×8 · Push-ups 2×15 · Plank 2×60s · 30 min · RPE 6 · COOL-DOWN (5 min): chest doorway stretch 30s/side → lat stretch 30s/side → shoulder cross-body 30s/side → hip flexor stretch 30s/side → child''s pose 30s', meals_plan = '— PROTEIN MATH (verified): 4 eggs (28g) + poha (4g) + whey (24g) + 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) + whey (24g) + peanuts (7g) + 3 eggs (21g) + curd (8g) + veggies (3g) = ~154g · CALORIES ~2,050–2,150 —
6:30 Pre-gym — Water + black coffee
8:00 Post-gym — 4 eggs + poha + 1 scoop whey
1:00 Lunch — 2 chapati + dal + paneer + salad
4:30 Snack — 1 scoop whey + peanuts (30g)
8:30 Dinner — 3 eggs + curd + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
Monday AM: weigh + waist', directive = 'TAPER — same weight, half the sets. You should feel ''too easy''. That''s the point. Your body is shedding fatigue while keeping fitness.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-08-24';

UPDATE daily_plans SET day_name = 'Tue', day_type = 'Run', protein_target = 150, calorie_target = 2050, water_target = '2.5L', run_type = 'Easy', run_km = 3, run_pace = '7:45–8:15/km', run_cue = 'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → bodyweight squats 1×10 (slow) → calf raises 1×15 → leg swings 10/side → hip circles 10/side → ankle circles → 1 min easy jog to start · Cadence: 150 BPM · RPE 5 · COOL-DOWN (8 min): 5 min walk (don''t stop abruptly) → standing wall calf stretch 30s/side → standing quad pull (hand on foot) 30s/side → kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute / IT band stretch 30s/side', workout_plan = NULL, workout_detail = NULL, meals_plan = '— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + 2 toast (6g) + curd (8g) + 2 chapati (6g) + chana (15g) + paneer (18g) + salad (2g) + whey (24g) + peanuts (7g) + 3 eggs (21g) + palak dal (14g) + veggies (3g) = ~153g · CALORIES ~2,000–2,100 —
6:20 Pre-run — 1 banana + 250ml water
~7:15 Post-run — 4 eggs + 2 toast + curd + water
1:00 Lunch — 2 chapati + chana + paneer + salad
4:00 Snack — 1 scoop whey + peanuts (30g)
8:30 Dinner — 3 eggs + palak dal + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
MONSOON BACKUP: If heavy rain at run time — do 20 min indoor bodyweight cardio (jumping jacks 3×1 min + high knees 3×1 min + mountain climbers 3×30s + burpees 3×8). Reschedule the run to next available dry slot within 48h. Don''t skip — substitute.', directive = 'Short easy run. Feel the legs — they should feel fresh and springy from taper.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-08-25';

UPDATE daily_plans SET day_name = 'Wed', day_type = 'Active Recovery', protein_target = 149, calorie_target = 1900, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Light mobility + foam rolling', workout_detail = '5 min brisk walk · Glute bridges 2×15 · Calf raises 2×20 · Ankle dorsiflexion 2×10/side · Foam roll full body 10 min · Light stretching · 15 min · RPE 3 · COOL-DOWN (5 min): kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute stretch 30s/side → standing wall calf stretch 30s/side', meals_plan = '— PROTEIN MATH (verified): 4 eggs (28g) + whey (24g) + 1.5 chapati (5g) + rajma (15g) + curd (8g) + salad (2g) + whey (24g) + flaxseed (2g) + walnuts (3g) + 3 eggs (21g) + paneer bhurji 80g (14g) + veggies (3g) = ~149g · CALORIES ~1,850–1,950 —
8:00 Breakfast — 4 eggs + 1 scoop whey
1:00 Lunch — 1.5 chapati + rajma + curd + salad
4:30 Snack — 1 scoop whey + flaxseed + 10 walnuts
8:30 Dinner — 3 eggs + paneer bhurji + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
Walk after work', directive = 'Light mobility. Extra foam rolling. Rest is productive during taper.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-08-26';

UPDATE daily_plans SET day_name = 'Thu', day_type = 'Run', protein_target = 150, calorie_target = 2050, water_target = '2.5L', run_type = 'Tempo', run_km = 3, run_pace = '7:00/km tempo · 8:00/km easy', run_cue = 'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → bodyweight squats 1×10 (slow) → calf raises 1×15 → leg swings 10/side → hip circles 10/side → ankle circles → 1 min easy jog to start · 1 km easy warm-up jog → 1.5 km TEMPO @ 7:00/km — feel race pace one last time → 0.5 km easy cool-down jog · Cadence: 158–162 BPM · RPE 6–7 · COOL-DOWN (8 min): 5 min walk (don''t stop abruptly) → standing wall calf stretch 30s/side → standing quad pull (hand on foot) 30s/side → kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute / IT band stretch 30s/side', workout_plan = NULL, workout_detail = NULL, meals_plan = '— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + upma (4g) + curd (8g) + 2 chapati (6g) + dal (12g) + paneer (18g) + whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) + veggies (3g) + salad (2g) = ~146g · CALORIES ~2,000–2,100 —
6:20 Pre-run — 1 banana + 250ml water
~7:15 Post-run — 4 eggs + upma + curd + water
1:00 Lunch — 2 chapati + dal + paneer + salad
4:00 Snack — 1 scoop whey + peanuts (30g)
8:30 Dinner — 3 eggs + dal + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch · Uprise D3 60K with fattiest meal (weekly)
MONSOON BACKUP: If heavy rain at run time — do 20 min indoor bodyweight cardio (jumping jacks 3×1 min + high knees 3×1 min + mountain climbers 3×30s + burpees 3×8). Reschedule the run to next available dry slot within 48h. Don''t skip — substitute.', directive = 'LAST TEMPO before race. Short and sharp — 1.5 km at race pace. The purpose is to remind your legs what 7:00/km feels like. Should feel easy — that''s the taper working.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-08-27';

UPDATE daily_plans SET day_name = 'Fri', day_type = 'Gym', protein_target = 155, calorie_target = 2100, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Gym — Pull TAPER (last gym before race)', workout_detail = 'WARM-UP (8 min): 5 min treadmill walk at incline → arm circles 20 → hip circles 10/side → band pull-aparts 1×15 → dead hang 30s → 1 warm-up set rows at 50% working weight · Pull-ups 3×max · Barbell rows 2×8 (moderate) · Lat pulldown 2×10 · Light RDL 2×10 · Glute bridges 2×15 · 30 min · RPE 5–6 · COOL-DOWN (5 min): chest doorway stretch 30s/side → lat stretch 30s/side → shoulder cross-body 30s/side → hip flexor stretch 30s/side → child''s pose 30s', meals_plan = '— PROTEIN MATH (verified): 4 eggs (28g) + 1 chapati (3g) + whey (24g) + 2 chapati (6g) + chana (15g) + paneer (18g) + salad (2g) + whey (24g) + walnuts (3g) + 3 eggs (21g) + curd (8g) + 1 chapati (3g) + veggies (3g) = ~158g · CALORIES ~2,050–2,150 —
6:30 Pre-gym — Water + black coffee
8:00 Post-gym — 4 eggs + 1 chapati + 1 scoop whey
1:00 Lunch — 2 chapati + chana + paneer + salad
4:30 Snack — 1 scoop whey + 10 walnuts
8:30 Dinner — 3 eggs + 1 chapati + curd + veggies
PRE-LONG-RUN — carb dinner
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch', directive = 'LAST GYM SESSION before race. Light pull. No DOMS allowed going into race week. Carb dinner for tomorrow''s dress rehearsal run.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-08-28';

UPDATE daily_plans SET day_name = 'Sat', day_type = 'Run', protein_target = 150, calorie_target = 2100, water_target = '2.5L+', run_type = 'Long Easy', run_km = 8, run_pace = '7:45–8:30/km', run_cue = 'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → bodyweight squats 1×10 (slow) → calf raises 1×15 → leg swings 10/side → hip circles 10/side → ankle circles → 1 min easy jog to start · Cadence: 150 BPM · RPE 5–6 · DRESS REHEARSAL — wear race-day shoes, clothes, carry water · Practice race-day nutrition (banana + dates pre-run) · Walk 1 min at 4 km · COOL-DOWN (8 min): 5 min walk (don''t stop abruptly) → standing wall calf stretch 30s/side → standing quad pull (hand on foot) 30s/side → kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute / IT band stretch 30s/side', workout_plan = NULL, workout_detail = NULL, meals_plan = '— PROTEIN MATH (verified): banana (1g) + dates (1g) + 4 eggs (28g) + 2 chapati (6g) + curd (8g) + 2 chapati (6g) + dal (12g) + paneer (18g) + whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) + veggies (3g) + salad (2g) = ~149g · CALORIES ~2,050–2,150 —
6:20 Pre-run — banana + dates + water (EXACTLY what you''ll eat race morning)
~7:30 Post-run — 4 eggs + 2 chapati + curd + electrolyte water
1:00 Lunch — 2 chapati + dal + paneer + salad
4:00 Snack — 1 scoop whey + peanuts (30g)
8:30 Dinner — 3 eggs + dal + veggies
Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
MONSOON BACKUP: If heavy rain at run time — do 20 min indoor bodyweight cardio (jumping jacks 3×1 min + high knees 3×1 min + mountain climbers 3×30s + burpees 3×8). Reschedule the run to next available dry slot within 48h. Don''t skip — substitute.', directive = 'DRESS REHEARSAL — 8 km at easy pace wearing race-day gear. Test everything: shoes, shorts, hydration, pre-run nutrition. Nothing new on race day. This run should feel comfortable — that''s taper magic.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-08-29';

UPDATE daily_plans SET day_name = 'Sun', day_type = 'Rest', protein_target = 149, calorie_target = 1900, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'NEAT walk + recovery', workout_detail = 'Easy 20 min walk · Light stretching · No foam rolling (save it for race week)', meals_plan = '— PROTEIN MATH (verified): 4 eggs (28g) + whey (24g) + 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) + curd (8g) + whey (24g) + roasted chana (8g) + 3 eggs (21g) + hung curd (14g) + veggies (3g) = ~152g · CALORIES ~1,850–1,950 —
8:00 Breakfast — 4 eggs + 1 scoop whey
1:00 Lunch — 2 chapati + dal + paneer + salad + curd
4:30 Snack — 1 scoop whey + roasted chana (30g)
8:30 Dinner — 3 eggs + hung curd + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch', directive = 'Rest. RACE WEEK STARTS TOMORROW. Sleep 8 hours tonight.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-08-30';

UPDATE daily_plans SET day_name = 'Mon', day_type = 'Gym', protein_target = 150, calorie_target = 2050, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Light movement only — 15 min', workout_detail = 'Push-ups 2×10 · Plank 2×30s · Glute bridges 2×10 · Light stretching · 15 min · RPE 3 · NO gym — do at home', meals_plan = '— PROTEIN MATH (verified): 4 eggs (28g) + poha (4g) + whey (24g) + 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) + whey (24g) + walnuts (3g) + 3 eggs (21g) + curd (8g) + veggies (3g) = ~150g · CALORIES ~2,000–2,100 —
8:00 Breakfast — 4 eggs + poha + 1 scoop whey
1:00 Lunch — 2 chapati + dal + paneer + salad
4:30 Snack — 1 scoop whey + 10 walnuts
8:30 Dinner — 3 eggs + curd + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
Monday AM: weigh + waist (final check)', directive = 'NO GYM this week. Light movement at home only. Do NOT try anything new. Normal meals. Monday AM: final weigh + waist. 5 DAYS TO RACE.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-09-01';

UPDATE daily_plans SET day_name = 'Tue', day_type = 'Run', protein_target = 150, calorie_target = 2050, water_target = '2.5L', run_type = 'Shakeout', run_km = 3, run_pace = '7:45–8:15/km', run_cue = 'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → bodyweight squats 1×10 (slow) → calf raises 1×15 → leg swings 10/side → hip circles 10/side → ankle circles → 1 min easy jog to start · Cadence: 150 BPM · RPE 4–5 · Include 4×20s strides at the end (accelerate to fast pace, decelerate) · COOL-DOWN (8 min): 5 min walk (don''t stop abruptly) → standing wall calf stretch 30s/side → standing quad pull (hand on foot) 30s/side → kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute / IT band stretch 30s/side', workout_plan = NULL, workout_detail = NULL, meals_plan = '— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + 2 toast (6g) + curd (8g) + 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) + whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) + veggies (3g) = ~148g · CALORIES ~2,000–2,100 —
6:20 Pre-run — 1 banana + 250ml water
~7:15 Post-run — 4 eggs + 2 toast + curd + water
1:00 Lunch — 2 chapati + dal + paneer + salad
4:00 Snack — 1 scoop whey + peanuts (30g)
8:30 Dinner — 3 eggs + dal + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
MONSOON BACKUP: If heavy rain at run time — do 20 min indoor bodyweight cardio (jumping jacks 3×1 min + high knees 3×1 min + mountain climbers 3×30s + burpees 3×8). Reschedule the run to next available dry slot within 48h. Don''t skip — substitute.', directive = 'Shakeout run + strides. 3 km easy then 4×20 second strides. Strides = accelerate to fast pace for 20 sec, then decelerate. Keeps legs sharp without fatigue.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-09-02';

UPDATE daily_plans SET day_name = 'Wed', day_type = 'Rest', protein_target = 150, calorie_target = 2000, water_target = '2.5L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Complete rest + walk', workout_detail = '20 min easy walk · Light stretching only · No exercises', meals_plan = '— PROTEIN MATH (verified): 4 eggs (28g) + whey (24g) + 2 chapati (6g) + chana (15g) + paneer (18g) + salad (2g) + whey (24g) + walnuts (3g) + 3 eggs (21g) + curd (8g) + veggies (3g) = ~152g · CALORIES ~1,950–2,050 —
8:00 Breakfast — 4 eggs + 1 scoop whey
1:00 Lunch — 2 chapati + chana + paneer + salad
4:30 Snack — 1 scoop whey + 10 walnuts
8:30 Dinner — 3 eggs + curd + veggies
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
3 DAYS TO RACE — sleep 8+ hours', directive = 'Complete rest. No running, no gym, no exercises. Walk and stretch only. Sleep 8 hours.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-09-03';

UPDATE daily_plans SET day_name = 'Thu', day_type = 'Run', protein_target = 150, calorie_target = 2100, water_target = '2.5L', run_type = 'Shakeout', run_km = 2, run_pace = '7:45–8:00/km', run_cue = 'Light 5 min walk warm-up → 2 km easy jog · Cadence: 150 BPM · RPE 4 · Include 3×15s strides · Cool-down walk 5 min', workout_plan = NULL, workout_detail = NULL, meals_plan = '— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + upma (4g) + curd (8g) + 2 chapati (6g) + dal (12g) + paneer (18g) + whey (24g) + peanuts (7g) + 3 eggs (21g) + rajma (15g) + veggies (3g) + 1 chapati (3g) = ~150g · CALORIES ~2,050–2,200 — CARB LOADING starts tonight —
6:30 Pre-run — 1 banana + 250ml water
~7:00 Post-run — 4 eggs + upma + curd + water
1:00 Lunch — 2 chapati + dal + paneer
4:00 Snack — 1 scoop whey + peanuts (30g)
8:30 Dinner — 3 eggs + rajma + 1 chapati + veggies
CARB LOAD — extra chapati at dinner, don''t go light
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch · Uprise D3 60K with fattiest meal (weekly)', directive = 'Last run before race. 2 km shakeout + 3 strides. Legs should feel bouncy and impatient. CARB LOADING tonight — extra chapati at dinner. Don''t try any new food. 2 DAYS TO RACE.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-09-04';

UPDATE daily_plans SET day_name = 'Fri', day_type = 'Rest', protein_target = 150, calorie_target = 2200, water_target = '3L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Complete rest — race prep', workout_detail = '15 min easy walk · Lay out race gear · Charge watch · Set 3 alarms for 4:00 AM', meals_plan = '— PROTEIN MATH (verified): 4 eggs (28g) + poha (4g) + whey (24g) + 3 chapati (9g) + dal (12g) + paneer (18g) + salad (2g) + whey (24g) + peanuts (7g) + 3 eggs (21g) + curd (8g) + 1 chapati (3g) + veggies (3g) = ~160g · CALORIES ~2,200–2,350 — CARB LOADING DAY —
8:00 Breakfast — 4 eggs + poha + 1 scoop whey
1:00 Lunch — 3 chapati + dal + paneer + salad (extra carbs)
4:00 Snack — 1 scoop whey + peanuts (30g)
8:00 Dinner — 3 eggs + 1 chapati + curd + veggies (dinner by 8 PM — early, not heavy, carb-rich)
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
BED BY 9:30 PM — alarm at 4:00 AM', directive = 'RACE EVE. Complete rest. Lay out: race bib, shoes (Nike Pegasus 40), shorts, t-shirt, watch. Dinner by 8 PM — familiar food, extra carbs, not heavy. No alcohol, no smoking tonight. Set 3 alarms for 4:00 AM. Bed by 9:30 PM. Pre-race breakfast ready: banana, dates, water.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-09-05';

UPDATE daily_plans SET day_name = 'Sat', day_type = 'Run', protein_target = 155, calorie_target = 2500, water_target = '3L+', run_type = 'RACE — Half Marathon', run_km = 21.1, run_pace = '7:06/km (target 2:30:00)', run_cue = '4:00 AM — Wake up · 4:15 AM — 1 banana + 2 dates + 250ml water + 1 black coffee · 4:45 AM — Reach venue · Use bathroom · Light jog 5 min · 5:00 AM — RACE START · Strategy: START SLOW — first 3 km at 7:30/km, settle into 7:06 by km 5 · Walk through EVERY water station — drink, don''t skip · Planned walk breaks: 1 min at km 7, 14 if needed · km 15-21: focus on cadence 155+ and finishing strong · If you feel good at km 18, push pace slightly · FINISH LINE — you did it', workout_plan = NULL, workout_detail = NULL, meals_plan = '— RACE DAY NUTRITION —
4:15 Pre-race — 1 banana + 2 dates + 250ml water + 1 black coffee
~7:30 Post-race — Whatever is available at finish line + 500ml water + electrolytes
9:00 Breakfast — 4 eggs + chapati + curd + whey — CELEBRATE
1:00 Lunch — Eat whatever you want — you earned it
8:30 Dinner — Normal meal + extra carbs for recovery
HYDRATE ALL DAY — 3L+ water with electrolytes
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch', directive = 'RACE DAY — Vedanta Zinc City Half Marathon. You trained for 11 weeks. You ran 14 km. You held 6:50/km tempo. START SLOW — resist the crowd adrenaline. First 3 km at 7:30, then settle. Walk through every water station. You WILL finish. Target: 2:30:00. Mission: arrive, run, finish, celebrate.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-09-06';

UPDATE daily_plans SET day_name = 'Sun', day_type = 'Rest', protein_target = 150, calorie_target = 2300, water_target = '3L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Post-race recovery', workout_detail = '15–20 min very easy walk · Light stretching · Foam roll GENTLY if not too sore · No running', meals_plan = '— POST-RACE RECOVERY — No deficit today · Eat at maintenance ~2,200–2,400 kcal —
8:00 Breakfast — 4 eggs + poha + 1 scoop whey
1:00 Lunch — Normal meal + extra carbs + paneer
4:30 Snack — 1 scoop whey + whatever you want
8:30 Dinner — Normal dinner — no restrictions today
Supplements — Supradyn after first meal · Creatine 5g with lunch · Omega-3 with lunch
NO DEFICIT TODAY — maintenance calories, let your body recover', directive = 'POST-RACE. Congratulations. You finished a half marathon. No running for 3-5 days. Easy walking only. Eat at maintenance (~2,200–2,400 kcal) for the next 2 weeks. No deficit. Let your body recover. Next phase: reassess body comp → lean bulk or maintenance hold.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-09-07';
