---
name: save-weekly-debrief
description: >-
  Save a weekly coach debrief (8-section Cursor response) to Supabase coach_debriefs
  for read-only display on the app Week tab. Use ONLY when the user explicitly asks
  to save weekly debrief or run save-weekly-debrief.
disable-model-invocation: true
---

# Save Weekly Debrief

Manual coach workflow. **Never auto-run.** Invoked only by name in Cursor after a Monday weekly debrief is complete.

## What this solves

- Weekly coach report (sections 1–8) lives in Cursor chat only unless saved
- App Week tab can show the retrospective for a completed week
- One canonical report per Monday check-in — UPSERT overwrites if re-saved

## Prerequisites

1. Run `personal-coach-app/coach-debriefs.sql` in Supabase SQL Editor (once)
2. Coach has returned the full 8-section weekly debrief (`weekly-debrief.mdc`)
3. `coach/week-plans.py` / `seed-plans.py` sync is separate — this skill does **not** write `daily_plans`

---

## Hard limits — non-negotiable

| Allowed | Forbidden |
|---------|-----------|
| `coach_debriefs` UPSERT on `(user_id, debrief_monday, debrief_type)` | Any other table |
| `markdown`, `scores`, week date fields, `updated_at` | `daily_plans`, `food_logs`, `coach/week-plans.py` |

**Use the script** — do not hand-write curl/SQL.

---

## Workflow

### 1. Save coach response to a file (optional but recommended)

```bash
# e.g. reports/2026-06-29-weekly-debrief.md
```

Paste the full Cursor response including all 8 sections.

### 2. Dry-run

**Desktop:** scripts auto-load `SUPABASE_SERVICE_ROLE_KEY` from `personal-coach-app/.env` or parent `../.env`.

**Phone / Cloud Agent:** add `SUPABASE_SERVICE_ROLE_KEY` as a **Runtime Secret** in [Cursor Cloud Agents → Secrets](https://cursor.com/dashboard/cloud-agents). `SUPABASE_URL` and `SUPABASE_USER_ID` are in `.cursor/environment.json`.

```bash
python3 .cursor/skills/save-weekly-debrief/scripts/save-weekly-debrief.py \
  --debrief-monday 2026-06-29 \
  --file reports/2026-06-29-weekly-debrief.md \
  --dry-run
```

`--debrief-monday` = the Monday you ran check-in (not the first day of the week reviewed).

Default week covered = prior Mon–Sun (29 Jun debrief → covers 22–28 Jun).

### 3. Apply

```bash
python3 .cursor/skills/save-weekly-debrief/scripts/save-weekly-debrief.py \
  --debrief-monday 2026-06-29 \
  --file reports/2026-06-29-weekly-debrief.md \
  --apply
```

Or stdin:

```bash
pbpaste | python3 .cursor/skills/save-weekly-debrief/scripts/save-weekly-debrief.py \
  --debrief-monday 2026-06-29 --apply
```

### 4. Verify in app

Week tab → navigate to the **week covered** (e.g. 22–28 Jun) → Coach report card appears.

---

## Script reference

| Flag | Required | Notes |
|------|----------|-------|
| `--debrief-monday` | Yes | `YYYY-MM-DD` — Monday check-in date |
| `--file` | No* | Path to markdown |
| `--week-covered-start` | No | Override default prior Monday |
| `--week-covered-end` | No | Override default prior Sunday |
| `--dry-run` | One of | Preview |
| `--apply` | One of | Write + backup existing row |

\* Or pipe markdown on stdin.

Env: `SUPABASE_SERVICE_ROLE_KEY` (required), `SUPABASE_USER_ID` (optional), `SUPABASE_URL` (optional).

---

## Scores JSON (best-effort)

Script parses Section 1 for `Training · Nutrition · Recovery · Adherence` `/10` values into:

```json
{ "training": 7, "nutrition": 8, "recovery": 6, "adherence": 9, "composite": 7.5 }
```

Missing scores → `null` in DB. Not shown in app v1.

---

## Backups

Before overwrite, existing row → `.cursor/skills/save-weekly-debrief/backups/{timestamp}_{debrief_monday}_weekly.json`

---

## Relationship to other artifacts

| Artifact | Role |
|----------|------|
| `weekly-debrief.mdc` | Coach **writes** the 8-section report |
| `save-weekly-debrief` (this skill) | **Archives** report to Supabase |
| `resolve-custom-food-macros` | Unrelated — patches `food_logs` only |
| App Week tab | **Reads** `coach_debriefs` for week covered |

Do **not** run during daily debrief unless explicitly invoked.
