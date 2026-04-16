-- Backend production hardening: processing status, analytics payloads, richer action items, and Stripe webhook idempotency.

-- Sessions: analytics + processing columns for polling and observability
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS analytics_data jsonb,
  ADD COLUMN IF NOT EXISTS processing_status text,
  ADD COLUMN IF NOT EXISTS processing_progress integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS processing_message text,
  ADD COLUMN IF NOT EXISTS processing_retries integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS processing_error text,
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone NOT NULL DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_sessions_updated_at'
  ) THEN
    CREATE TRIGGER update_sessions_updated_at
      BEFORE UPDATE ON public.sessions
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Action items: optional linkage to session and richer metadata
ALTER TABLE public.action_items
  ADD COLUMN IF NOT EXISTS session_id uuid REFERENCES public.sessions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_to text,
  ADD COLUMN IF NOT EXISTS deadline timestamp with time zone,
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_action_items_session_id ON public.action_items(session_id);

-- Stripe webhook idempotency table
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  processed_at timestamp with time zone NOT NULL DEFAULT now(),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'stripe_webhook_events'
      AND policyname = 'Service role can manage stripe webhook events'
  ) THEN
    CREATE POLICY "Service role can manage stripe webhook events"
      ON public.stripe_webhook_events
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;
