# Screen Redesign Specifications

**Date:** 02 July 2026
**Status:** Proposed. Not yet implemented.

---

## Table of Contents

1. [Coach Screen](#1-coach-screen)
2. [Food Screen](#2-food-screen)
3. [Plan Screen](#3-plan-screen)
4. [Trends Screen](#4-trends-screen)

---

## 1. Coach Screen

**Replaces:** Today tab + Debrief tab

### Current Problems
1. Static layout regardless of time or completion state.
2. Six cards stacked vertically. On gym days, scroll depth exceeds 2000px.
3. Completed sections don't get out of the way.
4. Warm-up is collapsed on training mornings when needed most.
5. "Coach says" banner gives workflow nudges, not observations.
6. No feedback after logging anything.
7. Debrief is on a separate tab, blocked by any single incomplete item.
8. Supplement D3 row disappears 6 days a week.

### Goals
- First thing you see should be the first thing you need.
- Completed sections compress to one-line summaries.
- Observations (Level 1 and 2) appear inline after logging.
- Debrief export is a button in the evening context, not a separate tab.
- Scroll depth stays under ~1200px regardless of day type.

### Layout Philosophy

The screen is a stack of **sections**, not cards. Sections have three states:
- **Active** — expanded, primary.
- **Done** — compressed to a single summary line.
- **Hidden** — not relevant today.

**Dynamic ordering rules:**
1. Done sections move above pending sections.
2. Within pending sections, order follows natural day flow: vitals -> training -> meals -> supplements -> notes.

### State Machine

```
                     +----------------+
          app open   |    MORNING     |
          ---------> |  Plan brief    |
                     |  Vitals form   |
                     |  Warm-up       |
                     +-------+--------+
                             | vitals saved
                             v
                     +----------------+
                     |   PRE-TRAIN    |
                     |  Vitals done   |  (compressed)
                     |  Training      |  (form expanded)
                     |  Warm-up       |
                     +-------+--------+
                             | training marked done
                             v
                     +----------------+
                     |  POST-TRAIN    |
                     |  Vitals done   |  (compressed)
                     |  Training done |  (compressed)
                     |  Observation   |  (contextual text)
                     |  Meals link    |
                     |  Supps         |  (toggles inline)
                     +-------+--------+
                             | meals + supps done
                             v
                     +----------------+
                     |    EVENING     |
                     |  Day summary   |  (all compressed)
                     |  Observation   |
                     |  Notes         |
                     |  [Copy Log]    |
                     +----------------+

On Mondays, before MORNING:
                     +----------------+
                     | WEEKLY REVIEW  |
                     |  Last week     |
                     |  This week     |
                     |  Vitals+Waist  |
                     +-------+--------+
                             | vitals saved
                             v
                          MORNING (normal flow)
```

State is determined by checking existing global state: `state.vitals`, `state.runLog`/`state.workoutLog`, `state.foodLogs`, `state.supplementLog`. No new state management needed.

### Wireframes

**Morning state (nothing logged):**
```
+-------------------------------+
| Sun Run day - 63 days to race |  <- day brief
+-------------------------------+
| "5 km easy - 7:30-8:00/km    |  <- training brief
|  Warm-up: 5 min walk -> ...  |  <- auto-expanded on training days
|  [full warm-up text]"        |
+-------------------------------+
| Weight [___] Sleep [___]     |  <- vitals inline
| Cigs   [___]                 |
| [Save vitals]                |
+-------------------------------+
| o Vitals  o Run  oooo Meals  |  <- progress strip
| o Supps                      |
+-------------------------------+
```

**Post-vitals state:**
```
+-------------------------------+
| Sun Run day - 63 days to race |
+-------------------------------+
| check 77.4 kg - 6.8h - 3 cigs|  <- vitals compressed
+-------------------------------+
| Training: 5 km easy           |
| Warm-up: [visible]           |
| ---                          |
| Actual km [___] Time [___]   |  <- training inputs
| Pace [auto]  Cadence [___]   |
| RPE [--slider--]             |
| Knee [*free oMinor oDisc o]  |
| Notes [____________________] |
| [Mark as Done]               |
+-------------------------------+
| check Vitals  o Run  oooo Mea|
| o Supps                      |
+-------------------------------+
```

**Post-training state:**
```
+-------------------------------+
| Sun Run day - 63 days to race |
+-------------------------------+
| check 77.4 kg - 6.8h - 3 cigs|
| check 5.2 km - 7:42/km - 148 |  <- training compressed
+-------------------------------+
| "Cadence 148 -- 2 away from  |  <- observation (Level 1)
|  target. Knee clear."        |
+-------------------------------+
| Meals: 0/5 logged            |
| [Log Food ->]                |
+-------------------------------+
| [ ] Supradyn  [ ] Creatine   |  <- supplement toggles inline
| [ ] Omega-3   (D3: Thu)      |
| [Save]                       |
+-------------------------------+
| check Vitals check Run oooo M|
| o Supps                      |
+-------------------------------+
```

**Evening state (most logged):**
```
+-------------------------------+
| Day Summary -- 01 Jul, 26    |
+-------------------------------+
| check 77.4 kg - 6.8h - 3 cigs|
| check 5.2 km - 7:42/km - 148 |
| check 148g P - 2,040 kcal    |
| check Supps 3/3              |
+-------------------------------+
| "Protein on target. Sleep    |  <- evening observation
|  trending up -- 3rd night    |
|  above 6.5h."               |
+-------------------------------+
| Notes [____________________] |
| [Save notes]                 |
+-------------------------------+
| [Copy Day Log]               |  <- debrief export
|  > Preview                   |  <- expandable
+-------------------------------+
```

**Monday morning state:**
```
+-------------------------------+
| Monday - Week 3 starts       |
+-------------------------------+
| Last week                    |
| 11.2 / 12 km - 3 runs       |
| Longest: 5.2 km - Sleep     |
| avg 6.4h - Knee: clear      |
| Cigs avg: 3.1               |
| Weight: 78.1 -> 77.4 (-0.7) |
| ---                         |
| This week: 15 km - 4 runs   |
| Tempo run introduced Thu     |
+-------------------------------+
| Weight [___] Sleep [___]     |
| Cigs   [___] Waist [___]    |  <- waist visible on Monday
| [Save vitals]                |
+-------------------------------+
```

### Interaction Changes

| Change | Priority |
|---|---|
| Sections auto-compress on completion | High Impact / High Effort |
| Training log surfaces as primary when pending | High Impact / Medium Effort |
| Warm-up auto-expanded on training days | High Impact / Low Effort |
| Supplement toggles inline on Coach | High Impact / Low Effort |
| Debrief export button on Coach screen | High Impact / Medium Effort |
| Monday weekly review block at top | High Impact / Medium Effort |
| Observation text after training/vitals save | High Impact / High Effort |

### Copy Improvements

| Current | Proposed | Reason |
|---|---|---|
| "Morning Vitals" (card title) | Remove title. Fields are self-evident. | Less scroll. |
| "Today's Plan" (card title) | "Run day - 63 days to race" | Contextual, informative. |
| "Coach says: Log morning weight first" | Workflow nudges only when no data to observe. Otherwise Level 1/2 observations. | Actual value, not task-list. |
| "Mark as Done" | Text changes to "Done" after toggle. | Clarity. |
| "Complete logging to copy" (disabled) | "Copy Day Log" (enabled always, with soft warning if incomplete) | Don't block the export. |
| "Notes / Deviations" | "Notes" | "Deviations" implies failure. |
| Placeholder: "Anything that deviated..." | Training: "How did the session feel?" / Rest: "How are you recovering?" | Context-adaptive. |

### Loading States

| State | Design |
|---|---|
| Plan loading | Skeleton: one 60% width line + two 40% width lines. No spinner. |
| Vitals loading | Fields appear immediately with no values. No loading state needed. |
| Save in progress | Button text -> "Saving..." with disabled state. No layout shift. |
| Section compressing | Crossfade: fields fade out (150ms), summary line fades in (150ms). |

### Error States

| Error | Design |
|---|---|
| Vitals save failure | Button shakes (200ms), red border, text -> "Retry". Error message below. |
| Plan fetch failure | Replace skeleton with "Couldn't load today's plan. [Retry]". |
| Debrief copy failure | Toast with error variant: "Copy failed -- try again." |

### Success States

| Action | Feedback |
|---|---|
| Vitals saved | Fields crossfade to compressed summary. Subtle green flash on icon (200ms). |
| Training marked done | Button fills green. Observation fades in (300ms delay). |
| Debrief copied | Button text -> "Copied" (1500ms), then reverts. |

### Accessibility

| Change | Priority |
|---|---|
| Compressed summary lines expandable via tap AND keyboard Enter | High / Low |
| Progress strip chips: `role="list"` and `role="listitem"` | Low / Low |
| Observation text: `role="status"` and `aria-live="polite"` | High / Low |
| Export button announces "Copied" via `aria-live` region | High / Low |

---

## 2. Food Screen

**Stays as own tab. Structural improvements only.**

### Current Problems
1. No memory of past meals. Every day starts from zero.
2. Calories hidden — only protein visible.
3. Grid hint permanently visible noise.
4. No "clear slot" action.
5. Meal deletion has no confirmation.
6. Custom food macros are integer-only.
7. Food coach banner says "coach" but shows data quality alerts.
8. Emojis consume ~25% of food cell width.

### Key Changes

| Change | Priority |
|---|---|
| **"Same as yesterday" banner** — One-tap to copy previous day's same slot. | High Impact / Medium Effort |
| **Show calories in footer AND header** — Footer: `38g P - 480 kcal`. Header: `94g P - 1,420 kcal`. | High Impact / Low Effort |
| **Dismiss grid hint after first meal** — `localStorage` flag. | Low Impact / Low Effort |
| **"Clear slot" button** — Reset entire meal slot. Confirmation via dirty-slot modal. | Low Impact / Low Effort |
| **Decimal protein in custom modal** — `inputmode="decimal"`, `step="0.1"`. | Low Impact / Low Effort |
| **Rename food coach banner** — Data quality language, not coaching language. | Low Impact / Low Effort |
| **Meal deletion confirmation** — Reuse dirty-slot modal pattern. | High Impact / Low Effort |

### Food Grid Cell Refinement

Current cell (~110px height):
```
+------------+
|    emoji   |   <- emoji (large, own line)
|   Name     |
|   6g P     |
|  1 each    |
| [-] 0 [+]  |
|   [ADD]    |
+------------+
```

Proposed cell (~80px height):
```
+------------+
| emoji Name |   <- emoji inline (saves a line)
| 6g P-78cal |   <- protein AND calories
|   [ADD]    |   <- single add button
+------------+

After adding (qty > 0):
+------------+
| emoji Name |
| 6g P-78cal |
| [-] 2 [+]  |   <- stepper replaces ADD
+------------+
```

Reduces cell height by ~30px. More items visible without scrolling. Calories visible per item.

**Priority: High Impact / Medium Effort**

### Wireframe

```
+-----------------------------------+
| [Pre-run] [Breakfast] [Lunch]     |  <- slot pills
| [Snack] [Dinner]                  |
+-----------------------------------+
| +-------------------------------+ |
| | Yesterday's lunch:            | |  <- "same as" banner
| | 2x Eggs, 1x Chapati, Curd    | |     only if yesterday had slot
| | [Use same]     [Dismiss]      | |
| +-------------------------------+ |
+-----------------------------------+
| [Search food...              ]    |
+-----------------------------------+
| +----+ +----+ +----+             |
| |Eggs| |Whey| |Curd|  ...       |  <- food grid (3 col)
| | 6g | |24g | | 5g |             |
| |[+] | |[+] | |[+] |             |
| +----+ +----+ +----+             |
| ...                               |
| +------+                         |
| |Custom|                         |
| +------+                         |
+-----------------------------------+
| Notes [________________________]  |
+-----------------------------------+
| +-------------------------------+ |  <- sticky footer
| | Lunch: 38g P - 480 kcal      | |     BOTH macros
| |              [Next meal ->]   | |
| +-------------------------------+ |
+-----------------------------------+
```

### Loading States

| State | Design |
|---|---|
| Slot data loading | Slot pills render immediately. Grid renders immediately (static). Shimmer on summary area only. |

---

## 3. Plan Screen

**Replaces:** Week tab

### Current Problems
1. No nutrition data — mileage only.
2. Day cards collapsed by default; completion badges small.
3. No next-week preview.
4. Coach debrief conditionally hidden.
5. "Open day" navigation has no back-to-Plan path.

### Goals
- Weekly picture includes training AND nutrition.
- Completion status visible at a glance across all 7 days without expanding.
- Coach debrief permanently accessible.

### Key Changes

| Change | Priority |
|---|---|
| **Weekly nutrition summary** — avg protein, avg calories, days on target. | High Impact / Medium Effort |
| **Compact day rows** — Day name, type badge, 3 completion dots visible WITHOUT expansion. | High Impact / Medium Effort |
| **Coach debrief always visible** when it exists. Collapsed, one tap to read. | High Impact / Low Effort |
| **Next-week preview** — Collapsed section if plans are seeded. | Low Impact / Low Effort |

### Completion Dots

```
check = complete (green)
o = incomplete (muted)
- = not applicable (no training on rest days)
```

Three dots per day: Vitals, Training, Meals. Visible in compact row without expansion.

### Wireframe

```
+------------------------------------+
|  <- Week 3 - 30 Jun -- 06 Jul ->  |
+------------------------------------+
| Training    11.2 / 15.0 km        |
| ============____  3/4 runs        |
| Longest: 5.2 km   +10% cap: 13   |
|                                    |
| Nutrition   avg 142g P - 2,040    |  <- NEW
| ===============_  5/7 on target   |  <- NEW
+------------------------------------+
| > Coach Review (Week 2)           |  <- collapsible
|   Score: 72 - "Solid base week.." |     when debrief exists
+------------------------------------+
| Mon   Rest       check check check|  <- compact rows
| Tue   Run 3km    check check o    |     completion visible
| Wed   Recovery   check - check    |     WITHOUT expanding
| Thu   Run 5km    check check check|
| Fri   Gym Push   o o o            |
| Sat   Long Run   o o o            |
| Sun   Rest       -                |
|                                    |
| v Fri -- Gym - Push + Core        |  <- expanded card
|   Push-ups 3x15 - OHP 3x10       |
|   Plank 3x40s                     |
|   [Open in Coach]                 |
+------------------------------------+
```

### Loading States

| State | Design |
|---|---|
| Week data loading | Week nav + label immediately. 7 skeleton lines (name + 3 gray dots). Mileage as shimmer bars. |
| Coach debrief loading | "Coach Review (Week N) -- Loading..." |
| No data for future week | "No plan seeded for this week yet." |
| Fetch failure | "Couldn't load this week. [Retry]" inline. |

---

## 4. Trends Screen

**Replaces:** Progress tab

### Current Problems
1. Shows trends for 4 metrics; app tracks 10+.
2. Sleep, cigarettes, cadence, RPE, knee, calorie compliance have no visualization.
3. Progress cards show "Loading..." forever on fetch failure.
4. Body comp scan form hidden behind toggle.
5. Weight goal constant is stale.

### Goals
- Every tracked dimension has a visible trend.
- Organized by coaching domain, not by data source.
- Each section scannable in 2 seconds.

### Organization

**BODY**
- Weight sparkline (existing — keep)
- Waist trend (new — Monday data points)
- Body comp history (existing — keep)

**TRAINING**
- Weekly mileage trend (new — bar chart across weeks)
- Long-run progression (existing — keep)
- Cadence trend (new — sparkline, 150 target line)

**RECOVERY**
- Sleep trend (new — sparkline, 7h floor line)
- RPE trend (new — per-session dots)
- Knee status timeline (new — color-coded dots per run)

**NUTRITION**
- Protein compliance (new — check/x day strip against target)
- Calorie compliance (new — check/x day strip against target)

**HABITS**
- Cigarettes trend (new — sparkline)
- Supplement adherence (existing — keep, extend per-supplement)

### Key Changes

| Change | Priority |
|---|---|
| **Sleep sparkline** — 56-day window, 7h floor line. | High Impact / Low Effort |
| **Cigarette sparkline** — 56-day window. | High Impact / Low Effort |
| **Cadence sparkline** — Per-run dots, 150 target line. | High Impact / Low Effort |
| **Protein/calorie compliance** — check/x strip against daily targets. | High Impact / Medium Effort |
| **Knee status timeline** — Color-coded dots per run. | Low Impact / Low Effort |
| **RPE trend** — Per-session dots from run + workout logs. | Low Impact / Low Effort |
| **Weekly mileage bar chart** — Aggregate by week. | High Impact / Medium Effort |
| **Waist trend** — Monday data points. | Low Impact / Low Effort |
| **Fix weight goal** — Update to 73.5 kg. | High Impact / Low Effort |
| **Body comp: visible "Log scan" trigger** — Move to scan due banner. | Low Impact / Low Effort |

### Sparkline Component (Reusable)

All sparklines share one component:

```
Inputs:
  data: [{date, value}]
  targetLine: number | null    (e.g., 7 for sleep, 150 for cadence)
  targetLabel: string | null   (e.g., "floor: 7h")
  unit: string                 (e.g., "kg", "h", "/km")
  days: number                 (lookback window)

Visual:
  SVG, 100% width, 64px height
  Data line: --accent-blue, 1.5px stroke
  Target line: dashed, --text-hint, 1px
  Delta badge: up-arrow +0.4 (green if improving)
  No axis labels except min/max Y and target label
```

### Wireframe

```
+------------------------------------+
| Trends                             |
+------------------------------------+
|                                    |
| BODY                               |
| +--------------------------------+ |
| | Weight    77.4 kg  down -1.1   | |
| | ~~~/~~~~/______ goal: 73.5     | |
| |                                | |
| | Waist     33.5 in  down -0.5   | |
| | ~~~/~_                         | |
| +--------------------------------+ |
| > Body Comp Scans (last: 24 Dec)  |
|   Next due: ~28 Jul               |
|                                    |
| TRAINING                           |
| +--------------------------------+ |
| | Weekly km                      | |
| | W1: == 8   W2: ==== 12        | |
| | W3: =====_ 11.2/15            | |
| |                                | |
| | Long runs                     | |
| | [bar chart]  Peak: 5.2 km     | |
| | Target: 14-15 km              | |
| |                                | |
| | Cadence   148  up +6          | |
| | ~~~~~/______ target: 150      | |
| +--------------------------------+ |
|                                    |
| RECOVERY                           |
| +--------------------------------+ |
| | Sleep     6.8h  up +0.4       | |
| | ~~~/~~~~_____ floor: 7h       | |
| |                                | |
| | RPE trend                     | |
| | 5 6 5 7 5 6                   | |
| |                                | |
| | Knee status                   | |
| | * * * * * * * * * *           | |
| | All clear -- 12 runs          | |
| +--------------------------------+ |
|                                    |
| NUTRITION                          |
| +--------------------------------+ |
| | Protein compliance             | |
| | checkcheckxcheckcheckcheckx... | |
| | 12/14 days                     | |
| |                                | |
| | Calorie compliance             | |
| | checkxcheckcheckcheckx...      | |
| | 11/14 days                     | |
| +--------------------------------+ |
|                                    |
| HABITS                             |
| +--------------------------------+ |
| | Cigarettes  3.1/day  down -0.4 | |
| | ~~~/~~~~/~~~                   | |
| |                                | |
| | Supplements                    | |
| | Daily: 89%  D3: 100%          | |
| | Last 8 D3: check x 8          | |
| +--------------------------------+ |
+------------------------------------+
```

### Loading States

| State | Design |
|---|---|
| Initial load | Section headers immediately. Each card interior: shimmer bar at sparkline width. |
| Fetch failure per section | "Couldn't load. [Retry]" — not stuck on "Loading..." |
| No data for a metric | "No data yet. Starts appearing after a few days of logging." |
