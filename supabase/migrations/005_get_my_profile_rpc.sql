-- ============================================================
-- Migration 005: RPC function to get current user's profile
-- Bypasses RLS entirely via SECURITY DEFINER
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'first_name', first_name,
    'last_name', last_name,
    'role', role
  )
  FROM public.profiles
  WHERE id = auth.uid();
$$;
