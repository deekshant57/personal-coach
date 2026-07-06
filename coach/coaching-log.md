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
