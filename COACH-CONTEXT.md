# Coach Context — Personal Coach

Integrated coaching system for **Half Marathon (13 Dec 2026)**. Previous target (Vedanta Zinc City HM, 6 Sep) cancelled — replaced with Dec race.

**Workspace:** open this folder (`personal-coach-app/`) as your Cursor project root.

## File map

| File | Purpose |
|------|---------|
| `personal-details.md` | Athlete profile — metrics, history, blood work, lifestyle |
| `coach/coaching-log.md` | Coaching decision history — read before every session, append after weekly debriefs |
| `coach/current-block.md` | Active training block — goal, priorities, phase, race timeline |
| `coach/week-plans.py` | Warm-up constants only — **no live weeks** (DB is source of truth) |
| `audit-week-plan.py` | Verify sequencing + block template vs `daily_plans` |
| `seed-plans.py` | Namrata / optional seed only — do **not** overwrite Deekshant from empty `WEEK_PLANS` |
| `scripts/import-runs.py` | Parse GPX / Strava export → JSON + print fields for app |
| `docs/RUN-IMPORT.md` | GPX import guide |
| `coach-debriefs.sql` | Supabase table for archived weekly coach reports |
| `.cursor/rules/*.mdc` | Coach persona, debrief protocol, nutrition rules |
| `js/` | PWA — daily logging, debrief paste, week/progress views |

## Daily workflow

1. **Today tab** — plan, vitals, training, food summary, supplements
2. Record run on Strava
3. Optional: GPX → `imports/runs/` → `python3 scripts/import-runs.py --folder`
4. Log km / pace / RPE / knee / meals / supplements in the **app**
5. **Debrief tab** → copy paste → Cursor: `End of day tracker upload — DD MMM,YY`
6. Coach returns 4-section debrief

## Monday workflow

1. Weigh in → log weight + waist in app vitals
2. Debrief tab (Monday) → copy paste with prior-week rollups
3. Cursor: `Monday — weekly debrief — DD MMM,YY`
4. Coach returns 9-section debrief + Week N+1 plan → **PATCH Supabase `daily_plans`** (source of truth)
5. Verify: `python3 audit-week-plan.py --week-of YYYY-MM-DD`
6. Coach appends decisions to `coach/coaching-log.md` (Section 9)
7. **save weekly debrief** skill → `coach_debriefs` (Week tab)

## After plan changes

```bash
# Confirm DB layout + adjacency rules
python3 audit-week-plan.py --week-of YYYY-MM-DD
```

## Coach calculates — you log portions

Food in app by portions. Coach estimates protein/calories in debrief.

## Race timeline

Half Marathon — **13 Dec 2026**. 3-phase plan:
- **Phase 1 (Aug 11 – Sep 27):** Hypertrophy + Base — 3 gym + 3 runs, maintenance calories
- **Phase 2 (Sep 29 – Nov 29):** HM Build — 2 gym + 4 runs, deficit, long run → 18 km
- **Phase 3 (Nov 30 – Dec 12):** Taper
Weight target: **~73 kg** by race day.

## Artifact relationships

| Artifact | Role |
|----------|------|
| `end-of-day-debrief.mdc` | Daily debrief — 4 sections |
| `weekly-debrief.mdc` | Weekly debrief — 9 sections (retrospective + plan + note + log update) |
| `weekly-plan-and-nutrition.mdc` | Nutrition coaching rules + reference tables |
| `body-comp.mdc` | Body composition scan interpretation |
| `resolve-custom-food-macros` skill | Manual — patch custom food P/kcal in `food_logs` |
| `save-weekly-debrief` skill | Manual — archive full report to `coach_debriefs` |
| App Debrief tab | Generates input paste for daily or Monday metrics |
| App Week tab | Reads `coach_debriefs` for the week covered (read-only) |

Coach responses are archived via `save-weekly-debrief` when invoked after Monday debrief. Not auto-saved.

Weekly debrief is **not** the `resolve-custom-food-macros` skill. That skill only patches `food_logs` for custom items with missing macros.
