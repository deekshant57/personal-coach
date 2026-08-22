-- Phase C — persistent user food library (additive only)
-- Spec: docs/FRIENDS-PRODUCT-SPEC.md §6, WEEK-STATS-SPEC §7
-- Safe: CREATE IF NOT EXISTS / ADD COLUMN IF NOT EXISTS — no data loss

CREATE TABLE IF NOT EXISTS user_custom_foods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  protein NUMERIC NOT NULL DEFAULT 0,
  calories NUMERIC NOT NULL DEFAULT 0,
  fat NUMERIC DEFAULT 0,
  carbs NUMERIC,
  unit TEXT DEFAULT '1',
  barcode TEXT,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Case-insensitive unique name per user
CREATE UNIQUE INDEX IF NOT EXISTS user_custom_foods_user_name_lower
  ON user_custom_foods (user_id, lower(name));

CREATE INDEX IF NOT EXISTS user_custom_foods_user_barcode
  ON user_custom_foods (user_id, barcode)
  WHERE barcode IS NOT NULL;

ALTER TABLE user_custom_foods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_custom_foods_own" ON user_custom_foods;
CREATE POLICY "user_custom_foods_own" ON user_custom_foods
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
