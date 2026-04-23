-- Add source column to meetings to track how the meeting was created
ALTER TABLE public.meetings
  ADD COLUMN IF NOT EXISTS source text;
