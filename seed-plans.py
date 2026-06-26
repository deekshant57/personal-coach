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


def write_sql_file(path, week_plans, user_id):
    rows = build_day_rows(week_plans, user_id)
    lines = [
        '-- Sync daily_plans from coach/week-plans.py',
        '-- Run in Supabase SQL Editor',
        f"-- User: {user_id}",
        '',
    ]
    for row in rows:
        sets = []
        if row['run_cue'] is not None:
            sets.append(f"run_cue = {sql_literal(row['run_cue'])}")
        if row['workout_detail'] is not None:
            sets.append(f"workout_detail = {sql_literal(row['workout_detail'])}")
        if not sets:
            continue
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
        return

    headers = {
        'apikey': ANON_KEY,
        'Authorization': f'Bearer {ANON_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=minimal',
    }

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
            print(f'    Error: {resp[:300]}')

        url = (
            f'{SUPABASE_URL}/rest/v1/week_plans'
            f'?user_id=eq.{user_id}&week_number=eq.{week_num}&select=id'
        )
        req = urllib.request.Request(url, headers={
            'apikey': ANON_KEY,
            'Authorization': f'Bearer {ANON_KEY}',
        })
        try:
            resp = urllib.request.urlopen(req, context=ctx)
            rows = json.loads(resp.read().decode())
        except urllib.error.HTTPError:
            rows = []
        week_plan_id = rows[0]['id'] if rows else None

        for day in plan['days']:
            run = day['run']
            workout = day['workout']
            is_run = run['type'] != NA
            is_workout = workout['plan'] != NA

            day_data = {
                'user_id': user_id,
                'week_plan_id': week_plan_id,
                'date': day['date'],
                'day_name': day['day'],
                'day_type': day['type'],
                'protein_target': day.get('protein', 145),
                'water_target': day.get('water', '2L'),
                'run_type': run['type'] if is_run else None,
                'run_km': run['km'] if is_run else None,
                'run_pace': run['pace'] if is_run else None,
                'run_cue': run['cue'] if is_run else None,
                'workout_plan': workout['plan'] if is_workout else None,
                'workout_detail': workout['detail'] if is_workout else None,
                'meals_plan': day['meals'],
                'directive': day['directive'],
            }

            status, resp = api_request('daily_plans', day_data, headers)
            symbol = '✓' if status < 400 else '✗'
            print(f'  {symbol} {day["date"]} {day["day"]} ({day["type"]}): {status}')
            if status >= 400:
                print(f'    Error: {resp[:300]}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Seed Supabase week plans')
    parser.add_argument('--user-id', default=DEFAULT_USER_ID, help='Auth user UUID')
    parser.add_argument(
        '--sql-only',
        action='store_true',
        help='Write sync-plans.sql for Supabase SQL Editor (bypasses RLS)',
    )
    args = parser.parse_args()

    week_plans = load_week_plans()

    if args.sql_only:
        out = os.path.join(os.path.dirname(__file__), 'sync-plans.sql')
        write_sql_file(out, week_plans, args.user_id)
    else:
        print('Seeding Supabase with week plans...')
        print(f'URL: {SUPABASE_URL}')
        print(f'User: {args.user_id}')
        seed_week_plans(args.user_id)
        print('\nDone! If REST seed failed (RLS), run: python3 seed-plans.py --sql-only')
        print('Then paste sync-plans.sql in Supabase SQL Editor.')
