-- Add snapshot column to store denormalized meeting data for public sharing
ALTER TABLE public.meeting_shares
  ADD COLUMN IF NOT EXISTS snapshot JSONB;

-- Allow anonymous users to read non-revoked shares by token
-- (used by SharedMeetingPage without requiring login)
DROP POLICY IF EXISTS "Public can read non-revoked shares" ON public.meeting_shares;
CREATE POLICY "Public can read non-revoked shares"
ON public.meeting_shares
FOR SELECT
TO anon, authenticated
USING (
  is_revoked = FALSE
  AND (expires_at IS NULL OR expires_at > now())
);
