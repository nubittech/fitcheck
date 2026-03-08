-- ═══════════════════════════════════════════
-- Admin Delete Fix - RPC function for admin content deletion
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════

-- This function runs with SECURITY DEFINER (bypasses RLS)
-- so admins can delete any outfit regardless of ownership.
-- It checks that the calling user is an admin before proceeding.

CREATE OR REPLACE FUNCTION public.admin_delete_outfit(outfit_id_param uuid)
RETURNS json AS $$
DECLARE
  caller_role text;
BEGIN
  -- 1. Verify the caller is an admin
  SELECT role INTO caller_role
  FROM public.profiles
  WHERE id = auth.uid();

  IF caller_role IS NULL OR caller_role != 'admin' THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized: admin role required');
  END IF;

  -- 2. Delete from all related tables (cascade order)
  DELETE FROM public.outfit_media WHERE outfit_id = outfit_id_param;
  DELETE FROM public.comments WHERE outfit_id = outfit_id_param;
  DELETE FROM public.likes WHERE outfit_id = outfit_id_param;
  DELETE FROM public.reported_posts WHERE outfit_id = outfit_id_param;

  -- 3. Delete the outfit itself
  DELETE FROM public.outfits WHERE id = outfit_id_param;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
