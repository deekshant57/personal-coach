#!/usr/bin/env python3
"""Seed Supabase with week plans from generate-tracker.py"""

import json
import urllib.request
import ssl
import sys
import os

# Add parent dir to path so we can import generate-tracker
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

SUPABASE_URL = 'https://lqtwtcgnzpsrhfuynzdk.supabase.co'
ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxdHd0Y2duenBzcmhmdXluemRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNjU1MzUsImV4cCI6MjA5Nzg0MTUzNX0.QqfjgnC3b_VjWUrKbhgb4YF-FDN2ptZgYQ3WoyjMer4'

HEADERS = {
    'apikey': ANON_KEY,
    'Authorization': f'Bearer {ANON_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates',
}

# SSL context (macOS Python often lacks certs)
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE


def api_request(path, data, method='POST'):
    """Make a request to Supabase REST API."""
    url = f'{SUPABASE_URL}/rest/v1/{path}'
    body = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(url, data=body, headers=HEADERS, method=method)
    try:
        resp = urllib.request.urlopen(req, context=ctx)
        return resp.status, resp.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()


def seed_week_plans():
    """Read WEEK_PLANS from generate-tracker.py and push to Supabase."""

    # Import the WEEK_PLANS dict
    # We need to exec the file and extract the dict since it uses f-strings with module-level vars
    tracker_path = os.path.join(os.path.dirname(__file__), '..', 'generate-tracker.py')
    with open(tracker_path, 'r') as f:
        source = f.read()

    # Execute in isolated namespace
    ns = {}
    exec(compile(source, tracker_path, 'exec'), ns)
    week_plans = ns.get('WEEK_PLANS', {})

    if not week_plans:
        print('ERROR: No WEEK_PLANS found in generate-tracker.py')
        return

    for week_num, plan in week_plans.items():
        print(f'\n── Week {week_num}: {plan["dates"]} ──')

        # 1. Upsert week_plans row
        week_data = {
            'week_number': week_num,
            'label': plan['label'],
            'date_range': plan['dates'],
            'focus': plan['focus'],
        }
        status, resp = api_request('week_plans', week_data)
        print(f'  week_plans: {status}')
        if status >= 400:
            print(f'    Error: {resp}')

        # Get the week_plan_id by querying
        url = f'{SUPABASE_URL}/rest/v1/week_plans?week_number=eq.{week_num}&select=id'
        req = urllib.request.Request(url, headers={
            'apikey': ANON_KEY,
            'Authorization': f'Bearer {ANON_KEY}',
        })
        resp = urllib.request.urlopen(req, context=ctx)
        rows = json.loads(resp.read().decode())
        week_plan_id = rows[0]['id'] if rows else None

        # 2. Upsert daily_plans rows
        for day in plan['days']:
            run = day['run']
            workout = day['workout']
            is_run = run['type'] != 'NA'
            is_workout = workout['plan'] != 'NA'

            day_data = {
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

            status, resp = api_request('daily_plans', day_data)
            symbol = '✓' if status < 400 else '✗'
            print(f'  {symbol} {day["date"]} {day["day"]} ({day["type"]}): {status}')
            if status >= 400:
                print(f'    Error: {resp[:200]}')


if __name__ == '__main__':
    print('Seeding Supabase with week plans...')
    print(f'URL: {SUPABASE_URL}')
    seed_week_plans()
    print('\nDone!')
