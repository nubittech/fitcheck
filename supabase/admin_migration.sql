-- ═══════════════════════════════════════════
-- Veylo Admin Panel - Database Migration
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════

-- 1. Add 'role' and 'status' columns to profiles (if not exist)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
    ALTER TABLE profiles ADD COLUMN role text DEFAULT 'user';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'status') THEN
    ALTER TABLE profiles ADD COLUMN status text DEFAULT 'active';
  END IF;
END $$;

-- 2. Create reported_posts table
CREATE TABLE IF NOT EXISTS reported_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  outfit_id uuid REFERENCES outfits(id) ON DELETE CASCADE,
  reporter_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  reason text,
  status text DEFAULT 'pending', -- pending | resolved | dismissed
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 3. Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_reported_posts_status ON reported_posts(status);
CREATE INDEX IF NOT EXISTS idx_reported_posts_created ON reported_posts(created_at DESC);

-- 4. Enable RLS on reported_posts
ALTER TABLE reported_posts ENABLE ROW LEVEL SECURITY;

-- Allow any authenticated user to INSERT a report
CREATE POLICY "Users can report posts"
  ON reported_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

-- Allow admins to SELECT and UPDATE reports
CREATE POLICY "Admins can view reports"
  ON reported_posts FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update reports"
  ON reported_posts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 5. Set your admin user (REPLACE with your actual user ID)
-- UPDATE profiles SET role = 'admin' WHERE email = 'YOUR_EMAIL@example.com';

-- IMPORTANT: After running this migration, run the UPDATE command above 
-- with your actual email to grant yourself admin access.
