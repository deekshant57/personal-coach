# Run Import Guide

Parse activities from **GPX** or **Strava bulk export** — outputs JSON history and prints fields to enter in the app.

---

## After each run (recommended)

1. Record on Strava app
2. strava.com → activity → **⋯** → **Export GPX**
3. Save to `imports/runs/`
4. Run:

```bash
cd personal-coach-app
python3 scripts/import-runs.py --folder
```

5. Open the app **Today** tab → enter **km, time, pace, cadence, RPE, knee** on the run day

**Parsed for you:** distance, time, pace (printed + saved to `imports/processed/activities.json`)  
**You still log in app:** knee, RPE, food, supplements

---

## Strava bulk backfill

```bash
python3 scripts/import-runs.py --zip ~/Downloads/strava_export.zip
# or
python3 scripts/import-runs.py --csv ~/Downloads/activities.csv
```

---

## Dependencies

```bash
pip3 install -r requirements.txt
```
