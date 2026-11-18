-- Sport mode + UI flags for friends presets (Track A)
-- Run in Supabase SQL Editor after athlete-profiles.sql
-- Spec: docs/FRIENDS-PRODUCT-SPEC.md (sport presets)

ALTER TABLE athlete_profiles
  ADD COLUMN IF NOT EXISTS sport_mode TEXT DEFAULT 'gym',
  ADD COLUMN IF NOT EXISTS ui_flags JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN athlete_profiles.sport_mode IS 'gym|run|hybrid — setup preset; drives chrome + week template defaults';
COMMENT ON COLUMN athlete_profiles.ui_flags IS 'Optional overrides: showRunningTrends, showLifts, showKneeTracking, etc.';
