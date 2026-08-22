# Friends Product Spec — Plan-First Athletic Logger

**Version:** 1.0  
**Date:** 21 Aug 2026  
**Status:** Phase A–C implemented in app  
**Parents:** `PRODUCT-BIBLE.md`, `APP-GOALS.md`  
**Related:** `WEEK-STATS-SPEC.md` §7 (custom foods), `docs/SCREEN-SPECS.md`, `js/athlete-profile.js`

This document locks product decisions for letting friends use the app without Cursor/coach authoring every day. It is not a UI mock. Implement in phase order; do not skip to charts or Open Food Facts before Phase A.

---

## 1. Product verdict (locked)

**What we are building:** A plan-first athletic logger.

```
Setup (once) → Week template → Daily log (flexible) → Trends → Coach Skill (optional)
```

**What we are not building:** MyFitnessPal clone, Hevy clone, social feed, streak gamification, photo-AI calorie guessing as source of truth.

**Wedge vs competitors:**

| Competitor | Their win | Our win |
|------------|-----------|---------|
| Hevy | Fast set logging | Plan + nutrition + memory in one place |
| MyFitnessPal | Huge food DB | Personal staples + targets + coaching history |
| Lifesum | Pretty wellness | Quiet, non-shaming logging (Product Bible) |
| MacroFactor | Adaptive expenditure | Coach Skill judgment + athlete memory |

**Identity stays:** Athletic Memory (`PRODUCT-BIBLE` §1). Friends get the same philosophy — not a second product brand.

---

## 2. Problem → requirement map

| Pain | Root cause | Spec section |
|------|------------|--------------|
| Miss morning workout → food sequence breaks | Meal slots bound to planned `day_type` only; no planned vs actual session | §5 Day-shift |
| Friends can't start alone | Profile/targets/plan live in markdown + coach-authored `daily_plans` | §4 Onboarding |
| Unknown foods | Small `FOOD_ITEMS` + custom text without durable macros | §6 Food resolution |
| No gym progression | `workout_logs` mostly free text; sets not first-class | §8 Phase B |
| Charts before setup | Temptation to polish Progress without targets | §3 Phases |

---

## 3. Build phases (do not reorder)

### Phase A — Setup + day flexibility (ship first)

1. Athlete setup / onboarding → DB profile + nutrition targets  
2. Week template → seed next 7–14 days of `daily_plans`  
3. Day-shift state machine (skip / move session / remap slots)  
4. Header shows planned vs actual when they differ  

**Exit criteria:** A new friend can sign up, set protein/kcal + Mon–Sun day types, log food after moving a morning gym session to evening, without Deekshant editing Supabase by hand.

### Phase B — Dual logging depth

1. Gym set logger (Hevy-lite): exercise → sets (kg × reps) → last performance  
2. Macro awareness on Food: protein + kcal vs target always visible  
3. Minimal charts: weight, protein adherence, key-lift progression  

**Exit criteria:** Gym day logs structured sets; Progress shows 7/28-day protein hit rate.

### Phase C — Food discovery

1. Three-layer food resolution (local → open DB → manual)  
2. Optional barcode via Open Food Facts  
3. Confirm-and-save into `user_custom_foods`  

**Exit criteria:** Unknown packaged food resolvable in ≤30s and reappears as one tap next time.

---

## 4. Athlete setup (onboarding)

### 4.1 When it runs

- After first successful auth, if `athlete_profiles.setup_completed_at` is null → force Setup flow (block Today/Food until done or “Skip for now” with soft gate).  
- Existing users (Deekshant, Namrata): backfill from `js/athlete-profile.js` + `personal-details.md` once; mark setup complete.  
- Re-entry: Settings → Edit profile / targets / week template (never delete history).

### 4.2 Fields (v1)

**Identity**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `display_name` | text | yes | |
| `goal_primary` | enum | yes | `fat_loss` \| `recomp` \| `strength` \| `endurance` \| `general` |
| `sex` | enum | optional | Used only for default calorie hints; athlete can override |
| `height_cm` | number | optional | |
| `starting_weight_kg` | number | recommended | Seeds weight trend |
| `diet_style` | enum | yes | `veg` \| `eggetarian` \| `non_veg` — filters default food grid |
| `injuries_notes` | text | optional | Shown to Coach Skill later; app does not advise |

**Nutrition targets (required for “logging feels useful”)**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `protein_target_g` | int | yes | Default suggestion by goal; editable |
| `calorie_target_training` | int | yes | Used on Run/Gym/Bodyweight days |
| `calorie_target_rest` | int | yes | Rest / Active Recovery |
| `calorie_target_special` | int | optional | e.g. Namrata Thursday lighter day |
| `special_day_weekday` | 0–6 | optional | If special target set |

Targets on `daily_plans` remain the **day-level source of truth**. Profile holds **defaults** used when seeding / when plan row has nulls.

**Training template (required)**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `default_session_window` | enum | yes | `morning` \| `evening` \| `flexible` |
| `week_template` | jsonb | yes | 7 entries: Mon…Sun |

`week_template` shape:

```json
[
  { "weekday": 1, "day_type": "Gym", "session_window": "morning", "label": "Lower" },
  { "weekday": 2, "day_type": "Gym", "session_window": "morning", "label": "Upper" },
  { "weekday": 0, "day_type": "Rest", "session_window": null, "label": null }
]
```

Allowed `day_type` values: existing `DAY_TYPES` in `js/data.js` — `Run`, `Bodyweight`, `Active Recovery`, `Rest`, `Gym`.

### 4.3 Seeding `daily_plans`

On setup complete (and on “Extend plan” later):

1. For each date in `[today … today+13]` missing a `daily_plans` row for this `user_id`:  
   - Set `day_type`, `protein_target`, `calorie_target` from template + profile defaults.  
   - Set `directive` to template `label` or a short default (“Training day” / “Rest”).  
   - Leave run/workout detail null until athlete or coach fills.  
2. Never overwrite rows that already have coach-authored `run_type` / `workout_detail` / non-empty `directive` beyond template label — **preserve coach work**.  
3. Coach Skill / Cursor path remains valid: PATCH `daily_plans` still wins for coached athletes.

### 4.4 Schema (Phase A migration)

```sql
CREATE TABLE IF NOT EXISTS athlete_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  goal_primary TEXT NOT NULL DEFAULT 'general',
  sex TEXT,
  height_cm NUMERIC,
  starting_weight_kg NUMERIC,
  diet_style TEXT NOT NULL DEFAULT 'veg',
  injuries_notes TEXT,
  protein_target_g INT NOT NULL DEFAULT 120,
  calorie_target_training INT NOT NULL DEFAULT 2000,
  calorie_target_rest INT NOT NULL DEFAULT 1800,
  calorie_target_special INT,
  special_day_weekday INT CHECK (special_day_weekday BETWEEN 0 AND 6),
  default_session_window TEXT NOT NULL DEFAULT 'morning',
  week_template JSONB NOT NULL DEFAULT '[]',
  setup_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE athlete_profiles ENABLE ROW LEVEL SECURITY;
-- RLS: user can CRUD own row only (match supabase-auth patterns)

-- Day-level planned vs actual (Phase A)
ALTER TABLE daily_plans
  ADD COLUMN IF NOT EXISTS planned_session_window TEXT,  -- morning|evening|flexible
  ADD COLUMN IF NOT EXISTS actual_session_window TEXT,   -- morning|evening|skipped|null
  ADD COLUMN IF NOT EXISTS session_status TEXT DEFAULT 'planned';
  -- planned | completed | moved | skipped
  ADD COLUMN IF NOT EXISTS slot_scheme TEXT;             -- null = derive from day_type
```

`js/athlete-profile.js` becomes a **read-through cache**: prefer `athlete_profiles` row; hard-coded `PROFILES` map is fallback for chrome flags until migrated (`showRunningTrends`, etc. can move to profile JSON `ui_flags` in a later migration).

### 4.5 Defaults (honest, not magic)

- Do **not** invent TDEE AI in-app (Level 3 coaching).  
- Offer simple presets: “Strength / fat loss beginner” → protein 1.6–2.0 g/kg suggestion, calories left blank until user enters or picks a preset band.  
- MacroFactor-style adaptive expenditure is **out of scope** until Coach Skill owns it.

---

## 5. Day-shift state machine

### 5.1 Why

Today: `MEAL_SLOTS[day_type]` is fixed (`js/data.js`). A planned `Gym` morning still shows `pre-workout` / `post-workout` even if the athlete trains at 7 PM or skips. Logging works; **sequence and coaching meaning break**.

### 5.2 Concepts

| Term | Meaning |
|------|---------|
| `planned_session_window` | What the plan assumed (from template / coach) |
| `actual_session_window` | What happened: `morning` \| `evening` \| `skipped` |
| `session_status` | `planned` \| `completed` \| `moved` \| `skipped` |
| `slot_scheme` | Which meal-slot list to use (see §5.4) |
| `day_type` | Training identity (Run/Gym/…) — only changes if athlete explicitly changes day type |

**Rule:** Moving a session does **not** delete the plan. It records discontinuity for the Coach Skill (`PRODUCT-BIBLE` §18).

### 5.3 Athlete actions (Today tab, one primary control)

| Action | Effect |
|--------|--------|
| **Keep as planned** | No-op; status stays `planned` until training marked done → `completed` |
| **Move to evening** | `actual_session_window = evening`, `session_status = moved`, remap slots if needed |
| **Move to morning** | Symmetric |
| **Skip session** | `actual_session_window = skipped`, `session_status = skipped`; offer slot scheme `rest_day` **or** keep training slots for “ate like training day” (athlete choice) |
| **Change day type** | Explicit confirm; updates `day_type` + default slots; rare — prefer Move/Skip |

Marking training **Done** sets `session_status = completed` and fills `actual_session_window` from the shift control (default = planned).

### 5.4 Slot schemes

Keep `MEAL_SLOTS` in `data.js`. Add resolver:

```
effectiveSlots(plan) =
  if plan.slot_scheme set → MEAL_SLOTS[schemeKey]
  else → MEAL_SLOTS[plan.day_type]
```

| Scheme key | Slots | When |
|------------|-------|------|
| `Run` | pre-run, post-run, lunch, snack, dinner | Default run day |
| `Gym` / `Bodyweight` | pre-workout, post-workout, lunch, snack, dinner | Default training |
| `Rest` / `Active Recovery` | breakfast, lunch, snack, dinner | Rest / skip-as-rest |
| `time_based` | meal-1 … meal-5 | Escape hatch — labels editable later |

**Remap on Move/Skip (v1 algorithm):**

1. If switching Gym/Run → Rest scheme:  
   - `pre-*` → `breakfast`  
   - `post-*` → merge into `lunch` if both filled (prompt), else `lunch`  
   - `lunch`/`snack`/`dinner` keep names  
2. If only window changes (morning → evening) but day_type stays Gym:  
   - **Keep** pre/post-workout slots; update UI copy: “Pre-workout (evening session)”.  
   - Do **not** force breakfast rename — that was the user pain of broken sequence without need.  
3. Persist food rows by **new** `meal_slot` keys; migrate JSON with a single transactional remap helper in `food.js`.  
4. Never drop macros silently; if collision, merge quantities and append note `"merged on day-shift"`.

### 5.5 State diagram

```
                    [open day]
                        |
                        v
                 +--------------+
                 |   planned    |
                 +------+-------+
                        |
        +---------------+---------------+
        |               |               |
        v               v               v
   Move window     Skip session    Log training Done
        |               |               |
        v               v               v
     moved           skipped        completed
  (slots may       (slots → rest     (actual_window
   stay training    or keep train)    set)
   scheme)
```

Undo: “Reset day schedule” restores `planned` + original `slot_scheme` **only if** no food logged yet; if food exists, require confirm and run reverse remap or leave slots as-is and only reset status flags.

### 5.6 UI copy (Product Bible voice)

- Fact, not guilt: “Session moved to evening.”  
- Not: “You missed your morning workout!”  
- Observation OK: “Planned morning · actual evening.”

### 5.7 Acceptance tests (Phase A)

1. Plan Gym morning → Move to evening → slots still pre/post-workout; header shows moved; food saves to same slot keys.  
2. Skip session → choose rest slots → `pre-workout` log migrates to `breakfast`; protein total unchanged.  
3. Skip → keep training slots → pre/post remain; status `skipped`.  
4. Friend with empty `daily_plans` completes setup → 14 days seeded.  
5. Coach-authored directive on a day is not wiped by re-seed.

---

## 6. Food resolution (3 layers)

### 6.1 Priority order (every search / add)

```
1. Local staples     FOOD_ITEMS (data.js) + CUSTOM_FOODS_REGISTRY
2. User library      user_custom_foods (per user_id)
3. Recent foods      From prior food_logs (Phase 3 UI)
4. Manual create     Always available — Confirm sheet required
5. Open lookup       Open Food Facts — ONLY on explicit "Look up packaged" / barcode
```

**Never auto-call Open Food Facts while the user is typing.** Indian home-cooked names are not covered well by OFF; Your foods is the real database.

After layer 4 or 5, **Confirm macros → Save to user library** so layer 2 wins next time.

### 6.2 Layer details

**Layer 1 — Personal staples**  
Indian veg/egg reference set stays. Diet style can hide non-matching items. This covers ~80% of home logging for current athletes.

**Layer 2 — `user_custom_foods`**  
Implement `WEEK-STATS-SPEC` §7 if not fully shipped:

```sql
CREATE TABLE user_custom_foods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  protein NUMERIC NOT NULL DEFAULT 0,
  calories NUMERIC NOT NULL DEFAULT 0,
  fat NUMERIC DEFAULT 0,
  carbs NUMERIC,                 -- optional Phase B+
  unit TEXT DEFAULT '1',
  barcode TEXT,                  -- Phase C
  source TEXT,                   -- manual|off|usda|registry
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, lower(name))  -- or unique index on lower(name)
);
```

**Layer 3 — Open Food Facts (opt-in only)**  
- Triggered only by **Look up packaged** or barcode — never on search `input`.  
- API: product by barcode + text search ([OFF API docs](https://openfoodfacts.github.io/openfoodfacts-server/api/)).  
- License: ODbL — attribution in lookup panel.  
- Require descriptive `User-Agent`.  
- Prefer `nutriments.energy-kcal_100g` / proteins_100g; convert to per serving with user portion.  
- Always show **editable** confirm sheet before meal add.  
- Cache successful lookups into `user_custom_foods` with `source = 'off'`.

**Layer 4 — Manual**  
Existing custom food modal: name + protein + kcal (+ fat). Source `manual`.

### 6.3 Explicit non-goals for food

- No AI meal photo as primary calorie source (Lifesum-style).  
- No attempt to match MFP’s 20M foods.  
- No shaming UI for over-target days (`PRODUCT-BIBLE` §14).

### 6.4 Acceptance tests (Phase C)

1. Search “paneer” → hits Layer 1 instantly.  
2. Custom “Fitworld whey scoop” saved → appears under Your foods.  
3. Barcode miss → manual create path in one screen.  
4. OFF hit → user edits kcal → saved to library → second log is one tap.

---

## 7. Logging model after setup

### 7.1 Daily loop (unchanged philosophy)

Vitals → Training → Food → Supplements → Notes → (optional) debrief paste.

Friends without Coach Skill: debrief tab can stay as **export / self-review**; Cursor paste optional.

### 7.2 Targets display

Header / Food tab always show:

```
Protein  82 / 100 g
Calories 1,240 / 1,800 kcal   (from daily_plans that day)
```

Use training vs rest vs special target from plan row; fall back to `athlete_profiles`.

### 7.3 What Coach Skill still owns

- Judgment, load changes, race calls, adaptive calories  
- Week plan quality beyond template seed  
- Interpreting skipped/moved sessions  

App owns capture + remember + observe only (`PRODUCT-BIBLE` §3, §9).

---

## 8. Phase B — Gym / charts (summary)

Defer detailed UI to implementation notes; scope lock only:

**Gym logger (Hevy-lite)**  
- Extend `workout_logs.exercises_json` (already columned in `supabase-workout-exercises.sql`):  

```json
[
  {
    "exercise_id": "goblet_squat",
    "name": "Goblet squat",
    "sets": [
      { "kg": 20, "reps": 10, "rpe": 7 },
      { "kg": 20, "reps": 10 }
    ]
  }
]
```

- Seed ~40 exercises + custom exercise create.  
- “Last time” prefetch for same `exercise_id`.  

**Charts (minimum)**  
- Weight sparkline (exists)  
- Protein target hit rate 7d / 28d  
- Top 3 lifts: estimated volume or best set over time  

No social, no streaks, no badges.

---

## 9. APP-GOALS amendments (required when Phase A starts)

Update `APP-GOALS.md` non-goals:

| Old | New |
|-----|-----|
| Not multi-athlete / social / gamification | Not **social or gamification**; multi-athlete **is** in scope (RLS + setup) |
| Not weekly plan authoring in-app | Template self-seed **is** in scope; rich coach plan authoring stays Coach Skill |
| Not macro coaching in-app | Targets + adherence display **in** scope; adaptive coaching stays Coach Skill |

Add JTBD:

- **JTBD-9** — Complete setup (targets + week template) without a human coach  
- **JTBD-10** — Shift or skip today’s session without breaking meal sequence  

Add success criteria:

- **S11** — New user reaches first food log in ≤10 minutes including setup  
- **S12** — Move/Skip preserves protein/kcal totals (± merge rules)

---

## 10. File / module map (implementation)

| Area | Touch |
|------|--------|
| Migration | `athlete-profiles.sql` (new), alter `daily_plans` |
| Profile | `js/athlete-profile.js` → fetch Supabase; keep flag fallbacks |
| Setup UI | `js/setup.js` + setup screen in `index.html` |
| Day shift | `js/day-shift.js` — status + slot remap |
| Food slots | `js/food.js`, `getCurrentMealSlots()` in `app.js` |
| Plans seed | `js/plan-seed.js` — template → `daily_plans` |
| Custom foods | `js/food.js` + `user-custom-foods.sql` (WEEK-STATS §7) |
| OFF client | `js/food-lookup-off.js` (Phase C only) |
| Docs | This file; amend `APP-GOALS.md` when coding starts |

---

## 11. Out of scope (explicit)

- Wear OS / Health Connect sync  
- Barcode **without** confirm sheet  
- Photo / voice calorie AI as authority  
- Friend feeds, following, copying workouts (Hevy social)  
- In-app Coach Skill automation  
- Replacing Cursor coaching for coached athletes  

---

## 12. Decision log

| Date | Decision |
|------|----------|
| 21 Aug 2026 | Plan-first > tracker-first |
| 21 Aug 2026 | Phase A before OFF / Hevy charts |
| 21 Aug 2026 | Move session prefers keeping training meal slots; Skip offers rest remap |
| 21 Aug 2026 | Food: staples → user library → OFF → manual; always confirm external macros |
| 21 Aug 2026 | `athlete_profiles` is source of truth for friends; markdown coach files remain for coached athletes |

---

## 13. Immediate next implementation slice

When coding starts, do **only**:

1. `athlete_profiles` migration + RLS  
2. Setup wizard (targets + week template + seed 14 days)  
3. `day-shift.js` Move / Skip + header planned vs actual  
4. Wire `getCurrentMealSlots()` through `slot_scheme`  

Stop before OFF, before set graphs, before Progress redesign.
