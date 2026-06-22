
-- 1. Membership tier on profiles
CREATE TYPE public.membership_tier AS ENUM ('free','regular','premium');
ALTER TABLE public.profiles ADD COLUMN membership_tier public.membership_tier NOT NULL DEFAULT 'free';

CREATE OR REPLACE FUNCTION public.get_membership_tier(_user_id uuid)
RETURNS public.membership_tier
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT COALESCE((SELECT membership_tier FROM public.profiles WHERE id = _user_id), 'free'::public.membership_tier) $$;

-- Admins update tier
CREATE POLICY "Admins update profile tier" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Public-display fields on submissions
ALTER TABLE public.submissions
  ADD COLUMN display_publicly boolean NOT NULL DEFAULT false,
  ADD COLUMN public_title text,
  ADD COLUMN public_excerpt text,
  ADD COLUMN public_approved_at timestamptz,
  ADD COLUMN public_approved_by uuid REFERENCES auth.users(id);

-- Public view exposes ONLY approved excerpts (never raw content / contact info)
CREATE VIEW public.public_voices WITH (security_invoker = on) AS
  SELECT
    s.id,
    s.type,
    s.category,
    COALESCE(s.public_title, 'A voice from the sanctuary') AS title,
    s.public_excerpt AS excerpt,
    s.public_approved_at AS approved_at,
    s.created_at
  FROM public.submissions s
  WHERE s.display_publicly = true
    AND s.public_approved_at IS NOT NULL
    AND s.public_excerpt IS NOT NULL;

GRANT SELECT ON public.public_voices TO anon, authenticated;

-- 3. Pastors directory
CREATE TABLE public.pastors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL,
  title text,
  bio text,
  photo_url text,
  email text,
  phone text,
  twitter text,
  instagram text,
  facebook text,
  website text,
  sort_order int NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.pastors TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.pastors TO authenticated;
GRANT ALL ON public.pastors TO service_role;

ALTER TABLE public.pastors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view visible pastors" ON public.pastors
  FOR SELECT USING (is_visible = true);
CREATE POLICY "Admins read all pastors" ON public.pastors
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage pastors" ON public.pastors
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER pastors_set_updated_at BEFORE UPDATE ON public.pastors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Pastor messages (premium-only)
CREATE TABLE public.pastor_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pastor_id uuid NOT NULL REFERENCES public.pastors(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text,
  body text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.pastor_messages TO authenticated;
GRANT ALL ON public.pastor_messages TO service_role;

ALTER TABLE public.pastor_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Premium members can send" ON public.pastor_messages
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id AND public.get_membership_tier(auth.uid()) = 'premium');
CREATE POLICY "Sender reads own messages" ON public.pastor_messages
  FOR SELECT TO authenticated USING (auth.uid() = sender_id);
CREATE POLICY "Pastors and admins read all" ON public.pastor_messages
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'pastor') OR public.has_role(auth.uid(), 'admin'));

-- 5. Seed placeholder pastors
INSERT INTO public.pastors (display_name, title, bio, email, sort_order) VALUES
  ('Samuel Adekunle', 'Senior Pastor', 'Shepherd of the Throne. Walks with members through confession, marriage and restoration.', 'pastor.samuel@throneofsinners.org', 1),
  ('Esther Okonkwo', 'Pastor of Counsel', 'Twenty years walking with women through grief, anxiety and motherhood.', 'pastor.esther@throneofsinners.org', 2),
  ('Daniel Mensah', 'Pastor of Restoration', 'Oversees the restoration chambers and addiction recovery.', 'pastor.daniel@throneofsinners.org', 3);
