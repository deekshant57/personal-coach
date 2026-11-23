# Coaching Log — Namrata

Append-only record of coaching decisions, outcomes, and accumulated insights.

**Athlete:** Namrata · `9e6a0d55-b63f-4857-b318-122e0c337ef4`  
**Authority:** `athletes/namrata/` files only — do not import Deekshant HM / hybrid decisions.

**What goes here:** Decisions made, athlete responses, observed outcomes, insights.  
**What does NOT go here:** Full debrief dumps, raw logs, or invented prescriptions.

**Maintenance:** Summarize at block transitions. Compress if log exceeds ~200 lines.

---

## Entry format

```
### [Date] — [Session type]

**Block:** [block name] · Week [N]
**Context:** [evidence that drove decisions]
**Decisions:**
- [recommendation — confidence: high/moderate/low]
**Athlete response:** Accepted / Rejected / Modified — reason if given
**Outcome:** [when observable]
**Insight:** [later]
```

---

## Entries

### 23 Jul 2026 — Account + profile setup

**Block:** Foundation — Strength + Cardio · pre–Week 1
**Context:** New separate user created. Baseline InBody 260 (Fitworld) logged in app. Confirmed: beginner; gym strength + cardio; 6 mornings/week Fitworld only; eggetarian with Thursday fast; physique goals (leaner waist, fuller hips/glutes, toned arms, overall muscle) over 3–4 months; wake 6:30 / sleep 11:30; office 8–9h stress; no injuries reported.
**Decisions:**
- Keep Namrata fully separate from Deekshant’s hybrid/HM coaching artifacts — confidence: high
- Record InBody machine control numbers as scan data only; do not adopt as coaching targets until prescribed — confidence: high
- Defer Week 1 plan and nutrition anchors until explicitly requested — confidence: high
**Athlete response:** Profile details provided by account owner (Deekshant) on her behalf
**Outcome:** Auth account live; `body_comp_scans` row for 2026-07-23; athlete folder created under `athletes/namrata/`
**Insight:** Short sleep (~5h) + 6-day morning training will need careful volume/intensity pacing when Week 1 is written

---

### 23 Jul 2026 — Week 1 + nutrition anchors

**Block:** Foundation — Strength + Cardio · Week 1
**Context:** Account owner requested Week 1 from today (Thu) plus nutrition anchors. Thursday fasting clarified: milk, fruits, dry fruits all day; chapati/dal/veg only once at dinner.
**Decisions:**
- Week 1 dates: 23–29 Jul 2026 (Thu–Wed); 6 gym mornings Thu–Tue; Wed rest — confidence: high
- Split: Lower / Upper / Lower / Full light / Upper / Lower — glute + arm emphasis, easy cardio each training day — confidence: high
- Reject InBody 2,147 kcal recommendation; set training ~1,800 / Thu ~1,450 / rest ~1,650; protein 95g+ (Thu 70g+) — confidence: moderate
- No whey/supplements prescribed (not confirmed) — confidence: high
- Beginner RPE 5–6, Fitworld machines only — confidence: high
**Athlete response:** Pending (plan seeded to app)
**Outcome:** [Week 1 in progress]
**Insight:** [to be filled]

---

### 23 Jul 2026 — Week 1 revision (Sun rest + whey + no run log)

**Block:** Foundation — Strength + Cardio · Week 1
**Context:** No running (cardio only). Fitworld closed Sundays. Whey confirmed: ON Gold Standard isolate Double Rich Chocolate.
**Decisions:**
- Never set `run_type` for Namrata — cardio lives inside workout detail; she uses Workout log only — confidence: high
- Sunday = Rest (gym closed); move light full-body + longer cardio to Wednesday — confidence: high
- Add 1 scoop whey post-gym (and rest-day breakfast as planned); raise training protein target to ~100g — confidence: high
- Thursday: whey with water/milk allowed under fast protocol — confidence: high
**Athlete response:** Accepted (via account owner)
**Outcome:** Plan re-seeded to app
**Insight:** [to be filled]

---

### 23 Jul 2026 — Supradyn + D3 for Namrata

**Block:** Foundation — Strength + Cardio · Week 1
**Context:** Account owner: Vitamin D insufficient; add Supradyn + Vitamin D (same household pattern).
**Decisions:**
- Enable supplements card for Namrata with keys: Supradyn daily + Uprise D3 60K Thu only — confidence: high
- Do not add Creatine or Omega-3 (not requested) — confidence: high
- Lab ng/mL value still unknown — keep protocol, ask for number when available — confidence: moderate
**Athlete response:** Accepted (via account owner)
**Outcome:** App toggles scoped per athlete; meal plans note Supradyn/D3
**Insight:** [to be filled]

---

### 29 Jul 2026 — Week 1 review + Weeks 2–5 plan + macro fill

**Block:** Foundation — Strength + Cardio · Week 1 → Week 2
**Context:** Reviewed Namrata logs 23–29 Jul. Weight ~48.5–48.7 kg; waist 31" (Mon); sleep 7h then 6.5 / 5h Wed. Gym logged: Thu (substituted — notes: BW squats, leg curl/extension, shrugs, cable pull, DB shoulder press + calf + cardio), Sat lower complete RPE 6, Mon upper RPE 5, Tue lower RPE 6. **Missed Fri + Wed.** Food: whey+eggs working; Thu had lunch paneer (breaks fast rule); custom macros filled. Supplements mostly unlogged (only Sun Supradyn).
**Decisions:**
- Fill custom food macros + fix undercounted egg customs + almond qty scaling on 23 Jul — confidence: high
- Seed Weeks 2–5 (30 Jul – 26 Aug): same Thu–Wed split, Sun rest; Fri/Wed called out as non-negotiable; cardio as single checkbox; +1 set main lifts from Week 3 — confidence: high
- Keep nutrition anchors; reinforce Thu fast (no lunch thali) — confidence: high
- Sleep protection note after 5h Wed — confidence: high
**Athlete response:** Pending
**Outcome:** Macros patched; W2–W5 in app
**Insight:** She follows machine circuit she knows (leg curl/extension/shoulders) when plan feels unfamiliar — allow swaps while keeping hinge + glute thrust

---

### 21 Aug 2026 — Wed/Thu upper stack fix + DB as sole plan SoT

**Block:** Foundation — Strength + Cardio · peak window
**Context:** DB showed Wed “Upper light” + Thu “Light upper (fast)” — nearly identical push/pull compounds two days in a row, then Fri full Upper again. Athlete/owner flagged back-to-back upper. File `week-plans.py` still held full historical weeks (second source of truth).
**Decisions:**
- Weekly template → **Mon Upper · Tue Lower · Wed Cardio+Core · Thu Easy cardio (fast) · Fri Upper · Sat Lower · Sun Rest** — confidence: high
- PATCH upcoming DB days (26–27 Aug, 2 Sep Wed); leave past Wed/Thu as historical — confidence: high
- Empty `athletes/namrata/coach/week-plans.py` — Supabase `daily_plans` is sole live plan source — confidence: high
**Athlete response:** Requested (via account owner)
**Outcome:** DB week 24–30 verified: no consecutive upper-compound days
**Insight:** Soft “upper” on fast day still counts as upper stimulus before Fri — cardio-only on Thu is the right fast-day call

---

### 19 Nov 2026 — Mid-week re-entry plan (from Fri 20)

**Block:** Foundation — Strength + Cardio · re-entry
**Context:** Account owner asked for a plan from tomorrow (Fri); mid-week so keep volume mindful. Last live `daily_plans` ended 2 Sep 2026. Template unchanged: Mon Upper · Tue Lower · Wed Cardio+Core · Thu Easy cardio (fast) · Fri Upper · Sat Lower · Sun Rest. No running; Thu fast intact.
**Decisions:**
- Seed Fri 20 – Sun 29 Nov into Supabase `daily_plans` (via `wire-namrata-reentry-nov2026.py`) — confidence: high
- Fri/Sat stub = reduced re-entry (3-set mains, ~15 min cardio, RPE 4–5) — not peak Week-6 volume mid-week — confidence: high
- Week 23–29 = clean template at beginner re-entry loads (still 3× compounds, 18–20 min cardio, RPE 5–6) — consistency > load — confidence: high
- Nutrition anchors unchanged: training ~1,800 / 100g · Thu ~1,450 / 90g+ · rest ~1,650 / 95g+ — confidence: high
- Never set `run_type` — confidence: high
**Athlete response:** Pending (via account owner)
**Outcome:** 10 days wired in app
**Insight:** [see next entry — full log review done after owner challenge]

---

### 19 Nov 2026 — Full log / food / body-comp review (post-plan)

**Block:** Foundation — Strength + Cardio · re-entry
**Context:** Owner asked whether last logs, performance, body transformation, and intake were read before writing the plan. Honest answer: first pass only skimmed plan rows + thin samples. Full pull done now.
**Evidence:**
- Body: **one** InBody only (23 Jul — 48.2 kg, 35.9% BF, SMM 16.3 under, trunk fat over). No second scan → **no measured transformation**. Scale Jul 23–29 ~48.5–48.7; waist 31" once (27 Jul). Aug 11 vitals `78.25 kg` is garbage (wrong athlete scale) — ignore.
- Gym: **7 logged / 24 planned** gym days Jul 23–Aug 19. Solid Week 1 (missed Fri), then long miss streak, brief return Aug 10–11, then silence. Last log 11 Aug. RPE 5–6; **no kg in exercises_json** → no load progression. Day-1 pattern: swapped to BW squats / curl / extension / shrugs when plan felt unfamiliar.
- Food: 9 logged days (last partial 19 Aug). Good days hit ~100–125g protein (eggs + whey + paneer working). Training kcal often **under** 1,800 (~1,600–1,745). Thu 23 Jul broke fast (lunch paneer + dinner thali). Supplements almost never logged (1× Supradyn).
**Decisions:**
- Keep Fri–Sun reduced re-entry + habit week as written — data supports consistency > load, not a Build bump — confidence: high
- Keep machine-swap language (hinge + glute thrust non-negotiable) — confidence: high
- Do not change calorie/protein anchors until she logs a full week again — confidence: high
- Flag for next debrief: second InBody when 2 clean weeks logged; fix bogus Aug 11 weight if she notices — confidence: moderate
**Athlete response:** N/A (coach process correction)
**Outcome:** Plan stands; coaching memory corrected
**Insight:** Writing plans from empty DB tail without food/workout adherence is incomplete coaching — pull logs first next time

---

### 20 Nov 2026 — Restart week corrected to what she actually did

**Block:** Foundation — Strength + Cardio · re-entry
**Context:** Owner report, not an app log. Restart began Tue 17 (upper: chest, back, biceps, triceps — no shoulders). Wed 18 skipped. Thu 19 was legs and shoulders, on the fast day. She will train Fri 20 and Sat 21. Live plan had Fri as upper and Sat as lower.
**Decisions:**
- Do not put upper on Fri — shoulders were yesterday — confidence: high
- Fri 20 = cardio + core (the missed Wednesday). No upper, no legs — confidence: high
- Sat 21 = easy glutes (RDL + hip thrust). No shoulders. Skip leg press and lunges if quads are sore — confidence: high
- Record Mon 16 off, Tue 17 and Thu 19 completed, Wed 18 skipped. Thursday fast food stays on Thu 19 — confidence: high
- Next week 23–29 returns to the template. Shoulders live on Mon and Fri. Thu 26 is easy cardio only — last Thursday’s legs and shoulders do not repeat — confidence: high
**Athlete response:** Pending (via account owner)
**Outcome:** `daily_plans` 16–29 Nov rewritten
**Insight:** A restart week gets corrected forward. The standing split does not move to match one off-plan Thursday

---

### 23 Nov 2026 — InBody 16 Sep logged (owner report)

**Block:** Foundation — Strength + Cardio · re-entry
**Context:** Owner shared mid-block InBody keys from **16 Sep 2026**: weight 49.2 kg · SMM 17.1 kg · PBF 34.5%. Partial — no segmental / visceral / full printout. Prior DB had only 23 Jul baseline.
**Evidence vs 23 Jul:** weight +1.0 kg · SMM +0.8 kg · PBF −1.4 pp · fat mass ~flat (−0.3 kg est.)
**Decisions:**
- Upsert `body_comp_scans` for 2026-09-16; update `personal-details.md` + `current-block.md` — confidence: high
- Treat as recomp progress during Foundation peak window — do **not** cut calories on scale-up alone — confidence: high
- Keep current re-entry plan + anchors; next full InBody after 1–2 clean logged weeks — confidence: high
- If a photo/PDF of the full sheet appears later, backfill segmental + visceral — confidence: moderate
**Athlete response:** Owner provided metrics
**Outcome:** Second scan now in DB + athlete files
**Insight:** Scale went up for the right reason (muscle). Fat % improved without needing a deficit narrative.

---

### 23 Nov 2026 — Partner-align Upper/Lower with Deekshant

**Block:** Foundation — Strength + Cardio · re-entry
**Context:** Neither trained Mon morning yet. Owner asked to match Upper/Lower on days both lift. Deekshant template fixed: Mon Legs · Wed Push · Fri Pull (runs Tue/Thu/Sat). Namrata Thu fast locked cardio-only. InBody does not require a load/calorie change.
**Decisions:**
- Shift Namrata standing template → **Mon Lower · Tue Cardio+Core · Wed Upper · Thu Easy cardio (fast) · Fri Upper · Sat Lower · Sun Rest** — confidence: high
- PATCH `daily_plans` 23–29 Nov; leave Deekshant unchanged — confidence: high
- Keep full Upper Wed+Fri (not Push/Pull split) so each upper muscle still 2×/week; day-type still matches his gym days — confidence: high
- Sat Lower stays hers solo (he runs) — second glute day preserved — confidence: high
**Athlete response:** Requested (via account owner)
**Outcome:** Week 23–29 rewritten in DB; `current-block.md` + `COACH-CONTEXT.md` updated
**Insight:** She adapts to his gym calendar — his Legs/run sequencing should not move for partner sync
