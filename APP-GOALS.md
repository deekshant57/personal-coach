# Personal Coach App — Goal Document

**Version:** 1.1  
**Date:** 25 Jun 2026  
**Scope:** `personal-coach-app/` (mobile PWA only)

This document defines *why the app exists* and *what good looks like*. All UI/UX work must be evaluated against these goals — not against generic design patterns.

---

## 1. Product purpose

Replace the legacy Excel tracker with a **phone-native logging surface** that feeds the existing Cursor coaching loop unchanged.

The app is **input + display**. The coach (Claude in Cursor) remains the brain: debrief, protein math verification, weekly plan authoring, load adjustments.

```
Morning → log vitals → follow plan → log training + food → generate debrief → paste to Cursor → coach responds
```

---

## 2. User & context

| | |
|---|---|
| **User** | Deekshant — single athlete, not a multi-user product |
| **Device** | Phone (PWA, portrait, home-screen install) |
| **Location** | Udaipur — Indian veg diet, park runs, bodyweight until ~Jul 2026 |
| **When used** | Morning (vitals), post-workout (training), after each meal (food), night (debrief) |
| **Race** | Vedanta Zinc City Half Marathon — 6 Sep 2026, 5:00 AM |
| **Body goal** | 70–71 kg, knees intact, 18–20 km long run in training |

---

## 3. North-star outcome

**Complete the daily loop with correct data, minimal friction, zero ambiguity about which day is being logged.**

If the app fails at date context, data persistence, or debrief completeness, nothing else matters.

---

## 4. Jobs to be done (JTBD)

### JTBD-1 — Know what today requires
- See coach directive, training type, distance/pace/cues, meal plan for the **selected calendar day**
- Day-type must be obvious at a glance (Run / Bodyweight / Active Recovery / Rest)

### JTBD-2 — Log morning vitals
- Weight, sleep, cigarettes (+ waist on Mondays)
- Save once, collapse when done, editable later

### JTBD-3 — Log training
- Run days: km, time, pace, cadence, RPE, knee status, notes
- Workout days: what I did, RPE, notes
- Rest / active recovery: no forced training card

### JTBD-4 — Log food by portions
- Tap portions (not count macros) — app calculates protein/calories from reference table
- Meal slots change by day type (pre-run vs pre-workout vs breakfast, etc.)
- Running protein total vs daily target (140–150 g)
- Per-meal save, planned-meal hint per slot

### JTBD-5 — Close the day
- Generate structured paste for Cursor: `End of day tracker upload — DD MMM,YY` (e.g. `24 Jun,26`)
- Include run/workout/food/vitals/notes; Monday check-in block when applicable
- One-action copy to clipboard

### JTBD-6 — Browse the week (read-only)
- See Mon–Sun plan without leaving the app
- Know which day is **calendar today** vs which day is **being viewed**

### JTBD-7 — Sync & persist
- Supabase per-user storage when signed in
- No silent data loss on tab/date switch

### JTBD-8 — See training & body trends
- Weekly mileage (planned vs actual) and long-run progression toward 18–20 km
- Monday debrief auto-fills prior-week rollups (longest run, avg sleep, cigs/day, knee)
- Weight trend from daily vitals; body comp scans stay episodic on Progress tab

---

## 5. Success criteria (measurable)

| ID | Criterion |
|----|-----------|
| S1 | User always knows **which date** data will save to (visible on every tab) |
| S2 | Daily debrief paste contains all logged fields the coach rules require |
| S3 | Food log → protein bar updates correctly per day |
| S4 | Training card only appears on run/workout days per plan |
| S5 | Complete a full logging day in **≤5 minutes** of active app time (excluding workout) |
| S6 | **Zero feature regression** — every field in Excel tabs has an app equivalent |
| S7 | Works on phone one-handed; primary actions in thumb reach |
| S8 | Monday debrief paste includes correct **prior-week** rollups (not today-only placeholders) |
| S9 | Failed writes show visible error state with retry — no silent loss |
| S10 | Week-level planned vs actual km visible without leaving the app |

---

## 6. Non-goals (explicit)

- **Not** replacing Cursor coach or in-app AI debrief
- **Not** Strava/GPX import (stays in `import-runs.py`)
- **Not** weekly plan authoring in-app (coach updates `coach/week-plans.py` / Supabase)
- **Not** macro coaching, meal suggestions, or triglyceride warnings in-app
- **Not** multi-athlete, social, or gamification
- **Not** desktop-first layout or feature parity with Excel power-user workflows

---

## 7. Design principles (derived from goals)

1. **Date is global state** — one source of truth, visible everywhere, never ambiguous
2. **Log, don't calculate** — user enters portions; app sums protein/kcal from `data.js`
3. **Progressive disclosure** — directive + summary first; warm-up/meal detail collapsed
4. **One primary action per context** — save meal on Food tab, save training on training card, etc.
5. **Coach copy is the output** — Debrief tab exists to produce paste text, not to display feedback
6. **Preserve what works** — day-type badges, food grid steppers, collapse-on-save vitals
7. **Don't label wrong** — never call a past day "Today"; reserve that word for calendar today only

---

## 8. Screen map (intended responsibilities)

| Screen | Owns | Must not own |
|--------|------|--------------|
| **Auth** | Sign in/up, session | Any logging |
| **Header** | Date nav, protein total, user | Form fields |
| **Today** | Vitals, plan, training log, meal summary, notes | Food grid |
| **Food** | Meal slots, portion grid, per-slot save | Training fields |
| **Week** | 7-day plan browse, mileage summary, per-day completion badges | Editing logs |
| **Progress** | Body comp scans, long-run arc, weight sparkline | Daily logging |
| **Debrief** | Generate + copy paste (incl. Monday rollups) | Coach response |

---

## 9. Constraints (hard)

- All existing Supabase tables and field names unchanged unless explicitly migrated
- Meal slots, food items, day types driven by `data.js` + `daily_plans`
- Local date (not UTC) for all `YYYY-MM-DD` keys
- PWA: offline-tolerant reads where possible; writes queue or fail visibly
- Vegetarian + egg food reference set stays intact

---

## 10. Audit method (how to evaluate changes)

For any screen or change, answer in order:

1. **Which JTBD does this serve?** If none → don't build it.
2. **Does it pass S1–S7?** If it breaks S1 or S6 → reject.
3. **Does it violate a non-goal?** If yes → reject.
4. **Does it violate principle 7 (labeling)?** If yes → reject.
5. Only then: visual polish, spacing, accessibility.

---

## 11. Priority backlog (goal-ordered)

| P | Item | JTBD | Success criterion |
|---|------|------|-------------------|
| P0 | Global date header, correct local dates, no mislabeling | JTBD-1,7 | S1 |
| P1 | Day completion visibility (what's left tonight) | JTBD-5 | S5 |
| P2 | Training log: show fields first, planned vs actual | JTBD-3 | S5, S6 |
| P3 | Debrief pre-flight + single copy CTA | JTBD-5 | S2, S5 |
| P4 | Week: open day from card, week navigation | JTBD-6 | S1 |
| P5 | Food: search, unsaved-slot guard | JTBD-4 | S5 |
| P6 | Visual consistency pass (inline styles → CSS, loading states) | — | S7 |

**Status (25 Jun 2026):** P11 shipped — Week cards show vitals / training / meals completion chips (aligned with `isRunLogComplete`). P12 shipped — Progress tab weight sparkline from daily vitals (56-day window).

**Status (25 Jun 2026):** P10 shipped — Week tab mileage summary (+10% cap), Progress tab long-run arc toward 18–20 km.

**Status (25 Jun 2026):** P9 shipped — `run-log.js`, pace auto-calc, run validation before Mark as Done, debrief gate uses `isRunLogComplete`.

**Status (25 Jun 2026):** P8 shipped — `save-state.js`, header saving indicator, persistent error banner + retry on all writes.

**Status (25 Jun 2026):** P7 shipped — `week-stats.js`, Supabase range fetches, Monday debrief prior-week rollups.

**Status (24 Jun 2026):** P0–P6 shipped. P6: day badges via `renderDayBadge()`, tab/food/debrief styles in CSS, loading on date change + week fetch, dead `generate-debrief` reference removed.

**P0 partial:** date header shipped; labeling fixes applied 24 Jun 2026.

### P7–P13 — Depth & breadth (approved 25 Jun 2026)

Implementation detail: **`WEEK-STATS-SPEC.md`** (week windows, aggregations, consumers, acceptance tests).

| P | Item | JTBD | Success criterion | Depends on |
|---|------|------|-------------------|------------|
| P7 | Monday debrief rollup + `week-stats.js` module | JTBD-5, 8 | S2, S8 | `WEEK-STATS-SPEC` §2–3 |
| P8 | Save-state indicator + retry on failed writes | JTBD-7 | S9 | `WEEK-STATS-SPEC` §6 |
| P9 | Pace auto-calc + run-field validation before Done | JTBD-3, 5 | S2, S5 | `WEEK-STATS-SPEC` §5 |
| P10 | Weekly mileage (planned vs actual) + long-run progression | JTBD-8 | S10 | P7 (`week-stats.js`) |
| P11 | Week cards: per-day completion badges | JTBD-6, 8 | S5 | P7 (`dayCompletion`) |
| P12 | Weight sparkline on Progress (daily vitals) | JTBD-8 | — | `fetchVitalsRange` |
| P13 | Persistent custom food library (`user_custom_foods`) | JTBD-4 | S5 | `WEEK-STATS-SPEC` §7 |

**Build order:** P7 → P8 → P9 → P10 → P11 → P12 → P13. P10/P11 share P7; do not duplicate week queries outside `week-stats.js`.

**Deferred (P14+):** gym structured lift logging (~Jul 2026), Activity History, coach response archive UI polish, blood work reminders.

**Status (25 Jun 2026):** P14 partial — `coach_debriefs` table + `save-weekly-debrief` skill + Week tab read-only coach report card.

---

## 12. Reference files

| File | Role |
|------|------|
| `COACH-CONTEXT.md` | Project workflow |
| `personal-details.md` | Athlete profile |
| `WEEK-STATS-SPEC.md` | Week aggregation contract — P7–P13 implementation |
| `.cursor/rules/*.mdc` | Coach debrief + plan rules the app must feed |
| `js/data.js` | Food reference, meal slots, day types |
| `js/week-stats.js` | Week windows + aggregates (P7) |
| `js/run-log.js` | Pace calc + run completion validation (P9) |
| `js/save-state.js` | Save indicator + error retry (P8) |
| `supabase-setup.sql` | Schema contract |
