-- Schema updates — Jul 2026
-- Run in Supabase SQL Editor

-- 1. Add calorie_target to daily_plans
ALTER TABLE daily_plans ADD COLUMN IF NOT EXISTS calorie_target INT;

-- 2. Add total_fat to food_logs
ALTER TABLE food_logs ADD COLUMN IF NOT EXISTS total_fat NUMERIC;

-- 3. Add omega_3 to supplement_logs
ALTER TABLE supplement_logs ADD COLUMN IF NOT EXISTS omega_3 BOOLEAN DEFAULT false;

-- 4. Add Gym badge CSS class support (day_type is TEXT, no schema change needed)
-- The daily_plans.day_type column already accepts any text value including 'Gym'
