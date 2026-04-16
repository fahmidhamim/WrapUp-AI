-- Backfill missing profile rows for existing auth users.
-- Safe to run multiple times due to ON CONFLICT DO NOTHING.
INSERT INTO public.profiles (id, full_name, email)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', ''),
  COALESCE(au.email, '')
FROM auth.users au
WHERE au.email IS NOT NULL
ON CONFLICT (id) DO NOTHING;
