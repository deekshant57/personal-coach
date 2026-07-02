#!/usr/bin/env python3
"""Run a SQL migration file against Supabase Postgres.

Requires SUPABASE_DB_PASSWORD in .env (Dashboard → Settings → Database → password).
Optional: SUPABASE_DB_HOST (default: db.lqtwtcgnzpsrhfuynzdk.supabase.co)
"""

from __future__ import annotations

import os
import sys

PROJECT_REF = 'lqtwtcgnzpsrhfuynzdk'
DEFAULT_HOST = f'db.{PROJECT_REF}.supabase.co'


def load_env_file() -> None:
    for path in (
        os.path.join(os.path.dirname(__file__), '..', '.env'),
        os.path.join(os.path.dirname(__file__), '..', '..', '.env'),
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


def main() -> int:
    load_env_file()
    sql_path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
        os.path.dirname(__file__), '..', 'supabase-workout-exercises.sql',
    )
    password = os.environ.get('SUPABASE_DB_PASSWORD') or os.environ.get('DATABASE_PASSWORD')
    if not password:
        print('ERROR: Set SUPABASE_DB_PASSWORD in .env (Supabase Dashboard → Settings → Database).')
        return 1

    try:
        import psycopg2
    except ImportError:
        print('Installing psycopg2-binary…')
        import subprocess
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-q', 'psycopg2-binary'])
        import psycopg2

    host = os.environ.get('SUPABASE_DB_HOST', DEFAULT_HOST)
    conn_str = (
        f"host={host} port=5432 dbname=postgres user=postgres "
        f"password={password} sslmode=require"
    )

    with open(sql_path, encoding='utf-8') as f:
        sql = f.read()

    print(f'Running migration: {sql_path}')
    conn = psycopg2.connect(conn_str)
    conn.autocommit = True
    try:
        with conn.cursor() as cur:
            cur.execute(sql)
        print('Migration applied successfully.')
    finally:
        conn.close()
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
