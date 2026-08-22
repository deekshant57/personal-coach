#!/usr/bin/env python3
"""One-shot: fix Phase 1 gym sequencing in daily_plans (DB is source of truth).

Wrong layout (in DB through Sep):  Mon Push · Wed Legs · Fri Pull
Correct layout:                   Mon Legs · Wed Push · Fri Pull

Applies to weeks starting 2026-08-24 through Phase 1 end (2026-09-27).
Leaves current/historical week (Aug 17–23) untouched.

Also rewrites Thu run directives that framed the day as 'recovery after Legs'.
"""

from __future__ import annotations

import json
import os
import ssl
import sys
import urllib.error
import urllib.request
from datetime import date, timedelta

sys.path.insert(0, os.path.dirname(__file__))

# Reuse env loader from audit script patterns
SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://lqtwtcgnzpsrhfuynzdk.supabase.co')
DEFAULT_USER_ID = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139'
START = date(2026, 8, 24)
END = date(2026, 9, 27)

GYM_FIELDS = (
    'workout_plan', 'workout_detail', 'directive',
    'protein_target', 'calorie_target', 'water_target', 'meals_plan',
)

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE


def load_env_file():
    for path in (
        os.path.join(os.path.dirname(__file__), '.env'),
        os.path.join(os.path.dirname(__file__), '..', '.env'),
    ):
        if not os.path.isfile(path):
            continue
        with open(path, encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#') or '=' not in line:
                    continue
                key, value = line.split('=', 1)
                os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def headers():
    key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    if not key:
        raise SystemExit('SUPABASE_SERVICE_ROLE_KEY required')
    return {
        'apikey': key,
        'Authorization': f'Bearer {key}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        'Accept': 'application/json',
    }


def api(method: str, path: str, body: dict | None = None):
    url = f'{SUPABASE_URL}/rest/v1/{path}'
    data = None if body is None else json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers=headers(), method=method)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
            raw = resp.read().decode()
            return resp.status, json.loads(raw) if raw else None
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode(errors='replace')


def fetch_range(user_id: str, start: date, end: date) -> list[dict]:
    select = (
        'date,day_name,day_type,workout_plan,workout_detail,run_type,run_km,'
        'run_pace,run_cue,directive,protein_target,calorie_target,water_target,meals_plan'
    )
    path = (
        f'daily_plans?user_id=eq.{user_id}'
        f'&date=gte.{start.isoformat()}&date=lte.{end.isoformat()}'
        f'&select={select}&order=date.asc'
    )
    status, data = api('GET', path)
    if status >= 400 or not isinstance(data, list):
        raise SystemExit(f'Fetch failed ({status}): {data}')
    return data


def patch_day(user_id: str, day: str, payload: dict) -> None:
    path = f'daily_plans?user_id=eq.{user_id}&date=eq.{day}'
    status, data = api('PATCH', path, payload)
    if status >= 400:
        raise SystemExit(f'PATCH {day} failed ({status}): {data}')


def legs_directive(old: str) -> str:
    base = (
        'Legs day after Sunday rest — progressive overload. '
        'Easy run tomorrow: keep it genuinely easy (residual fatigue is OK in Phase 1). '
        'Log all weights.'
    )
    if old and 'barbell squat' in old.lower():
        return (
            'Barbell squat focus — progressive overload after Sunday rest. '
            'Easy run tomorrow: genuinely easy. Log all weights.'
        )
    if old and 'introduction' in old.lower():
        return (
            'Barbell squat introduction — start light, own depth and bracing. '
            'Easy run tomorrow: genuinely easy. Log all weights.'
        )
    return base


def push_directive(_old: str) -> str:
    return (
        'Push day. Progressive overload — add weight or reps vs last matching session. '
        'Log all weights.'
    )


def thu_run_directive(old: str) -> str:
    # Drop "recovery after yesterday's legs" framing — Legs moved to Monday
    if not old:
        return 'Easy run — base maintenance. Conversational pace.'
    cleaned = old
    for phrase in (
        "also active recovery for yesterday's leg session. ",
        "also active recovery for yesterday's leg session.",
        'active recovery for yesterday\'s leg session. ',
        'active recovery for yesterday\'s leg session.',
    ):
        cleaned = cleaned.replace(phrase, '')
    cleaned = cleaned.strip()
    if not cleaned:
        return 'Easy run — base maintenance. Conversational pace.'
    if 'easy run' not in cleaned.lower():
        return f'Easy run — {cleaned}'
    return cleaned


def main():
    load_env_file()
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    dry = '--dry-run' in sys.argv
    user_id = args[0] if args else DEFAULT_USER_ID

    rows = fetch_range(user_id, START, END)
    by_date = {r['date']: r for r in rows}
    print(f'Loaded {len(rows)} rows {START} → {END}')
    if dry:
        print('DRY RUN — no writes')

    cur = START
    weeks_fixed = 0
    while cur <= END:
        # Process Mon of each week
        if cur.weekday() == 0:  # Monday
            mon = cur.isoformat()
            wed = (cur + timedelta(days=2)).isoformat()
            thu = (cur + timedelta(days=3)).isoformat()
            mon_row = by_date.get(mon)
            wed_row = by_date.get(wed)
            thu_row = by_date.get(thu)

            if not mon_row or not wed_row:
                print(f'  skip week of {mon}: missing Mon/Wed')
            else:
                mon_plan = (mon_row.get('workout_plan') or '').lower()
                wed_plan = (wed_row.get('workout_plan') or '').lower()
                already = 'leg' in mon_plan and 'push' in wed_plan
                wrong = 'push' in mon_plan and 'leg' in wed_plan

                if already:
                    print(f'  ok   week of {mon}: already Mon Legs / Wed Push')
                elif not wrong:
                    print(
                        f'  WARN week of {mon}: unexpected '
                        f'Mon={mon_row.get("workout_plan")!r} Wed={wed_row.get("workout_plan")!r}'
                    )
                else:
                    mon_payload = {f: wed_row.get(f) for f in GYM_FIELDS}
                    wed_payload = {f: mon_row.get(f) for f in GYM_FIELDS}
                    mon_payload['directive'] = legs_directive(wed_row.get('directive') or '')
                    wed_payload['directive'] = push_directive(mon_row.get('directive') or '')
                    mon_payload['day_type'] = 'Gym'
                    wed_payload['day_type'] = 'Gym'

                    print(f'  FIX  week of {mon}: Mon←Legs, Wed←Push')
                    if not dry:
                        patch_day(user_id, mon, mon_payload)
                        patch_day(user_id, wed, wed_payload)

                    if thu_row and thu_row.get('run_type'):
                        new_dir = thu_run_directive(thu_row.get('directive') or '')
                        if new_dir != (thu_row.get('directive') or ''):
                            print(f'       Thu directive cleanup')
                            if not dry:
                                patch_day(user_id, thu, {'directive': new_dir})

                    weeks_fixed += 1
        cur += timedelta(days=1)

    print(f'\nWeeks fixed: {weeks_fixed}')
    if dry:
        print('Re-run without --dry-run to apply.')


if __name__ == '__main__':
    main()
