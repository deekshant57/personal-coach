-- Phase A — athlete_profiles + day-shift columns on daily_plans
-- Run in Supabase SQL Editor after supabase-auth.sql
-- Spec: docs/FRIENDS-PRODUCT-SPEC.md §4–5

-- ── Athlete profiles (setup / targets / week template) ───────
CREATE TABLE IF NOT EXISTS athlete_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  goal_primary TEXT NOT NULL DEFAULT 'general',
  sex TEXT,
  height_cm NUMERIC,
  starting_weight_kg NUMERIC,
  diet_style TEXT NOT NULL DEFAULT 'veg',
  injuries_notes TEXT,
  protein_target_g INT NOT NULL DEFAULT 120,
  calorie_target_training INT NOT NULL DEFAULT 2000,
  calorie_target_rest INT NOT NULL DEFAULT 1800,
  calorie_target_special INT,
  special_day_weekday INT CHECK (special_day_weekday IS NULL OR special_day_weekday BETWEEN 0 AND 6),
  default_session_window TEXT NOT NULL DEFAULT 'morning',
  week_template JSONB NOT NULL DEFAULT '[]'::jsonb,
  setup_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE athlete_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "athlete_profiles_own" ON athlete_profiles;
CREATE POLICY "athlete_profiles_own" ON athlete_profiles
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── Day-shift fields on daily_plans ──────────────────────────
ALTER TABLE daily_plans
  ADD COLUMN IF NOT EXISTS planned_session_window TEXT,
  ADD COLUMN IF NOT EXISTS actual_session_window TEXT,
  ADD COLUMN IF NOT EXISTS session_status TEXT DEFAULT 'planned',
  ADD COLUMN IF NOT EXISTS slot_scheme TEXT;

-- Ensure calorie_target exists (also in schema-updates.sql)
ALTER TABLE daily_plans ADD COLUMN IF NOT EXISTS calorie_target INT;

COMMENT ON COLUMN daily_plans.planned_session_window IS 'morning|evening|flexible — from template/coach';
COMMENT ON COLUMN daily_plans.actual_session_window IS 'morning|evening|skipped — what happened';
COMMENT ON COLUMN daily_plans.session_status IS 'planned|completed|moved|skipped';
COMMENT ON COLUMN daily_plans.slot_scheme IS 'Override MEAL_SLOTS key; null = derive from day_type';
