-- Track last activity time for each user
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

-- Seed existing profiles so they don't all start at NULL
UPDATE public.profiles SET last_active_at = created_at WHERE last_active_at IS NULL;

-- Public RPC: returns count of users active in the last 24 hours
-- SECURITY DEFINER so it can read all profiles without RLS
CREATE OR REPLACE FUNCTION public.get_active_users_count()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.profiles
  WHERE last_active_at > now() - INTERVAL '24 hours';
$$;

-- Allow unauthenticated (landing page) and authenticated callers
GRANT EXECUTE ON FUNCTION public.get_active_users_count() TO anon;
GRANT EXECUTE ON FUNCTION public.get_active_users_count() TO authenticated;
