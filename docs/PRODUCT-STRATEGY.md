# Product Strategy — Personal Coach

**Date:** 02 July 2026
**Status:** Approved direction. Not yet implemented.

---

## 1. Product Vision

The app today is a form collection engine organized by data type. Vitals go here. Food goes there. Runs go here. The user is the integrator — they must mentally connect the dots.

A coach doesn't work that way.

A coach looks at you when you walk in and says: "You slept 5.8 hours, your weight is trending up, and today is your long run. Here's what that means for today."

**The product vision:**

> The app should behave like a coach who has read your entire file, knows what time it is, knows what you've done today, and says the right thing at the right moment.

The organizing principle shifts from **"what kind of data am I entering?"** to **"what does my coach want me to do or know right now?"**

---

## 2. Core User Journey

The daily journey has five distinct moments. Each has different needs.

### Moment 1 — Wake Up (6:20 AM)
**Need:** What does today look like? Log vitals fast.
**Target duration:** 30 seconds.
**Success:** Vitals saved, warm-up visible, out the door.

### Moment 2 — Post-Training (7:15 AM)
**Need:** Log the session. Get feedback.
**Target duration:** 90 seconds.
**Success:** Training logged, immediate observation seen.

### Moment 3 — Meals (throughout day)
**Need:** Log food fast. Know where you stand.
**Target duration:** 45 seconds per slot.
**Success:** Slot filled, protein/calories updated, move on.

### Moment 4 — Close of Day (9 PM)
**Need:** Review and export.
**Target duration:** 60 seconds.
**Success:** Day summary scanned, debrief copied.

### Moment 5 — Monday Morning
**Need:** Weekly review + waist.
**Target duration:** 2 minutes.
**Success:** Last week absorbed, this week understood.

**Total active app time target: under 4 minutes on a normal day.**

---

## 3. Information Architecture

### Current IA (organized by data type)
```
Today (vitals + plan + training + meals summary + supplements + notes)
Food (meal slots + grid + custom items)
Week (7-day plan cards + mileage + debrief card)
Progress (long runs + weight + supplements + body comp)
Debrief (preflight + export)
```

Five sections. Data organized by input type, not by purpose.

### Proposed IA (organized by coaching purpose)

```
Coach (contextual — changes by time, day, completion state)
  |-- Morning brief (plan + vitals input)
  |-- Post-training feedback (after logging)
  |-- Day progress (midday — what's left)
  |-- Day review (evening — summary + export)
  |-- Weekly review (Monday — prior week + new plan)

Food (logging surface — stays as own section)
  |-- Meal slots + grid
  |-- "Same as yesterday" shortcuts
  |-- Running totals (protein + calories)

Plan (forward-looking)
  |-- This week (day cards + completion + mileage)
  |-- Nutrition targets alongside training
  |-- Weekly coach debrief (when available)

Trends (backward-looking — all longitudinal data)
  |-- Body: weight, waist, body comp
  |-- Training: mileage, long runs, pace, cadence
  |-- Nutrition: protein compliance, calorie compliance
  |-- Recovery: sleep, RPE trend
  |-- Habits: cigarettes, supplement adherence
```

Four sections instead of five. Debrief eliminated as a tab. Week becomes Plan. Progress becomes Trends.

---

## 4. Navigation Structure

### Bottom Nav: 4 Tabs

| Tab | Replaces | Rationale |
|---|---|---|
| **Coach** | Today + Debrief | Merges logging home + day review + export. Debrief no longer needs its own tab. |
| **Food** | Food | Stays. Grid UI needs its own surface. |
| **Plan** | Week | Renamed. Adds nutrition summary and coach debrief alongside training plan. |
| **Trends** | Progress | Renamed. Expanded to all tracked dimensions. |

### Why 4 not 5
- **Debrief eliminated:** Its two functions (preflight checklist and clipboard export) move into Coach's evening context.
- **Food stays separate:** Grid UI is physically large and interaction-dense.
- **Plan replaces Week:** "Week" is a time label, not a purpose. The purpose is planning.
- **Trends replaces Progress:** "Progress" implies celebration. The purpose is pattern detection.

### Why Coach not "Today"
"Today" is a time reference. "Coach" tells you what the screen does: this is where the coach talks to you. The content focuses on today but on Monday mornings shows last week's review.

---

## 5. Dashboard Philosophy

**There is no dashboard.**

Dashboards are static summaries. They show the same cards in the same positions regardless of context.

The Coach screen replaces the dashboard with a **contextual coaching surface**. It answers one question: "What should I pay attention to right now?" The answer changes:

- At 6:20 AM: your plan and vitals.
- At 7:15 AM: your training log and post-session feedback.
- At 1:00 PM: your nutrition status and what's left.
- At 9:00 PM: your day summary and export.
- On Monday: your weekly review.

**Completed items compress, pending items expand, and coaching observations surface when they're relevant.**

---

## 6. Coaching Integration Philosophy

### Tier 1 — Inline Observations (Coach screen)
Short, contextual observations that appear after logging. Level 1 and Level 2 intelligence per the Product Bible. "Cadence 148 — highest this month." "Sleep below 7h for 3 consecutive nights. Today: long run."

### Tier 2 — Day Summary (Coach screen, evening)
The day-in-review observation. Connects today's data to training block context. "Protein on target. Sleep trending up — 3rd night above 6.5h."

### Tier 3 — Weekly Review (Plan screen)
The stored coach debrief from the Coach Skill workflow. Detailed, multi-section analysis. Already built via `coach_debriefs` table.

### Tier 4 — Trend Observations (Trends screen)
Pattern-level observations. Proactive — triggered by what the data shows over time. Threshold alerts: "sleep below 7h floor for 3 consecutive days."

**All observations follow the Product Bible's intelligence levels: the app informs, the Coach Skill advises.**

---

## 7. Future Product Direction

### Phase 1: Quick wins + animation fix (current)
Ship the 12 quick wins. Fix the broken spinner. Show calories. Fix the stale weight goal.

### Phase 2: Coach screen restructure
Implement section compression. Dynamic section ordering. Move debrief export to Coach screen. Remove Debrief tab. Move supplement toggles inline. Navigation drops to 4 tabs.

### Phase 3: Food improvements
"Same as yesterday" banner. Food grid cell refinement. Meal deletion confirmation. Clear slot action.

### Phase 4: Trends expansion
Reusable sparkline component. Sleep, cigarettes, cadence sparklines. Protein/calorie compliance strip. Knee dot timeline. Weekly mileage bar chart.

### Phase 5: Plan screen + observations
Nutrition summary on Plan screen. Compact day rows. Observation blocks on Coach screen (Level 1 and 2 intelligence). Monday weekly review block.

### Phase 6: Polish
Skeleton loaders. Focus traps. All accessibility fixes. Context-adaptive copy.

### Beyond: Close the coaching loop
Bring Coach Skill responses back into the app automatically. Daily observations. In-app coaching endpoint (long-term).
