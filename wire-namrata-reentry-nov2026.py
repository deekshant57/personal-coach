#!/usr/bin/env python3
"""Wire Namrata re-entry plans into daily_plans (Mon 16 – Sun 29 Nov 2026).

Restart week (16–22): Tue upper done, Wed skipped, Thu legs+shoulders done,
Fri cardio+core, Sat glutes, Sun rest.
Next week (23–29): clean template at beginner re-entry loads.

Usage:
  python3 wire-namrata-reentry-nov2026.py
  python3 wire-namrata-reentry-nov2026.py --dry-run
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
USER_ID = '9e6a0d55-b63f-4857-b318-122e0c337ef4'

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

EGGS_NOTE = (
    'EGGS: whole eggs (yolk + white) — not whites only. Plan math = ~7g protein / ~70 kcal each; '
    'yolks help hit fat floor 40–50g.\n'
    'SABZI / VEGGIES: 1 bowl non-starchy sabzi (bhindi / beans / cabbage / cauliflower / '
    'capsicum / zucchini / carrot / palak / lauki / mixed) sautéed light oil — ~150–200g cooked. '
    'Not dal/chana/rajma (those are the legume slot). Not potato as the main veg. '
    'Lunch salad = separate (cucumber/tomato/onion/lettuce)'
)

MEALS_TRAIN = f"""— PROTEIN TARGET 100g · CALORIES ~1800 —
6:00 Pre-gym — Banana or water
~7:30 Post-gym — 3 eggs + 1 scoop ON Gold Standard whey isolate (Double Rich Chocolate) in water
1:00 Lunch — 2 chapati + dal/chana/rajma + 80–100g paneer + salad
4:30 Snack — curd or roasted chana + 10 almonds OR fruit
8:00 Dinner — 2 eggs + sabzi
Supplements — Supradyn after first/post-gym meal
{EGGS_NOTE}"""

MEALS_THU = f"""— PROTEIN TARGET 90g+ · CALORIES ~1450 —
THURSDAY FAST: Milk + fruits + dry fruits all day. Whey with water/milk OK. Chapati / dal / sabzi only once — at dinner. No lunch thali.
6:00 Pre-gym — 200ml milk + fruit
~7:30 Post-gym — 1 scoop ON Gold Standard whey isolate (Double Rich Chocolate) in water + dry fruits
Daytime — milk + fruit + dry fruits only (no chapati/dal/sabzi)
8:00 Dinner (ONLY solid meal) — 3 eggs + 2 chapati + dal + sabzi + curd
Supplements — Supradyn after first/post-gym meal · Uprise D3 60K with dinner (fattiest meal — Thursday)
{EGGS_NOTE}"""

MEALS_REST = f"""— PROTEIN TARGET 95g · CALORIES ~1650 —
GYM CLOSED — rest day
8:30 Breakfast — 3 eggs + 1 scoop ON Gold Standard whey isolate (Double Rich Chocolate) in water  OR  dosa/sambar (log portions)
1:00 Lunch — 1.5–2 chapati + dal + paneer/eggs + salad
4:30 Snack — almonds / roasted chana / fruit
8:00 Dinner — 2 eggs + sabzi
Supplements — Supradyn after first meal
Optional: 20–30 min easy outdoor walk
{EGGS_NOTE}"""

# Reduced mid-week re-entry (Fri/Sat stub)
UPPER_REENTRY = (
    'WARM-UP (8 min): treadmill walk easy 5 min → arm circles 20 → hip circles 10/side → '
    'bodyweight squats 1×10 (slow) → glute bridges 1×10 → 1 light warm-up set of first lift · '
    'Lat pulldown 3×10–12 · Seated row 3×10–12 · Chest press 2×10–12 · '
    'Shoulder press or seated DB press 2×10 · Lateral raise 2×12 · '
    'Biceps curl 2×12 · Triceps pushdown 2×12 · Plank 2×25–35s · '
    'CARDIO — 15 min incline walk or cycle (easy conversational) · '
    '40–50 min · RPE 4–5 · RE-ENTRY — leave 2–3 reps in reserve · '
    'COOL-DOWN (5 min): hip flexor stretch 30s/side → figure-4 glute stretch 30s/side → '
    'chest doorway stretch 30s/side → child\'s pose 30s'
)

LOWER_REENTRY = (
    'WARM-UP (8 min): treadmill walk easy 5 min → arm circles 20 → hip circles 10/side → '
    'bodyweight squats 1×10 (slow) → glute bridges 1×10 → 1 light warm-up set of first lift · '
    'Leg press 3×10 · Dumbbell RDL 3×10 (light-moderate) · Hip thrust or glute bridge 3×12 · '
    'Reverse or walking lunge 2×8/leg · Cable kickback or abduction 2×12–15 · Calf raise 2×15 · '
    'CARDIO — 15 min incline walk or cycle (easy conversational) · '
    '40–50 min · RPE 4–5 · RE-ENTRY — form first, not load · '
    'OK swaps: leg curl / leg extension if preferred · keep at least one hinge (RDL) + one glute thrust · '
    'COOL-DOWN (5 min): hip flexor stretch 30s/side → figure-4 glute stretch 30s/side → '
    'chest doorway stretch 30s/side → child\'s pose 30s'
)

# Clean next-week sessions (still re-entry, not peak)
UPPER = (
    'WARM-UP (8 min): treadmill walk easy 5 min → arm circles 20 → hip circles 10/side → '
    'bodyweight squats 1×10 (slow) → glute bridges 1×10 → 1 light warm-up set of first lift · '
    'Lat pulldown 3×10–12 · Seated row 3×10–12 · Chest press 3×10–12 · '
    'Shoulder press or seated DB press 2×10 · Lateral raise 2×12 · '
    'Biceps curl 2×12 · Triceps pushdown 2×12 · Plank 3×25–40s · '
    'CARDIO — 18–20 min incline walk or cycle (easy conversational) · '
    '45–55 min · RPE 5–6 · '
    'COOL-DOWN (5 min): hip flexor stretch 30s/side → figure-4 glute stretch 30s/side → '
    'chest doorway stretch 30s/side → child\'s pose 30s'
)

LOWER = (
    'WARM-UP (8 min): treadmill walk easy 5 min → arm circles 20 → hip circles 10/side → '
    'bodyweight squats 1×10 (slow) → glute bridges 1×10 → 1 light warm-up set of first lift · '
    'Leg press 3×10 · Dumbbell RDL 3×10 · Hip thrust or glute bridge 3×12 · '
    'Reverse or walking lunge 2×8/leg · Cable kickback or abduction 2×12–15 · Calf raise 2×15 · '
    'CARDIO — 18–20 min incline walk or cycle (easy conversational) · '
    '45–55 min · RPE 5–6 · '
    'OK swaps: leg curl / leg extension if preferred · keep at least one hinge (RDL) + one glute thrust · '
    'COOL-DOWN (5 min): hip flexor stretch 30s/side → figure-4 glute stretch 30s/side → '
    'chest doorway stretch 30s/side → child\'s pose 30s'
)

CARDIO_CORE = (
    'WARM-UP (5 min): treadmill walk easy · '
    'CARDIO (25–30 min): incline walk OR cycle OR elliptical · conversational · RPE 4–5 · '
    'CORE: Plank 3×30–40s · Side plank 2×20s/side · Dead bug 2×8/side · Bird dog 2×8/side · '
    'NO lat pulldown / rows / chest / shoulder press / curls — save upper for Fri · '
    'NO squats / leg press / RDL / hip thrust / lunges · '
    '40–45 min · RPE 4–5 · '
    'COOL-DOWN: hip flexor 30s/side → child’s pose 30s → chest doorway 30s/side'
)

EASY_CARDIO_THU = (
    'WARM-UP (5 min): easy walk · '
    'CARDIO (20–25 min): incline walk OR cycle · easy conversational · RPE 3–4 · '
    'Optional: light stretching 5 min · '
    'NO strength compounds — fasting day + Fri is full Upper · '
    '25–35 min total · RPE 3–4 · '
    'COOL-DOWN: easy walk 2 min → gentle stretches'
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


def gym(day_name, plan, detail, directive, meals, calories=1800, protein=100, water='2.5L'):
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
        'protein_target': protein,
        'calorie_target': calories,
        'water_target': water,
        'meals_plan': meals,
        'planned_session_window': 'morning',
        'session_status': 'planned',
        'slot_scheme': None,
    }


def rest(day_name, directive, meals):
    return {
        'day_name': day_name,
        'day_type': 'Rest',
        'workout_plan': None,
        'workout_detail': None,
        'run_type': None,
        'run_km': None,
        'run_pace': None,
        'run_cue': None,
        'directive': directive,
        'protein_target': 95,
        'calorie_target': 1650,
        'water_target': '2L',
        'meals_plan': meals,
        'planned_session_window': None,
        'session_status': 'planned',
        'slot_scheme': None,
    }


# Friday make-up. Shoulders were Thursday; legs were Thursday. Upper waits until Monday.
FRI_CARDIO_CORE = (
    'WARM-UP (5 min): treadmill walk easy · '
    'CARDIO (25–30 min): incline walk OR cycle OR elliptical · conversational · RPE 4–5 · '
    'CORE: Plank 3×30–40s · Side plank 2×20s/side · Dead bug 2×8/side · Bird dog 2×8/side · '
    'NO lat pulldown / rows / chest / shoulder press / curls / shrugs — shoulders were yesterday · '
    'NO squats / leg press / RDL / hip thrust / lunges — Saturday is glutes · '
    '40–45 min · RPE 4–5 · '
    'COOL-DOWN: hip flexor 30s/side → child’s pose 30s → chest doorway 30s/side'
)

# Saturday after Thursday legs. Glutes, not a second shoulder day, not a hard quad day.
SAT_GLUTES = (
    'WARM-UP (8 min): treadmill walk easy 5 min → hip circles 10/side → '
    'bodyweight squats 1×10 (slow) → glute bridges 1×10 → 1 light warm-up set of the RDL · '
    'Dumbbell RDL 3×10 (light) · Hip thrust or glute bridge 3×12 · '
    'Cable kickback or abduction 2×12–15 · Calf raise 2×12 · '
    'Leg curl 2×12 if you want one machine — skip leg press and lunges if quads are sore · '
    'NO shoulder press, lateral raise, or shrugs · '
    'CARDIO — 15 min incline walk or cycle (easy) · '
    '40–50 min · RPE 4–5 · hinge + hip thrust stay in · '
    'COOL-DOWN (5 min): hip flexor stretch 30s/side → figure-4 glute stretch 30s/side → child\'s pose 30s'
)


def mark(row, status, actual=None):
    row['session_status'] = status
    if actual is not None:
        row['actual_session_window'] = actual
    return row


def build_plans():
    plans = {}

    # ── This week, corrected to the restart: Mon 16 – Sun 22 ──
    # Tue upper done, Wed skipped, Thu legs+shoulders done.
    # Fri = missed cardio+core. Sat = glutes. Sun = rest.
    plans['2026-11-16'] = rest(
        'Mon',
        'Off. Restart began Tuesday. Nothing to make up.',
        MEALS_REST,
    )
    plans['2026-11-17'] = mark(gym(
        'Tue',
        'Upper — chest, back, biceps, triceps (done)',
        'DONE. Chest, back, biceps, triceps. No shoulder work this day.',
        'Counted. Restart day. Shoulders were not in this session. Do not repeat chest, back, or arms on Friday.',
        MEALS_TRAIN,
    ), 'completed', 'morning')
    plans['2026-11-18'] = mark(gym(
        'Wed',
        'Skipped — no session',
        'Missed. No workout.',
        'Missed. Not made up with extra lifting. Friday is cardio + core instead.',
        MEALS_TRAIN,
        water='2L',
    ), 'skipped', 'skipped')
    plans['2026-11-19'] = mark(gym(
        'Thu',
        'Lower + shoulders (done — off plan)',
        'DONE. Legs and shoulders. This replaced easy cardio.',
        'Counted. Legs and shoulders are done for this week. Thursday fast still applied: '
        'milk, fruit, dry fruits, whey; chapati, dal, and sabzi at dinner only. '
        'Do not repeat shoulders on Friday or Saturday.',
        MEALS_THU,
        calories=1450,
        protein=90,
    ), 'completed', 'morning')
    plans['2026-11-20'] = gym(
        'Fri',
        'Cardio + core — Fitworld (make-up)',
        FRI_CARDIO_CORE,
        'Shoulders and legs were yesterday. No upper lifts and no leg work. '
        'This is the Wednesday session. Easy. RPE 4–5. Saturday is glutes.',
        MEALS_TRAIN,
        water='2L',
    )
    plans['2026-11-21'] = gym(
        'Sat',
        'Lower / glutes — Fitworld (easy, no shoulders)',
        SAT_GLUTES,
        'Glutes, not another shoulder day and not a hard quad day. Legs were Thursday. '
        'RDL and hip thrust stay. Skip leg press and lunges if stairs feel sore. RPE 4–5.',
        MEALS_TRAIN,
    )
    plans['2026-11-22'] = rest(
        'Sun',
        'Fitworld closed. Rest. Monday is upper, including shoulders. Optional easy outdoor walk.',
        MEALS_REST,
    )

    # ── Next week: back on the template. Mon 23 – Sun 29 ──
    plans['2026-11-23'] = gym(
        'Mon',
        'Upper / arms + cardio — Fitworld',
        UPPER,
        'Clean week. Full upper, including shoulder press and lateral raises. '
        'Shoulders belong on this day, not on leg day. Controlled reps. RPE 5–6.',
        MEALS_TRAIN,
    )
    plans['2026-11-24'] = gym(
        'Tue',
        'Lower / glutes + cardio — Fitworld',
        LOWER,
        'Lower / glutes. Saturday was light glutes and Sunday was rest, so this is the normal gap. '
        'Same loads, do not add plates. Hinge and hip thrust stay. No shoulders.',
        MEALS_TRAIN,
    )
    plans['2026-11-25'] = gym(
        'Wed',
        'Cardio + core — Fitworld (no upper compounds, no legs)',
        CARDIO_CORE,
        'Cardio + core only. Not an upper day and not a leg day. Thursday is the fast. '
        'Keep it easy if sleep was short.',
        MEALS_TRAIN,
        water='2L',
    )
    plans['2026-11-26'] = gym(
        'Thu',
        'Easy cardio — Fitworld (Thursday fast · no lifting)',
        EASY_CARDIO_THU,
        'THURSDAY FAST. Easy cardio only. Last Thursday was legs and shoulders — that does not repeat. '
        'No presses, no rows, no leg machines. Solid food only at dinner.',
        MEALS_THU,
        calories=1450,
        protein=90,
    )
    plans['2026-11-27'] = gym(
        'Fri',
        'Upper / arms + cardio — Fitworld',
        UPPER,
        'Quality upper of the week. Chest, back, shoulders, and arms. Controlled reps. RPE 5–6.',
        MEALS_TRAIN,
    )
    plans['2026-11-28'] = gym(
        'Sat',
        'Lower / glutes + cardio — Fitworld',
        LOWER,
        'Quality lower / glutes. Hinge and hip thrust stay in. No shoulders.',
        MEALS_TRAIN,
    )
    plans['2026-11-29'] = rest(
        'Sun',
        'Fitworld closed. Rest. Weigh Monday AM before food if possible.',
        MEALS_REST,
    )

    return plans


def upsert(day: str, payload: dict, dry_run: bool):
    row = {'user_id': USER_ID, 'date': day, **payload}
    if dry_run:
        print(f'[dry-run] {day} {payload["day_name"]} {payload["day_type"]} | {payload.get("workout_plan")}')
        return True
    status, data = api('POST', 'daily_plans?on_conflict=user_id,date', row)
    if status in (200, 201):
        print(f'OK POST {day} {payload["day_name"]} → {payload.get("workout_plan") or "Rest"}')
        return True
    # fallback PATCH
    status2, data2 = api(
        'PATCH',
        f'daily_plans?user_id=eq.{USER_ID}&date=eq.{day}',
        payload,
    )
    if status2 in (200, 204):
        print(f'OK PATCH {day} {payload["day_name"]} → {payload.get("workout_plan") or "Rest"}')
        return True
    print(f'FAIL {day}: POST {status} {data} | PATCH {status2} {data2}', file=sys.stderr)
    return False


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    load_env_file()
    plans = build_plans()
    ok = True
    for day in sorted(plans):
        if not upsert(day, plans[day], args.dry_run):
            ok = False
    if not ok:
        raise SystemExit(1)
    print(f'Done — {len(plans)} days ({"dry-run" if args.dry_run else "wired"}).')


if __name__ == '__main__':
    main()
