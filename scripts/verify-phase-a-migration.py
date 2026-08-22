#!/usr/bin/env python3
"""Verify Phase A + C migrations without mutating data."""
from __future__ import annotations

import os
import ssl
import sys
import urllib.error
import urllib.request
from pathlib import Path

URL = os.environ.get('SUPABASE_URL', 'https://lqtwtcgnzpsrhfuynzdk.supabase.co')


def load_env() -> None:
    for path in (Path(__file__).resolve().parents[2] / '.env',
                 Path(__file__).resolve().parents[1] / '.env'):
        if not path.is_file():
            continue
        for line in path.read_text(encoding='utf-8').splitlines():
            line = line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            k, v = line.split('=', 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def ssl_context():
    try:
        import certifi
        return ssl.create_default_context(cafile=certifi.where())
    except Exception:
        return ssl.create_default_context()


def req(path: str, key: str):
    r = urllib.request.Request(
        f'{URL}{path}',
        headers={
            'apikey': key,
            'Authorization': f'Bearer {key}',
            'Prefer': 'count=exact',
        },
    )
    try:
        with urllib.request.urlopen(r, timeout=30, context=ssl_context()) as resp:
            body = resp.read().decode()
            count = resp.headers.get('content-range', '')
            return resp.status, body, count
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode(), ''
    except ssl.SSLCertVerificationError:
        insecure = ssl._create_unverified_context()
        try:
            with urllib.request.urlopen(r, timeout=30, context=insecure) as resp:
                body = resp.read().decode()
                count = resp.headers.get('content-range', '')
                return resp.status, body, count
        except urllib.error.HTTPError as e:
            return e.code, e.read().decode(), ''


def table_missing(status: int, body: str) -> bool:
    if status == 404:
        return True
    lower = body.lower()
    return 'could not find the table' in lower or 'does not exist' in lower


def main() -> int:
    load_env()
    key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    if not key:
        print('ERROR: SUPABASE_SERVICE_ROLE_KEY missing')
        return 1

    failed = False

    status, body, rng = req('/rest/v1/athlete_profiles?select=user_id&limit=5', key)
    print(f'athlete_profiles: HTTP {status} range={rng}')
    if table_missing(status, body) or status >= 400:
        print('FAIL: athlete_profiles missing — run athlete-profiles.sql in Supabase SQL Editor')
        print(body[:300])
        failed = True
    else:
        print(f'  sample: {body[:200]}')

    status, body, rng = req(
        '/rest/v1/daily_plans?select=date,planned_session_window,actual_session_window,session_status,slot_scheme,calorie_target&limit=3',
        key,
    )
    print(f'daily_plans session cols: HTTP {status} range={rng}')
    if status >= 400:
        print('FAIL: session columns missing on daily_plans — run athlete-profiles.sql')
        print(body[:400])
        failed = True

    status, body, rng = req('/rest/v1/user_custom_foods?select=id,name&limit=3', key)
    print(f'user_custom_foods: HTTP {status} range={rng}')
    if table_missing(status, body) or status >= 400:
        print('FAIL: user_custom_foods missing — run user-custom-foods.sql in Supabase SQL Editor')
        print(body[:300])
        failed = True
    else:
        print(f'  sample: {body[:200]}')

    for table in ('daily_plans', 'food_logs', 'run_logs', 'workout_logs', 'daily_vitals'):
        st, _, rng = req(f'/rest/v1/{table}?select=*&limit=1', key)
        print(f'{table}: HTTP {st} {rng}')

    if failed:
        print('VERIFY_FAIL — apply missing SQL before prod')
        return 1

    print('VERIFY_OK — additive schema present')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
