# Implementation Roadmap

**Date:** 06 July 2026 (amended — Product Bible alignment)  
**Status:** Sprint 1 complete (06 Jul 2026). Sprint 2 complete (06 Jul 2026). Sprint 3 complete (06 Jul 2026). Sprint 4 complete (06 Jul 2026). Sprint 5 complete (06 Jul 2026). Sprint 6 complete (06 Jul 2026).  
**Authority:** `PRODUCT-BIBLE.md` v1.0, `ROADMAP-AMENDMENTS.md` (merged)  
**Weight target:** **73–74 kg** by race day (Option B — canonical in `personal-details.md`)

**Principle:** The app informs and observes (Level 1–2). The Coach Skill advises (Level 3). Training blocks are primary context. Silence on quiet days is a feature.

---

## Quick Wins (Ship in ~90 minutes)

Changes that can ship immediately with minimal risk.

| # | Change | Files | Effort | Impact |
|---|---|---|---|---|
| 1 | **Remove global animation kill** — Delete lines 2931-2938 in `style.css`. Add `prefers-reduced-motion` block. Spinner spins. Toasts fade. Protein bar animates. | `css/style.css` | 10 min | Critical |
| 2 | **Show calories in protein bar** — Remove `.hidden` from `#calorie-current`. Ensure `updateTotalProtein()` writes both numbers. | `js/food.js`, `index.html` | 15 min | High |
| 3 | **Sync weight goal to canonical target** — `WEIGHT_GOAL_KG = 73.5`, `WEIGHT_GOAL_LABEL = '73–74 kg'` (matches `personal-details.md`). | `js/weight-trend.js` | 15 min | High |
| 4 | **Remove `user-scalable=no`** — Delete from viewport meta tag. | `index.html` | 1 min | High |
| 5 | **RPE: require explicit input** — Set initial slider value to empty/null. Add "RPE not set" as validation error. | `index.html`, `js/run-log.js`, `js/today.js` | 20 min | High |
| 6 | **Add `role="alert"` to toast** — One attribute on `#toast`. | `index.html` | 1 min | Medium |
| 7 | **Auto-expand warm-up on training days** — In `renderPlanCard()`, add `.open` to `#plan-warmup-content` when plan has `run_type` or `workout_plan`. | `js/today.js` | 5 min | High |
| 8 | **Mark as Done -> Done** — Change button text on toggle. | `js/today.js` | 5 min | Low |
| 9 | **Hide food grid hint after first use** — `localStorage.setItem('food_hint_dismissed', '1')` after first save. Check on render. | `js/food.js` | 10 min | Low |
| 10 | **Add `min="0"` to cigs input** — Prevent negative numbers. | `index.html` | 1 min | Low |
| 11 | **Notes placeholder adapts to day type** — Rest: "How are you recovering?" / Training: "How did the session feel?" | `js/today.js` | 5 min | Low |
| 12 | **Loading fallback for Progress cards** — If fetch fails, replace "Loading..." with "Couldn't load. [Retry]". | `js/progress.js` | 15 min | Medium |
| 13 | **Rest-day plan header** — On rest days, header shows recovery context: e.g. `Rest day · HM Build Base · Week 2 · Next: Tue 5 km easy`. Reads from `js/block-context.js` stub. | `js/today.js`, new `js/block-context.js` | 20 min | Medium |

---

## Sprint Roadmap

### Sprint 1 (Week 1): Quick Wins + Animation Fix

Ship all 13 quick wins above.

**Outcome:** Spinner works. Calories visible. Weight goal 73–74 kg. Toasts visible. Warm-up auto-expands. RPE requires explicit input. Block context stub in place.

**Projected UX score: 62 → 68**

---

### Sprint 2 (Week 2): Coach Screen Restructure — **COMPLETE (06 Jul 2026)**

**Core restructure (original):**

- Implement section compression (done → summary line)
- Dynamic section ordering (pending items rise to top)
- Move debrief export to Coach screen evening context
- Remove the Debrief tab
- Move supplement toggles inline on Coach
- Navigation drops from 5 → 4 tabs

**Bible-aligned additions:**

| ID | Item | Bible | Files | Effort |
|----|------|-------|-------|--------|
| 2a | **Soft debrief export** — "Copy Day Log" always enabled. Inline warning if incomplete (`2 items not logged — export anyway?`). Missing fields export as `—` or `not logged`. | S18.1 | `js/debrief.js`, `js/day-progress.js`, `index.html`, `css/style.css` | 4h |
| 2b | **Training block context chip** — `HM Build — Base · Week 2 · 9 wk to race` on Coach + Plan headers. Source: `js/block-context.js` mirrored from `coach/current-block.md`. | S16.4 | `js/block-context.js`, `js/today.js`, `js/week.js`, `index.html`, `css/style.css` | 2h |
| 2c | **Rest day as active training day** — "Recovery today" block: supplements due, protein floor, sleep floor, tomorrow's session preview (Level 1 facts only). | S15.3 | `js/today.js`, `css/style.css` | 3h |
| 2d | **Past-day read-only mode** — Past dates show compressed summaries by default. Tap "Edit" to unlock forms. | — | `js/today.js`, `js/app.js`, `css/style.css` | 4h |

**Key files:** `index.html`, `js/app.js`, `js/today.js`, `js/debrief.js`, `js/supplements.js`, `js/day-progress.js`, `js/block-context.js`, `css/style.css`

**Dependencies:** Quick wins must ship first (animation fix required for section compression transitions).

**Outcome:** Coach screen restructured. Debrief tab removed. Export never blocked. Block context visible. Rest days show recovery + next-demand preview.

**Projected UX score: 68 → 74**

**Risks:** Largest structural change. Tab removal and Coach screen state machine require significant refactoring of `app.js` and `today.js`.

---

### Sprint 3 (Week 3): Food Improvements — **COMPLETE (06 Jul 2026)**

- "Same as yesterday" banner
- Food grid cell refinement (emoji inline, calories visible, 110px → 80px)
- Meal deletion confirmation
- Clear slot action

**Key files:** `js/food.js`, `js/data.js`, `index.html`, `css/style.css`

**Dependencies:** None. Can run in parallel with Sprint 2.

---

### Sprint 4 (Weeks 3–4): Trends + Meaningful Events — **COMPLETE (06 Jul 2026)**

**Trends (original):**

- Build reusable sparkline component
- Add sleep, cigarettes, cadence sparklines
- Add protein/calorie compliance strip
- Add knee dot timeline
- Add weekly mileage bar chart
- Organize by coaching domain (Body, Training, Recovery, Nutrition, Habits)

**Meaningful events foundation (Bible S10):**

- [x] `js/meaningful-events.js` — detect events from Supabase on load and after saves
- [x] Event registry in localStorage (`id`, `type`, `metric`, `firstSeenDate`, `active`, `payload`)
- [x] Event types: `new`, `progression`, `stagnation`, `milestone`, `threshold`
- [x] Surface-once lifecycle (reset when condition clears)
- [x] Trends screen: optional "Active signals" section (Level 1 labels only)

**Key files:** `js/progress.js`, new `js/sparkline.js`, new `js/meaningful-events.js`, `js/supabase.js`, `css/style.css`

**Dependencies:** None for trends. **Sprint 5 depends on this sprint completing.**

**Effort:** High (~8h for meaningful-events layer)

---

### Sprint 5 (Week 4): Plan Screen + Observation Engine — **COMPLETE (06 Jul 2026)**

**Do not ship observations without Sprint 4 meaningful-events foundation.**

**Plan screen (original):**

- Add nutrition summary to Plan screen
- Compact day rows with visible completion dots
- Monday weekly review block

**Observation engine (Bible S9, S11):**

- [x] `js/observation-engine.js` — Level 1–2 only; hard ban on Level 3 patterns ("you should", "reduce", "deload", etc.)
- [x] Wire to `meaningful-events.js` — show observation only when new `active` event
- [x] Wire to `block-context.js` for Level 2 "today's demand" context
- [x] Coach screen observation block (see `DESIGN-SYSTEM.md` §1.2)
- [x] **Silence on quiet days** — no observation post-save if no new event; on-plan day = plan + progress + nothing else
- [x] Evening summary off by default; facts on explicit "Day summary" expand only
- [x] `observation-engine.test.mjs` — 10 cases (silence, L1, L2, Level 3 rejection)

**Key files:** `js/week.js`, `js/week-stats.js`, `js/today.js`, `js/observation-engine.js`, `js/meaningful-events.js`, `css/style.css`

**Dependencies:** Sprint 2 (Coach screen structure). Sprint 4 (meaningful-events — **required**).

**Effort:** High (~12h)

---

### Sprint 6 (Week 5): Gap Return + Polish

**Gap return UX (Bible S18.2):**

- [x] Detect 5+ consecutive days without logs
- [x] Show normal Coach screen — no "welcome back", no guilt, no "where have you been"
- [x] Dismissible once: `Continuing from today.`
- [x] If gap > 14 days: factual `Last logged: [date].` only
- [x] Reset stale `active` meaningful events after gap

**Polish (original):**

- [x] Skeleton loaders replace spinners for inline loading (plan directive, week list)
- [x] Focus traps on modals
- [x] Bottom nav `role="navigation"` + `aria-label` on tabs
- [x] Context-adaptive copy (placeholders, labels, hints) — Sprint 1 + ongoing

**Edge case testing checklist:**

- [ ] Return after 7-day gap — no shame copy, events reset
- [ ] Perfect on-plan day — zero observations
- [ ] Export with 90% data — succeeds with warning
- [ ] Rest day — recovery block + tomorrow preview visible
- [ ] Monday — weekly review + waist field, block chip shows new week if updated

**Key files:** All. `js/app.js`, `js/meaningful-events.js`, plus polish pass.

**Dependencies:** All prior sprints complete.

---

## Sprint dependency graph

```
Sprint 1 (Quick Wins incl. weight 73–74 kg + block-context stub)
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

**Critical path:** Sprint 4 → Sprint 5. Do not ship observations without meaningful-events.

---

## Block context sync (maintenance)

Until editable goals ship (Beyond #4), block context is manually synced after each weekly debrief:

| Step | Owner | When |
|------|-------|------|
| Coach updates `coach/current-block.md` | Coach Skill | Every Monday |
| Update `js/block-context.js` constants | Human | Same session (~2 min) |

```js
// js/block-context.js — v1 stub (mirror coach/current-block.md)
export const BLOCK = {
  name: 'HM Build — Base Phase',
  phase: 'Base',
  week: 2,
  raceDate: '2026-09-06',
  raceName: 'Vedanta Zinc City HM',
  weightGoalKg: 73.5,
  weightGoalLabel: '73–74 kg',
};
```

---

## Projected UX Scores

| Dimension | Current | After Quick Wins | After Full Redesign |
|---|---|---|---|
| Information Architecture | 7 | 7 | 9 |
| Navigation | 7 | 7 | 9 |
| Visual Design | 7 | 7 | 8 |
| Interaction Design | 4 | 6 | 8 |
| Logging Friction | 5 | 5 | 8 |
| Coaching Value Returned | 3 | 3 | **8** |
| Data Visibility | 4 | 5 | 9 |
| Error/Loading States | 5 | 7 | 8 |
| Daily Workflow Efficiency | 6 | 7 | 9 |
| **Overall** | **62** | **68** | **86** |

Biggest jumps:

- **Data Visibility** (4 → 9): Sparklines for all tracked metrics.
- **Coaching Value** (3 → 8): Event-gated observations with silence on quiet days.
- **Logging Friction** (5 → 8): "Same as yesterday" for food. Compressed sections. Soft export.
- **Navigation** (7 → 9): 4 tabs with clear purposes. No Debrief dead-end.

Score stays below 90 until coaching loop closes (Beyond #1).

---

## Prioritization Matrix

### High Impact / Low Effort

- Remove global animation kill (CSS deletion)
- Show calories in protein bar (un-hide element)
- Sync weight goal to 73–74 kg (`weight-trend.js` — **done**)
- Remove `user-scalable=no` (1 attribute)
- Add `role="alert"` to toast (1 attribute)
- Auto-expand warm-up on training days
- Meal deletion confirmation (reuse existing modal)
- Block context chip (Sprint 2)
- Soft debrief export (Sprint 2)
- Supplement toggles inline on Coach
- RPE require explicit input

### High Impact / High Effort

- Coach screen section compression and state machine
- `meaningful-events.js` (Sprint 4)
- `observation-engine.js` with silence rules (Sprint 5)
- "Same as yesterday" food banner
- Weekly nutrition summary on Plan screen
- Compact day rows with completion dots

### High Impact / Medium Effort

- Reusable sparkline component (one build, 6 uses)
- Debrief export moved to Coach screen
- Monday weekly review block
- Food grid cell refinement
- Training log as primary when pending
- Rest-day recovery block (Sprint 2)
- Past-day read-only mode (Sprint 2)
- Gap-return UX (Sprint 6)

### Low Impact / Low Effort

- Dismiss food grid hint after first use
- Mark as Done → Done text change
- Add `min="0"` to cigs input
- Notes placeholder adapts to day type
- Rest-day plan header (Quick Win #13)
- Decimal protein in custom food modal
- Rename food coach banner
- Clear slot action
- Next-week preview on Plan screen
- Knee segment inactive colors
- Bottom nav `aria-label`
- Sparkline SVG alt text

### Bible principle → sprint traceability

| Principle | Sprint | Deliverable |
|-----------|--------|-------------|
| App informs, Coach advises | 5 | observation-engine Level 1–2 only |
| Silence = on course | 5 | no observation without active event |
| Meaningful events, not states | 4 | event registry + surface-once |
| Training blocks are chapters | 2 | block context chip |
| App knows current block | 2 | block-context.js stub |
| Gaps are chapters, not failures | 6 | gap-return UX |
| Rest days maintain readiness | 2 | rest-day recovery block |
| Bad days = objective facts | 2 | soft export |

---

## Beyond the Roadmap

| # | Item | Notes |
|---|------|-------|
| 1 | **Close the coaching loop** | Coach Skill responses come back into the app automatically via API |
| 2 | **AI coaching inside the app** | Replace clipboard workflow with in-app coaching endpoint |
| 3 | **Editable goals and adaptable plans** | Block context + weight goal in Supabase; eliminates `block-context.js` stub |
| 4 | **Training block chapters (full history UI)** | History organized by goals and intent, not calendar dates |
| 5 | **Coach Skill → app block sync** | Script to push `current-block.md` fields into app config / Supabase after weekly debrief |

**Merged into Sprint 4–5 (no longer Beyond):** Proactive observation intelligence — now `meaningful-events.js` + `observation-engine.js`.

---

## Related documents

- `ROADMAP-AMENDMENTS.md` — amendment rationale (merged 06 Jul 2026)
- `PRODUCT-STRATEGY.md` — vision and IA
- `SCREEN-SPECS.md` — screen-level interaction specs
- `DESIGN-SYSTEM.md` §1.2 — observation block visual spec; logic in `observation-engine.js`
- `PRODUCT-BIBLE.md` — authority for all principles above
