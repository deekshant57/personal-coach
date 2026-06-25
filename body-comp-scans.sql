-- ═══════════════════════════════════════════════════════════════
-- Body composition scans — run once in Supabase SQL Editor
-- Episodic machine reads (InBody, Karada Scan, etc.)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS body_comp_scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

CREATE UNIQUE INDEX IF NOT EXISTS body_comp_scans_user_date
  ON body_comp_scans(user_id, scan_date);

CREATE INDEX IF NOT EXISTS idx_body_comp_scans_user_date_desc
  ON body_comp_scans(user_id, scan_date DESC);

ALTER TABLE body_comp_scans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "body_comp_scans_own" ON body_comp_scans;
CREATE POLICY "body_comp_scans_own" ON body_comp_scans
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── Baseline: Dec 2024 InBody (from personal-details.md) ───────
INSERT INTO body_comp_scans (
  user_id, scan_date, machine, weight_kg, body_fat_pct, muscle_mass_kg, notes
) VALUES (
  'd6f25dae-4cc8-48dd-9822-fbccf9a92139',
  '2024-12-15',
  'InBody',
  74.8,
  26.5,
  30.9,
  'December 2024 baseline — seeded from athlete profile'
)
ON CONFLICT (user_id, scan_date) DO NOTHING;
