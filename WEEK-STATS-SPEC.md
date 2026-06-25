# Week Stats — Implementation Spec

**Version:** 1.0  
**Date:** 25 Jun 2026  
**Status:** Approved for implementation (P7–P13)  
**Parent:** `APP-GOALS.md` §11

Single source of truth for cross-day aggregation. All features that need week-level numbers **must** import from `js/week-stats.js` — no duplicate queries or ad-hoc math in `debrief.js`, `week.js`, or `progress.js`.

---

## 1. Week windows

All boundaries use **local calendar dates** (`formatDate()` in `app.js`), never UTC.

| Window ID | Definition | Example (viewing Mon 29 Jun,26) |
|-----------|------------|----------------------------------|
| `priorWeek` | Mon–Sun of the week **immediately before** the week containing `anchorDate` | Mon 22 Jun – Sun 28 Jun |
| `currentWeek` | Mon–Sun of the week containing `anchorDate` | Mon 29 Jun – Sun 5 Jul |
| `weekContaining` | Same as `currentWeek` for any date in that week | — |

### Helpers (`week-stats.js`)

```javascript
getWeekMonday(date)       // local Mon 00:00 of week containing date
getWeekSunday(date)       // local Sun of same week
getPriorWeekRange(anchor) // { startIso, endIso } — Mon–Sun before anchor's week
getCurrentWeekRange(anchor)
formatWeekRangeLabel(startIso, endIso) // "23 Jun,26 – 29 Jun,26"
```

**Monday check-in** always uses `priorWeek` relative to the Monday being debriefed.

**Week tab mileage / completion** uses `currentWeek` for the week being browsed (`weekViewMonday` in `week.js`).

---

## 2. Data fetches (`supabase.js`)

Add three range queries (scoped `user_id`):

| Function | Table | Select |
|----------|-------|--------|
| `fetchWeekRunLogs(startIso, endIso)` | `run_logs` | `*` where `date` between start and end |
| `fetchWeekVitals(startIso, endIso)` | `daily_vitals` | `*` where `date` between start and end |
| `fetchWeekFoodLogs(startIso, endIso)` | `food_logs` | `date, meal_slot, items, custom_text, total_protein` |

`fetchWeekPlans(startIso, endIso)` already exists — use for planned km and day types.

`computeWeekStats(range, plans, runLogs, vitals, foodLogs)` is **pure** (no I/O) for testability.

---

## 3. Aggregated metrics

### 3.1 Running load

| Metric | Rule |
|--------|------|
| `plannedKm` | Sum of `daily_plans.run_km` where `run_km` is not null |
| `actualKm` | Sum of `run_logs.actual_km` where `done === true` and `actual_km` is numeric |
| `longestRun` | Max `actual_km` among runs where `done === true`; tie-break: latest `date` |
| `longestRunDate` | ISO date of longest run |
| `runDaysPlanned` | Count of plan rows with `run_type` |
| `runDaysLogged` | Count of run_logs with `done === true` |
| `tenPercentCeiling` | `priorWeekActualKm * 1.1` (for next-week guard; `null` if prior week actual is 0) |

Display: `11.2 km actual / 12.0 km planned` on Week tab header.

### 3.2 Monday check-in fields

Used in debrief `## Monday Check-in` when `isMonday(viewedDate)`.

| Field | Window | Computation |
|-------|--------|-------------|
| Weight | That Monday | `daily_vitals.weight_kg` for Monday date |
| Waist | That Monday | `daily_vitals.waist_inches` for Monday date |
| Longest run | **priorWeek** | `longestRun` + `longestRunDate` from §3.1 |
| Avg sleep | **priorWeek** | Mean of `sleep_hours` where not null; round to 1 decimal; `—` if no rows |
| Knee status | **priorWeek** run days | Worst knee among run_logs where `done === true` and `knee_status` set (see §3.3) |
| Cigs/day avg | **priorWeek** | Mean of `cigarettes` where not null; round to 1 decimal |

Debrief line format (unchanged header, filled values):

```
- **Weight / Waist / Longest run / Avg sleep / Knee / Cigs/day:** 78.2 / 33.5 / 5.0 km (27 Jun,26) / 6.8h / Pain-free / 4.3
```

### 3.3 Knee severity ranking

For `worstKnee(runLogs)`:

```
Pain (4) > Discomfort (3) > Minor pressure (2) > Pain-free (1)
```

Return the label with the highest rank seen in the window. If no run days logged, return `—`.

Store ranks in `week-stats.js` only — UI and debrief use the string label.

### 3.4 Sleep & cigarettes

```javascript
function mean(values) {
  const nums = values.filter((v) => v != null && !Number.isNaN(v));
  if (!nums.length) return null;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}
```

Do **not** impute missing days into the average.

### 3.5 Per-day completion (`dayCompletion[]`)

For each date in the range, reuse the same rules as `day-progress.js`:

| Check | Done when |
|-------|-----------|
| Vitals | `weight_kg` or `sleep_hours` present |
| Training | If plan has `run_type`: `run_log.done`; if `workout_plan`: `workout_log.done`; else N/A (not required) |
| Meals | All meal slots for that day's `day_type` have items or `custom_text` |

Return `{ date, vitals, training, meals, complete }` per day.

### 3.6 Long-run progression (P10)

Across **all history** (or last 12 weeks — use all `run_logs` ordered by date):

```javascript
longRunSeries: [{ date, km }]  // one point per run day where done && actual_km
peakLongRun: { date, km }       // max km in series
```

Show on **Progress** tab: latest long run vs race target (18–20 km), simple list or sparkline — no new nav tab.

---

## 4. Consumers

| Feature | Module | Stats used |
|---------|--------|------------|
| Monday debrief block | `debrief.js` | `priorWeek` + Monday vitals |
| Week tab header | `week.js` | `currentWeek` planned/actual km, 10% hint |
| Week card badges | `week.js` | `dayCompletion[]` per card |
| Long-run arc | `progress.js` | `longRunSeries`, `peakLongRun` |
| Weight sparkline (P12) | `progress.js` | `fetchWeekVitals` extended to 56-day vitals fetch — separate helper `fetchVitalsRange` |

Load strategy: fetch week bundle once per Week tab open / Monday debrief build. Cache in `state.weekStatsCache` keyed by `startIso-endIso` until date changes or save invalidates.

---

## 5. Run field validation (P9)

When user taps **Mark as Done** on a run day, require:

| Field | Required |
|-------|----------|
| `actual_km` | > 0 |
| `cadence` | integer 120–200 (warn if < 150, still allow save) |
| `knee_status` | one of segmented values |
| `rpe` | 1–10 (slider always has value) |

Optional: `time_display`, `avg_pace`, `notes`.

**Pace auto-calc:** when `actual_km` and `time_display` (mm:ss) both valid, auto-fill `avg_pace` as `m:ss/km`. User can override.

`computeDebriefReadiness()` and `computeDayProgress()` share `isRunLogComplete(runLog)` from `week-stats.js` or `day-progress.js` (export one function, import in both).

---

## 6. Save-state (P8)

| State | UI |
|-------|-----|
| `idle` | no indicator |
| `saving` | subtle dot or “Saving…” in header |
| `saved` | brief “Saved” toast (existing) |
| `error` | persistent banner + **Retry** until success |

Applies to: vitals, food slots, training, notes, body comp scans.

On `visibilitychange` / `pagehide`, flush autosaves; if fail, show error banner on next paint.

Does not require offline queue in v1 — **visible failure + retry** satisfies `APP-GOALS` §9.

---

## 7. Custom food library (P13)

New Supabase table (migration):

```sql
CREATE TABLE user_custom_foods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  protein NUMERIC NOT NULL DEFAULT 0,
  calories NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, name)
);
```

- Food grid: section “Your foods” above reference grid
- Tapping adds item with saved macros (user enters once)
- `resolve-custom-food-macros` skill remains for retroactive patches to old `food_logs` rows

---

## 8. UI placement (no 6th tab)

| P | Surface |
|---|---------|
| P7 | Debrief paste only |
| P8 | Global header / banner |
| P9 | Today → training card |
| P10 | Week tab header + Progress tab |
| P11 | Week tab day cards |
| P12 | Progress tab |
| P13 | Food tab |

Optional header chip (P10): `71 days · Week 2` — race date from `personal-details.md` constant in `app.js`.

---

## 9. Files to add / touch

| File | Change |
|------|--------|
| `js/week-stats.js` | **New** — windows, aggregates, knee rank, run completeness |
| `js/supabase.js` | Range fetches |
| `js/debrief.js` | Monday block from `computeWeekStats` |
| `js/week.js` | Mileage header, completion badges |
| `js/progress.js` | Long-run series, weight sparkline |
| `js/day-progress.js` | Import shared `isRunLogComplete` |
| `js/today.js` | Pace calc, done validation |
| `js/food.js` | Custom food library CRUD |
| `js/app.js` | Cache invalidation on save |
| `user-custom-foods.sql` | **New** migration |

---

## 10. Acceptance tests (manual)

1. **Monday debrief** on 29 Jun,26: longest run reflects best run from 22–28 Jun, not 29 Jun.
2. **Monday debrief**: avg sleep and cigs are weekly means, not Monday-only.
3. **Monday bodyweight day**: knee still populated from prior week's runs.
4. **Week tab**: shows 11.2 / 12.0 km when 3+4+5 planned and partial actual logged.
5. **Mark done** without km: blocked with clear message.
6. **Pace**: 5.0 km in 40:00 → auto `8:00/km`.
7. **Failed save**: airplane mode → error banner → retry succeeds.
8. **Week cards**: Tue shows ○ if run not done; all ✓ when complete.

---

## 11. Out of scope (this spec)

- Strava / GPX import
- Activity History tab
- In-app coach response
- Blood work reminders
- Gym structured logging (P14 — after Jul 2026)
- Calorie-bracket coaching warnings
