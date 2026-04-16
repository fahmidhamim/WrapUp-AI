-- Expand subscription plan values from binary free/premium to explicit tier names.
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_plan_type_check;

UPDATE public.subscriptions
SET plan_type = 'plus'
WHERE plan_type = 'premium';

ALTER TABLE public.subscriptions
  ALTER COLUMN plan_type SET DEFAULT 'free';

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_plan_type_check
  CHECK (plan_type IN ('free', 'plus', 'business', 'enterprise'));
