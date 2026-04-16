
-- Add duration_minutes column to meetings for drag-resize support
ALTER TABLE public.meetings ADD COLUMN duration_minutes integer NOT NULL DEFAULT 30;
