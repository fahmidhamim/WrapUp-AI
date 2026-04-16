ALTER TABLE public.meetings
  ADD COLUMN scheduled_end_at timestamp with time zone,
  ADD COLUMN actual_ended_at timestamp with time zone;

UPDATE public.meetings
SET scheduled_end_at = scheduled_at + make_interval(mins => COALESCE(duration_minutes, 30))
WHERE scheduled_at IS NOT NULL AND scheduled_end_at IS NULL;
