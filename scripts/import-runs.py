#!/usr/bin/env python3
"""
Parse GPX or Strava bulk export — saves activity history JSON and prints run fields for app logging.

  python3 scripts/import-runs.py --folder
"""

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

from gpx_import import (  # noqa: E402
    IMPORTS_DIR,
    export_activities,
    parse_gpx,
    parse_strava_csv,
    parse_strava_zip,
)


def collect_gpx(paths: list[Path]) -> list[dict]:
    runs = []
    for path in paths:
        if path.suffix.lower() != ".gpx":
            continue
        run = parse_gpx(path)
        if run:
            runs.append(run)
            print(f"  Parsed GPX  {path.name}  →  {run['date']}  {run['distance_km']} km")
    return runs


def main():
    parser = argparse.ArgumentParser(description="Parse GPX or Strava export for app logging")
    parser.add_argument("paths", nargs="*", help="GPX file(s) or folder")
    parser.add_argument("--folder", action="store_true", help=f"Parse all GPX in {IMPORTS_DIR}")
    parser.add_argument("--csv", help="Strava bulk export activities.csv")
    parser.add_argument("--zip", help="Strava bulk export ZIP archive")
    args = parser.parse_args()

    runs = []

    if args.folder or (not args.paths and not args.csv and not args.zip):
        IMPORTS_DIR.mkdir(parents=True, exist_ok=True)
        gpx_files = list(IMPORTS_DIR.glob("*.gpx"))
        if not gpx_files:
            print(f"No GPX files in {IMPORTS_DIR}")
            print("\n1. Export GPX from strava.com → save to imports/runs/")
            print("2. python3 scripts/import-runs.py --folder")
            print("3. Enter km/time/pace in the app Run log")
            sys.exit(0)
        print(f"Scanning {IMPORTS_DIR} ...")
        runs = collect_gpx(gpx_files)

    elif args.csv:
        path = Path(args.csv)
        print(f"Reading {path} ...")
        runs = parse_strava_csv(path)

    elif args.zip:
        path = Path(args.zip)
        print(f"Reading {path} ...")
        runs = parse_strava_zip(path)

    else:
        for p in args.paths:
            path = Path(p)
            if path.is_dir():
                runs.extend(collect_gpx(list(path.glob("*.gpx"))))
            elif path.suffix.lower() == ".gpx":
                run = parse_gpx(path)
                if run:
                    runs.append(run)
            elif path.suffix.lower() == ".csv":
                runs.extend(parse_strava_csv(path))
            elif path.suffix.lower() == ".zip":
                runs.extend(parse_strava_zip(path))

    if not runs:
        print("No activities found.")
        sys.exit(0)

    print(f"\nSaving {len(runs)} activit{'y' if len(runs) == 1 else 'ies'} ...")
    stats = export_activities(runs)
    print(f"\nDone — {stats['saved']} in imports/processed/activities.json  |  {stats['runs']} run(s) to log in app")
    if stats.get("by_type"):
        print("By type:", ", ".join(f"{k} {v}" for k, v in sorted(stats["by_type"].items())))


if __name__ == "__main__":
    main()
