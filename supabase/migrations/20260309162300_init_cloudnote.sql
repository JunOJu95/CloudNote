-- Migration File: Init CloudNote schema & RLS policies

-- =========================================================================
-- 1. Create Tables
-- =========================================================================

-- users table (synced with auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  plan text DEFAULT 'free',
  storage_used bigint DEFAULT 0,
  ai_summary_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- notes table
CREATE TABLE IF NOT EXISTS public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- tags table
CREATE TABLE IF NOT EXISTS public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, name)
);

-- note_tags mapping table
CREATE TABLE IF NOT EXISTS public.note_tags (
  note_id uuid REFERENCES public.notes(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (note_id, tag_id)
);

-- activity_logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan text NOT NULL,
  amount integer NOT NULL,
  payment_method text,
  status text NOT NULL DEFAULT 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now()
);

-- =========================================================================
-- 2. Triggers
-- =========================================================================

-- updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_notes_updated_at
  BEFORE UPDATE ON public.notes FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- user sync trigger from auth.users to public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- trigger executed on auth.users when a user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- 3. Row Level Security (RLS) Policies
-- =========================================================================

-- Enable RLS for all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- users policies
CREATE POLICY "Users can view their own profile."
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- notes policies
CREATE POLICY "Users can view their own notes."
  ON public.notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notes."
  ON public.notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes."
  ON public.notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes."
  ON public.notes FOR DELETE
  USING (auth.uid() = user_id);

-- tags policies
CREATE POLICY "Users can view their own tags."
  ON public.tags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tags."
  ON public.tags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags."
  ON public.tags FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags."
  ON public.tags FOR DELETE
  USING (auth.uid() = user_id);

-- note_tags policies
-- Since note_tags is a junction table, we check access through notes
CREATE POLICY "Users can view note_tags for their notes."
  ON public.note_tags FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.notes
    WHERE notes.id = note_tags.note_id AND notes.user_id = auth.uid()
  ));

CREATE POLICY "Users can create note_tags for their notes."
  ON public.note_tags FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.notes
    WHERE notes.id = note_tags.note_id AND notes.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete note_tags for their notes."
  ON public.note_tags FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.notes
    WHERE notes.id = note_tags.note_id AND notes.user_id = auth.uid()
  ));

-- activity_logs policies (insert usually done by app or trigger, but user can view)
CREATE POLICY "Users can view their own activity logs."
  ON public.activity_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activity logs."
  ON public.activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- subscriptions policies (usually inserted/updated by service role from payment webhooks, user reads)
CREATE POLICY "Users can view their own subscriptions."
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);
