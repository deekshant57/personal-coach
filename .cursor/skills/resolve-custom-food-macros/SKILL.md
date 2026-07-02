---
name: resolve-custom-food-macros
description: >-
  Estimate protein and calories for custom foods not in data.js FOOD_ITEMS,
  using same-slot meal notes (custom_text) as estimation context, update the
  registry, and patch Supabase food_logs macros only. Use ONLY when the user
  explicitly asks to resolve custom food macros or run resolve-custom-food-macros.
disable-model-invocation: true
---

# Resolve Custom Food Macros

Manual coach workflow. **Never auto-run.** Invoked only by name in Cursor.

Every invocation **must** end with a Supabase patch (dry-run preview first, then `--apply`). Registry update alone is not a complete run.

## What this solves

- User logs **Custom** items in the app (name only → protein/calories default to 0).
- Coach meal plans mention foods not in `personal-coach-app/js/data.js` `FOOD_ITEMS`.
- **Slot notes** (`custom_text`) carry prep/portion detail ("extra ghee", "half portion", "100g") that changes macros but does not affect in-app totals today.
- The app **auto-resolves** known custom foods from `js/custom-foods-registry.js` on every Food/Today load (synced from this skill's registry). Cursor patch is only needed for **new** foods not yet in the registry, or bulk backfill before sync.

### In-app auto-resolve (primary path)

On load, the PWA:

1. Looks up each `custom_*` item with missing macros in `js/custom-foods-registry.js`
2. Converts **notes-only** rows to a custom item when notes match the registry exactly
3. Persists fixes to Supabase silently
4. Surfaces unresolved items in **Coach says** + Meals Logged alerts

After adding entries here, run:

```bash
python3 scripts/sync-food-registry.py
```

Then hard-refresh the PWA. The Cursor `--apply` patch is a **fallback** for dates already logged before sync, or when you cannot refresh the app.

---

## Hard limits — non-negotiable

Wrong edits are hard to undo. The skill and [scripts/patch-food-logs.py](scripts/patch-food-logs.py) **must not** violate these:

### Tables

| Allowed | Forbidden |
|---------|-----------|
| `food_logs` PATCH on existing rows by `id` | `daily_plans`, `daily_vitals`, `run_logs`, `workout_logs`, `week_plans` |
| | INSERT, DELETE, UPSERT, or bulk UPDATE without row `id` |

### `food_logs` columns

| May change | Never change |
|------------|--------------|
| `items` → only `protein` and `calories` on qualifying custom items | `date`, `meal_slot`, `custom_text`, `user_id`, `created_at` |
| `total_protein`, `total_calories` (recomputed from full `items`) | Any field on non-`food_logs` tables |

### `items[]` JSON rules

Patch **only** when **all** are true:

1. `id` starts with `custom_`
2. `protein` is 0 or missing **or** `calories` is 0 or missing
3. Registry has a match for normalized `name`

**Never modify:** `id`, `name`, `qty`, reference-grid items (`egg`, `chapati`, …), or custom items that **already have both** `protein > 0` and `calories > 0`.

**Never overwrite** existing non-zero macros unless the user explicitly says `recalculate`.

### Other files

| Allowed | Forbidden without explicit user request |
|---------|----------------------------------------|
| `custom-foods-registry.json` | `js/data.js`, `coach/week-plans.py`, `daily_plans` |
| Run `python3 scripts/sync-food-registry.py` after registry edits | Forgetting to sync — app won't see new entries |

**Use the patch script** — do not hand-write curl/SQL for Supabase. The script enforces the rules above.

---

## Meal bundle (unit of estimation)

Each `food_logs` row is a **meal bundle**. Always read these together:

| Field | Role |
|-------|------|
| `date`, `meal_slot` | Cross-ref `daily_plans` / `WEEK_PLANS` meals for that day |
| `items[]` | Grid + custom items — patch target for macros |
| `custom_text` | **Same-slot notes** — read-only context for estimation (never written by patch) |

Do not estimate a custom item in isolation when `custom_text` exists on the same row.

---

## Slot notes — what counts

### Macro-relevant (must influence Pass 2)

Portion, prep, or add-ons that change P/kcal:

- "extra ghee", "fried", "restaurant portion", "half bowl", "100g paneer", "bhurji style", "light oil", "no oil"

### Coach-only (ignore for macro resolution)

Deviations and context — belongs in daily Notes / debrief, not slot notes:

- "ate late", "felt full", "skipped", "work dinner", "didn't finish"

When ambiguous, prefer adjusting the estimate and show math in the resolution table.

---

## Data sources

| Source | What to scan |
|--------|--------------|
| `personal-coach-app/js/data.js` → `FOOD_ITEMS` | Skip known grid items |
| [custom-foods-registry.json](custom-foods-registry.json) | Reuse + write new estimates |
| `coach/week-plans.py` → `WEEK_PLANS` | `meals` text (estimation context only) |
| Supabase `food_logs` | `items[]` **and** `custom_text` per row |

**Read-only for estimation:** `daily_plans`, vitals, run/workout logs, daily `vitals.notes` — never write them.

## Scan order (mandatory)

1. **Previous calendar week** (Mon–Sun before the week containing today).
2. **Current week** (Mon–Sun containing today), days ≤ today unless user names a date.

---

## Two-pass resolution

### Pass 1 — Base macros (per custom item name)

Resolution priority:

1. `custom-foods-registry.json` (normalize: lowercase, trim, collapse spaces).
2. Previous week `food_logs` custom items with `protein > 0` or `calories > 0`.
3. Meal-plan text if coach already annotated macros.
4. **Estimate** from `.cursor/rules/weekly-plan-and-nutrition.mdc`. Show brief math.

Do not re-estimate if registry or prior week already has values (unless user says `recalculate`).

### Pass 2 — Notes-informed adjustment (same row)

After Pass 1, re-read `custom_text` for **that** `date` + `meal_slot` and adjust:

| Situation | Action |
|-----------|--------|
| Custom item + modifier notes | Scale or bump P/kcal (e.g. "150g paneer" vs default 100g → ×1.5; "extra ghee" → +7g P / +90 kcal per tbsp assumed) |
| Custom item + "half" / "small" | Scale Pass 1 down (~×0.5 unless qty already reflects it) |
| Custom item + "fried" / "restaurant" | Bump calories ~15–25% vs home-cooked baseline; show assumption |
| **Notes-only row** (no `items`, or no `custom_*` items) | Parse `custom_text` as food description → new registry entry → **flag:** user must add a Custom item with that name in app, then re-run patch |
| **Grid items + modifier notes** (e.g. 4 eggs + "extra ghee") | **Cannot patch grid items.** Flag in report; suggest logging `custom_extra ghee 1 tbsp` (or coach debrief adjustment) |

Store Pass 2 reasoning in registry `notes` field (estimation math), not in `custom_text`.

---

## Logging convention (tell user when relevant)

| What | Where |
|------|--------|
| Composite / one-off meals | Custom item with full descriptive name |
| Fat add-ons on grid meals | Second custom item ("extra ghee 1 tsp") — not notes alone |
| Prep / portion modifiers | Slot notes on same meal |
| Why you deviated | Today tab Notes / Deviations — not Food tab notes |

---

## Invocation workflow (every run)

```
1. Scan prev week → current week; build meal bundles (items + custom_text per row)
2. Pass 1 → Pass 2 resolve macros → update custom-foods-registry.json
3. Show resolution table (mandatory columns below)
4. --dry-run patch script → user sees exact diff
5. --apply patch script → backup then write
6. Report: rows patched, backup paths, unresolved items, notes-only flags, grid+modifier flags
```

### Step 3 — Resolution table (mandatory before patch)

| Date | Slot | Items | Slot notes | Food | Protein | Calories | Source / adjustment |
|------|------|-------|------------|------|---------|----------|---------------------|
| 24 Jun,26 | Lunch | paneer ×1 | extra ghee | paneer | 18→18 | 265→355 | registry + 1 tbsp ghee |

Include a **Flags** subsection when any row is notes-only or grid+modifier (unpatchable without user action).

### Step 4–5: Supabase patch (mandatory)

**Desktop:** scripts auto-load `SUPABASE_SERVICE_ROLE_KEY` from `personal-coach-app/.env` or parent `../.env` if present.

**Phone / Cloud Agent:** add a **Runtime Secret** in [Cursor Cloud Agents → Secrets](https://cursor.com/dashboard/cloud-agents):
- `SUPABASE_SERVICE_ROLE_KEY` — service_role key from Supabase Dashboard → Settings → API (never commit)
- `SUPABASE_URL` and `SUPABASE_USER_ID` are already in `.cursor/environment.json` (non-secret)

```bash
# Only needed if env is not loaded automatically:
export SUPABASE_SERVICE_ROLE_KEY='…'

# Preview — no writes
python3 .cursor/skills/resolve-custom-food-macros/scripts/patch-food-logs.py \
  --from YYYY-MM-DD --to YYYY-MM-DD --dry-run

# Apply — backs up each row to backups/ before PATCH
python3 .cursor/skills/resolve-custom-food-macros/scripts/patch-food-logs.py \
  --from YYYY-MM-DD --to YYYY-MM-DD --apply
```

Uses **service role** only — anon key cannot read `food_logs` under RLS. Service role bypasses RLS; `SUPABASE_USER_ID` scopes to your rows only.

**Rollback:** restore from `backups/<timestamp>_<date>_<slot>.json` — full row snapshot before patch.

### Registry entry format

```json
{
  "soy chunks": {
    "protein": 15,
    "calories": 120,
    "unit": "100g",
    "resolved_at": "2026-06-24",
    "source": "estimated",
    "notes": "dry, no oil — slot note confirmed"
  }
}
```

- `notes` = estimation math and Pass 2 adjustments (internal to registry).
- `custom_text` on `food_logs` = user's slot notes (never overwritten by this skill).

---

## Invocation examples

- "Run resolve-custom-food-macros"
- "Backfill custom food protein for this week"
- "@resolve-custom-food-macros"

Do **not** run during end-of-day debrief or Monday plan unless explicitly invoked.

## Promotion (suggest only)

If a custom food appears 3+ times in a week, suggest adding to `FOOD_ITEMS` in `data.js`. Do not edit unless user asks.
