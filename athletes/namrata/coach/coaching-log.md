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
