# Roadmap Amendments — Product Bible Alignment

**Date:** 06 July 2026  
**Status:** Merged into `IMPLEMENTATION-ROADMAP.md` on 06 Jul 2026 (Option B: 73–74 kg adopted)  
**Authority:** `PRODUCT-BIBLE.md` v1.0, post–Coach Skill Refactor (`coach/current-block.md`, `coach/coaching-log.md`)

This document patches gaps found when comparing `IMPLEMENTATION-ROADMAP.md`, `PRODUCT-STRATEGY.md`, and `SCREEN-SPECS.md` against the Product Bible and the completed Coach Skill refactor.

**Principle:** The app informs and observes (Level 1–2). The Coach Skill advises (Level 3). Training blocks are primary context. Silence on quiet days is a feature.

---

## Summary of changes

| Area | Current roadmap gap | Amendment |
|------|---------------------|-----------|
| Weight goal | Quick Win #3 hardcodes 73.5 kg, conflicts with `personal-details.md` (70–71 kg) | Resolve in profile first; app reads single source |
| Debrief export | SCREEN-SPECS fixes blocking export; roadmap omits it | Add to Sprint 2 |
| Training blocks | Deferred to "Beyond"; Coach Skill already has blocks | Pull minimal block context into Sprint 2 |
| Observations | "Show after save" with no guardrails | New `observation-engine.js` spec + Sprint 5 dependency |
| Meaningful events | Sparklines only; no lifecycle | Event registry in Sprint 4; observations consume it in Sprint 5 |
| Silence | Not specified | Quiet-day rules in observation engine |
| Gap / return | Coach Skill has protocol; app does not | Sprint 6 gap-return UX |
| Rest days | Placeholder only | Sprint 2 rest-day Coach content |
| Beyond section | Block chapters too late | Split: minimal v1 in Sprint 2, full history stays Beyond |

---

## Amendment 1 — Resolve weight goal before Quick Win #3

### Problem

Quick Win #3 changes `WEIGHT_GOAL_KG` to 73.5 and displays "73–74 kg". `personal-details.md`, `COACH-CONTEXT.md`, `personal-coach.mdc`, and `coach/coaching-log.md` all say **70–71 kg** (race-day target). The UX audit cites a Jul 1 coaching decision for 73–74 kg, but that decision was never written back to the canonical athlete profile.

### Decision required (pick one, update `personal-details.md`, then ship)

| Option | Action |
|--------|--------|
| **A — Keep 70–71 kg** | Quick Win #3: set `WEIGHT_GOAL_KG = 70.5`, display `"70–71 kg"`. No doc changes. |
| **B — Adopt 73–74 kg** | Update `personal-details.md` §Goals, `COACH-CONTEXT.md`, `coach/current-block.md` success criteria, and Coach refactor references. Then Quick Win #3 as written. |

### Implementation rule (either option)

```js
// js/weight-trend.js — never hardcode display text separately from constant
export const WEIGHT_GOAL_KG = /* from personal-details constant or shared config */;
```

**Bible trace:** S19.1 — coaching decisions driven by agreed targets, not stale constants.

**Effort:** 15 min (decision + one file) + 30 min if Option B (profile sync across coach files).

---

## Amendment 2 — Quick Wins (revised)

Replace Quick Win #3 with:

| # | Change | Files | Effort |
|---|--------|-------|--------|
| 3 | **Sync weight goal to canonical target** — After Amendment 1 decision, update `WEIGHT_GOAL_KG` and display string to match `personal-details.md`. | `js/weight-trend.js`, optionally `js/app.js` if goal moves to shared config | 15 min |

Add new Quick Win:

| # | Change | Files | Effort |
|---|--------|-------|--------|
| 13 | **Rest-day plan header** — On rest days, Coach header shows recovery context instead of only "Rest day": e.g. `Rest day · HM Build Base · Week 2 · Next: Tue 5 km easy`. Reads block name/week from a new `js/block-context.js` stub (static constants until Sprint 2 sync). | `js/today.js`, new `js/block-context.js` | 20 min |

---

## Amendment 3 — Sprint 2 additions (Coach Screen Restructure)

Add these items to Sprint 2. They are Bible-critical and already designed in SCREEN-SPECS.

### 2a. Soft debrief export (Bible S18.1, UX Audit C5)

| Item | Detail |
|------|--------|
| **What** | "Copy Day Log" always enabled. If preflight incomplete, show inline soft warning listing missing items — do not disable the button. |
| **Copy** | Button: `Copy Day Log`. Warning: `2 items not logged — export anyway?` (lists items). |
| **Files** | `js/debrief.js`, `js/day-progress.js`, `index.html`, `css/style.css` |
| **Effort** | Medium (4h) |
| **Acceptance** | Athlete can export with 1 snack slot empty. Exported paste marks missing fields as `—` or `not logged`. |

### 2b. Training block context chip (Bible S16.4)

| Item | Detail |
|------|--------|
| **What** | Read-only block context on Coach screen header and Plan screen header. |
| **Display** | `HM Build — Base · Week 2` + optional `· 9 wk to race` |
| **Source v1** | `js/block-context.js` — constants mirrored from `coach/current-block.md` (manual sync until Amendment 7). |
| **Files** | new `js/block-context.js`, `js/today.js`, `js/week.js`, `index.html`, `css/style.css` |
| **Effort** | Low (2h) |
| **Acceptance** | Block name visible on Coach and Plan every day. Week number updates when `current-block.md` is edited. |

### 2c. Rest day as active training day (Bible S15.3)

| Item | Detail |
|------|--------|
| **What** | On rest days, Coach screen shows a compact "Recovery today" block below the plan: supplements due, protein target, sleep floor reminder, and **next session preview** (tomorrow's planned demand from `daily_plans`). |
| **Not** | No "do nothing" empty state. No coaching advice ("you should sleep more"). Level 1 facts only. |
| **Example** | `Tomorrow: 5 km easy run. Protein floor 140g. Supplements: Supradyn, Creatine, Omega-3.` |
| **Files** | `js/today.js`, `css/style.css` |
| **Effort** | Medium (3h) |

### 2d. Past-day read-only mode (UX Audit M6)

| Item | Detail |
|------|--------|
| **What** | Dates before today render compressed summaries by default. Tap "Edit" to unlock forms. |
| **Files** | `js/today.js`, `js/app.js`, `css/style.css` |
| **Effort** | Medium (4h) |

### Updated Sprint 2 outcome

Coach screen restructured. Debrief tab removed. Export never blocked. Block context visible. Rest days show recovery + next-demand preview.

---

## Amendment 4 — Sprint 4 additions (Meaningful Events foundation)

Sprint 4 currently adds sparklines. Add an event layer so Sprint 5 observations don't invent their own rules.

### New file: `js/meaningful-events.js`

Event types (Bible S10):

| Type | Trigger example | Surface once |
|------|-----------------|--------------|
| `new` | First run below 7:30/km this block | Yes |
| `progression` | Cadence monthly high | Yes — until superseded by new high |
| `stagnation` | Cadence unchanged 6+ runs | Yes — reset if cadence improves |
| `milestone` | Longest run of block | Yes — update only if new record |
| `threshold` | Sleep < 7h for 3 consecutive nights | Yes — reset after 2 nights ≥ 7h |

### Event registry

```js
// Persisted in localStorage keyed by event id
// id = `${type}:${metric}:${threshold}` e.g. "threshold:sleep:3nights_below_7h"
{
  id, type, metric, firstSeenDate, lastSurfacedDate, active, payload
}
```

### Sprint 4 deliverables (add to list)

- [ ] `js/meaningful-events.js` — detect events from Supabase data on app load and after saves
- [ ] `js/sparkline.js` — sparklines remain visual; events drive Coach observations
- [ ] Trends screen: optional "Active signals" section listing currently `active` events (Level 1 labels only, no advice)

**Bible trace:** S10.5 — app ensures athlete notices; Coach Skill answers why/what next.

**Effort:** High (8h) — can start in parallel with Sprint 3.

---

## Amendment 5 — Observation Engine (Sprint 5 prerequisite)

Sprint 5 must not ship raw "observation after every save." Ship this spec first.

### New file: `js/observation-engine.js`

#### Intelligence boundary (hard rules)

**MAY output (Level 1):** objective facts from data.  
**MAY output (Level 2):** connect two facts for situational awareness.  
**MUST NOT output (Level 3):** recommendations, judgments, "you should", "reduce", "skip", "deload", "overtraining", "increase calories".

#### When to show an observation

| Trigger | Show? | Example |
|---------|-------|---------|
| Meaningful event just became `active` | Yes | `Sleep below 7h for 3 nights.` |
| Level 2 context: event + today's plan demand | Yes | `Sleep below 7h for 3 nights. Today: 5 km easy run.` |
| Post-save with no new event | **No** | — |
| All plan items complete, no active events | **No** (silence) | Coach screen shows plan + compressed summaries only |
| Evening, day fully logged, no events | **No** or one-line factual summary only if athlete opens evening review | `148g protein · 2,040 kcal · 7.1h sleep.` (facts, not praise) |

#### When to stay silent (Bible S11)

On a quiet, on-plan day the Coach screen shows:

1. Today's plan (with block context chip)
2. Logging progress (what's pending)
3. Compressed completed sections
4. **Nothing else**

Target: athlete closes app in under 5 seconds when on course.

#### Post-save behavior

```
onSave(domain) {
  const newEvents = meaningfulEvents.detectSinceLastCheck();
  if (newEvents.length === 0) return;           // silence
  const obs = observationEngine.render(newEvents, { block, todayPlan });
  if (obs) showObservationBlock(obs);           // max 2 sentences
}
```

#### Evening observation (Tier 2)

Only render if **at least one** of:

- Active meaningful event exists
- Athlete taps "Day summary" (explicit request — not automatic noise)
- Monday morning weekly review block (Sprint 5 existing item)

Evening auto-summary is **off by default**. Facts available on expand, not pushed.

#### Copy templates (approved patterns)

```
Level 1: "Cadence 148 — highest this month."
Level 1: "Longest run of this block: 5.2 km."
Level 2: "Sleep averaged 6.2h over 4 nights. Today's session: 5 km easy run."
Level 2: "Protein floor hit 5 of last 7 days."
```

#### Forbidden patterns (lint in code review)

```
"Consider reducing..."
"You should..."
"Good job..."
"Great work..."
"Don't worry..."
"You're overtraining..."
```

### Sprint 5 revised deliverables

Replace:

> Observation blocks on Coach screen (Level 1 and Level 2 intelligence per Product Bible)

With:

- [ ] `js/observation-engine.js` — render + silence rules above
- [ ] Wire to `meaningful-events.js` (Sprint 4 dependency)
- [ ] Wire to `block-context.js` for Level 2 "today's demand" half of observations
- [ ] Coach screen: observation block component (DESIGN-SYSTEM §1.2)
- [ ] Monday weekly review block (unchanged)
- [ ] Plan screen nutrition summary (unchanged)
- [ ] **Tests:** `observation-engine.test.mjs` — 10 cases covering silence, L1, L2, and Level 3 rejection

**Effort:** High (12h) — was underestimated in original Sprint 5.

---

## Amendment 6 — Sprint 6 additions (Gap return + polish)

### 6a. Return-after-gap UX (Bible S18.2)

| Item | Detail |
|------|--------|
| **Detect** | No vitals/training/food logs for 5+ consecutive days; athlete opens app on any tab. |
| **Do** | Show today's date and normal Coach screen. No "welcome back", no "you were away X days", no guilt copy. |
| **Do** | Soft banner (dismissible, once): `Continuing from today.` — nothing more. |
| **Do** | Block context chip still visible. If gap > 14 days, add factual line: `Last logged: 22 Jun.` (date only, no judgment). |
| **Don't** | Ask why they were away. Don't change the plan automatically. Don't surface stale meaningful events from before the gap. |
| **Files** | `js/app.js`, new gap detection in `js/meaningful-events.js` (reset stale `active` events on gap detect) |
| **Effort** | Medium (4h) |

### 6b. Edge cases (add to Sprint 6 testing checklist)

- [ ] Return after 7-day gap — no shame copy, events reset
- [ ] Perfect on-plan day — zero observations
- [ ] Export with 90% data — succeeds with warning
- [ ] Rest day — recovery block + tomorrow preview visible
- [ ] Monday — weekly review + waist field, block chip shows new week if updated

---

## Amendment 7 — Block context sync (post–Sprint 2 maintenance)

Until editable goals ship (Beyond #4), block context is manually synced.

| Step | Owner | When |
|------|-------|------|
| Coach updates `coach/current-block.md` at weekly debrief | Coach Skill | Every Monday |
| Developer or coach updates `js/block-context.js` constants | Human | Same session, 2 min |
| Future: read block from Supabase `athlete_profile` row | App | Beyond #4 |

```js
// js/block-context.js — v1 stub
export const BLOCK = {
  name: 'HM Build — Base Phase',
  phase: 'Base',
  week: 2,
  raceDate: '2026-09-06',
  raceName: 'Vedanta Zinc City HM',
};
```

**Bible trace:** S16.4 — app always knows current block. v1 is read-only mirror; full block chapters remain Beyond.

---

## Amendment 8 — Revised "Beyond the Roadmap"

Reorder and split:

| # | Item | Was | Now |
|---|------|-----|-----|
| 1 | Close the coaching loop | Beyond | Beyond (unchanged) |
| 2 | Proactive observation intelligence | Beyond | **Merged into Sprint 4–5** (`meaningful-events.js` + `observation-engine.js`) |
| 3 | AI coaching inside the app | Beyond | Beyond (unchanged) |
| 4 | Editable goals and adaptable plans | Beyond | Beyond — includes block context in Supabase, eliminates `block-context.js` stub |
| 5 | Training block chapters (full history UI) | Beyond | Beyond — block **summary chip** now Sprint 2; full chapter browser stays future |

Add:

| # | Item | Notes |
|---|------|-------|
| 6 | **Coach Skill → app block sync** | Script or manual step to push `current-block.md` fields into app config / Supabase after each weekly debrief |

---

## Amendment 9 — Updated sprint dependency graph

```
Sprint 1 (Quick Wins incl. weight goal resolution)
    │
    ├── Sprint 2 (Coach restructure + block chip + soft export + rest day + read-only past)
    │       │
    │       ├── Sprint 3 (Food) — parallel
    │       │
    │       └── Sprint 4 (Trends + meaningful-events.js)
    │               │
    │               └── Sprint 5 (observation-engine.js + Plan observations)
    │                       │
    │                       └── Sprint 6 (gap UX + polish + a11y)
```

**Critical path:** Sprint 4 must complete before Sprint 5 observations. Do not ship observations without meaningful-events foundation.

---

## Amendment 10 — Revised projected UX scores

| Dimension | Original "After Full" | Amended | Why |
|-----------|----------------------|---------|-----|
| Coaching Value Returned | 7 | **8** | Observations gated by events + silence rules = actually feels like coaching, not nagging |
| Information Architecture | 9 | **9** | Block context chip reinforces chapter mental model |
| Daily Workflow Efficiency | 9 | **9** | Soft export removes dead-end |
| **Overall** | **84** | **86** | +2 from Bible-aligned observation quality |

Still capped below 90 until coaching loop closes (Beyond #1).

---

## Amendment 11 — Prioritization matrix additions

### High Impact / Low Effort (add)
- Block context chip (Sprint 2)
- Soft debrief export (Sprint 2)
- Weight goal sync after profile decision (Sprint 1)

### High Impact / High Effort (add)
- `meaningful-events.js` (Sprint 4)
- `observation-engine.js` with silence rules (Sprint 5)

### Bible principle → sprint traceability

| Principle | Sprint | Deliverable |
|-----------|--------|-------------|
| App informs, Coach advises | 5 | observation-engine Level 1–2 only |
| Silence = on course | 5 | no observation without active event |
| Meaningful events, not states | 4 | event registry + surface-once |
| Training blocks are chapters | 2 | block context chip |
| App knows current block | 2, 7 | block-context.js stub |
| Gaps are chapters, not failures | 6 | gap-return UX |
| Rest days maintain readiness | 2 | rest-day recovery block |
| Bad days = objective facts | 2 | soft export, no "deviations" copy |

---

## Merge checklist

Merged 06 Jul 2026:

- [x] Replace Quick Win #3 per Amendment 1 (Option B: 73–74 kg)
- [x] Add Quick Win #13 per Amendment 2
- [x] Append Sprint 2 items 2a–2d
- [x] Append Sprint 4 meaningful-events work
- [x] Replace Sprint 5 observation bullet with Amendment 5 deliverables
- [x] Append Sprint 6 gap UX
- [x] Update Beyond section per Amendment 8
- [x] Update dependency graph and UX score table
- [x] Cross-link `DESIGN-SYSTEM.md` §1.2 to `observation-engine.js` spec
- [x] Resolve weight goal (Option B) in `personal-details.md` and coach files

---

*These amendments align the app UX roadmap with Product Bible v1.0 and the completed Coach Skill refactor. They do not change Coach Skill scope — they ensure the app consumes the same block context and respects the same intelligence boundary.*
