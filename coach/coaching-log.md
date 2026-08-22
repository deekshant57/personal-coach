# Coaching Log

Append-only record of coaching decisions, outcomes, and accumulated insights.

The coach reads this file before every session. It provides memory across conversations so that coaching evolves with the athlete rather than starting fresh each time.

**What goes here:** Decisions made, athlete responses, observed outcomes, and coaching insights.
**What does NOT go here:** Full debrief text (archived in `coach_debriefs` via `save-weekly-debrief`), raw data, or chain-of-thought reasoning.

**Maintenance:** Review and summarize older entries during training block transitions. If the log exceeds ~200 lines, compress resolved entries into a block summary.

---

## Entry format

```
### [Date] — [Session type]

**Block:** [block name] · Week [N]
**Context:** [evidence and events that drove decisions]
**Decisions:**
- [recommendation — confidence: high/moderate/low]
**Athlete response:** Accepted / Rejected / Modified — reason if given
**Outcome:** [filled in when observable — what actually happened]
**Insight:** [filled in later — what this taught us about this athlete]
```

---

## Entries

### 22 Jun 2026 — Block Start (retrospective)

**Block:** HM Build — Base Phase · Week 1
**Context:** Athlete restarting after 3+ months of inactivity. Last run was early Jun (5 km at 7:50/km, cadence 142, RPE 7, knee: minor pressure). Previous HM attempt stopped at 10 km due to knee pain. Current weight 78.55 kg. Triglycerides elevated (227). Vitamin D insufficient (23.4).
**Decisions:**
- Start with 12 km/week, easy runs only, bodyweight strength (no gym) — confidence: high
- Protein floor 140–150g/day, deficit 15–18% (~2,050 kcal run days, ~1,900 rest days) — confidence: high
- Cadence target 150+ BPM with metronome awareness — confidence: high
- No squats/lunges on days before runs (leg freshness for knee protection) — confidence: high
- Supplement protocol: D3 60K weekly, Supradyn daily, creatine 5g, algae omega-3 for TG — confidence: high
**Athlete response:** Accepted (full plan adopted)
**Outcome:** [to be filled after Week 1 debrief]
**Insight:** [to be filled]

---

### 29 Jun 2026 — Weekly Debrief (retrospective)

**Block:** HM Build — Base Phase · Week 1 → Week 2
**Context:** Week 1 completed. First structured training week after extended break. Week 2 plan issued.
**Decisions:**
- Week 2 mileage: 12.5 km (+10% from 12 km cap respected) — confidence: high
- Continue bodyweight only, no gym until Week 3 (~7 Jul) — confidence: high
- Cadence focus: 150 BPM metronome on every run — confidence: high
- Breakfast rotation: poha/chilla/upma (reduce chapati frequency at breakfast) — confidence: moderate
- Legume rotation for protein variety: chana, rajma, dal — confidence: moderate
**Athlete response:** Accepted (full plan adopted)
**Outcome:** [Week 2 in progress — to be evaluated at next Monday debrief]
**Insight:** [to be filled]

---

### 01 Jul 2026 — Target revision

**Block:** HM Build — Base Phase · Week 2
**Context:** Original race-day target was 70–71 kg. Coaching review (Jul 1) concluded aggressive cut risks muscle loss and knee load during HM build. Athlete at ~78.5 kg with 9 weeks to race.
**Decisions:**
- Revise race-day weight target to 73–74 kg — confidence: high
- Revise fat-loss expectation to 4–6 kg from restart (not 7–8 kg) — confidence: high
**Athlete response:** Accepted
**Outcome:** Canonical target updated in `personal-details.md`, coach files, and app (`weight-trend.js`).
**Insight:** Realistic race weight preserves performance and lean mass better than chasing lowest possible number.

---

### 7 Jul 2026 — Weekly Debrief

**Block:** HM Build — Base Phase · Week 2 → Week 3
**Context:** W2 mileage 12.68/12.5 km, all runs completed, knee pain-free, long run 5.61 km at 8:13/km. Protein 1/7 days on floor. Sat alcohol binge. Mon/Fri bodyweight missed or partial. Cadence still below 150 SPM in app data. Weight trend 78.5 → 77.25 kg over 2 weeks; waist 40 → 39 in.
**Decisions:**
- Week 3: 14 km total, 6.5 km long run — confidence: high
- Gym starts light Mon/Fri — no heavy squats/deadlifts — confidence: high
- 150 BPM metronome every run until cadence verified — confidence: high
- Zero alcohol until TG retest; protein 140g floor with bedtime whey backup — confidence: high
- Knee: hold progression, no volume cut — confidence: high
**Athlete response:** [to be filled by athlete — accepted / rejected / modified]
**Outcome:** [Week 3 in progress — evaluate at next Monday debrief]
**Previous decisions updated:**
- Week 2 mileage 12.5 km (29 Jun debrief): Outcome — hit 12.68 km ✅
- Continue bodyweight only until Week 3: Outcome — gym starts 7 Jul; Mon 6 Jul rain backup (pushups + JJ) acceptable
- Cadence 150 BPM focus: Outcome — not achieved in app data; manual count on Thu suggests possible measurement error
- Breakfast rotation: Outcome — partial; poha logged, chapati still at breakfast some days
- Race weight 73–74 kg (1 Jul revision): Outcome — on track at −1.25 kg over 2 weeks
**Insight:** [to be filled]

---

### 21 Jul 2026 — Return from travel + Course correction

**Block:** HM Build — Base Phase continues · Week 5 (Return Week)
**Context:** Athlete skipped Week 4 (14–20 Jul) entirely due to travel. Last meaningful run was 4.52 km on 9 Jul (minor knee pressure). First gym session never completed in W3–W4. Return run today 2.01 km @ 7:46/km, cadence 149, knee pain-free. Weight 76.65 kg (stable through travel). Protein 2/6 days on floor since 7 Jul. Jul 7 knee discomfort confirmed linked to jumping jacks rain backup + low protein recovery. Race: 6 Sep 2026 — 7 weeks out.
**Decisions:**
- W5 (21–27 Jul): Return week — ~10.5 km, gym Session 1 Fri only (Push + Core, RPE 5–6, find weights), NO tempo, NO Bulgarian split squat, long run 5 km — confidence: high
- W6 (28 Jul–3 Aug): Build phase begins — 14 km, first tempo (2 km @ 7:00/km), gym Session 2 Push Mon + Pull Fri (light RDL, no Bulgarian), long run 6.5 km — confidence: high
- W7 (3–9 Aug): Deload — ~12 km, no tempo, Bulgarian split squat only if knee fully clear W6 — confidence: high
- Protein 140g floor every day without exception; creatine + omega-3 back on schedule — confidence: high
- Knee: no Bulgarian split squat until 2+ weeks pain-free; no jumping jacks in any rain backup — confidence: high
- Build phase entry revised: 28 Jul (was 21 Jul in original plan) — confidence: high
**Athlete response:** [to be filled]
**Outcome:** [evaluate at next Monday debrief — 28 Jul]
**Previous decisions updated:**
- Week 3 gym starts 7 Jul: Outcome — gym never started (rain + travel); first session now Fri 24 Jul
- Week 3 14 km / long run 6.5 km: Outcome — only 6.55 km total, no long run >5 km due to knee + rain
- Knee hold progression: Outcome — minor pressure Jul 9 after mobility Jul 8; pain-free today Jul 21
- Protein 140g floor: Outcome — 2/6 days since Jul 7; travel disrupted nutrition
**Insight:** Travel gaps without a modified plan cause cascading resets. Future travel weeks need a minimum maintenance plan written in advance (3 easy runs + protein floor as the only non-negotiables).

---

### 23 Jul 2026 — InBody scan + goal alignment

**Block:** HM Build — Return Week (W5)
**Context:** First gym InBody (Fitworld / All Time Fitness). Weight 76.8 kg · SMM 29.4 kg (floor) · fat mass 24.5 kg · PBF 31.9% · visceral 11 · WHR 1.02 · BMR 1,590 · score 60. Height on machine 175 cm; athlete confirmed correct height **176 cm** (use on next scan). Vs Dec 2024: +2.0 kg weight, −1.5 kg SMM, BF 26.5% → 31.9%. Machine ideal 68.2 kg / −14.2 kg fat / +5.6 kg muscle rejected for HM timeline (~6 weeks to race).
**Decisions:**
- Keep race weight 73–74 kg; reject InBody ideal 68.2 kg for this block — confidence: high
- Revise race-day BF target from 18–19% → ~26–28% (realistic from 31.9% with −4–6 kg fat) — confidence: high
- Fat-loss action goal unchanged: −4–6 kg fat mass; trunk/visceral priority — confidence: high
- Muscle goal: preserve SMM ≥ 29.4 kg; regain toward 30+ (~0.5–1 kg pre-race); +1–2 kg deferred post-race — confidence: high
- Calorie anchors: maintenance ~2,250–2,350 (InBody 2,267 ≈ maintenance); training days ≥2,050; rest ~1,900; do not eat to 2,267 during cut — confidence: high
- Protein floor: 150g preferred / 140g absolute (SMM + soft-tissue protein at floor) — confidence: high
- Training plan W5–W7 unchanged (return → build → deload) — confidence: high
- Next scan: 4–6 weeks (late Aug / post-race) on same machine if possible — confidence: medium
**Athlete response:** Accepted — update canonical files
**Outcome:** `personal-details.md`, `coach/current-block.md`, `body-comp.mdc` updated
**Previous decisions updated:**
- Race weight 73–74 kg (1 Jul): Outcome — confirmed vs InBody; still correct
- Race BF 18–19% (profile): Outcome — revised to ~26–28% after measured 31.9% baseline
- Fat loss 4–6 kg (Jul revision): Outcome — still valid; now anchored to 24.5 kg fat mass
**Insight:** BMI-normal + high PBF (“C-shape”) means scale alone understates risk. Visceral 11 + WHR 1.02 make trunk fat and protein adherence the composition KPIs until race; absolute muscle gain is a post-race project.

---

### 25 Jul 2026 — Meal swap options expanded

**Block:** HM Build — Return Week (W5) → Build (W6)
**Context:** Athlete requested more practical food options without removing existing plan items. Candidates: quinoa, lobia, moong chilla, besan chilla.
**Decisions:**
- Keep all prior foods as options; add approved swaps only where macros fit — confidence: high
- Breakfast/post-run carb: poha / upma / quinoa / moong chilla / besan chilla — confidence: high
- Legume rotation: dal / chana / rajma / lobia / palak dal (1:1 bowl) — confidence: high
- Quinoa = carb swap (not a full legume replacement); lobia = 1:1 with chana/rajma/dal — confidence: high
- Grid: add Quinoa + Lobia; chillas already present — confidence: high
**Athlete response:** Requested
**Outcome:** W5 Sat–Sun + W6 meals updated with OR options + SWAPS footer; nutrition rule table added. 25 Jul: oats, chana dal, chhole, idli/dosa+sambar added; Greek yogurt rejected (cost); kala chana, uttapam+sambar, palak/matar paneer added.
**Previous decisions updated:**
- Breakfast rotation poha/chilla/upma: Outcome — expanded to include quinoa
- Legume rotation chana/rajma/dal: Outcome — expanded to include lobia
### 21 Aug 2026 — Phase 1 sequencing fix + DB as plan source of truth

**Block:** Phase 1 — Hypertrophy + Base · Week 2
**Context:** Athlete flagged Tue run → Wed Legs → Thu run (3-day lower stack). DB confirmed Wed Legs; `current-block.md` still said Wed Pull / Fri Legs. `week-plans.py` still held cancelled 6 Sep HM peak/taper weeks.
**Decisions:**
- Correct weekly template to **Mon Legs · Tue Easy · Wed Push · Thu Easy · Fri Pull · Sat Long · Sun Rest** — confidence: high
- PATCH `daily_plans` for 24 Aug – 27 Sep 2026 (swap Mon↔Wed gym); leave 17–23 Aug as historical — confidence: high
- Remove live weeks from `coach/week-plans.py` / `sync-plans.sql` / app embedded fallback — **Supabase `daily_plans` is sole source of truth** — confidence: high
- Audit via `audit-week-plan.py` after every plan change — confidence: high
**Athlete response:** Requested
**Previous decisions updated:**
- No squats/lunges on days before runs: Outcome — refined: hard lower OK before *easy* run after rest day; never before long/tempo; never Legs between two runs
**Insight:** File-based plans drifted from DB; verify against DB first.

---
