CREATE TABLE public.meeting_ai_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.meeting_ai_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meeting ai chats"
ON public.meeting_ai_chats
FOR SELECT
USING (public.is_meeting_owner(meeting_id));

CREATE POLICY "Users can create own meeting ai chats"
ON public.meeting_ai_chats
FOR INSERT
WITH CHECK (public.is_meeting_owner(meeting_id) AND auth.uid() = user_id);

CREATE POLICY "Users can delete own meeting ai chats"
ON public.meeting_ai_chats
FOR DELETE
USING (public.is_meeting_owner(meeting_id));

CREATE INDEX meeting_ai_chats_meeting_id_created_at_idx
ON public.meeting_ai_chats(meeting_id, created_at DESC);
