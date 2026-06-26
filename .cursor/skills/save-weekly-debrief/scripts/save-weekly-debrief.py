#!/usr/bin/env python3
"""
Upsert a weekly coach debrief into Supabase coach_debriefs.

Hard limits:
  - Table: coach_debriefs only
  - Operation: UPSERT on (user_id, debrief_monday, debrief_type) — one row per Monday
  - Backs up existing row before overwrite on --apply

Usage:
  export SUPABASE_SERVICE_ROLE_KEY='…'
  python3 save-weekly-debrief.py --debrief-monday 2026-06-29 --file debrief.md --dry-run
  python3 save-weekly-debrief.py --debrief-monday 2026-06-29 --file debrief.md --apply
  cat debrief.md | python3 save-weekly-debrief.py --debrief-monday 2026-06-29 --apply

Auth: SUPABASE_SERVICE_ROLE_KEY required. Never commit this key.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import ssl
import sys
import urllib.error
import urllib.request
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parent.parent
BACKUPS_DIR = SKILL_DIR / "backups"

SUPABASE_URL = os.environ.get(
    "SUPABASE_URL", "https://lqtwtcgnzpsrhfuynzdk.supabase.co"
)
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
DEFAULT_USER_ID = "d6f25dae-4cc8-48dd-9822-fbccf9a92139"
SUPABASE_USER_ID = os.environ.get("SUPABASE_USER_ID", DEFAULT_USER_ID)

CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE

MIN_MARKDOWN_LEN = 200


def api_request(
    path: str,
    *,
    method: str = "GET",
    data: dict | None = None,
    prefer: str | None = None,
) -> tuple[int, str]:
    key = SUPABASE_SERVICE_ROLE_KEY
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }
    if prefer:
        headers["Prefer"] = prefer
    elif method in ("POST", "PATCH"):
        headers["Prefer"] = "return=representation"
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, context=CTX) as resp:
            return resp.status, resp.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()


def parse_iso(d: str) -> date:
    return date.fromisoformat(d)


def prior_week_range(debrief_monday: date) -> tuple[date, date]:
    """Week covered by a Monday check-in (prior Mon–Sun)."""
    end = debrief_monday - timedelta(days=1)
    start = debrief_monday - timedelta(days=7)
    return start, end


def load_markdown(args: argparse.Namespace) -> str:
    if args.file:
        path = Path(args.file)
        if not path.is_file():
            print(f"ERROR: file not found: {path}", file=sys.stderr)
            sys.exit(1)
        return path.read_text(encoding="utf-8")
    if not sys.stdin.isatty():
        return sys.stdin.read()
    print("ERROR: pass --file or pipe markdown on stdin", file=sys.stderr)
    sys.exit(1)


def extract_scores(markdown: str) -> dict | None:
    """Best-effort parse from Section 1 — WEEK SCORE."""
    section = markdown
    m = re.search(
        r"section\s*1[^\n]*\n(.*?)(?=section\s*2|##\s*section\s*2|$)",
        markdown,
        re.IGNORECASE | re.DOTALL,
    )
    if m:
        section = m.group(1)

    def score(label: str) -> int | None:
        pat = rf"{label}\s*[·:.]?\s*(\d+)\s*/\s*10"
        hit = re.search(pat, section, re.IGNORECASE)
        return int(hit.group(1)) if hit else None

    scores = {
        "training": score("training"),
        "nutrition": score("nutrition"),
        "recovery": score("recovery"),
        "adherence": score("adherence"),
    }
    nums = [v for v in scores.values() if v is not None]
    if not nums:
        return None
    scores["composite"] = round(sum(nums) / len(nums), 1)
    return scores


def fetch_existing(debrief_monday: str) -> dict | None:
    path = (
        f"coach_debriefs?user_id=eq.{SUPABASE_USER_ID}"
        f"&debrief_monday=eq.{debrief_monday}"
        f"&debrief_type=eq.weekly"
        f"&select=*"
    )
    status, body = api_request(path)
    if status >= 400:
        print(f"ERROR fetch coach_debriefs: {status} {body}", file=sys.stderr)
        sys.exit(1)
    rows = json.loads(body) if body else []
    return rows[0] if rows else None


def backup_row(row: dict | None, run_id: str, debrief_monday: str) -> Path | None:
    if not row:
        return None
    BACKUPS_DIR.mkdir(parents=True, exist_ok=True)
    path = BACKUPS_DIR / f"{run_id}_{debrief_monday}_weekly.json"
    with open(path, "w", encoding="utf-8") as f:
        json.dump(row, f, indent=2, ensure_ascii=False)
    return path


def upsert_debrief(payload: dict) -> tuple[int, str]:
    path = "coach_debriefs?on_conflict=user_id,debrief_monday,debrief_type"
    return api_request(
        path,
        method="POST",
        data=payload,
        prefer="return=representation,resolution=merge-duplicates",
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Save weekly coach debrief to Supabase")
    parser.add_argument(
        "--debrief-monday",
        required=True,
        help="Monday check-in date YYYY-MM-DD (debrief issued this day)",
    )
    parser.add_argument(
        "--week-covered-start",
        help="Monday of week reviewed (default: prior week before debrief_monday)",
    )
    parser.add_argument(
        "--week-covered-end",
        help="Sunday of week reviewed (default: day before debrief_monday)",
    )
    parser.add_argument("--file", help="Path to markdown file")
    parser.add_argument("--dry-run", action="store_true", help="Preview only")
    parser.add_argument("--apply", action="store_true", help="Write to Supabase")
    args = parser.parse_args()

    if args.dry_run and args.apply:
        print("ERROR: use --dry-run OR --apply, not both", file=sys.stderr)
        sys.exit(1)
    if not args.dry_run and not args.apply:
        print("ERROR: pass --dry-run to preview or --apply to write", file=sys.stderr)
        sys.exit(1)

    if not SUPABASE_SERVICE_ROLE_KEY:
        print(
            "ERROR: set SUPABASE_SERVICE_ROLE_KEY (Supabase Dashboard → Settings → API)",
            file=sys.stderr,
        )
        sys.exit(1)

    debrief_monday = parse_iso(args.debrief_monday)
    if debrief_monday.weekday() != 0:
        print(
            f"WARNING: {args.debrief_monday} is not a Monday — continuing anyway",
            file=sys.stderr,
        )

    default_start, default_end = prior_week_range(debrief_monday)
    week_start = parse_iso(args.week_covered_start) if args.week_covered_start else default_start
    week_end = parse_iso(args.week_covered_end) if args.week_covered_end else default_end

    markdown = load_markdown(args).strip()
    if len(markdown) < MIN_MARKDOWN_LEN:
        print(
            f"ERROR: markdown too short ({len(markdown)} chars, min {MIN_MARKDOWN_LEN})",
            file=sys.stderr,
        )
        sys.exit(1)

    scores = extract_scores(markdown)
    payload = {
        "user_id": SUPABASE_USER_ID,
        "debrief_monday": args.debrief_monday,
        "week_covered_start": week_start.isoformat(),
        "week_covered_end": week_end.isoformat(),
        "debrief_type": "weekly",
        "markdown": markdown,
        "scores": scores,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    existing = fetch_existing(args.debrief_monday)
    run_id = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")

    print("── Weekly debrief save preview ──")
    print(f"User:              {SUPABASE_USER_ID}")
    print(f"Debrief Monday:    {args.debrief_monday}")
    print(f"Week covered:      {week_start.isoformat()} – {week_end.isoformat()}")
    print(f"Markdown length:   {len(markdown)} chars")
    print(f"Scores (parsed):   {json.dumps(scores) if scores else '(none)'}")
    print(f"Existing row:      {'yes — will overwrite' if existing else 'no — insert'}")

    if args.dry_run:
        print("\n[DRY RUN] No changes written.")
        return

    backup_path = backup_row(existing, run_id, args.debrief_monday)
    if backup_path:
        print(f"Backup:            {backup_path}")

    status, body = upsert_debrief(payload)
    if status >= 400:
        print(f"\nERROR upsert: {status} {body}", file=sys.stderr)
        sys.exit(1)

    saved = json.loads(body)[0] if body else payload
    print(f"\n[APPLIED] coach_debriefs id={saved.get('id', '?')}")
    print(f"Week tab will show this report for week starting {week_start.isoformat()}")


if __name__ == "__main__":
    main()
