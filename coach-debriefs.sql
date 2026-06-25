-- ═══════════════════════════════════════════════════════════════
-- Coach debriefs — weekly retrospective reports (Cursor coach output)
-- Run once in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS coach_debriefs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  debrief_monday DATE NOT NULL,
  week_covered_start DATE NOT NULL,
  week_covered_end DATE NOT NULL,
  debrief_type TEXT NOT NULL DEFAULT 'weekly',
  markdown TEXT NOT NULL,
  scores JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, debrief_monday, debrief_type)
);

CREATE INDEX IF NOT EXISTS idx_coach_debriefs_user_week
  ON coach_debriefs(user_id, week_covered_start DESC);

CREATE INDEX IF NOT EXISTS idx_coach_debriefs_user_monday
  ON coach_debriefs(user_id, debrief_monday DESC);

ALTER TABLE coach_debriefs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "coach_debriefs_own" ON coach_debriefs;
CREATE POLICY "coach_debriefs_own" ON coach_debriefs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
