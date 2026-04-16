
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'free' CHECK (role IN ('free', 'premium')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Meetings table (BEFORE helper function)
CREATE TABLE public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'Untitled Meeting',
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_deleted BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- Helper function: check meeting ownership
CREATE OR REPLACE FUNCTION public.is_meeting_owner(_meeting_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.meetings WHERE id = _meeting_id AND owner_id = auth.uid()
  );
$$;

CREATE POLICY "Users can view own meetings" ON public.meetings FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Users can create meetings" ON public.meetings FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can update own meetings" ON public.meetings FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Users can delete own meetings" ON public.meetings FOR DELETE USING (owner_id = auth.uid());

-- Sessions table
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  audio_file_url TEXT,
  transcript TEXT,
  summary JSONB,
  language_detected TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" ON public.sessions FOR SELECT USING (public.is_meeting_owner(meeting_id));
CREATE POLICY "Users can create sessions" ON public.sessions FOR INSERT WITH CHECK (public.is_meeting_owner(meeting_id));
CREATE POLICY "Users can update own sessions" ON public.sessions FOR UPDATE USING (public.is_meeting_owner(meeting_id));
CREATE POLICY "Users can delete own sessions" ON public.sessions FOR DELETE USING (public.is_meeting_owner(meeting_id));

-- Participants table
CREATE TABLE public.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT
);

ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view meeting participants" ON public.participants FOR SELECT USING (public.is_meeting_owner(meeting_id));
CREATE POLICY "Users can add participants" ON public.participants FOR INSERT WITH CHECK (public.is_meeting_owner(meeting_id));
CREATE POLICY "Users can update participants" ON public.participants FOR UPDATE USING (public.is_meeting_owner(meeting_id));
CREATE POLICY "Users can delete participants" ON public.participants FOR DELETE USING (public.is_meeting_owner(meeting_id));

-- Notes table
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view meeting notes" ON public.notes FOR SELECT USING (public.is_meeting_owner(meeting_id));
CREATE POLICY "Users can create notes" ON public.notes FOR INSERT WITH CHECK (public.is_meeting_owner(meeting_id));
CREATE POLICY "Users can update notes" ON public.notes FOR UPDATE USING (public.is_meeting_owner(meeting_id));
CREATE POLICY "Users can delete notes" ON public.notes FOR DELETE USING (public.is_meeting_owner(meeting_id));

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'premium')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own subscriptions" ON public.subscriptions FOR UPDATE USING (user_id = auth.uid());

-- User roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (user_id = auth.uid());

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON public.meetings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for audio files
INSERT INTO storage.buckets (id, name, public) VALUES ('meeting-files', 'meeting-files', false);

CREATE POLICY "Users can upload meeting files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'meeting-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view own meeting files" ON storage.objects FOR SELECT USING (bucket_id = 'meeting-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own meeting files" ON storage.objects FOR DELETE USING (bucket_id = 'meeting-files' AND auth.uid()::text = (storage.foldername(name))[1]);
