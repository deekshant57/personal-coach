#!/usr/bin/env node
/**
 * One-shot QA account create + synthetic seed (isolated user only).
 * Does not modify product source. Credentials → .env.qa (gitignored).
 */
import { readFileSync, writeFileSync, chmodSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FOOD_ITEMS } from '../js/data.js';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const PARENT_ENV = join(ROOT, '..', '.env');
const CREDS_FILE = join(ROOT, '.env.qa');
const SUMMARY_FILE = join(ROOT, '.qa-seed-summary.json');
const SUPABASE_URL = 'https://lqtwtcgnzpsrhfuynzdk.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxdHd0Y2duenBzcmhmdXluemRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNjU1MzUsImV4cCI6MjA5Nzg0MTUzNX0.QqfjgnC3b_VjWUrKbhgb4YF-FDN2ptZgYQ3WoyjMer4';
const PROTECTED = new Set([
  'd6f25dae-4cc8-48dd-9822-fbccf9a92139',
  '9e6a0d55-b63f-4857-b318-122e0c337ef4',
]);

function loadServiceRole() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) return process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!existsSync(PARENT_ENV)) throw new Error('Missing parent .env');
  for (const line of readFileSync(PARENT_ENV, 'utf8').split('\n')) {
    const m = line.match(/^\s*SUPABASE_SERVICE_ROLE_KEY\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[1].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    return v;
  }
  throw new Error('SUPABASE_SERVICE_ROLE_KEY not found');
}

function iso(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function addDays(d, n) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() + n);
  return x;
}
function parseIso(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function findFood(...needles) {
  const lower = needles.map((n) => n.toLowerCase());
  const hit = FOOD_ITEMS.find((f) => lower.every((n) => f.name.toLowerCase().includes(n)));
  if (!hit) throw new Error(`Food not found: ${needles.join(' ')}`);
  return hit;
}
function asItem(f, qty = 1) {
  return { id: f.id, name: f.name, qty, protein: f.protein, calories: f.calories };
}
function mealTotals(items) {
  return {
    protein: Math.round(items.reduce((s, i) => s + i.protein * i.qty, 0) * 10) / 10,
    calories: Math.round(items.reduce((s, i) => s + i.calories * i.qty, 0)),
  };
}

async function api(method, path, { key, token, body, prefer } = {}) {
  const headers = {
    apikey: key,
    Authorization: `Bearer ${token || key}`,
    'Content-Type': 'application/json',
  };
  if (prefer) headers.Prefer = prefer;
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers,
    body: body == null ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const msg = typeof data === 'object' ? JSON.stringify(data) : String(data);
    throw new Error(`${method} ${path} → ${res.status}: ${msg}`);
  }
  return data;
}

const serviceKey = loadServiceRole();
const displayName = 'Personal Coach QA Athlete';
const password = randomBytes(18).toString('base64url');

// Resume incomplete QA user if a prior run created Auth but failed mid-seed.
let email;
let userId;
{
  const listed = await api('GET', '/auth/v1/admin/users?page=1&per_page=200', { key: serviceKey });
  const users = listed.users || listed || [];
  const existing = (Array.isArray(users) ? users : []).find((u) =>
    String(u.email || '').startsWith('personal-coach-qa-') && String(u.email).endsWith('@example.com'));
  if (existing?.id) {
    userId = existing.id;
    email = existing.email;
    await api('PUT', `/auth/v1/admin/users/${userId}`, {
      key: serviceKey,
      body: {
        password,
        email_confirm: true,
        user_metadata: { display_name: displayName },
      },
    });
  } else {
    const unique = randomBytes(4).toString('hex');
    email = `personal-coach-qa-${unique}@example.com`;
    const created = await api('POST', '/auth/v1/admin/users', {
      key: serviceKey,
      body: {
        email,
        password,
        email_confirm: true,
        user_metadata: { display_name: displayName },
      },
    });
    userId = created.id || created.user?.id;
  }
}
if (!userId) throw new Error('No user id from admin create');
if (PROTECTED.has(userId)) throw new Error('QA user collided with protected athlete');

const tables = [
  'athlete_profiles', 'daily_plans', 'daily_vitals', 'food_logs', 'workout_logs',
  'run_logs', 'supplement_logs', 'user_custom_foods', 'coach_debriefs',
  'body_comp_scans', 'profiles',
];

async function countForUser(table) {
  const col = table === 'profiles' ? 'id' : 'user_id';
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}?${col}=eq.${userId}&select=*`,
    {
      method: 'HEAD',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: 'count=exact',
      },
    },
  );
  const cr = res.headers.get('content-range');
  const count = cr && cr.includes('/') ? Number(cr.split('/')[1]) : null;
  return { status: res.status, count };
}

const pre = {};
for (const t of tables) pre[t] = await countForUser(t);

// Ensure profiles row (trigger may have created it)
try {
  await api('POST', '/rest/v1/profiles', {
    key: serviceKey,
    prefer: 'resolution=merge-duplicates,return=representation',
    body: { id: userId, display_name: displayName },
  });
} catch {
  await api('PATCH', `/rest/v1/profiles?id=eq.${userId}`, {
    key: serviceKey,
    prefer: 'return=representation',
    body: { display_name: displayName },
  });
}

const session = await api('POST', '/auth/v1/token?grant_type=password', {
  key: ANON_KEY,
  body: { email, password },
});
const accessToken = session.access_token;
if (!accessToken || session.user?.id !== userId) throw new Error('QA sign-in failed or id mismatch');

const ownership = [];

const CONFLICT = {
  athlete_profiles: 'user_id',
  daily_plans: 'user_id,date',
  daily_vitals: 'user_id,date',
  food_logs: 'user_id,date,meal_slot',
  workout_logs: 'user_id,date',
  run_logs: 'user_id,date',
  supplement_logs: 'user_id,date',
  body_comp_scans: 'user_id,scan_date',
  profiles: 'id',
};

async function upsertUser(table, row) {
  if (table === 'profiles') {
    if (row.id !== userId) throw new Error('profiles id must be QA');
  } else if (row.user_id !== userId) {
    throw new Error(`${table} user_id must be QA`);
  }
  const onConflict = CONFLICT[table];
  const path = onConflict
    ? `/rest/v1/${table}?on_conflict=${encodeURIComponent(onConflict)}`
    : `/rest/v1/${table}`;
  const data = await api('POST', path, {
    key: ANON_KEY,
    token: accessToken,
    prefer: 'resolution=merge-duplicates,return=representation',
    body: row,
  });
  const rows = Array.isArray(data) ? data : [data];
  for (const r of rows) {
    if ((r.user_id || r.id) !== userId) throw new Error(`Foreign ownership in ${table}`);
    ownership.push({
      table,
      id: r.id ?? `${r.user_id}:${r.date || r.scan_date || ''}`,
      user_id: r.user_id ?? r.id,
      date: r.date ?? r.scan_date ?? null,
    });
  }
  return rows[0];
}

const week_template = [
  { weekday: 1, day_type: 'Gym', session_window: 'morning', label: 'Upper' },
  { weekday: 2, day_type: 'Run', session_window: 'morning', label: 'Easy run' },
  { weekday: 3, day_type: 'Bodyweight', session_window: 'morning', label: 'BW circuit' },
  { weekday: 4, day_type: 'Active Recovery', session_window: null, label: 'Walk + mobility' },
  { weekday: 5, day_type: 'Gym', session_window: 'morning', label: 'Lower' },
  { weekday: 6, day_type: 'Run', session_window: 'morning', label: 'Long run' },
  { weekday: 0, day_type: 'Rest', session_window: null, label: null },
];

await upsertUser('athlete_profiles', {
  user_id: userId,
  display_name: displayName,
  goal_primary: 'general',
  sport_mode: 'hybrid',
  diet_style: 'eggetarian',
  starting_weight_kg: 78.5,
  protein_target_g: 140,
  calorie_target_training: 2200,
  calorie_target_rest: 1900,
  default_session_window: 'morning',
  week_template,
  ui_flags: {
    showRunningTrends: true,
    showLifts: true,
    showKneeTracking: true,
  },
  injuries_notes: 'QA synthetic athlete — isolated test account',
  setup_completed_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
function planForDate(dateObj) {
  const weekday = dateObj.getDay();
  const entry = week_template.find((e) => e.weekday === weekday);
  const dayType = entry.day_type;
  const isTraining = dayType === 'Run' || dayType === 'Gym' || dayType === 'Bodyweight';
  return {
    user_id: userId,
    date: iso(dateObj),
    day_name: DAY_NAMES[weekday],
    day_type: dayType,
    protein_target: 140,
    calorie_target: isTraining ? 2200 : 1900,
    water_target: '2L',
    directive: entry.label || (isTraining ? 'Training day' : dayType === 'Active Recovery' ? 'Active Recovery' : 'Rest'),
    planned_session_window: isTraining ? 'morning' : null,
    actual_session_window: null,
    session_status: 'planned',
    slot_scheme: null,
    run_type: dayType === 'Run' ? (entry.label || 'Run') : null,
    run_km: dayType === 'Run' ? (entry.label === 'Long run' ? 10 : 5) : null,
    run_pace: dayType === 'Run' ? '6:00' : null,
    run_cue: dayType === 'Run' ? 'Easy conversational' : null,
    workout_plan: (dayType === 'Gym' || dayType === 'Bodyweight') ? (entry.label || dayType) : null,
    workout_detail: dayType === 'Gym'
      ? 'WARM-UP (5 min): brisk walk · Bench Press 3×8 · Row 3×10 · Overhead Press 3×8 · COOL-DOWN'
      : dayType === 'Bodyweight'
        ? 'WARM-UP · Push-ups 3×12 · Squats 3×15 · Plank 3×40s · COOL-DOWN'
        : null,
    meals_plan: 'Protein-forward meals; include fruit + dairy',
  };
}

const planStart = parseIso('2026-11-10');
for (let i = 0; i < 21; i += 1) {
  await upsertUser('daily_plans', planForDate(addDays(planStart, i)));
}

const populated = '2026-11-17';
const emptyPast = '2026-11-15';
const secondary = '2026-11-18';

for (const v of [
  { date: '2026-11-12', weight_kg: 78.8, sleep_hours: 7.0, waist_inches: 34.0, cigarettes: 0 },
  { date: '2026-11-14', weight_kg: 78.6, sleep_hours: 6.5, waist_inches: null, cigarettes: 0 },
  { date: populated, weight_kg: 78.4, sleep_hours: 7.5, waist_inches: 33.8, cigarettes: 0 },
  { date: secondary, weight_kg: 78.3, sleep_hours: 7.0, waist_inches: null, cigarettes: 0 },
]) {
  await upsertUser('daily_vitals', {
    user_id: userId,
    ...v,
    notes: 'QA synthetic',
    updated_at: new Date().toISOString(),
  });
}

const oats = findFood('oat');
const milk = findFood('milk');
const banana = FOOD_ITEMS.find((f) => /banana/i.test(f.name)) || findFood('fruit');
const rice = findFood('rice');
const protein = FOOD_ITEMS.find((f) => /chicken|paneer|egg|dal|tofu/i.test(f.name));
const veg = FOOD_ITEMS.find((f) => /veg|spinach|salad|broccoli|beans/i.test(f.name)) || rice;
if (!protein) throw new Error('No protein food in library');

const meals = {
  Breakfast: [asItem(oats), asItem(milk), asItem(banana)],
  Lunch: [asItem(rice), asItem(veg), asItem(protein)],
  Dinner: [asItem(protein), asItem(rice)],
  Snack: [asItem(milk)],
};
for (const [slot, items] of Object.entries(meals)) {
  const t = mealTotals(items);
  await upsertUser('food_logs', {
    user_id: userId,
    date: populated,
    meal_slot: slot,
    items: JSON.stringify(items),
    custom_text: slot === 'Dinner' ? 'QA dinner note' : null,
    total_protein: t.protein,
    total_calories: t.calories,
    updated_at: new Date().toISOString(),
  });
}
{
  const items = [asItem(oats), asItem(milk)];
  const t = mealTotals(items);
  await upsertUser('food_logs', {
    user_id: userId,
    date: secondary,
    meal_slot: 'Breakfast',
    items: JSON.stringify(items),
    custom_text: null,
    total_protein: t.protein,
    total_calories: t.calories,
    updated_at: new Date().toISOString(),
  });
}

await upsertUser('workout_logs', {
  user_id: userId,
  date: populated,
  done: true,
  exercises_json: [
    {
      name: 'Bench Press',
      type: 'weighted',
      sets: [
        { done: true, reps: 8, kg: 60 },
        { done: true, reps: 8, kg: 60 },
        { done: true, reps: 7, kg: 60 },
      ],
    },
    {
      name: 'Barbell Row',
      type: 'weighted',
      sets: [
        { done: true, reps: 10, kg: 50 },
        { done: true, reps: 10, kg: 50 },
        { done: true, reps: 9, kg: 50 },
      ],
    },
    {
      name: 'Overhead Press',
      type: 'weighted',
      sets: [
        { done: true, reps: 8, kg: 35 },
        { done: true, reps: 8, kg: 35 },
        { done: false, reps: 8, kg: 35 },
      ],
    },
  ],
  what_i_did: 'Bench Press 3×8 · Barbell Row 3×10 · Overhead Press 2×8',
  rpe: 7,
  notes: 'QA gym session — synthetic',
  updated_at: new Date().toISOString(),
});

await api('PATCH', `/rest/v1/daily_plans?user_id=eq.${userId}&date=eq.${populated}`, {
  key: ANON_KEY,
  token: accessToken,
  prefer: 'return=minimal',
  body: { session_status: 'completed', actual_session_window: 'morning' },
});

await upsertUser('run_logs', {
  user_id: userId,
  date: secondary,
  done: true,
  actual_km: 5.2,
  time_display: '31:00',
  avg_pace: '5:58',
  cadence: 168,
  rpe: 5,
  notes: 'QA easy run — synthetic',
  knee_status: 'ok',
  updated_at: new Date().toISOString(),
});

await api('PATCH', `/rest/v1/daily_plans?user_id=eq.${userId}&date=eq.${secondary}`, {
  key: ANON_KEY,
  token: accessToken,
  prefer: 'return=minimal',
  body: { session_status: 'completed', actual_session_window: 'morning' },
});

await upsertUser('supplement_logs', {
  user_id: userId,
  date: populated,
  supradyn: true,
  creatine: true,
  uprise_d3_60k: false,
  notes: 'QA supplements',
  updated_at: new Date().toISOString(),
});

try {
  await upsertUser('body_comp_scans', {
    user_id: userId,
    scan_date: '2026-11-12',
    weight_kg: 78.8,
    body_fat_pct: 18.5,
    muscle_mass_kg: 34.2,
    notes: 'QA scan',
    updated_at: new Date().toISOString(),
  });
} catch (err) {
  await upsertUser('body_comp_scans', {
    user_id: userId,
    scan_date: '2026-11-12',
    weight_kg: 78.8,
    notes: 'QA scan',
    updated_at: new Date().toISOString(),
  });
}

const verify = {};
for (const t of tables) {
  const col = t === 'profiles' ? 'id' : 'user_id';
  try {
    const rows = await api('GET', `/rest/v1/${t}?${col}=eq.${userId}&select=*`, {
      key: serviceKey,
    });
    const list = Array.isArray(rows) ? rows : [];
    verify[t] = {
      count: list.length,
      foreignOwnership: list.filter((r) => (r.user_id || r.id) !== userId).length,
    };
  } catch (err) {
    verify[t] = { error: String(err.message || err), skipped: true };
  }
}

const emptyChecks = {};
for (const t of ['daily_vitals', 'food_logs', 'workout_logs', 'run_logs', 'supplement_logs']) {
  const rows = await api(
    'GET',
    `/rest/v1/${t}?user_id=eq.${userId}&date=eq.${emptyPast}&select=id`,
    { key: serviceKey },
  );
  emptyChecks[t] = Array.isArray(rows) ? rows.length : 0;
}

writeFileSync(CREDS_FILE, [
  '# Personal Coach QA credentials — DO NOT COMMIT',
  `COACH_TEST_EMAIL=${email}`,
  `COACH_TEST_PASSWORD=${password}`,
  `COACH_TEST_USER_ID=${userId}`,
  '',
].join('\n'), { mode: 0o600 });
chmodSync(CREDS_FILE, 0o600);

writeFileSync(SUMMARY_FILE, JSON.stringify({
  email,
  userId,
  displayName,
  sport_mode: 'hybrid',
  protectedCollision: false,
  pre,
  ownershipCount: ownership.length,
  ownership,
  verify,
  emptyPast,
  emptyChecks,
  populated,
  secondary,
  planRange: { start: '2026-11-10', days: 21 },
  week_template,
  foodsUsed: [oats.name, milk.name, banana.name, rice.name, protein.name, veg.name],
  credsFile: '.env.qa',
}, null, 2));

console.log(JSON.stringify({
  ok: true,
  email,
  userId,
  populated,
  secondary,
  emptyPast,
  foreignOwnershipTotal: Object.values(verify).reduce((s, v) => s + (v.foreignOwnership || 0), 0),
  verifyCounts: Object.fromEntries(Object.entries(verify).map(([k, v]) => [k, v.count])),
  emptyChecks,
  ownershipCount: ownership.length,
  credsWritten: true,
}, null, 2));
