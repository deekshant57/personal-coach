-- Sync daily_plans from coach/week-plans.py
-- Run in Supabase SQL Editor
-- User: d6f25dae-4cc8-48dd-9822-fbccf9a92139

UPDATE daily_plans SET day_name = 'Mon', day_type = 'Bodyweight', protein_target = 150, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Bodyweight — upper + core + light knee activation', workout_detail = 'WARM-UP (5 min): brisk walk or jog in place 2 min → arm circles 20 → hip circles 10/side → bodyweight squats 1×10 (slow) → push-ups 1×5 (slow) · Pull-ups 4×max · Push-ups 3×15 · Rows 3×10 (park bench) · Dead hang 3×20s · Plank 3×40s · Side plank 2×30s · Glute bridges 2×12 (light activation only — not strength) · 25–30 min · RPE 5 · COOL-DOWN (5 min): chest doorway stretch 30s/side → lat stretch 30s/side → shoulder cross-body 30s/side → hip flexor stretch 30s/side → child''s pose 30s', meals_plan = '— PROTEIN MATH: 4 eggs (28g) + 1 chapati (3g) + 1 whey (24g) + 2 chapati (6g) + dal (12g) + 100g paneer (18g) + salad (2g) + 1 whey (24g) + walnuts (3g) + 3 eggs (21g) + curd (8g) + veggies (3g) = ~152g ✓ —
6:30 Pre-workout — Water + black coffee
7:45 Post-workout — 4 eggs bhurji + 1 chapati + 1 scoop whey (water)
1:00 Lunch — 2 chapati + 1 bowl moong dal + 100g paneer + salad
4:30 Snack — 1 scoop whey (water) + 10 walnuts
8:30 Dinner — 3 eggs omelette + 1 bowl curd + sautéed veggies
Supplements — Supradyn after post-workout meal · Creatine 5g with lunch
Avoid — sweets, juice, fried snacks (triglycerides)', directive = 'First day. Upper body only — NO squats/lunges today. Legs must be fresh for tomorrow''s run. Glute bridges are activation, not a strength set.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-06-22';

UPDATE daily_plans SET day_name = 'Tue', day_type = 'Run', protein_target = 148, water_target = '2.5L', run_type = 'Easy', run_km = 3, run_pace = '8:00–8:30/km', run_cue = 'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → bodyweight squats 1×10 (slow) → calf raises 1×15 → leg swings 10/side → hip circles 10/side → ankle circles → 1 min easy jog to start · Cadence: use 150 BPM metronome · RPE 5–6 · Oxygen Park · COOL-DOWN (8 min): 5 min walk (don''t stop abruptly) → standing wall calf stretch 30s/side → standing quad pull (hand on foot) 30s/side → kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute / IT band stretch 30s/side', workout_plan = NULL, workout_detail = NULL, meals_plan = '— PROTEIN MATH: banana (1g) + 4 eggs (28g) + 2 toast (6g) + curd (8g) + 2 chapati (6g) + dal (12g) + 100g paneer (18g) + salad (2g) + 1 whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) + veggies (3g) = ~148g ✓ —
6:20 Pre-run — 1 banana + 250ml water
6:40 Warm-up at park (see run cue)
~7:30 Post-run — 4 eggs + 2 whole wheat toast + 1 bowl curd + 500ml water with pinch salt + lemon
1:00 Lunch — 2 chapati + 1 bowl dal + 100g paneer + salad
4:00 Snack — 1 scoop whey (water) + small handful peanuts (30g)
8:30 Dinner — 3 eggs bhurji + 1 bowl dal + veggies
Supplements — Supradyn after post-run meal · Creatine 5g with lunch
MONSOON BACKUP: If heavy rain at run time — do 20 min indoor bodyweight cardio (jumping jacks 3×1 min + high knees 3×1 min + mountain climbers 3×30s + burpees 3×8). Reschedule the run to next available dry slot within 48h. Don''t skip — substitute.', directive = 'Easy means easy — slower than your 5 km pace. Warm-up is mandatory, not optional. If knee feels off during warm-up squats, walk today instead. CADENCE: Current 142, target 150+. Use a free metronome app (150 BPM). Focus on shorter, quicker steps — not longer strides. Week 1 goal: just awareness. Don''t force it if form breaks down.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-06-23';

UPDATE daily_plans SET day_name = 'Wed', day_type = 'Active Recovery', protein_target = 149, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Knee prep + mobility', workout_detail = 'WARM-UP (5 min): 5 min brisk walk · Squats 3×15 (slow, controlled) · Lunges 2×10/leg · Glute bridges 3×15 · Calf raises 3×20 · Foam roll quads + calves + IT band 5 min · 20–25 min · RPE 4–5 · Keep it light — this is prep, not a leg day · COOL-DOWN (5 min): kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute stretch 30s/side → standing wall calf stretch 30s/side', meals_plan = '— PROTEIN MATH: 4 eggs (28g) + 1 whey (24g) + 1.5 chapati (5g) + dal (12g) + 150g curd (12g) + salad (2g) + 1 whey (24g) + walnuts (3g) + 3 eggs (21g) + 80g paneer (14g) + veggies (3g) = ~148g ✓ —
8:00 Breakfast — 4 eggs + 1 scoop whey (water or milk)
1:00 Lunch — 1.5 chapati + 1 bowl dal + 150g curd + salad
4:30 Snack — 1 scoop whey (water) + 10 walnuts
8:30 Dinner — 3 eggs + 80g paneer + veggies (no rice)
Rest day — fewer carbs than run days, protein stays the same
Supplements — Supradyn after breakfast · Creatine 5g with lunch
Avoid — refined carbs, sugary drinks, fried food', directive = 'Knee prep day — not a leg strength session. Slow, controlled reps. If any knee discomfort, stop squats/lunges and do glute bridges + calf raises only. Foam rolling is mandatory. Sleep target: 7+ hours tonight. After work (~7:45 PM): 25–30 min brisk walk — non-negotiable NEAT.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-06-24';

UPDATE daily_plans SET day_name = 'Thu', day_type = 'Run', protein_target = 148, water_target = '2.5L', run_type = 'Easy', run_km = 4, run_pace = '8:00–8:30/km', run_cue = 'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → bodyweight squats 1×10 (slow) → calf raises 1×15 → leg swings 10/side → hip circles 10/side → ankle circles → 1 min easy jog to start · Cadence: 150 BPM metronome · RPE 5–6 · Knee check at 2 km — if pain, walk home · COOL-DOWN (8 min): 5 min walk (don''t stop abruptly) → standing wall calf stretch 30s/side → standing quad pull (hand on foot) 30s/side → kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute / IT band stretch 30s/side', workout_plan = NULL, workout_detail = NULL, meals_plan = '— PROTEIN MATH: banana (1g) + 4 eggs (28g) + 2 chapati (6g) + curd (8g) + 2 chapati (6g) + dal (12g) + 100g paneer (18g) + 1 whey (24g) + flaxseed (2g) + peanuts (7g) + 3 eggs (21g) + dal (12g) + veggies (3g) = ~148g ✓ —
6:20 Pre-run — 1 banana + 250ml water
6:40 Warm-up at park (see run cue)
~7:40 Post-run — 4 eggs + 2 chapati + 1 bowl curd + 500ml water with pinch salt + lemon
1:00 Lunch — 2 chapati + 1 bowl dal + 100g paneer
4:00 Snack — 1 scoop whey + 1 tbsp flaxseed + handful peanuts (30g)
8:30 Dinner — 3 eggs + 1 bowl dal + salad
Supplements — Supradyn after post-run meal · Creatine 5g with lunch · Uprise D3 60K with fattiest meal (weekly)
MONSOON BACKUP: If heavy rain at run time — do 20 min indoor bodyweight cardio (jumping jacks 3×1 min + high knees 3×1 min + mountain climbers 3×30s + burpees 3×8). Reschedule the run to next available dry slot within 48h. Don''t skip — substitute.', directive = 'Longest mid-week run. Hold the pace ceiling. Warm-up is non-negotiable — your knees need it. If heavy rain, do monsoon backup and reschedule to Fri AM.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-06-25';

UPDATE daily_plans SET day_name = 'Fri', day_type = 'Bodyweight', protein_target = 150, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Bodyweight — upper + core', workout_detail = 'WARM-UP (5 min): brisk walk or jog in place 2 min → arm circles 20 → hip circles 10/side → bodyweight squats 1×10 (slow) → push-ups 1×5 (slow) · Pull-ups 4×max · Push-ups 3×max · Rows 3×10 (park bench) · Dead hang 3×20s · Plank 3×40s · Side plank 2×30s · Calf raises 2×15 (light) · 25–30 min · RPE 5–6 · COOL-DOWN (5 min): chest doorway stretch 30s/side → lat stretch 30s/side → shoulder cross-body 30s/side → hip flexor stretch 30s/side → child''s pose 30s', meals_plan = '— PROTEIN MATH: 4 eggs (28g) + 1 chapati (3g) + 1 whey (24g) + 2 chapati (6g) + chana (15g) + 100g paneer (18g) + 1 whey (24g) + walnuts (3g) + 3 eggs (21g) + curd (8g) + 1 chapati (3g) + veggies (3g) = ~156g ✓ —
6:30 Pre-workout — Water + black coffee
7:45 Post-workout — 4 eggs + 1 chapati + 1 scoop whey (water)
1:00 Lunch — 2 chapati + 1 bowl chana/rajma + 100g paneer
4:30 Snack — 1 scoop whey (water) + 10 walnuts
8:30 Dinner — 3 eggs + 1 chapati + curd + veggies
PRE-LONG-RUN — +1 chapati vs normal rest dinner (~+80 kcal carbs) · CALORIES ~2,000–2,100 —
Supplements — Supradyn after post-workout meal · Creatine 5g with lunch', directive = 'Upper body only — keep legs fresh for tomorrow''s long run. Calf raises are light, not a strength set. Carb-forward dinner tonight — not a light dinner. Sleep by 11 PM.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-06-26';

UPDATE daily_plans SET day_name = 'Sat', day_type = 'Run', protein_target = 150, water_target = '2.5L+', run_type = 'Long Easy', run_km = 5, run_pace = '8:00–8:45/km', run_cue = 'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → bodyweight squats 1×10 (slow) → calf raises 1×15 → leg swings 10/side → hip circles 10/side → ankle circles → 1 min easy jog to start · Cadence: 150 BPM metronome · RPE 6 max · Walk 1 min at 2.5 km if needed · COOL-DOWN (8 min): 5 min walk (don''t stop abruptly) → standing wall calf stretch 30s/side → standing quad pull (hand on foot) 30s/side → kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute / IT band stretch 30s/side · Extra: foam roll quads + calves post-shower if available', workout_plan = NULL, workout_detail = NULL, meals_plan = '— PROTEIN MATH: banana (1g) + dates (1g) + 4 eggs (28g) + 2 chapati (6g) + curd (8g) + 2.5 chapati (8g) + dal (12g) + 100g paneer (18g) + 1 whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) + veggies (3g) = ~149g ✓ —
6:20 Pre-run — 1 banana + 2 dates + 250ml water
6:40 Warm-up at park (see run cue) — take extra time today
~7:50 Post-run — 4 eggs + 2 chapati + curd + 500ml water with pinch salt + lemon
1:00 Lunch — 2–3 chapati + dal + 100g paneer (don''t skip carbs)
4:00 Snack — 1 scoop whey + handful peanuts (30g)
8:30 Dinner — 3 eggs + dal + veggies
Highest carb day of the week · Supradyn after post-run · Creatine 5g with lunch
MONSOON BACKUP: If heavy rain at run time — do 20 min indoor bodyweight cardio (jumping jacks 3×1 min + high knees 3×1 min + mountain climbers 3×30s + burpees 3×8). Reschedule the run to next available dry slot within 48h. Don''t skip — substitute.', directive = 'Week''s key run. Consolidate 5 km. Finish feeling you could do 1 more km. Full warm-up, full cool-down, no shortcuts. If monsoon blocks Sat, move to Sun — don''t skip the long run.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-06-27';

UPDATE daily_plans SET day_name = 'Sun', day_type = 'Rest', protein_target = 149, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'NEAT walk + recovery', workout_detail = 'Mandatory: 25–30 min brisk walk (morning or ~7:45 PM) · Foam roll quads + calves 5 min', meals_plan = '— PROTEIN MATH: 4 eggs (28g) + 1 whey (24g) + 2 chapati (6g) + dal (12g) + 100g paneer (18g) + salad (2g) + 1 whey (24g) + walnuts (3g) + 3 eggs (21g) + curd (8g) + veggies (3g) = ~149g ✓ —
8:00 Breakfast — 4 eggs + 1 scoop whey (water or milk)
1:00 Lunch — 2 chapati + dal + 100g paneer + salad
4:30 Snack — 1 scoop whey (water) + 10 walnuts
8:30 Dinner — 3 eggs + curd + veggies
Supplements — Supradyn after breakfast · Creatine 5g with lunch
Monday AM — weigh before food, measure waist', directive = 'Mandatory 25–30 min brisk walk today — not optional. Close the week clean. If long run moved here due to rain, this becomes run day and Monday becomes rest. Weigh Monday AM before food.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-06-28';

UPDATE daily_plans SET day_name = 'Mon', day_type = 'Bodyweight', protein_target = 152, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Bodyweight — upper + core ONLY', workout_detail = 'WARM-UP (5 min): brisk walk or jog in place 2 min → arm circles 20 → hip circles 10/side → bodyweight squats 1×10 (slow) → push-ups 1×5 (slow) · Pull-ups 4×max · Push-ups 3×15 · Rows 3×10 (park bench) · Dead hang 3×20s · Plank 3×40s · Side plank 2×30s · Glute bridges 2×12 (activation only — NOT strength) · NO squats · NO lunges · 25–30 min · RPE 5 · COOL-DOWN (5 min): chest doorway stretch 30s/side → lat stretch 30s/side → shoulder cross-body 30s/side → hip flexor stretch 30s/side → child''s pose 30s', meals_plan = '— PROTEIN MATH (verified): moong chilla 2 w/ paneer (20g) + 3 eggs (21g) + 2 chapati (6g) + chana (15g) + paneer (18g) + salad (2g) + whey (24g) + walnuts (3g) + tofu (12g) + hung curd (14g) + 2 eggs (14g) + veggies (3g) = ~152g · CALORIES ~1,950–2,050 —
6:30 Pre-workout — Water + black coffee
7:45 Post-workout — 2 moong dal chillas with paneer + 3 eggs bhurji
1:00 Lunch — 2 chapati + 1 bowl chana masala + 100g paneer + salad
4:30 Snack — 1 scoop whey (water) + 10 walnuts
8:30 Dinner — 100g tofu bhurji + hung curd + 2 eggs + sautéed veggies
Supplements — Supradyn after post-workout · Creatine 5g with lunch
Rule — breakfast = chilla (no chapati); chapati at lunch only', directive = 'Week 2 starts here. Upper body ONLY — zero squats/lunges. You did leg work on Mon W1 and paid for it Tue. Not again. Monday AM: weigh + waist before food. Log meals from food grid.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-06-29';

UPDATE daily_plans SET day_name = 'Tue', day_type = 'Run', protein_target = 149, water_target = '2.5L', run_type = 'Easy', run_km = 3, run_pace = '8:00–8:30/km', run_cue = 'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → bodyweight squats 1×10 (slow) → calf raises 1×15 → leg swings 10/side → hip circles 10/side → ankle circles → 1 min easy jog to start · Cadence: 150 BPM metronome — SHORT steps + fast turnover · Land with soft knee, foot under hip · RPE 5–6 · COOL-DOWN (8 min): 5 min walk (don''t stop abruptly) → standing wall calf stretch 30s/side → standing quad pull (hand on foot) 30s/side → kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute / IT band stretch 30s/side', workout_plan = NULL, workout_detail = NULL, meals_plan = '— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + poha (4g) + curd (8g) + 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) + whey (24g) + roasted chana (8g) + 3 eggs (21g) + palak dal (14g) + veggies (3g) = ~149g · CALORIES ~2,000–2,100 —
6:20 Pre-run — 1 banana + 250ml water (or sattu drink on light-stomach days)
6:40 Warm-up at park
~7:30 Post-run — 4 eggs + 1 plate poha + 1 bowl curd + 500ml water with pinch salt + lemon
1:00 Lunch — 2 chapati + 1 bowl moong dal + 100g paneer + salad
4:00 Snack — 1 scoop whey (water) + roasted chana (30g)
8:30 Dinner — 3 eggs bhurji + 1 bowl palak dal + veggies
Supplements — Supradyn after post-run · Creatine 5g with lunch
MONSOON BACKUP: If heavy rain at run time — do 20 min indoor bodyweight cardio (jumping jacks 3×1 min + high knees 3×1 min + mountain climbers 3×30s + burpees 3×8). Reschedule the run to next available dry slot within 48h. Don''t skip — substitute.', directive = 'Morning run — not evening. Alarm 6:20. Target 145–155 SPM with metronome — not slow shuffle at 124.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-06-30';

UPDATE daily_plans SET day_name = 'Wed', day_type = 'Active Recovery', protein_target = 149, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Knee prep + mobility — mandatory', workout_detail = 'WARM-UP (5 min): 5 min brisk walk · Glute bridges 3×15 · Calf raises 3×20 · Clamshells 2×12/side · Ankle dorsiflexion drills: knee-to-wall 2×10/side — fix ankle lock · Foam roll quads + calves + IT band 5 min · 20 min · RPE 4 · COOL-DOWN (5 min): kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute stretch 30s/side → standing wall calf stretch 30s/side', meals_plan = '— PROTEIN MATH (verified): 4 eggs (28g) + besan chilla 1.5 w/ paneer (17g) + 1.5 chapati (5g) + rajma (15g) + curd (8g) + salad (2g) + whey (24g) + flaxseed (2g) + walnuts (3g) + 3 eggs (21g) + 80g paneer (14g) + veggies (3g) = ~142g · Add 1 egg at dinner → 149g · CALORIES ~1,850–1,950 —
8:00 Breakfast — 4 eggs + 1.5 besan chilla with grated paneer
1:00 Lunch — 1.5 chapati + 1 bowl rajma + cucumber raita + salad
4:30 Snack — 1 scoop whey (water) + 1 tbsp flaxseed + 10 walnuts
8:30 Dinner — 3 eggs + 80g paneer + veggies (no rice)
Rest day — fewer carbs than run days, protein stays the same
Supplements — Supradyn after breakfast · Creatine 5g with lunch', directive = 'You skipped Wed W1 mobility. Not optional — protects knee for long run. Do the ankle drills. Ankle lock on Sat run is a form fault this fixes. After work (~7:45 PM): 25–30 min brisk walk — non-negotiable NEAT.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-07-01';

UPDATE daily_plans SET day_name = 'Thu', day_type = 'Run', protein_target = 152, water_target = '2.5L', run_type = 'Easy', run_km = 4, run_pace = '8:00–8:30/km', run_cue = 'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → bodyweight squats 1×10 (slow) → calf raises 1×15 → leg swings 10/side → hip circles 10/side → ankle circles → 1 min easy jog to start · Cadence: 150 BPM · Short quick steps · Complete full 4 km — walk 1 min at 2 km if needed · Knee check at 2 km · COOL-DOWN (8 min): 5 min walk (don''t stop abruptly) → standing wall calf stretch 30s/side → standing quad pull (hand on foot) 30s/side → kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute / IT band stretch 30s/side', workout_plan = NULL, workout_detail = NULL, meals_plan = '— PROTEIN MATH (verified): banana (1g) + 4 eggs (28g) + 2 toast (6g) + curd (8g) + 2 chapati (6g) + dal (12g) + paneer (18g) + whey (24g) + flaxseed (2g) + peanuts (7g) + sprout chaat (10g) + 3 eggs (21g) + 1 egg (7g) + salad (2g) = ~152g · CALORIES ~2,000–2,100 —
6:20 Pre-run — 1 banana + 250ml water
6:40 Warm-up at park
~7:40 Post-run — 4 eggs + 2 whole wheat toast + 1 bowl curd + 500ml water with pinch salt + lemon
1:00 Lunch — 2 chapati + 1 bowl toor dal + 100g paneer
4:00 Snack — 1 scoop whey + 1 tbsp flaxseed + handful peanuts (30g)
8:30 Dinner — 1 bowl sprout chaat + 3 eggs + 1 egg + salad
Supplements — Supradyn after post-run · Creatine 5g with lunch
MONSOON BACKUP: If heavy rain at run time — do 20 min indoor bodyweight cardio (jumping jacks 3×1 min + high knees 3×1 min + mountain climbers 3×30s + burpees 3×8). Reschedule the run to next available dry slot within 48h. Don''t skip — substitute.', directive = 'Full 4 km this time — you stopped at 3.6 km W1. Walk breaks are fine; quitting early is not.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-07-02';

UPDATE daily_plans SET day_name = 'Fri', day_type = 'Bodyweight', protein_target = 151, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'Bodyweight — upper + core', workout_detail = 'WARM-UP (5 min): brisk walk or jog in place 2 min → arm circles 20 → hip circles 10/side → bodyweight squats 1×10 (slow) → push-ups 1×5 (slow) · Pull-ups 4×max · Push-ups 3×max · Rows 3×10 (park bench) · Dead hang 3×20s · Plank 3×40s · Side plank 2×30s · Calf raises 2×15 (light) · 25–30 min · RPE 5–6 · COOL-DOWN (5 min): chest doorway stretch 30s/side → lat stretch 30s/side → shoulder cross-body 30s/side → hip flexor stretch 30s/side → child''s pose 30s', meals_plan = '— PROTEIN MATH (verified): 4 eggs (28g) + poha (4g) + whey (24g) + 2 chapati (6g) + rajma (15g) + paneer (18g) + whey (24g) + walnuts (3g) + 3 eggs (21g) + curd (8g) + 1 chapati (3g) + veggies (3g) = ~154g · CALORIES ~2,000–2,100 —
6:30 Pre-workout — Water + black coffee
7:45 Post-workout — 4 eggs + 1 plate poha + 1 scoop whey (water)
1:00 Lunch — 2 chapati + 1 bowl rajma + 100g paneer
4:30 Snack — 1 scoop whey (water) + 10 walnuts
8:30 Dinner — 3 eggs + 1 chapati + curd + veggies
PRE-LONG-RUN — +1 chapati vs normal rest dinner (~+80 kcal carbs) —
Supplements — Supradyn after post-workout · Creatine 5g with lunch', directive = 'Complete pull-ups and rows this time — you skipped them Fri W1. Upper body only. Carb-forward dinner tonight — not a light dinner. Sleep by 11 PM before long run.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-07-03';

UPDATE daily_plans SET day_name = 'Sat', day_type = 'Run', protein_target = 152, water_target = '2.5L+', run_type = 'Long Easy', run_km = 5.5, run_pace = '8:15–9:00/km', run_cue = 'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → bodyweight squats 1×10 (slow) → calf raises 1×15 → leg swings 10/side → hip circles 10/side → ankle circles → 1 min easy jog to start · Cadence: 150 BPM — NON-NEGOTIABLE · Short steps + fast turnover — not slow shuffle · Walk 1 min at 2.5 km and 4 km if needed · RPE 6 max · COOL-DOWN (8 min): 5 min walk (don''t stop abruptly) → standing wall calf stretch 30s/side → standing quad pull (hand on foot) 30s/side → kneeling hip flexor stretch 30s/side → seated hamstring stretch 30s/side → figure-4 glute / IT band stretch 30s/side · Post-run: foam roll quads + calves', workout_plan = NULL, workout_detail = NULL, meals_plan = '— PROTEIN MATH (verified): banana (1g) + dates (1g) + 4 eggs (28g) + poha (4g) + curd (8g) + 2 chapati (6g) + dal (12g) + paneer (18g) + whey (24g) + whey (24g) + peanuts (7g) + 3 eggs (21g) + dal (12g) + veggies (3g) = ~152g · CALORIES ~2,100–2,200 (highest carb day) —
6:20 Pre-run — 1 banana + 2 dates + 250ml water
6:40 Warm-up — extra 5 min today
~8:00 Post-run — 4 eggs + 1 plate poha (or upma) + curd + 1 scoop whey + 500ml water with pinch salt + lemon
1:00 Lunch — 2 chapati + dal + 100g paneer (don''t skip carbs)
4:00 Snack — 1 scoop whey + handful peanuts (30g)
8:30 Dinner — 3 eggs + dal + veggies
Supplements — Supradyn after post-run · Creatine 5g with lunch
MONSOON BACKUP: If heavy rain at run time — do 20 min indoor bodyweight cardio (jumping jacks 3×1 min + high knees 3×1 min + mountain climbers 3×30s + burpees 3×8). Reschedule the run to next available dry slot within 48h. Don''t skip — substitute.', directive = '5.5 km — +10% from 5 km W1. Metronome 150 BPM on. Verify cadence manually once mid-run (count 30 sec × 2). Finish feeling you could do 500m more.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-07-04';

UPDATE daily_plans SET day_name = 'Sun', day_type = 'Rest', protein_target = 147, water_target = '2L', run_type = NULL, run_km = NULL, run_pace = NULL, run_cue = NULL, workout_plan = 'NEAT walk + recovery', workout_detail = 'Mandatory: 25–30 min brisk walk (morning or ~7:45 PM) · Foam roll quads + calves 5 min', meals_plan = '— PROTEIN MATH (verified): paneer bhurji 80g (14g) + besan chilla 1.5 w/ paneer (17g) + 2 chapati (6g) + dal (12g) + paneer (18g) + salad (2g) + curd (8g) + whey (24g) + roasted chana (8g) + 3 eggs (21g) + hung curd (14g) + veggies (3g) = ~147g · CALORIES ~1,850–1,950 —
8:00 Breakfast — 80g paneer bhurji + 1.5 besan chilla with paneer
1:00 Lunch — 2 chapati + dal + 100g paneer + salad + curd
4:30 Snack — 1 scoop whey (water) + roasted chana (30g)
8:30 Dinner — 3 eggs + hung curd + veggies
Supplements — Supradyn after breakfast · Creatine 5g with lunch', directive = 'Mandatory 25–30 min brisk walk today — not optional. Rest. Close Week 2 clean. If long run moved here due to rain, swap with Sat and run today instead.' WHERE user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' AND date = '2026-07-05';
