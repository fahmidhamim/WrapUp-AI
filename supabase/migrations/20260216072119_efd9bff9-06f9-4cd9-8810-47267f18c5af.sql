
-- Create action_items table
CREATE TABLE public.action_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  title TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own action items" ON public.action_items FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Users can create action items" ON public.action_items FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can update own action items" ON public.action_items FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Users can delete own action items" ON public.action_items FOR DELETE USING (owner_id = auth.uid());

CREATE TRIGGER update_action_items_updated_at
BEFORE UPDATE ON public.action_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
