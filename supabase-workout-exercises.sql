-- Structured workout exercise logging (per-set reps / timed holds)
-- Run in Supabase SQL Editor after supabase-setup.sql / supabase-auth.sql

ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS exercises_json JSONB;
