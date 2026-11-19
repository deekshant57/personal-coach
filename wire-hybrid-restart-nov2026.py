#!/usr/bin/env python3
"""Wire Hybrid Cardio + Gym restart into daily_plans (Nov 16–29 2026).

This week (16–22): irregular re-entry — Tue upper warm-up done, Wed shoulders+legs,
then first easy runs. Next week (23–29): clean 3 gym + 3 easy runs template.

Usage:
  python3 wire-hybrid-restart-nov2026.py
  python3 wire-hybrid-restart-nov2026.py --dry-run
"""

from __future__ import annotations

import argparse
import json
import os
import ssl
import sys
import urllib.error
import urllib.request

SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://lqtwtcgnzpsrhfuynzdk.supabase.co')
DEFAULT_USER_ID = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139'

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

RUN_WU = (
    'WARM-UP (10 min): 5 min brisk walk → glute bridges 1×10 → '
    'bodyweight squats 1×10 → calf raises 1×15 → leg swings 10/side → 1 min easy jog'
)
RUN_CD = (
    'COOL-DOWN (8 min): 5 min walk → calf stretch 30s/side → '
    'quad stretch 30s/side → hip flexor stretch 30s/side → hamstring stretch 30s/side'
)

MEALS_GYM = """— MAINTENANCE ~2,300-2,400 kcal · 160g protein —
7:45 Post-workout — 4 eggs bhurji + 1 chapati + 1 scoop whey
1:00 Lunch — 2 chapati + 1 bowl dal OR chana OR rajma + 100g paneer + salad
4:30 Snack — 1 scoop whey (water) + 10 walnuts
8:30 Dinner — 3 eggs omelette + 1 bowl curd + sautéed veggies
Supplements — Supradyn · Creatine 5g · Omega-3
SWAPS — breakfast/post: poha / upma / toast / quinoa / oats / chilla · legume 1:1 dal/chana/rajma/lobia"""

MEALS_LEGS = """— MAINTENANCE ~2,350-2,450 kcal · 160g protein —
7:45 Post-workout — 4 eggs + 2 chapati + 1 scoop whey
1:00 Lunch — 2.5 chapati + dal OR rajma + 100g paneer + salad
4:30 Snack — 1 scoop whey + 10 walnuts
8:30 Dinner — 3 eggs + curd + veggies
Supplements — Supradyn · Creatine 5g · Omega-3
Extra carbs today — leg day needs fuel
SWAPS — post: poha/upma/chilla OK · legume 1:1"""

MEALS_RUN = """— MAINTENANCE ~2,300-2,400 kcal · 160g protein —
6:20 Pre-run — 1 banana + 250ml water
~7:30 Post-run — 4 eggs + 2 toast OR poha + curd + electrolyte water
1:00 Lunch — 2 chapati + dal OR chana + 100g paneer + salad
4:00 Snack — 1 scoop whey + handful peanuts (30g)
8:30 Dinner — 3 eggs + dal + veggies
Supplements — Supradyn · Creatine 5g · Omega-3
SWAPS — post-run carb: toast / poha / upma / quinoa / oats / chilla · legume 1:1"""

MEALS_RUN_SAT = """— MAINTENANCE ~2,300-2,400 kcal · 160g protein —
6:20 Pre-run — 1 banana + 2 dates + 250ml water
~8:00 Post-run — 4 eggs + 2 chapati OR poha + curd + electrolyte water
1:00 Lunch — 2.5 chapati + dal OR rajma + 100g paneer
4:00 Snack — 1 scoop whey + peanuts (30g)
8:30 Dinner — 3 eggs + dal + veggies
Supplements — Supradyn · Creatine 5g · Omega-3
SWAPS — post-run carb: chapati / poha / upma / quinoa · legume 1:1"""

MEALS_PULL_PRE_SAT = """— MAINTENANCE ~2,300-2,400 kcal · 160g protein · CARB-FORWARD DINNER —
7:45 Post-workout — 4 eggs bhurji + 1 chapati + 1 scoop whey
1:00 Lunch — 2 chapati + 1 bowl dal OR chana + 100g paneer + salad
4:30 Snack — 1 scoop whey (water) + 10 walnuts
8:30 Dinner — 3 eggs + 2 chapati + dal + veggies (extra carbs — pre-Sat run)
Supplements — Supradyn · Creatine 5g · Omega-3
Pre-run dinner: carb-forward (+1 chapati vs normal)
SWAPS — legume 1:1 · post: poha/upma/chilla OK"""

MEALS_REST = """— MAINTENANCE ~2,250-2,350 kcal · 160g protein —
8:00 Breakfast — 4 eggs + 1 scoop whey OR 2 moong chilla w/ paneer
1:00 Lunch — 2 chapati + dal OR lobia + 100g paneer + salad
4:30 Snack — 1 scoop whey + 10 walnuts
8:30 Dinner — 3 eggs + curd + veggies
Supplements — Supradyn · Creatine 5g · Omega-3
Monday AM — weigh before food (when next Mon)
SWAPS — breakfast: eggs/whey / chilla / poha+eggs · legume 1:1"""

UPPER_WU_DETAIL = (
    'WARM-UP (5 min): treadmill walk → arm circles 20 → band pull-aparts 2×15 → push-ups 1×8 (slow) · '
    'Dumbbell bench or push-ups 3×8-12 (light) · Seated row or band row 3×12 · '
    'Lateral raises 2×12 · Face pulls 2×15 · Plank 2×30s · '
    'COOL-DOWN: chest doorway + shoulder cross-body · ~25-30 min · RPE 5-6 · RE-ENTRY'
)

SHOULDERS_LEGS_DETAIL = (
    'WARM-UP (8 min): 5 min treadmill walk → arm circles → bodyweight squats 2×10 → '
    'hip circles 10/side → glute bridges 1×15 → 1 light set of first lift · '
    'Overhead press (DB) 3×10 (moderate — shoulders) · Lateral raises 3×12 · '
    'Face pulls 2×15 · Goblet squat OR leg press 3×10 (moderate, not a PR day) · '
    'DB RDL 3×10 (light-moderate) · Calf raises 3×12 · Plank 2×40s · '
    'COOL-DOWN: shoulder + hip flexor + hamstring stretches · ~45-50 min · RPE 6 · '
    'MODERATE — protect legs for Thu first run'
)

PUSH_DETAIL = (
    'WARM-UP (5 min): 5 min treadmill walk → arm circles 20 → band pull-aparts 2×15 → push-ups 1×10 (slow) · '
    'Barbell bench press 4×8-10 · Dumbbell incline press 3×10-12 · '
    'Overhead press (DB or barbell) 3×10 · Lateral raises 3×15 · '
    'Tricep pushdowns 3×12 · Overhead tricep extension 2×12 · '
    'Hanging leg raises 3×12 · Cable crunches 3×15 · Plank 2×45s · '
    'COOL-DOWN: chest doorway stretch 30s/side → shoulder cross-body 30s/side → '
    'tricep overhead stretch 30s/side · ~50 min · RPE 7-8'
)

PULL_DETAIL = (
    'WARM-UP (5 min): 5 min treadmill walk → band pull-aparts 2×15 → arm circles → cat-cow stretches · '
    'Barbell rows 4×8-10 · Pull-ups 3×max (or lat pulldown 3×10-12) · '
    'Seated cable row 3×12 · Face pulls 3×15 · Barbell curls 3×10 · '
    'Hammer curls 2×12 · Dead hang 3×20-30s · '
    'COOL-DOWN: lat stretch 30s/side → chest doorway stretch 30s/side → '
    'shoulder cross-body 30s/side · ~50 min · RPE 7-8'
)

LEGS_DETAIL = (
    'WARM-UP (8 min): 5 min treadmill walk → bodyweight squats 2×10 → hip circles 10/side → '
    'leg swings 10/side → glute bridges 1×15 → 1 light warm-up set of first lift · '
    'Barbell back squat 3×8-10 (rebuild — own depth/bracing, not max) · '
    'Barbell or DB RDL 3×10 · Leg press 3×12 · Walking lunges 2×10/leg (light DBs) · '
    'Calf raises 3×15 · Hanging leg raises 3×12 · '
    'COOL-DOWN: quad stretch 30s/side → hamstring stretch 30s/side → '
    'hip flexor stretch 30s/side → pigeon pose 30s/side · ~50-55 min · RPE 6-7'
)

REST_DETAIL = (
    '25-30 min brisk walk (morning or evening) · '
    'Foam roll quads + calves + IT band 5 min if available'
)


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
        'Prefer': 'resolution=merge-duplicates,return=representation',
        'Accept': 'application/json',
    }


def api(method: str, path: str, body=None):
    url = f'{SUPABASE_URL}/rest/v1/{path}'
    data = None if body is None else json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers=headers(), method=method)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=45) as resp:
            raw = resp.read().decode()
            return resp.status, json.loads(raw) if raw else None
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode(errors='replace')


def gym(day_name, plan, detail, directive, meals, calories=2350, water='2L'):
    return {
        'day_name': day_name,
        'day_type': 'Gym',
        'workout_plan': plan,
        'workout_detail': detail,
        'run_type': None,
        'run_km': None,
        'run_pace': None,
        'run_cue': None,
        'directive': directive,
        'protein_target': 160,
        'calorie_target': calories,
        'water_target': water,
        'meals_plan': meals,
        'slot_scheme': 'Gym',
    }


def run_day(day_name, run_type, km, pace, cue_extra, directive, meals, calories=2350, water='2.5L'):
    cue = f'{RUN_WU} · {cue_extra} · {RUN_CD}'
    return {
        'day_name': day_name,
        'day_type': 'Run',
        'workout_plan': None,
        'workout_detail': None,
        'run_type': run_type,
        'run_km': km,
        'run_pace': pace,
        'run_cue': cue,
        'directive': directive,
        'protein_target': 160,
        'calorie_target': calories,
        'water_target': water,
        'meals_plan': meals,
        'slot_scheme': 'Run',
    }


def rest(day_name, directive, meals, calories=2300):
    return {
        'day_name': day_name,
        'day_type': 'Rest',
        'workout_plan': 'NEAT walk + recovery',
        'workout_detail': REST_DETAIL,
        'run_type': None,
        'run_km': None,
        'run_pace': None,
        'run_cue': None,
        'directive': directive,
        'protein_target': 160,
        'calorie_target': calories,
        'water_target': '2L',
        'meals_plan': meals,
        'slot_scheme': 'Rest',
    }


def build_plans():
    """Return date → day payload (without user_id/date)."""
    plans = {}

    # ── This week: irregular re-entry (Mon 16 – Sun 22 Nov) ──
    plans['2026-11-16'] = rest(
        'Monday',
        'Re-entry week. Rest / NEAT only — gym restart starts Tue upper warm-up. '
        'No race deadline. Focus: show up, sleep, hit protein.',
        MEALS_REST,
    )
    plans['2026-11-17'] = gym(
        'Tuesday',
        'Upper Warm-up (re-entry)',
        UPPER_WU_DETAIL,
        'DONE / logged as upper warm-up re-entry. Keep it light — shoulders+legs tomorrow. '
        'No ego. Hybrid Cardio+Gym block starts with showing up.',
        MEALS_GYM,
        calories=2300,
    )
    plans['2026-11-18'] = gym(
        'Wednesday',
        'Shoulders + Legs (moderate)',
        SHOULDERS_LEGS_DETAIL,
        'TODAY — shoulders + legs at RPE 6. Not a PR day. Tomorrow is first run in ~2 months — '
        'leave the legs recoverable. If knees complain on any set, stop that movement.',
        MEALS_LEGS,
        calories=2400,
    )
    plans['2026-11-19'] = run_day(
        'Thursday',
        'Easy / Walk-jog',
        3.0,
        '8:00-9:30/km (or walk-jog)',
        'Walk-jog OK: 2 min jog / 1 min walk × 6–8 · Cadence goal 145+ when jogging · RPE 4-5 · '
        'STOP if sharp knee pain or pressure lasting into next day',
        'FIRST RUN after ~2 months. Cardio health restart — not race prep. '
        'Walk-jog is a win. Conversational only. Knee rule: sharp pain → stop.',
        MEALS_RUN,
        calories=2350,
    )
    plans['2026-11-20'] = gym(
        'Friday',
        'Pull + Rear Delts',
        PULL_DETAIL,
        'Pull day — complete the week’s push/pull balance after Tue/Wed. '
        'Legs stay fresh for Sat easy run. Squeeze at contraction; dead hang at end.',
        MEALS_PULL_PRE_SAT,
    )
    plans['2026-11-21'] = run_day(
        'Saturday',
        'Easy',
        4.0,
        '8:00-9:00/km',
        'Cadence: 145+ BPM · RPE 5-6 · Walk breaks anytime · Continuous only if Thu felt clean',
        'Second contact day. ~25–30 min / ~4 km easy. If Thu irritated the knee, '
        'repeat walk-jog or swap to rest walk. No pace chasing.',
        MEALS_RUN_SAT,
        calories=2350,
    )
    plans['2026-11-22'] = rest(
        'Sunday',
        'Full rest. 25–30 min brisk walk. Foam roll if sore. '
        'Mon starts clean hybrid week: Legs → Easy → Push → Easy → Pull → Easy → Rest.',
        MEALS_REST,
    )

    # ── Next week: clean hybrid (Mon 23 – Sun 29 Nov) ──
    plans['2026-11-23'] = gym(
        'Monday',
        'Legs + Core',
        LEGS_DETAIL,
        'Clean hybrid week starts. Legs after Sunday rest. Easy run tomorrow — keep Tue genuinely easy. '
        'Rebuild, don’t max. Log weights.',
        MEALS_LEGS,
        calories=2400,
    )
    plans['2026-11-24'] = run_day(
        'Tuesday',
        'Easy',
        4.0,
        '7:45-8:45/km',
        'Cadence: 145+ BPM · RPE 5-6',
        'Easy run for cardio health. Conversational. Residual Legs fatigue is OK — do not push pace. '
        'Knee: walk home if sharp pain.',
        MEALS_RUN,
    )
    plans['2026-11-25'] = gym(
        'Wednesday',
        'Push + Core',
        PUSH_DETAIL,
        'Push day. Progressive overload vs last matching upper session. Log all weights.',
        MEALS_GYM,
    )
    plans['2026-11-26'] = run_day(
        'Thursday',
        'Easy',
        4.0,
        '7:45-8:45/km',
        'Cadence: 145+ BPM · RPE 5-6',
        'Easy run — cardio consistency. Same easy effort as Tue. No speedwork.',
        MEALS_RUN,
    )
    plans['2026-11-27'] = gym(
        'Friday',
        'Pull + Rear Delts',
        PULL_DETAIL,
        'Pull day. Upper only so legs are fresh for Sat easy run. Dead hang at end.',
        MEALS_PULL_PRE_SAT,
    )
    plans['2026-11-28'] = run_day(
        'Saturday',
        'Easy',
        5.0,
        '7:45-8:45/km',
        'Cadence: 145+ BPM · RPE 5-6 · Walk 1 min at halfway if needed',
        'Week’s longest easy run (~35–40 min / ~5 km). Finish able to do 1 more km. '
        'Not a long-run race build — just cardio base.',
        MEALS_RUN_SAT,
        calories=2400,
        water='2.5L+',
    )
    plans['2026-11-29'] = rest(
        'Sunday',
        'Full rest + NEAT walk 25–30 min. Monday AM: weigh before food. '
        'Hold this 3+3 template until cardio feels easy, then nudge Sat duration.',
        MEALS_REST,
    )

    return plans


def upsert_day(user_id: str, day: str, payload: dict, dry_run: bool) -> None:
    row = {'user_id': user_id, 'date': day, **payload}
    if dry_run:
        print(f'  DRY {day} {payload["day_name"]} {payload["day_type"]}: {payload.get("workout_plan") or payload.get("run_type")}')
        return
    status, data = api('POST', 'daily_plans?on_conflict=user_id,date', row)
    if status >= 400:
        # Fallback: PATCH if row exists quirks
        status2, data2 = api(
            'PATCH',
            f'daily_plans?user_id=eq.{user_id}&date=eq.{day}',
            payload,
        )
        if status2 >= 400:
            raise SystemExit(f'UPSERT {day} failed POST={status} {data} PATCH={status2} {data2}')
        print(f'  ✓ {day} {payload["day_name"]} (patched)')
        return
    print(f'  ✓ {day} {payload["day_name"]} {payload["day_type"]}')


def main():
    load_env_file()
    parser = argparse.ArgumentParser()
    parser.add_argument('--user-id', default=DEFAULT_USER_ID)
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()

    plans = build_plans()
    print(f'Wiring {len(plans)} days for {args.user_id}' + (' (dry-run)' if args.dry_run else ''))
    for day in sorted(plans):
        upsert_day(args.user_id, day, plans[day], args.dry_run)
    print('Done.')


if __name__ == '__main__':
    main()
