CREATE TABLE IF NOT EXISTS public.meeting_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meeting_shares_meeting_id ON public.meeting_shares(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_shares_token ON public.meeting_shares(token);

ALTER TABLE public.meeting_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meeting shares"
ON public.meeting_shares
FOR SELECT
USING (created_by = auth.uid() OR public.is_meeting_owner(meeting_id));

CREATE POLICY "Users can create meeting shares"
ON public.meeting_shares
FOR INSERT
WITH CHECK (created_by = auth.uid() AND public.is_meeting_owner(meeting_id));

CREATE POLICY "Users can update own meeting shares"
ON public.meeting_shares
FOR UPDATE
USING (created_by = auth.uid() AND public.is_meeting_owner(meeting_id));

CREATE POLICY "Users can delete own meeting shares"
ON public.meeting_shares
FOR DELETE
USING (created_by = auth.uid() AND public.is_meeting_owner(meeting_id));
