#!/usr/bin/env python3
"""Pull live coaching evidence for Deekshant. Print a chart-style brief.

Usage:
  python3 .cursor/skills/coach-session/scripts/pull-coach-evidence.py
  python3 .cursor/skills/coach-session/scripts/pull-coach-evidence.py --days 21
"""

from __future__ import annotations

import argparse
import json
import os
import ssl
import sys
import urllib.request
from collections import defaultdict
from datetime import date, datetime, timedelta, timezone

DEFAULT_USER_ID = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139'
SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://lqtwtcgnzpsrhfuynzdk.supabase.co')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE


def load_env_file() -> None:
    # scripts/ → coach-session/ → skills/ → .cursor/ → personal-coach-app/
    app = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
    parent = os.path.abspath(os.path.join(app, '..'))  # Personal Coach/ (often holds .env)
    for path in (
        os.path.join(app, '.env'),
        os.path.join(parent, '.env'),
        os.path.join(app, '..', '.env'),
    ):
        if not os.path.isfile(path):
            continue
        with open(path, encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#') or '=' not in line:
                    continue
                k, v = line.split('=', 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))
        break


def get(path: str):
    key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    if not key:
        raise SystemExit('SUPABASE_SERVICE_ROLE_KEY required (../.env)')
    req = urllib.request.Request(
        f'{SUPABASE_URL}/rest/v1/{path}',
        headers={
            'apikey': key,
            'Authorization': f'Bearer {key}',
            'Accept': 'application/json',
        },
    )
    with urllib.request.urlopen(req, context=ctx, timeout=60) as resp:
        return json.loads(resp.read().decode())


def iso(d: date) -> str:
    return d.isoformat()


def main() -> int:
    load_env_file()
    p = argparse.ArgumentParser()
    p.add_argument('--user-id', default=DEFAULT_USER_ID)
    p.add_argument('--days', type=int, default=28, help='Lookback for food/vitals aggregation')
    args = p.parse_args()
    uid = args.user_id
    today = datetime.now(timezone.utc).date()
    start = today - timedelta(days=args.days)

    print(f'=== COACH EVIDENCE · {uid[:8]}… · as of {today} (lookback {args.days}d) ===\n')

    # Vitals
    vitals = get(
        f'daily_vitals?user_id=eq.{uid}&select=date,weight_kg,sleep_hours,cigarettes,waist_inches,notes'
        f'&order=date.desc&limit=15'
    )
    print('## Vitals (latest)')
    if not vitals:
        print('  (none)')
    for r in vitals[:8]:
        bits = [r['date'], f"{r.get('weight_kg')}kg" if r.get('weight_kg') is not None else None,
                f"sleep {r.get('sleep_hours')}h" if r.get('sleep_hours') is not None else None,
                f"waist {r.get('waist_inches')}" if r.get('waist_inches') is not None else None,
                f"cigs {r.get('cigarettes')}" if r.get('cigarettes') is not None else None]
        print('  ' + ' · '.join(b for b in bits if b))

    # Runs
    runs = get(
        f'run_logs?user_id=eq.{uid}&select=date,done,actual_km,avg_pace,cadence,rpe,knee_status,notes'
        f'&order=date.desc&limit=10'
    )
    print('\n## Runs (latest)')
    last_run = None
    for r in runs:
        if r.get('done') and r.get('actual_km'):
            last_run = last_run or r
        print(
            f"  {r['date']} done={r.get('done')} {r.get('actual_km')}km {r.get('avg_pace')} "
            f"cad {r.get('cadence')} RPE {r.get('rpe')} knee={r.get('knee_status')}"
        )
    if last_run:
        gap = (today - date.fromisoformat(last_run['date'])).days
        print(f'  → last completed run {last_run["date"]} ({gap}d gap)')

    # Workouts
    wos = get(
        f'workout_logs?user_id=eq.{uid}&select=date,done,what_i_did,rpe,notes'
        f'&order=date.desc&limit=10'
    )
    print('\n## Workouts (latest)')
    last_wo = None
    for r in wos:
        if r.get('done') and not (r.get('notes') or '').lower().startswith('skipped'):
            # prefer rows with what_i_did
            if r.get('what_i_did'):
                last_wo = last_wo or r
        summary = (r.get('what_i_did') or r.get('notes') or '')[:90]
        print(f"  {r['date']} done={r.get('done')} RPE {r.get('rpe')} · {summary}")
    if last_wo:
        gap = (today - date.fromisoformat(last_wo['date'])).days
        print(f'  → last meaningful gym log {last_wo["date"]} ({gap}d gap)')

    # Body comp
    scans = get(
        f'body_comp_scans?user_id=eq.{uid}&select=scan_date,machine,weight_kg,body_fat_pct,'
        f'muscle_mass_kg,body_fat_mass_kg,visceral_fat_level,notes&order=scan_date.desc&limit=4'
    )
    print('\n## Body comps')
    for r in scans:
        print(
            f"  {r['scan_date']} {r.get('machine')}: {r.get('weight_kg')}kg · "
            f"BF {r.get('body_fat_pct')}% · SMM {r.get('muscle_mass_kg')} · "
            f"visc {r.get('visceral_fat_level')}"
        )

    # Supplements
    supps = get(
        f'supplement_logs?user_id=eq.{uid}&select=date,supradyn,creatine,omega_3,uprise_d3_60k,notes'
        f'&order=date.desc&limit=40'
    )
    print('\n## Supplements')
    d3_dates = [r['date'] for r in supps if r.get('uprise_d3_60k')]
    print(f'  last logs: {len(supps)} rows')
    for r in supps[:5]:
        flags = []
        if r.get('supradyn'):
            flags.append('Supradyn')
        if r.get('creatine'):
            flags.append('Creatine')
        if r.get('omega_3'):
            flags.append('Omega-3')
        if r.get('uprise_d3_60k'):
            flags.append('D3')
        print(f"  {r['date']}: {', '.join(flags) or '(none toggled)'}")
    print(f'  Uprise D3 doses in lookback window: {d3_dates or "NONE"}')
    if d3_dates:
        print(f'  → last D3 dose {d3_dates[0]} — verify COURSE COMPLETE in personal-details before prescribing')
    else:
        print('  → no D3 doses in recent logs — do NOT prescribe weekly Uprise D3 unless personal-details says ACTIVE')

    # Food
    foods = get(
        f'food_logs?user_id=eq.{uid}&date=gte.{iso(start)}&select=date,meal_slot,items,'
        f'custom_text,total_protein,total_calories&order=date.desc&limit=800'
    )
    by = defaultdict(lambda: {'p': 0.0, 'c': 0.0, 'slots': 0, 'names': Counterish()})
    for r in foods:
        d = r['date']
        by[d]['p'] += float(r.get('total_protein') or 0)
        by[d]['c'] += float(r.get('total_calories') or 0)
        by[d]['slots'] += 1
        items = r.get('items') or []
        if isinstance(items, list):
            for it in items:
                if isinstance(it, dict) and it.get('name'):
                    by[d]['names'].add(it['name'], float(it.get('qty') or 1))

    print(f'\n## Food ({iso(start)} → {today})')
    if not by:
        print('  (no food logs in window — treat protein adherence as UNKNOWN / likely weak)')
    else:
        days = sorted(by.keys(), reverse=True)
        hit = sum(1 for d in days if by[d]['p'] >= 140)
        avg_p = sum(by[d]['p'] for d in days) / len(days)
        avg_c = sum(by[d]['c'] for d in days) / len(days)
        print(f'  logged days: {len(days)} · ≥140g P: {hit}/{len(days)} · avg P {avg_p:.0f}g · avg kcal {avg_c:.0f}')
        print('  recent days:')
        for d in days[:10]:
            print(f"    {d}: P={by[d]['p']:.0f} kcal={by[d]['c']:.0f} slots={by[d]['slots']}")
        # staple names across window
        staples = Counterish()
        for d in days:
            for name, n in by[d]['names'].items.items():
                staples.add(name, n)
        top = staples.top(12)
        if top:
            print('  staples:', ', '.join(f'{n}×{int(c)}' for n, c in top))

    # Plans window
    plans = get(
        f'daily_plans?user_id=eq.{uid}&date=gte.{iso(today - timedelta(days=3))}'
        f'&date=lte.{iso(today + timedelta(days=10))}'
        f'&select=date,day_type,workout_plan,run_type,run_km,protein_target,calorie_target,directive'
        f'&order=date.asc'
    )
    print('\n## Plans near today')
    if not plans:
        print('  (no daily_plans in ± window)')
    for r in plans:
        sess = r.get('workout_plan') or (
            f"{r.get('run_type')} {r.get('run_km')}km" if r.get('run_type') else r.get('day_type')
        )
        print(
            f"  {r['date']} {r.get('day_type')}: {sess} · "
            f"P{r.get('protein_target')}/kcal{r.get('calorie_target')}"
        )

    print('\n## Coach checklist')
    print('  [ ] Mission/priorities from current-block.md (not cancelled races)')
    print('  [ ] Supplements match ACTIVE status only')
    print('  [ ] Meals match staples + protein weak spot')
    print('  [ ] Volume scaled to run/gym gap')
    print('  [ ] Update stale markdown/JS if evidence contradicts')
    print('\n=== END EVIDENCE ===')
    return 0


class Counterish:
    def __init__(self):
        self.items: dict[str, float] = defaultdict(float)

    def add(self, name: str, n: float = 1.0) -> None:
        self.items[name] += n

    def top(self, n: int):
        return sorted(self.items.items(), key=lambda x: -x[1])[:n]


if __name__ == '__main__':
    sys.exit(main())
