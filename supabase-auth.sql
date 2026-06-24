-- ═══════════════════════════════════════════════════════════════
-- Personal Coach — auth + wire existing data to Deekshant
-- Run once in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Deekshant's account (created earlier)
-- Email: deekshant57@gmail.com
-- UUID:  d6f25dae-4cc8-48dd-9822-fbccf9a92139

-- ── Profiles table ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ── Add user_id to tracker tables (safe if already exists) ───
ALTER TABLE week_plans    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE daily_plans   ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE daily_vitals  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE food_logs     ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE run_logs      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE workout_logs  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ── Confirm Deekshant's email (so sign-in works) ─────────────
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now()), updated_at = now()
WHERE id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139';

INSERT INTO profiles (id, display_name)
VALUES ('d6f25dae-4cc8-48dd-9822-fbccf9a92139', 'Deekshant')
ON CONFLICT (id) DO UPDATE SET display_name = 'Deekshant';

-- ── Wire ALL existing tracker data to Deekshant ──────────────
UPDATE week_plans    SET user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' WHERE user_id IS NULL;
UPDATE daily_plans   SET user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' WHERE user_id IS NULL;
UPDATE daily_vitals  SET user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' WHERE user_id IS NULL;
UPDATE food_logs     SET user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' WHERE user_id IS NULL;
UPDATE run_logs      SET user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' WHERE user_id IS NULL;
UPDATE workout_logs  SET user_id = 'd6f25dae-4cc8-48dd-9822-fbccf9a92139' WHERE user_id IS NULL;

-- ── Per-user unique indexes ────────────────────────────────────
DROP INDEX IF EXISTS week_plans_week_number_key;
DROP INDEX IF EXISTS daily_plans_date_key;
DROP INDEX IF EXISTS daily_vitals_date_key;
DROP INDEX IF EXISTS food_logs_date_meal_slot_key;
DROP INDEX IF EXISTS run_logs_date_key;
DROP INDEX IF EXISTS workout_logs_date_key;

CREATE UNIQUE INDEX IF NOT EXISTS week_plans_user_week       ON week_plans(user_id, week_number);
CREATE UNIQUE INDEX IF NOT EXISTS daily_plans_user_date      ON daily_plans(user_id, date);
CREATE UNIQUE INDEX IF NOT EXISTS daily_vitals_user_date     ON daily_vitals(user_id, date);
CREATE UNIQUE INDEX IF NOT EXISTS food_logs_user_date_slot   ON food_logs(user_id, date, meal_slot);
CREATE UNIQUE INDEX IF NOT EXISTS run_logs_user_date         ON run_logs(user_id, date);
CREATE UNIQUE INDEX IF NOT EXISTS workout_logs_user_date     ON workout_logs(user_id, date);

-- ── RLS: each user sees only their own rows ──────────────────
ALTER TABLE week_plans    ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_plans   ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_vitals  ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE run_logs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on week_plans"    ON week_plans;
DROP POLICY IF EXISTS "Allow all on daily_plans"   ON daily_plans;
DROP POLICY IF EXISTS "Allow all on daily_vitals"  ON daily_vitals;
DROP POLICY IF EXISTS "Allow all on food_logs"     ON food_logs;
DROP POLICY IF EXISTS "Allow all on run_logs"      ON run_logs;
DROP POLICY IF EXISTS "Allow all on workout_logs"  ON workout_logs;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "week_plans_own"      ON week_plans;
DROP POLICY IF EXISTS "daily_plans_own"     ON daily_plans;
DROP POLICY IF EXISTS "daily_vitals_own"    ON daily_vitals;
DROP POLICY IF EXISTS "food_logs_own"       ON food_logs;
DROP POLICY IF EXISTS "run_logs_own"        ON run_logs;
DROP POLICY IF EXISTS "workout_logs_own"    ON workout_logs;

CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "week_plans_own"    ON week_plans    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "daily_plans_own"   ON daily_plans   FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "daily_vitals_own"  ON daily_vitals  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "food_logs_own"     ON food_logs     FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "run_logs_own"      ON run_logs      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "workout_logs_own"  ON workout_logs  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on new sign-ups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
