-- ═══════════════════════════════════════════
-- URGENT FIX: Remove recursive RLS policies
-- Run this IMMEDIATELY in Supabase SQL Editor
-- ═══════════════════════════════════════════

-- 1. Drop the recursive policies that cause 500 errors
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- 2. Create a SECURITY DEFINER helper function (bypasses RLS)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 3. Re-create safe policies using the helper function
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR is_admin());

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR is_admin());
