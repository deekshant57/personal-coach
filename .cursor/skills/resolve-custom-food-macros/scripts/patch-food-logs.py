#!/usr/bin/env python3
"""
Surgical Supabase patch: add protein/calories ONLY on custom_* food_log items.

Hard limits enforced in code (not optional):
  - Table: food_logs only
  - Rows: PATCH existing only — no INSERT, UPDATE-by-filter, DELETE, or UPSERT
  - items[]: only protein + calories on id starting with custom_ where both are 0/missing
  - Never changes: id, name, qty, custom_text, date, meal_slot, user_id, non-custom items
  - Recalculates total_protein / total_calories from full items array (derived)
  - Backs up every touched row before write

Usage:
  export SUPABASE_SERVICE_ROLE_KEY='…'   # Dashboard → Settings → API → service_role
  python3 patch-food-logs.py --from 2026-06-16 --to 2026-06-24 --dry-run
  python3 patch-food-logs.py --from 2026-06-16 --to 2026-06-24 --apply

Auth: requires SUPABASE_SERVICE_ROLE_KEY (bypasses RLS). Never commit this key.
Optional SUPABASE_USER_ID scopes reads/patches to one user (default: Deekshant).
"""

from __future__ import annotations

import argparse
import json
import os
import re
import ssl
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parent.parent
REGISTRY_PATH = SKILL_DIR / "custom-foods-registry.json"
BACKUPS_DIR = SKILL_DIR / "backups"
REPO_ROOT = SKILL_DIR.parents[2]
WORKSPACE_ROOT = SKILL_DIR.parents[3]


def load_env_file() -> None:
    """Load Supabase keys from .env without overwriting existing env."""
    for path in (
        REPO_ROOT / ".env",
        WORKSPACE_ROOT / ".env",
    ):
        if not path.is_file():
            continue
        for line in path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(
                key.strip(), value.strip().strip('"').strip("'")
            )


load_env_file()

SUPABASE_URL = os.environ.get(
    "SUPABASE_URL", "https://lqtwtcgnzpsrhfuynzdk.supabase.co"
)
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
DEFAULT_USER_ID = "d6f25dae-4cc8-48dd-9822-fbccf9a92139"
SUPABASE_USER_ID = os.environ.get("SUPABASE_USER_ID", DEFAULT_USER_ID)

CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE


def api_key() -> str:
    return SUPABASE_SERVICE_ROLE_KEY


def normalize_name(name: str) -> str:
    return re.sub(r"\s+", " ", (name or "").strip().lower())


def api_request(path: str, *, method: str = "GET", data: dict | None = None) -> tuple[int, str]:
    key = api_key()
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, context=CTX) as resp:
            return resp.status, resp.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()


def load_registry() -> dict:
    if not REGISTRY_PATH.exists():
        return {}
    with open(REGISTRY_PATH, encoding="utf-8") as f:
        return json.load(f)


def parse_items(raw) -> list:
    if raw is None:
        return []
    if isinstance(raw, str):
        return json.loads(raw)
    return list(raw)


def is_custom_item(item: dict) -> bool:
    return str(item.get("id", "")).startswith("custom_")


def needs_macros(item: dict) -> bool:
    if not is_custom_item(item):
        return False
    protein = item.get("protein") or 0
    calories = item.get("calories") or 0
    return protein == 0 or calories == 0


def lookup_macros(registry: dict, name: str) -> tuple[int, int] | None:
    entry = registry.get(normalize_name(name))
    if not entry:
        return None
    protein = int(entry.get("protein", 0))
    calories = int(entry.get("calories", 0))
    if protein <= 0 and calories <= 0:
        return None
    return protein, calories


def compute_totals(items: list) -> tuple[float, float]:
    total_p = 0.0
    total_c = 0.0
    for item in items:
        qty = item.get("qty") or 1
        total_p += (item.get("protein") or 0) * qty
        total_c += (item.get("calories") or 0) * qty
    return total_p, total_c


def patch_row_items(items: list, registry: dict) -> tuple[list, list[dict]]:
    """Return (new_items, change_log). new_items is unchanged if no patches."""
    changes = []
    new_items = []
    changed = False

    for item in items:
        patched = dict(item)
        if needs_macros(patched):
            macros = lookup_macros(registry, patched.get("name", ""))
            if macros:
                old_p, old_c = patched.get("protein") or 0, patched.get("calories") or 0
                new_p, new_c = macros
                if old_p == 0 and new_p > 0:
                    patched["protein"] = new_p
                    changed = True
                if old_c == 0 and new_c > 0:
                    patched["calories"] = new_c
                    changed = True
                if patched.get("protein") != old_p or patched.get("calories") != old_c:
                    changes.append({
                        "item_id": patched.get("id"),
                        "name": patched.get("name"),
                        "protein": f"{old_p} → {patched.get('protein')}",
                        "calories": f"{old_c} → {patched.get('calories')}",
                    })
        new_items.append(patched)

    if not changed:
        return items, []
    return new_items, changes


def fetch_food_logs(date_from: str, date_to: str) -> list:
    user_filter = f"&user_id=eq.{SUPABASE_USER_ID}" if SUPABASE_USER_ID else ""
    path = (
        f"food_logs?date=gte.{date_from}&date=lte.{date_to}{user_filter}"
        f"&select=id,date,meal_slot,items,custom_text,total_protein,total_calories,user_id"
        f"&order=date.asc,meal_slot.asc"
    )
    status, body = api_request(path)
    if status >= 400:
        print(f"ERROR fetch food_logs: {status} {body}", file=sys.stderr)
        sys.exit(1)
    return json.loads(body) if body else []


def backup_row(row: dict, run_id: str) -> Path:
    BACKUPS_DIR.mkdir(parents=True, exist_ok=True)
    fname = f"{run_id}_{row['date']}_{row['meal_slot']}.json"
    path = BACKUPS_DIR / fname
    with open(path, "w", encoding="utf-8") as f:
        json.dump(row, f, indent=2, ensure_ascii=False)
    return path


def apply_patch(row_id: str, items: list, total_protein: float, total_calories: float) -> tuple[int, str]:
    payload = {
        "items": items,
        "total_protein": total_protein,
        "total_calories": total_calories,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    return api_request(f"food_logs?id=eq.{row_id}", method="PATCH", data=payload)


def main() -> None:
    parser = argparse.ArgumentParser(description="Patch custom food macros in food_logs only")
    parser.add_argument("--from", dest="date_from", required=True, help="Start date YYYY-MM-DD")
    parser.add_argument("--to", dest="date_to", required=True, help="End date YYYY-MM-DD")
    parser.add_argument("--dry-run", action="store_true", help="Preview changes only")
    parser.add_argument("--apply", action="store_true", help="Write patches after backup")
    args = parser.parse_args()

    if args.dry_run and args.apply:
        print("ERROR: use --dry-run OR --apply, not both", file=sys.stderr)
        sys.exit(1)
    if not args.dry_run and not args.apply:
        print("ERROR: pass --dry-run to preview or --apply to write", file=sys.stderr)
        sys.exit(1)

    if not SUPABASE_SERVICE_ROLE_KEY:
        print(
            "ERROR: set SUPABASE_SERVICE_ROLE_KEY (Supabase Dashboard → Settings → API → service_role)",
            file=sys.stderr,
        )
        sys.exit(1)

    registry = load_registry()
    if not registry:
        print("WARNING: custom-foods-registry.json is empty — nothing to patch", file=sys.stderr)

    rows = fetch_food_logs(args.date_from, args.date_to)
    print(f"Fetched {len(rows)} food_log row(s) for user {SUPABASE_USER_ID or 'all'}\n")
    run_id = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    pending = []

    for row in rows:
        items = parse_items(row.get("items"))
        new_items, changes = patch_row_items(items, registry)
        if not changes:
            continue

        total_p, total_c = compute_totals(new_items)
        pending.append({
            "row": row,
            "new_items": new_items,
            "changes": changes,
            "total_protein": total_p,
            "total_calories": total_c,
        })

    if not pending:
        unresolved = []
        for row in rows:
            for item in parse_items(row.get("items")):
                if needs_macros(item):
                    unresolved.append({
                        "date": row["date"],
                        "slot": row["meal_slot"],
                        "name": item.get("name"),
                        "id": item.get("id"),
                        "notes": (row.get("custom_text") or "").strip() or None,
                    })
        notes_only = []
        for row in rows:
            notes = (row.get("custom_text") or "").strip()
            items = parse_items(row.get("items"))
            custom_items = [i for i in items if is_custom_item(i)]
            if notes and not custom_items:
                notes_only.append({
                    "date": row["date"],
                    "slot": row["meal_slot"],
                    "notes": notes,
                })

        if unresolved:
            print("Unresolved custom items (need registry entries):\n")
            for u in unresolved:
                line = f"  {u['date']} / {u['slot']}: {u['name']} ({u['id']})"
                if u.get("notes"):
                    line += f"\n    slot notes: {u['notes']}"
                print(line)
            print(f"\n{len(unresolved)} item(s) — add to custom-foods-registry.json then re-run.")

        if notes_only:
            print("\nNotes-only rows (no custom_* items — cannot patch; add Custom item in app):\n")
            for n in notes_only:
                print(f"  {n['date']} / {n['slot']}: {n['notes']}")
            print(f"\n{len(notes_only)} row(s) — resolve in registry from notes, then log as Custom item.")

        if not unresolved and not notes_only:
            print("No patchable custom items in range (all have macros or no registry match).")
        return

    print(f"{'DRY RUN' if args.dry_run else 'APPLY'} — {len(pending)} row(s) to patch\n")
    for entry in pending:
        row = entry["row"]
        print(f"  {row['date']} / {row['meal_slot']} (id={row['id']})")
        slot_notes = (row.get("custom_text") or "").strip()
        if slot_notes:
            print(f"    slot notes: {slot_notes}")
        for ch in entry["changes"]:
            print(f"    {ch['name']}: protein {ch['protein']}, calories {ch['calories']}")
        print(f"    totals → {entry['total_protein']}g P · {entry['total_calories']} kcal")
        print()

    if args.dry_run:
        print("Dry run complete. Re-run with --apply to write after review.")
        return

    for entry in pending:
        row = entry["row"]
        backup_path = backup_row(row, run_id)
        status, body = apply_patch(
            row["id"],
            entry["new_items"],
            entry["total_protein"],
            entry["total_calories"],
        )
        if status >= 400:
            print(f"ERROR patching {row['date']}/{row['meal_slot']}: {status} {body}", file=sys.stderr)
            print(f"  Backup at {backup_path}", file=sys.stderr)
            sys.exit(1)
        print(f"Patched {row['date']}/{row['meal_slot']} — backup {backup_path}")

    print(f"\nDone. {len(pending)} row(s) patched. Backups in {BACKUPS_DIR}")


if __name__ == "__main__":
    main()
