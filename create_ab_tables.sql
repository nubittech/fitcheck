-- =============================================
-- FitCheck A/B Voting System Migration
-- Run in Supabase SQL Editor
-- =============================================

-- 1. ADD COLUMNS TO OUTFITS
ALTER TABLE outfits 
ADD COLUMN IF NOT EXISTS post_type text default 'single' check (post_type in ('single', 'ab_test')),
ADD COLUMN IF NOT EXISTS image_url_b text;

-- 2. CREATE A/B VOTES TABLE
CREATE TABLE IF NOT EXISTS ab_votes (
    id uuid primary key default gen_random_uuid(),
    outfit_id uuid not null references outfits(id) on delete cascade,
    user_id uuid not null references profiles(id) on delete cascade,
    vote_choice text not null check (vote_choice in ('A', 'B')),
    created_at timestamptz default now(),
    unique(outfit_id, user_id)
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_ab_votes_outfit ON ab_votes(outfit_id);

-- 4. RLS
ALTER TABLE ab_votes ENABLE ROW LEVEL SECURITY;

-- ab_votes: anyone can read, only authenticated can write own vote
CREATE POLICY "ab_votes_select" ON ab_votes FOR SELECT USING (true);
CREATE POLICY "ab_votes_insert" ON ab_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ab_votes_update" ON ab_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "ab_votes_delete" ON ab_votes FOR DELETE USING (auth.uid() = user_id);

-- 5. Helper Function for Percentages
CREATE OR REPLACE FUNCTION get_ab_vote_stats(post_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  count_a INT;
  count_b INT;
  total INT;
  pct_a FLOAT;
  pct_b FLOAT;
BEGIN
  SELECT COUNT(*) INTO count_a FROM ab_votes WHERE outfit_id = post_id AND vote_choice = 'A';
  SELECT COUNT(*) INTO count_b FROM ab_votes WHERE outfit_id = post_id AND vote_choice = 'B';
  total := count_a + count_b;
  
  IF total = 0 THEN
    pct_a := 0;
    pct_b := 0;
  ELSE
    pct_a := ROUND((count_a::FLOAT / total::FLOAT) * 100);
    pct_b := ROUND((count_b::FLOAT / total::FLOAT) * 100);
  END IF;

  RETURN json_build_object(
    'count_a', count_a,
    'count_b', count_b,
    'total', total,
    'percentage_a', pct_a,
    'percentage_b', pct_b
  );
END;
$$;
