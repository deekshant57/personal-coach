#!/usr/bin/env python3
"""Audit a week's daily_plans for sequencing / source-of-truth drift.

Checks (pass/fail):
  1. DB rows exist for each Mon–Sun date (one athlete only)
  2. DB vs coach/current-block.md weekly template (gym + run layout)
  3. Optional: DB vs coach/week-plans.py for overlapping dates
  4. Lower-body adjacency rules:
     - Hard lower the day before any run → FAIL
     - Hard lower within 24h before long run → FAIL
     - 3+ consecutive days with lower stimulus → FAIL
     - Directive that contradicts hard lower before a run → WARN

Usage:
  python3 audit-week-plan.py
  python3 audit-week-plan.py --week-of 2026-08-21
  python3 audit-week-plan.py --from 2026-08-17 --to 2026-08-23
  python3 audit-week-plan.py --user-id d6f25dae-4cc8-48dd-9822-fbccf9a92139

Requires SUPABASE_SERVICE_ROLE_KEY in env or ../.env (same as seed-plans.py).
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
from datetime import date, datetime, timedelta

SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://lqtwtcgnzpsrhfuynzdk.supabase.co')
ANON_KEY = os.environ.get(
    'SUPABASE_ANON_KEY',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxdHd0Y2duenBzcmhmdXluemRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNjU1MzUsImV4cCI6MjA5Nzg0MTUzNX0.QqfjgnC3b_VjWUrKbhgb4YF-FDN2ptZgYQ3WoyjMer4',
)
DEFAULT_USER_ID = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139'

HARD_LOWER_RE = re.compile(
    r'\b('
    r'leg day|legs?\s*\+|squats?|lunges?|bulgarian|leg press|hip thrust|'
    r'hack squat|leg curl|leg extension|step[- ]?ups?|'
    r'heavy\s+rdl|rdls?\s+\d|romanian(?:\s+deadlift)?'
    r')\b',
    re.I,
)
SOFT_LOWER_HINT_RE = re.compile(
    r'\b(glute bridge|clamshell|calf raise|mobility|knee prep|active recovery)\b',
    re.I,
)
UPPER_RE = re.compile(
    r'\b(push\b|pull\b|upper\b|chest\b|back\b|arms?\b|ohp|bench|row|lat|'
    r'rear delts?|face pulls?)\b',
    re.I,
)
NO_LOWER_RE = re.compile(
    r'\b(no legs?|no squats?|no lunges?|no rdl|upper only|upper body only)\b',
    re.I,
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


def api_key():
    return os.environ.get('SUPABASE_SERVICE_ROLE_KEY') or ANON_KEY


def parse_iso(d: str) -> date:
    return datetime.strptime(d, '%Y-%m-%d').date()


def monday_of(d: date) -> date:
    return d - timedelta(days=d.weekday())


def week_range(week_of: date | None, start: date | None, end: date | None):
    if start and end:
        return start, end
    if start and not end:
        return start, start + timedelta(days=6)
    anchor = week_of or date.today()
    start = monday_of(anchor)
    return start, start + timedelta(days=6)


def fetch_daily_plans(user_id: str, start: date, end: date) -> list[dict]:
    params = urllib.parse.urlencode({
        'user_id': f'eq.{user_id}',
        'date': f'gte.{start.isoformat()}',
        'and': f'(date.lte.{end.isoformat()})',
        'select': (
            'date,day_name,day_type,workout_plan,workout_detail,'
            'run_type,run_km,directive'
        ),
        'order': 'date.asc',
    })
    # PostgREST prefers date=gte.X&date=lte.Y — rebuild cleanly
    q = (
        f'daily_plans?user_id=eq.{user_id}'
        f'&date=gte.{start.isoformat()}&date=lte.{end.isoformat()}'
        f'&select=date,day_name,day_type,workout_plan,workout_detail,'
        f'run_type,run_km,directive'
        f'&order=date.asc'
    )
    url = f'{SUPABASE_URL}/rest/v1/{q}'
    key = api_key()
    req = urllib.request.Request(url, headers={
        'apikey': key,
        'Authorization': f'Bearer {key}',
        'Accept': 'application/json',
    })
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors='replace')
        raise SystemExit(f'HTTP {e.code} fetching daily_plans: {body}') from e


def _strip_warmup(detail: str) -> str:
    """Drop WARM-UP / COOL-DOWN blocks so activation squats don't flag Legs."""
    if not detail:
        return ''
    text = detail
    text = re.sub(r'WARM-?UP.*?(?=·|$)', ' ', text, flags=re.I | re.S)
    text = re.sub(r'COOL-?DOWN.*?(?=·|$)', ' ', text, flags=re.I | re.S)
    return text


def classify_day(row: dict) -> str:
    """Return hard_lower | soft_lower | upper | rest | unknown.

    Classification prefers workout_plan (session title). workout_detail is only
    used after stripping warm-up/cool-down so bw squat warm-ups don't count.
    """
    day_type = (row.get('day_type') or '').strip().lower()
    title = row.get('workout_plan') or ''
    detail = _strip_warmup(row.get('workout_detail') or '')
    plan = f'{title} {detail}'.strip()
    run_type = (row.get('run_type') or '').strip()
    has_run = bool(run_type) and run_type.upper() != 'NA'

    if day_type in ('rest',):
        if has_run:
            return 'soft_lower'
        return 'rest'

    if has_run:
        return 'soft_lower'

    if day_type in ('active recovery',):
        return 'soft_lower'

    if NO_LOWER_RE.search(title) or NO_LOWER_RE.search(plan):
        return 'upper'

    # Session title wins: "Legs + Core", "Lower / glutes"
    if re.search(r'\b(legs?\b|lower\b|glutes?\b)', title, re.I):
        return 'hard_lower'

    # Working sets in detail (not warm-up): heavy hinge / squat / lunge volume
    if HARD_LOWER_RE.search(detail):
        return 'hard_lower'

    if UPPER_RE.search(title) or UPPER_RE.search(plan) or day_type == 'gym':
        return 'upper'

    if SOFT_LOWER_HINT_RE.search(plan):
        return 'soft_lower'

    if day_type in ('bodyweight', 'gym'):
        return 'unknown'

    return 'unknown'


def is_long_run(row: dict) -> bool:
    rt = (row.get('run_type') or '').lower()
    km = row.get('run_km')
    if 'long' in rt:
        return True
    try:
        return float(km or 0) >= 8
    except (TypeError, ValueError):
        return False


def parse_block_template(path: str) -> dict | None:
    """Parse Mon/Wed/Fri gym + Tue/Thu/Sat run lines from current-block.md."""
    if not os.path.isfile(path):
        return None
    text = open(path, encoding='utf-8').read()
    gym_m = re.search(
        r'\*\*Gym:\*\*[^\n]*?[—-]\s*'
        r'Mon\s+([^,]+),\s*Wed\s+([^,]+),\s*Fri\s+([^\n(]+)',
        text,
        re.I,
    )
    run_m = re.search(
        r'\*\*Running:\*\*[^\n]*?[—-]\s*'
        r'Tue\s+([^,]+),\s*Thu\s+([^,]+),\s*Sat\s+([^\n]+)',
        text,
        re.I,
    )
    if not gym_m or not run_m:
        return None

    def norm(s: str) -> str:
        return re.sub(r'\s+', ' ', s).strip().rstrip('.*')

    return {
        'Mon': ('Gym', norm(gym_m.group(1))),
        'Tue': ('Run', norm(run_m.group(1))),
        'Wed': ('Gym', norm(gym_m.group(2))),
        'Thu': ('Run', norm(run_m.group(2))),
        'Fri': ('Gym', norm(gym_m.group(3))),
        'Sat': ('Run', norm(run_m.group(3))),
        'Sun': ('Rest', 'Rest'),
    }


def weekday_label(d: date) -> str:
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][d.weekday()]


def session_label(row: dict) -> str:
    if row.get('run_type'):
        km = row.get('run_km')
        km_s = f' {km} km' if km is not None else ''
        return f"{row['run_type']}{km_s}"
    return row.get('workout_plan') or row.get('day_type') or '—'


def fuzzy_match_session(expected: str, actual: str) -> bool:
    """Loose match: primary session token from expected must appear in actual."""
    exp = expected.lower()
    act = actual.lower()
    if 'rest' in exp:
        return 'rest' in act or actual.strip() in ('—', '-', '')

    primaries = []
    if re.search(r'\blegs?\b', exp):
        primaries.append('leg')
    if 'push' in exp:
        primaries.append('push')
    if 'pull' in exp:
        primaries.append('pull')
    if 'long' in exp:
        primaries.append('long')
    if 'tempo' in exp:
        primaries.append('tempo')
    if re.search(r'\beasy\b', exp) and not primaries:
        primaries.append('easy')

    if primaries:
        return all(
            (p == 'leg' and 'leg' in act) or (p != 'leg' and p in act)
            for p in primaries
        )

    first = exp.split()[0] if exp else ''
    return first in act if first else True


def load_week_plans_for_range(start: date, end: date) -> dict[str, dict]:
    path = os.path.join(os.path.dirname(__file__), 'coach', 'week-plans.py')
    if not os.path.isfile(path):
        return {}
    ns = {'NA': 'NA'}
    with open(path, encoding='utf-8') as f:
        exec(compile(f.read(), path, 'exec'), ns)
    out = {}
    for plan in ns.get('WEEK_PLANS', {}).values():
        for day in plan.get('days', []):
            d = day.get('date')
            if not d:
                continue
            dd = parse_iso(d)
            if start <= dd <= end:
                out[d] = day
    return out


def audit(rows: list[dict], start: date, end: date, block_path: str) -> int:
    fails: list[str] = []
    warns: list[str] = []

    by_date: dict[str, dict] = {}
    for row in rows:
        d = row['date']
        if d in by_date:
            warns.append(f'{d}: duplicate DB row for this user_id (using last)')
        by_date[d] = row

    print(f'\n=== Week audit {start} → {end} ({(end - start).days + 1} days) ===\n')
    print(f'{"Date":<12} {"Dow":<4} {"Type":<16} {"Class":<12} Session')
    print('-' * 78)

    ordered: list[tuple[date, dict | None, str]] = []
    cur = start
    while cur <= end:
        key = cur.isoformat()
        row = by_date.get(key)
        if not row:
            fails.append(f'{key}: missing daily_plans row')
            print(f'{key:<12} {weekday_label(cur):<4} {"MISSING":<16} {"—":<12} —')
            ordered.append((cur, None, 'missing'))
        else:
            klass = classify_day(row)
            print(
                f'{key:<12} {weekday_label(cur):<4} '
                f'{(row.get("day_type") or "—"):<16} {klass:<12} '
                f'{session_label(row)}'
            )
            ordered.append((cur, row, klass))
        cur += timedelta(days=1)

    # --- Block template diff ---
    template = parse_block_template(block_path)
    print('\n--- Source: current-block.md template ---')
    if not template:
        warns.append('Could not parse Gym/Running lines from current-block.md')
        print('  (unparsed)')
    else:
        for dow, (etype, esess) in template.items():
            print(f'  {dow}: {etype} — {esess}')
        print('\n--- DB vs block template ---')
        for d, row, _klass in ordered:
            if not row:
                continue
            dow = weekday_label(d)
            if dow not in template:
                continue
            etype, esess = template[dow]
            atype = row.get('day_type') or ''
            asess = session_label(row)
            type_ok = etype.lower() in atype.lower() or (
                etype == 'Rest' and atype.lower() in ('rest', 'active recovery')
            )
            if etype == 'Rest' and type_ok:
                sess_ok = True
            else:
                sess_ok = fuzzy_match_session(esess, asess) or fuzzy_match_session(
                    esess, row.get('workout_plan') or ''
                )
            if not type_ok or not sess_ok:
                fails.append(
                    f'{d} ({dow}): DB={atype}/{asess!r} vs block={etype}/{esess!r}'
                )
                print(f'  FAIL {d} ({dow}): DB {atype} · {asess}  ≠  block {etype} · {esess}')
            else:
                print(f'  ok   {d} ({dow})')

    # --- week-plans.py overlap ---
    file_days = load_week_plans_for_range(start, end)
    if file_days:
        print('\n--- DB vs week-plans.py (overlapping dates) ---')
        for d_str, day in sorted(file_days.items()):
            row = by_date.get(d_str)
            if not row:
                warns.append(f'{d_str}: in week-plans.py but missing in DB')
                print(f'  WARN {d_str}: in week-plans.py, missing in DB')
                continue
            ftype = day.get('type') or ''
            fplan = (day.get('workout') or {}).get('plan') or ''
            frun = (day.get('run') or {}).get('type') or ''
            if frun and frun != 'NA':
                fsess = f"{frun} {(day.get('run') or {}).get('km')} km"
            else:
                fsess = fplan if fplan and fplan != 'NA' else ftype
            asess = session_label(row)
            if (row.get('day_type') or '').lower() != ftype.lower() or not fuzzy_match_session(fsess, asess):
                warns.append(
                    f'{d_str}: DB={row.get("day_type")}/{asess!r} vs week-plans.py={ftype}/{fsess!r}'
                )
                print(f'  WARN {d_str}: DB {row.get("day_type")} · {asess}  ≠  file {ftype} · {fsess}')
            else:
                print(f'  ok   {d_str}')
    else:
        print('\n--- week-plans.py: no overlapping dates in range ---')

    # --- Adjacency rules ---
    # Phase 1 concurrent rule (21 Aug 2026):
    #   Hard lower OK before an *easy* run (Mon Legs → Tue easy) after a rest day.
    #   Hard lower NOT OK before quality/long runs, or when it creates a 3-day lower stack
    #   that includes hard lower between two runs (the Wed Legs failure mode).
    print('\n--- Lower-body adjacency ---')
    for i, (d, row, klass) in enumerate(ordered):
        if not row:
            continue
        nxt = ordered[i + 1] if i + 1 < len(ordered) else None
        if klass == 'hard_lower' and nxt and nxt[1]:
            nxt_row = nxt[1]
            nxt_run = (nxt_row.get('run_type') or '').strip()
            if nxt_run:
                if is_long_run(nxt_row) or re.search(r'tempo|interval|race', nxt_run, re.I):
                    msg = (
                        f'{d}: hard lower ({session_label(row)}) '
                        f'the day before quality/long run ({session_label(nxt_row)})'
                    )
                    fails.append(msg)
                    print(f'  FAIL {msg}')
                else:
                    # Easy run after Legs — allowed; note only
                    print(
                        f'  ok   {d}: hard lower → easy run '
                        f'({session_label(nxt_row)}) — Phase 1 allowed'
                    )

            directive = row.get('directive') or ''
            if nxt_run and re.search(
                r'active recovery for yesterday|recovery for yesterday.s leg',
                directive,
                re.I,
            ):
                warns.append(
                    f'{d}: directive still frames next run as recovery-after-Legs '
                    f'(prefer Mon Legs wording)'
                )
                print(f'  WARN {d}: stale recovery-after-Legs directive')

    # Hard lower sandwiched between two soft_lower/run days → FAIL
    for i, (d, row, klass) in enumerate(ordered):
        if klass != 'hard_lower' or not row:
            continue
        prev = ordered[i - 1] if i > 0 else None
        nxt = ordered[i + 1] if i + 1 < len(ordered) else None
        if prev and nxt and prev[2] == 'soft_lower' and nxt[2] == 'soft_lower':
            msg = (
                f'{d}: hard lower sandwiched between two run/lower days '
                f'({prev[0]} → {d} → {nxt[0]})'
            )
            fails.append(msg)
            print(f'  FAIL {msg}')

    # 3+ consecutive lower stimulus — report longest streak only when it includes hard_lower
    streak = 0
    streak_start = None
    streak_has_hard = False
    best = None  # (start, end, length, has_hard)
    for d, _row, klass in ordered:
        if klass in ('hard_lower', 'soft_lower'):
            if streak == 0:
                streak_start = d
                streak_has_hard = False
            streak += 1
            if klass == 'hard_lower':
                streak_has_hard = True
            if streak >= 3 and streak_has_hard:
                best = (streak_start, d, streak, streak_has_hard)
        else:
            streak = 0
            streak_start = None
            streak_has_hard = False
    if best:
        s0, s1, n, _ = best
        msg = (
            f'{s0}→{s1}: {n} consecutive lower-stimulus days including hard lower '
            f'(run↔Legs sandwich)'
        )
        fails.append(msg)
        print(f'  FAIL {msg}')

    adj_fails = [
        f for f in fails
        if 'hard lower' in f or 'consecutive lower' in f or 'sandwiched' in f
    ]
    if not adj_fails:
        print('  ok   no Legs-between-runs or hard-lower→quality-run issues')

    # --- Summary ---
    print('\n=== Summary ===')
    if warns:
        print(f'WARN ({len(warns)}):')
        for w in warns:
            print(f'  • {w}')
    if fails:
        print(f'FAIL ({len(fails)}):')
        for f in fails:
            print(f'  • {f}')
        print('\nResult: FAIL')
        return 1

    print('Result: PASS')
    return 0


def main():
    load_env_file()
    p = argparse.ArgumentParser(description='Audit weekly training plan sequencing')
    p.add_argument('--user-id', default=DEFAULT_USER_ID)
    p.add_argument('--week-of', help='Any date in the week (YYYY-MM-DD); defaults to today')
    p.add_argument('--from', dest='date_from', help='Range start YYYY-MM-DD')
    p.add_argument('--to', dest='date_to', help='Range end YYYY-MM-DD')
    p.add_argument(
        '--block',
        default=os.path.join(os.path.dirname(__file__), 'coach', 'current-block.md'),
        help='Path to current-block.md',
    )
    args = p.parse_args()

    week_of = parse_iso(args.week_of) if args.week_of else None
    start = parse_iso(args.date_from) if args.date_from else None
    end = parse_iso(args.date_to) if args.date_to else None
    start, end = week_range(week_of, start, end)

    if not os.environ.get('SUPABASE_SERVICE_ROLE_KEY'):
        print(
            'Note: SUPABASE_SERVICE_ROLE_KEY not set — using anon key '
            '(may fail RLS). Put key in ../.env',
            file=sys.stderr,
        )

    print(f'User: {args.user_id}')
    print(f'URL:  {SUPABASE_URL}')
    rows = fetch_daily_plans(args.user_id, start, end)
    print(f'Rows: {len(rows)}')
    raise SystemExit(audit(rows, start, end, args.block))


if __name__ == '__main__':
    main()
