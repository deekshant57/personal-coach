# Coach Context — Personal Coach

Integrated coaching system for the **Vedanta Zinc City Half Marathon (6 Sep 2026)**.

**Workspace:** open this folder (`personal-coach-app/`) as your Cursor project root.

## File map

| File | Purpose |
|------|---------|
| `personal-details.md` | Athlete profile — metrics, history, blood work, lifestyle |
| `coach/week-plans.py` | Coach-authored `WEEK_PLANS` — sync to Supabase via `seed-plans.py` |
| `seed-plans.py` | Push week plans → Supabase `daily_plans` |
| `scripts/import-runs.py` | Parse GPX / Strava export → JSON + print fields for app |
| `docs/RUN-IMPORT.md` | GPX import guide |
| `coach-debriefs.sql` | Supabase table for archived weekly coach reports |
| `.cursor/rules/*.mdc` | Coach persona, debrief protocol, weekly plans |
| `js/` | PWA — daily logging, debrief paste, week/progress views |

## Daily workflow

1. **Today tab** — plan, vitals, training, food summary, supplements
2. Record run on Strava
3. Optional: GPX → `imports/runs/` → `python3 scripts/import-runs.py --folder`
4. Log km / pace / RPE / knee / meals / supplements in the **app**
5. **Debrief tab** → copy paste → Cursor: `End of day tracker upload — DD MMM,YY`
6. Coach returns 5-section debrief

## Monday workflow

1. Weigh in → log weight + waist in app vitals
2. Debrief tab (Monday) → copy paste with prior-week rollups
3. Cursor: `Monday — weekly debrief — DD MMM,YY`
4. Coach returns 8-section debrief + Week N+1 plan → update `coach/week-plans.py` → `python3 seed-plans.py`
5. **save weekly debrief** skill → `coach_debriefs` (Week tab)

## After plan changes

```bash
python3 seed-plans.py
# If RLS blocks REST: python3 seed-plans.py --sql-only → paste in Supabase SQL Editor
```

## Coach calculates — you log portions

Food in app by portions. Coach estimates protein/calories in debrief.

## Race timeline

~10 weeks from late June 2026. Long-run target: **18–20 km**. Weight target: **70–71 kg**.
