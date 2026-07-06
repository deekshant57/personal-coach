# UX Audit — Personal Coach PWA

**Date:** 02 July 2026
**Scope:** Single-user evaluation — Deekshant's daily coaching workflow
**Overall UX Score:** 62 / 100

---

## Dimension Scores

| Dimension | Score | Notes |
|---|---|---|
| Information Architecture | 7/10 | Coherent for your workflow |
| Navigation | 7/10 | 5-tab model works; some dead ends |
| Visual Design | 7/10 | Clean dark theme; good restraint |
| Interaction Design | 4/10 | All animations killed; several friction points |
| Logging Friction | 5/10 | Food grid is fast per-item but slow per-day; gym days are heavy |
| Coaching Value Returned | 3/10 | Data goes in, almost nothing comes back inside the app |
| Data Visibility | 4/10 | Tracks 10+ dimensions, shows trends for 4 |
| Error/Loading States | 5/10 | Loading overlays exist; some get stuck |
| Daily Workflow Efficiency | 6/10 | Functional but not optimized for repetition |

---

## Executive Summary

The daily loop works. Vitals, training, food, supplements, debrief is coherent, and the date-as-global-state pattern is sound. The food tap-grid is genuinely faster than any alternative for your specific diet. The Week tab's +10% mileage warning is real coaching intelligence. The debrief preflight checklist enforces data completeness.

The central problem: you log 15+ data points every day and the app gives you nothing back. The coaching happens outside the product, in Cursor. Inside the app, there is no feedback, no trend surfacing, no insight.

The second problem is friction. Food logging across 4-6 meal slots is the slowest part of the day, and you eat many of the same meals repeatedly with no shortcut. Workout logging on gym days is significantly more complex than run logging.

The third problem is dead information. You track sleep, cigarettes, cadence, RPE, and knee status daily, but only weight and long runs have trend views.

---

## Biggest Product Risks

### Risk 1: You log everything and the app tells you nothing
You enter weight, sleep, cigarettes, waist, run data, workout sets, 4-6 meal slots, supplement toggles, and notes every day. The app stores all of it. But the only place you see data reflected back is: protein bar (one number), weight sparkline (one chart), long-run bars (one chart), supplement adherence (one percentage). Sleep trend? Nothing. Cigarette trend? Nothing. RPE trend? Nothing. Knee status history? Nothing. Cadence progression? Nothing. Calorie compliance? Hidden.

### Risk 2: Food logging doesn't learn from your behavior
You eat many of the same meals repeatedly. Every day, you start from zero on the food grid, re-adding the same items across the same slots. No "same as yesterday," no recent foods, no meal templates. This is the highest-friction daily interaction.

### Risk 3: The coaching loop is broken in half
The app's output goes to Cursor. The coaching response comes back in Cursor. The `coach_debriefs` table and Week tab prove you've built infrastructure to bring coaching responses back — but daily coaching feedback never makes it back. You check the app 4-5 times per day and never see a coaching response inside it.

### Risk 4: The spinner doesn't spin
The global CSS override at line 2931 (`animation: none !important; transition: none !important`) kills every animation in the app, including the loading spinner. During every data fetch, you see a frozen green arc.

---

## Critical Issues

### C1: All animations and transitions are globally disabled
`css/style.css:2931-2938` contains `animation: none !important; transition: none !important` on `*, *::before, *::after`. This kills: the loading spinner rotation, protein bar fill animation, toast fade-in/out, modal slide-up, collapse/expand transitions, supplement focus pulse, save-state pulse, and coach debrief chevron rotation. Every defined `@keyframes` and `transition` is dead code. The loading spinner is a static green arc. Toasts appear and vanish in a single frame.

### C2: The protein bar hides calories by default
The sticky header shows `0g / 148g protein` but the calorie counter is hidden (`.hidden` on `#calorie-current`). You have explicit daily calorie targets and you're in a ~500 kcal deficit. Tracking protein without persistent calorie visibility is tracking half the equation.

### C3: RPE defaults to 5 instead of requiring explicit input
Both run and workout RPE sliders initialize at `value=5` (moderate). If you forget to adjust, the coach receives plausible-but-wrong data. RPE is a subjective readiness signal — false RPE 5s mask fatigue patterns.

### C4: Weight goal is already stale
`weight-trend.js` has `WEIGHT_GOAL_KG = 70.5` and displays `"Race goal: 70-71 kg"`. Your agreed target (Jul 1) is 73-74 kg by race day. The sparkline goal line points at the wrong number.

### C5: Debrief blocks entirely on incomplete logging
The copy button is disabled until every single item is logged. If you forget one supplement toggle or skip a snack slot, you cannot export the debrief at all. A coach would rather have 90% of the data than 0%.

---

## Medium Issues

### M1: No trends for sleep, cigarettes, cadence, RPE, or knee status
You track these daily. None have a visualization. Your coaching priorities explicitly include sleep floor (7h minimum), cigarette reduction, cadence improvement (target 150-155), and knee monitoring.

### M2: No "same as yesterday" or recent foods in food logging
Your food grid has 29 items + custom entry. On a typical day, you log 4-6 meal slots. Many meals repeat across days. Each slot starts empty. No copy, no frequent items, no templates.

### M3: The Week tab shows no nutrition data
Week cards show training plans and completion badges but zero nutrition information. No total protein, no average calories, no protein adherence trend. Your coach reviews both training load AND nutrition compliance weekly.

### M4: Workout logging (gym days) is significantly heavier than run logging
Run logging: 6 fields + segmented control + notes (~60 seconds). Gym logging: 6+ exercise cards x 3-4 sets each x multiple taps per set. A Push+Core day with 6 exercises at 3 sets each is 18+ set interactions. This becomes the biggest friction point starting Jul 7.

### M5: "Coach says" banner is workflow guidance, not coaching
`#coach-next` says things like "Log morning weight and sleep first." These are task-list nudges, not coaching insights. The same banner position could deliver actual coaching.

### M6: Past days show editable forms instead of a read-only summary
When navigating to a past date, you see the same input forms pre-filled with saved values. No visual distinction between "reviewing Tuesday" and "editing Tuesday."

### M7: Body comp scan "Loading..." persists on fetch failure
The three Progress tab cards show "Loading..." as their initial state. If Supabase fetch fails, they stay stuck forever. No error message, no retry.

### M8: Meal deletion has no confirmation or undo
Tapping the x on a logged meal in the Today tab immediately deletes it from Supabase. No confirmation dialog, no undo.

### M9: The Debrief tab's preview shows raw markdown
The preview renders in monospace with `##` headers and `**bold**` markers visible as raw text. Could render as formatted HTML for easier verification.

### M10: Toast duration (2000ms) with killed animations = invisible feedback
Toasts appear and disappear in a single frame because transitions are disabled. The "Saved" toast, the "Error" toast — all flash instantly.

---

## Minor Issues

1. **m1:** Vitals "Cigs" field accepts negative numbers (no `min="0"` attribute).
2. **m2:** `confirm()` dialog for scan deletion is a browser-native dialog that breaks the dark theme visual language.
3. **m3:** Notes card placeholder "Anything that deviated from the plan..." is misleading on rest days.
4. **m4:** Knee status segments don't show severity color until selected. All inactive segments are the same gray.
5. **m5:** Custom food modal rounds protein and calories to integers (`inputmode="numeric"`). Loses precision.
6. **m6:** Food grid hint "Tap ADD, then use - / + on the item" is permanently visible noise.
7. **m7:** "Log Food" button on Meals Summary is always visible even when all meals are logged.
8. **m8:** Service worker cache version (`coach-v19`) must be manually bumped on every deploy.
9. **m9:** D3 supplement row is hidden 6 days a week. Visual shift is jarring on Thursdays. No awareness of D3 on other days.
10. **m10:** Date navigation prevents going past current week's Sunday from Today tab.
11. **m11:** `formatDate()` is duplicated in `app.js` and `week-stats.js` (circular import workaround).

---

## Screen-by-Screen Findings

### Today Tab
- **Purpose justified:** Yes. Daily command center. Correct home screen.
- **Vitals card:** Auto-collapse after save is good but re-expand affordance is weak. Chevron is 20px and `--text-muted`. Used at 6:20 AM.
- **Plan directive:** Green left-border styling is the strongest visual hierarchy element. Good. But warm-up/cool-down is hidden in a collapsed section. On run days at 6:30 AM, this adds friction.
- **Training card (runs):** Well-structured. Knee segmented control is good. Auto-pace calculation is useful.
- **Training card (workouts):** Native `<details>` element for "Log something else..." doesn't match app's custom collapsible styling.
- **Meals Summary:** Shows logged meals but no per-meal macro breakdown.
- **Supplements card:** 7-day history strip is genuinely good. Best micro-feature in the app.
- **Notes card:** Save button is `btn-secondary` while supplement save is `btn-primary`. Inconsistent.
- **Scroll depth:** On gym days, potentially 2000+ pixels of scroll.

### Food Tab
- **Purpose justified:** Yes. Core differentiator.
- **Strengths:** Sticky footer with running macro totals. Slot-pill system. Dirty-slot guard modal.
- **Missing:** "Clear slot" action. Calorie visibility in footer. Memory of past meals.
- **Food coach banner:** Shows data quality alerts framed as coaching. It's not coaching.

### Week Tab
- **Purpose justified:** Yes.
- **+10% mileage warning:** Best coaching feature in the app.
- **Coach debrief card:** Only place coaching feedback appears inside the app.
- **Completion badges too small.** Can't scan all 7 days' completion status at a glance.
- **Missing:** Weekly nutrition aggregate.

### Progress Tab
- **Purpose justified:** Yes, but under-delivering.
- **Long-run bar chart:** Clear, useful.
- **Weight sparkline:** Good. Coaching copy ("watch 2+ week trends") is excellent.
- **Missing:** Sleep trend, cigarette trend, cadence trend, RPE trend, knee status history, calorie compliance trend.

### Debrief Tab
- **Purpose:** Partially justified. Preflight checklist has value. But the tab is named "Debrief" and contains no debrief.
- **Blocking behavior is the biggest friction issue.**
- **Monospace preview** doesn't help verify data correctness.
- **Monday check-in line** is useful but buried in a clipboard blob.

---

## Accessibility Findings

| Issue | Impact |
|---|---|
| Spinner doesn't animate — frozen green arc during loading | Looks broken; no confidence data is loading |
| `user-scalable=no` prevents pinch zoom | Can't zoom into small text if needed |
| Toast appears/disappears in one frame (no transition) | Miss save confirmations, especially at 6:20 AM |
| No focus indicators (transitions killed) | No visual feedback on active element |
| RPE slider value not visually connected to slider on small screens | Easy to set RPE without noticing displayed value |
| Weight sparkline SVG has no accessible alternative text | Screen readers encounter empty SVG |
| Toast has no `role="alert"` | Save confirmations not announced |
| Custom food modal has no focus trap | Tab key can reach elements behind modal |
| Bottom nav has no `role="navigation"` or `aria-label` | Missing landmark |
| `confirm()` dialogs break visual language | Browser-native white dialog on dark app |

---

## Responsiveness Findings

| Issue | Impact |
|---|---|
| Fixed bottom nav + sticky header consume ~130px of viewport | ~570px usable on standard phone. Heavy scrolling on gym days. |
| Food grid at 3 columns | Works but cells are tight on smaller phones. |
| Debrief preview (`max-height: 60vh`) | Unusably short in landscape. |
| No landscape accommodation | If phone rotates mid-logging, layout doesn't adapt. |

---

## Copywriting Findings

| Location | Current | Issue |
|---|---|---|
| Debrief intro | "Copy your daily log into Cursor for coaching feedback." | References a specific third-party tool. |
| Debrief button (disabled) | "Complete logging to copy" | Grammatically awkward. |
| Training toggle | "Mark as Done" | Text doesn't change after toggling. |
| Weight sparkline hint | "Scale weight from morning vitals; watch 2+ week trends." | Best copy in the app. Should be the standard. |
| Plan directive (loading) | "Loading plan..." | Hangs forever if fetch fails. |
| Notes placeholder (rest day) | "Anything that deviated from the plan..." | No plan to deviate from on rest days. |
| Food coach banner | Labeled as "coach" banner | It's a data quality alert, not coaching. |

---

## Features That Don't Justify Their Existence

1. **Supplement notes field** — If you missed a dose, you just don't toggle it. The note adds friction to a 4-tap interaction.
2. **Water target in database** — `daily_plans.water_target` stores "2L" but the UI never displays or tracks water intake. Dead schema.
3. **Food grid emoji column** — Takes ~25% of cell width. You scan by name, not emoji. Decorative cost in space-constrained layout.

---

## Missing Experiences

1. **Trend views for sleep, cigarettes, cadence, RPE, knee status** — Tracked daily, no visualization.
2. **Quick-log patterns for food** — No copy from yesterday, no recent/frequent foods, no templates.
3. **Coaching feedback inside the app** — Daily coaching response never makes it back.
4. **Weekly nutrition summary** — Week tab shows mileage but not nutrition compliance.
5. **Calorie visibility alongside protein** — Calorie targets exist, protein bar is persistent, calories hidden.
6. **Warm-up auto-expand on training days** — At 6:30 AM in the park, warm-up should be visible without tapping.

---

## Biggest Opportunities

1. **Fix the spinner and restore selective animations** — Single CSS change. Fixes broken-loading perception, invisible toasts, zero-feedback interactions.
2. **Add sparklines for sleep, cigarettes, and cadence** — Data already in Supabase. Three more sparklines surface the most coaching-relevant behavioral metrics.
3. **Add "copy yesterday's meal" to food** — Cut food logging time by 30-50% on days with repeated meals.
4. **Show calories persistently alongside protein** — Un-hide `#calorie-current`. One-line CSS change, high coaching impact.
5. **Surface coaching insights in the "Coach says" banner** — Replace workflow nudges with actual observations from data.
