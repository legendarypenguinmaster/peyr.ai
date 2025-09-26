-- Investors role-specific table
CREATE TABLE IF NOT EXISTS investors (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  investor_type TEXT,
  bio TEXT,
  industries TEXT[],
  stage_focus TEXT[],
  geography TEXT[],
  min_check NUMERIC,
  max_check NUMERIC,
  investment_type TEXT[],
  linkedin_url TEXT,
  angellist_url TEXT,
  accredited BOOLEAN,
  visibility TEXT CHECK (visibility IN ('public','private')) DEFAULT 'public',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE investors ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "investors_select_own" ON investors
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "investors_insert_own" ON investors
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "investors_update_own" ON investors
  FOR UPDATE USING (auth.uid() = id);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_investors_updated_at ON investors;
CREATE TRIGGER trg_investors_updated_at
BEFORE UPDATE ON investors
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

