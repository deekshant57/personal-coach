#!/usr/bin/env python3
"""Seed or sync Supabase week plans from coach/week-plans.py"""

import argparse
import json
import os
import ssl
import sys
import urllib.request

sys.path.insert(0, os.path.dirname(__file__))

SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://lqtwtcgnzpsrhfuynzdk.supabase.co')
ANON_KEY = os.environ.get(
    'SUPABASE_ANON_KEY',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxdHd0Y2duenBzcmhmdXluemRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNjU1MzUsImV4cCI6MjA5Nzg0MTUzNX0.QqfjgnC3b_VjWUrKbhgb4YF-FDN2ptZgYQ3WoyjMer4',
)
DEFAULT_USER_ID = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139'

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

NA = 'NA'

SQL_SYNC_FIELDS = (
    'day_name',
    'day_type',
    'protein_target',
    'calorie_target',
    'water_target',
    'run_type',
    'run_km',
    'run_pace',
    'run_cue',
    'workout_plan',
    'workout_detail',
    'meals_plan',
    'directive',
)


def load_env_file():
    """Load SUPABASE_SERVICE_ROLE_KEY from .env without overwriting existing env."""
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


def api_key():
    return os.environ.get('SUPABASE_SERVICE_ROLE_KEY') or ANON_KEY


def api_headers():
    key = api_key()
    return {
        'apikey': key,
        'Authorization': f'Bearer {key}',
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=minimal',
    }


def sql_value(column, value):
    if value is None:
        return 'NULL'
    if column in ('protein_target', 'calorie_target', 'run_km'):
        return str(value)
    return sql_literal(value)


def load_week_plans():
    plans_path = os.path.join(os.path.dirname(__file__), 'coach', 'week-plans.py')
    with open(plans_path, 'r') as f:
        source = f.read()
    ns = {}
    exec(compile(source, plans_path, 'exec'), ns)
    return ns.get('WEEK_PLANS', {})


def sql_literal(value):
    if value is None:
        return 'NULL'
    return "'" + str(value).replace("'", "''") + "'"


def build_day_rows(week_plans, user_id):
    rows = []
    for week_num, plan in week_plans.items():
        for day in plan['days']:
            run = day['run']
            workout = day['workout']
            is_run = run['type'] != NA
            is_workout = workout['plan'] != NA
            rows.append({
                'week_number': week_num,
                'user_id': user_id,
                'date': day['date'],
                'day_name': day['day'],
                'day_type': day['type'],
                'protein_target': day.get('protein', 145),
                'calorie_target': day.get('calories'),
                'water_target': day.get('water', '2L'),
                'run_type': run['type'] if is_run else None,
                'run_km': run['km'] if is_run else None,
                'run_pace': run['pace'] if is_run else None,
                'run_cue': run['cue'] if is_run else None,
                'workout_plan': workout['plan'] if is_workout else None,
                'workout_detail': workout['detail'] if is_workout else None,
                'meals_plan': day['meals'],
                'directive': day['directive'],
            })
    return rows


def day_row_to_api_payload(row, week_plan_id=None):
    payload = {
        'user_id': row['user_id'],
        'date': row['date'],
        'day_name': row['day_name'],
        'day_type': row['day_type'],
        'protein_target': row['protein_target'],
        'calorie_target': row['calorie_target'],
        'water_target': row['water_target'],
        'run_type': row['run_type'],
        'run_km': row['run_km'],
        'run_pace': row['run_pace'],
        'run_cue': row['run_cue'],
        'workout_plan': row['workout_plan'],
        'workout_detail': row['workout_detail'],
        'meals_plan': row['meals_plan'],
        'directive': row['directive'],
    }
    if week_plan_id:
        payload['week_plan_id'] = week_plan_id
    return payload


def write_sql_file(path, week_plans, user_id):
    rows = build_day_rows(week_plans, user_id)
    lines = [
        '-- Sync daily_plans from coach/week-plans.py',
        '-- Run in Supabase SQL Editor',
        f"-- User: {user_id}",
        '',
    ]
    for row in rows:
        sets = [f"{col} = {sql_value(col, row[col])}" for col in SQL_SYNC_FIELDS]
        lines.append(
            f"UPDATE daily_plans SET {', '.join(sets)} "
            f"WHERE user_id = '{user_id}' AND date = '{row['date']}';"
        )
        lines.append('')
    with open(path, 'w') as f:
        f.write('\n'.join(lines))
    print(f'Wrote {path} ({len(rows)} days)')


def api_request(path, data, headers, method='POST'):
    url = f'{SUPABASE_URL}/rest/v1/{path}'
    body = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        resp = urllib.request.urlopen(req, context=ctx)
        return resp.status, resp.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()


def seed_week_plans(user_id):
    week_plans = load_week_plans()
    if not week_plans:
        print('ERROR: No WEEK_PLANS found in coach/week-plans.py')
        return False

    headers = api_headers()
    using_service = bool(os.environ.get('SUPABASE_SERVICE_ROLE_KEY'))
    if using_service:
        print('Auth: service_role (RLS bypass)')
    else:
        print('Auth: anon key — may fail if RLS blocks writes')

    ok = True
    for week_num, plan in week_plans.items():
        print(f'\n── Week {week_num}: {plan["dates"]} ──')

        week_data = {
            'user_id': user_id,
            'week_number': week_num,
            'label': plan['label'],
            'date_range': plan['dates'],
            'focus': plan['focus'],
        }
        status, resp = api_request('week_plans', week_data, headers)
        print(f'  week_plans: {status}')
        if status >= 400:
            ok = False
            print(f'    Error: {resp[:300]}')

        url = (
            f'{SUPABASE_URL}/rest/v1/week_plans'
            f'?user_id=eq.{user_id}&week_number=eq.{week_num}&select=id'
        )
        req = urllib.request.Request(url, headers={
            'apikey': api_key(),
            'Authorization': f'Bearer {api_key()}',
        })
        try:
            resp = urllib.request.urlopen(req, context=ctx)
            rows = json.loads(resp.read().decode())
        except urllib.error.HTTPError:
            rows = []
        week_plan_id = rows[0]['id'] if rows else None

        day_rows = [r for r in build_day_rows(week_plans, user_id) if r['week_number'] == week_num]
        for row in day_rows:
            day_data = day_row_to_api_payload(row, week_plan_id)
            status, resp = api_request('daily_plans', day_data, headers)
            symbol = '✓' if status < 400 else '✗'
            print(f'  {symbol} {row["date"]} {row["day_name"]} ({row["day_type"]}): {status}')
            if status >= 400:
                ok = False
                print(f'    Error: {resp[:300]}')

    return ok


def patch_sync_daily_plans(user_id):
    """PATCH existing daily_plans rows (full field sync). Requires service_role."""
    if not os.environ.get('SUPABASE_SERVICE_ROLE_KEY'):
        return False

    week_plans = load_week_plans()
    headers = api_headers()
    headers['Prefer'] = 'return=minimal'
    ok = True

    for row in build_day_rows(week_plans, user_id):
        payload = day_row_to_api_payload(row)
        path = f"daily_plans?user_id=eq.{user_id}&date=eq.{row['date']}"
        status, resp = api_request(path, payload, headers, method='PATCH')
        symbol = '✓' if status < 400 else '✗'
        print(f'  {symbol} {row["date"]} {row["day_name"]}: {status}')
        if status >= 400:
            ok = False
            print(f'    Error: {resp[:300]}')
    return ok


if __name__ == '__main__':
    load_env_file()
    parser = argparse.ArgumentParser(description='Seed Supabase week plans')
    parser.add_argument('--user-id', default=DEFAULT_USER_ID, help='Auth user UUID')
    parser.add_argument(
        '--sql-only',
        action='store_true',
        help='Write sync-plans.sql for Supabase SQL Editor (bypasses RLS)',
    )
    parser.add_argument(
        '--patch',
        action='store_true',
        help='PATCH existing daily_plans only (full sync; needs SUPABASE_SERVICE_ROLE_KEY)',
    )
    args = parser.parse_args()

    week_plans = load_week_plans()

    if args.sql_only:
        out = os.path.join(os.path.dirname(__file__), 'sync-plans.sql')
        write_sql_file(out, week_plans, args.user_id)
    elif args.patch:
        print('Patching daily_plans (full field sync)...')
        print(f'URL: {SUPABASE_URL}')
        print(f'User: {args.user_id}')
        ok = patch_sync_daily_plans(args.user_id)
        if not ok:
            sys.exit(1)
        print('\nDone — daily_plans synced.')
    else:
        print('Seeding Supabase with week plans...')
        print(f'URL: {SUPABASE_URL}')
        print(f'User: {args.user_id}')
        ok = seed_week_plans(args.user_id)
        if ok:
            print('\nDone!')
        else:
            print('\nSome writes failed. Try:')
            print('  export SUPABASE_SERVICE_ROLE_KEY=... && python3 seed-plans.py --patch')
            print('  python3 seed-plans.py --sql-only  # then paste sync-plans.sql')
            sys.exit(1)
