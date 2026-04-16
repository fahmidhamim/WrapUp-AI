-- Add unique constraint on user_id so upsert works in the check-subscription edge function.
-- First remove duplicate rows (keep the most recent active one per user).
DELETE FROM public.subscriptions a
USING public.subscriptions b
WHERE a.user_id = b.user_id
  AND a.created_at < b.created_at;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_user_id_unique UNIQUE (user_id);
