-- ═══════════════════════════════════════════════════════════════
-- Personal Coach App — Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════

-- Week plans (coach-authored)
CREATE TABLE IF NOT EXISTS week_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  week_number INT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  date_range TEXT NOT NULL,
  focus TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Daily plans (one row per day, 7 per week)
CREATE TABLE IF NOT EXISTS daily_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  week_plan_id UUID REFERENCES week_plans(id) ON DELETE CASCADE,
  date DATE NOT NULL UNIQUE,
  day_name TEXT NOT NULL,
  day_type TEXT NOT NULL,
  protein_target INT DEFAULT 145,
  water_target TEXT DEFAULT '2L',
  run_type TEXT,
  run_km NUMERIC,
  run_pace TEXT,
  run_cue TEXT,
  workout_plan TEXT,
  workout_detail TEXT,
  meals_plan TEXT,
  directive TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Daily vitals (one row per day, includes Monday waist)
CREATE TABLE IF NOT EXISTS daily_vitals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  weight_kg NUMERIC,
  sleep_hours NUMERIC,
  cigarettes INT,
  waist_inches NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Food logs (multiple per day, one per meal slot)
CREATE TABLE IF NOT EXISTS food_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  meal_slot TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  custom_text TEXT,
  total_protein NUMERIC DEFAULT 0,
  total_calories NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(date, meal_slot)
);

-- Run logs (one per run day)
CREATE TABLE IF NOT EXISTS run_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  done BOOLEAN DEFAULT false,
  actual_km NUMERIC,
  time_display TEXT,
  avg_pace TEXT,
  cadence INT,
  rpe INT CHECK (rpe BETWEEN 1 AND 10),
  knee_status TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Body composition scans (episodic — InBody, Karada Scan, etc.)
CREATE TABLE IF NOT EXISTS body_comp_scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  scan_date DATE NOT NULL,
  machine TEXT NOT NULL DEFAULT 'InBody',
  weight_kg NUMERIC,
  body_fat_pct NUMERIC,
  muscle_mass_kg NUMERIC,
  body_fat_mass_kg NUMERIC,
  visceral_fat_level NUMERIC,
  waist_inches NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Workout logs (one per workout day)
CREATE TABLE IF NOT EXISTS workout_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  done BOOLEAN DEFAULT false,
  what_i_did TEXT,
  rpe INT CHECK (rpe BETWEEN 1 AND 10),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Supplement logs (daily adherence — Supradyn, Creatine, weekly D3)
CREATE TABLE IF NOT EXISTS supplement_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  supradyn BOOLEAN NOT NULL DEFAULT false,
  creatine BOOLEAN NOT NULL DEFAULT false,
  uprise_d3_60k BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- ═══════════════════════════════════════════════════════════════
-- Row Level Security — permissive for single user (anon key)
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE week_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE run_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_comp_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on week_plans" ON week_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on daily_plans" ON daily_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on daily_vitals" ON daily_vitals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on food_logs" ON food_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on run_logs" ON run_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on workout_logs" ON workout_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on body_comp_scans" ON body_comp_scans FOR ALL USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_daily_plans_date ON daily_plans(date);
CREATE INDEX IF NOT EXISTS idx_daily_vitals_date ON daily_vitals(date);
CREATE INDEX IF NOT EXISTS idx_food_logs_date ON food_logs(date);
CREATE INDEX IF NOT EXISTS idx_run_logs_date ON run_logs(date);
CREATE INDEX IF NOT EXISTS idx_workout_logs_date ON workout_logs(date);
CREATE UNIQUE INDEX IF NOT EXISTS body_comp_scans_user_date ON body_comp_scans(user_id, scan_date);
CREATE INDEX IF NOT EXISTS idx_body_comp_scans_user_date_desc ON body_comp_scans(user_id, scan_date DESC);
