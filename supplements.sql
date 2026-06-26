-- ═══════════════════════════════════════════════════════════════
-- Supplement logs — daily adherence (Supradyn, Creatine, weekly D3)
-- Run once in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS supplement_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  supradyn BOOLEAN NOT NULL DEFAULT false,
  creatine BOOLEAN NOT NULL DEFAULT false,
  uprise_d3_60k BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS supplement_logs_user_date
  ON supplement_logs(user_id, date);

CREATE INDEX IF NOT EXISTS idx_supplement_logs_user_date_desc
  ON supplement_logs(user_id, date DESC);

ALTER TABLE supplement_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "supplement_logs_own" ON supplement_logs;
CREATE POLICY "supplement_logs_own"
  ON supplement_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

Optional backfill: Uprise D3 taken Thu 25 Jun 2026 (run once if needed)
INSERT INTO supplement_logs (user_id, date, uprise_d3_60k, updated_at)
VALUES ('d6f25dae-4cc8-48dd-9822-fbccf9a92139', '2026-06-25', true, now())
ON CONFLICT (user_id, date) DO UPDATE
  SET uprise_d3_60k = true, updated_at = now();
