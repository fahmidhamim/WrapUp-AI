-- Ensure legacy soft-delete updates result in actual hard delete.
-- This keeps old clients compatible while enforcing full cascade deletion.
CREATE OR REPLACE FUNCTION public.hard_delete_meeting_on_soft_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.is_deleted = true AND OLD.is_deleted = false THEN
    DELETE FROM public.meetings WHERE id = OLD.id;
    RETURN NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_hard_delete_meeting_on_soft_delete ON public.meetings;

CREATE TRIGGER trg_hard_delete_meeting_on_soft_delete
BEFORE UPDATE OF is_deleted ON public.meetings
FOR EACH ROW
EXECUTE FUNCTION public.hard_delete_meeting_on_soft_delete();
