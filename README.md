# Personal Coach

Half-marathon coaching system + daily logging PWA.

**Open this folder as your Cursor workspace** so coach rules (`.cursor/rules/`) load correctly.

## Quick start

| Task | Command / location |
|------|-------------------|
| Daily logging | PWA — `index.html` or deployed URL |
| End-of-day debrief | App → Debrief tab → paste into Cursor |
| Monday weekly debrief | App Debrief (Monday) → Cursor |
| Issue new week plan | Edit `coach/week-plans.py` → `python3 seed-plans.py` |
| GPX after run | `imports/runs/` → `python3 scripts/import-runs.py --folder` |

See **`COACH-CONTEXT.md`** for full workflow.

## Layout

```
coach/week-plans.py    # WEEK_PLANS source of truth
personal-details.md    # Athlete profile
seed-plans.py          # Sync plans → Supabase
scripts/               # import-runs, icons, sprites
js/ css/ index.html    # PWA
docs/                  # RUN-IMPORT.md
*.sql                  # Supabase migrations
```

## Python deps

```bash
pip3 install -r requirements.txt
```
