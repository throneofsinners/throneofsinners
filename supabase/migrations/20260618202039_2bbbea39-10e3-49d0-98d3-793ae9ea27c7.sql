
-- ============== ROLES ==============
CREATE TYPE public.app_role AS ENUM ('admin', 'pastor', 'peer_mentor', 'member');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  granted_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users see own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins see all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============== PROFILES (pastors/admins) ==============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  display_name text,
  title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own profile select" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins read profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Own profile update" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Own profile insert" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile + seed admin role for the designated email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;

  IF lower(NEW.email) = 'throneofsinners@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
      ON CONFLICT DO NOTHING;
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'pastor')
      ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============== INVITATIONS ==============
CREATE TABLE public.pastor_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  role public.app_role NOT NULL DEFAULT 'pastor',
  invited_by uuid REFERENCES auth.users(id),
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pastor_invitations TO authenticated;
GRANT ALL ON public.pastor_invitations TO service_role;
ALTER TABLE public.pastor_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage invites" ON public.pastor_invitations
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- On signup, if invited, grant the invited role
CREATE OR REPLACE FUNCTION public.apply_invitation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE inv RECORD;
BEGIN
  SELECT * INTO inv FROM public.pastor_invitations
    WHERE lower(email) = lower(NEW.email) AND accepted_at IS NULL;
  IF FOUND THEN
    INSERT INTO public.user_roles (user_id, role, granted_by)
      VALUES (NEW.id, inv.role, inv.invited_by) ON CONFLICT DO NOTHING;
    UPDATE public.pastor_invitations SET accepted_at = now() WHERE id = inv.id;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created_apply_invite
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.apply_invitation();

-- ============== PASTORAL RESPONSES (thread) ==============
CREATE TABLE public.pastoral_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id),
  author_display_name text,
  body text NOT NULL,
  scripture_reference text,
  is_internal_note boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX pastoral_responses_submission_idx ON public.pastoral_responses(submission_id, created_at);
GRANT SELECT, INSERT, UPDATE ON public.pastoral_responses TO authenticated;
GRANT ALL ON public.pastoral_responses TO service_role;
ALTER TABLE public.pastoral_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pastors read responses" ON public.pastoral_responses
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'pastor') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Pastors create responses" ON public.pastoral_responses
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = author_id AND
    (public.has_role(auth.uid(),'pastor') OR public.has_role(auth.uid(),'admin'))
  );
CREATE POLICY "Authors edit own response" ON public.pastoral_responses
  FOR UPDATE TO authenticated
  USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);

CREATE TRIGGER pastoral_responses_updated_at BEFORE UPDATE ON public.pastoral_responses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============== AUDIT LOG (immutable) ==============
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id),
  actor_email text,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_log_created_idx ON public.audit_log(created_at DESC);
CREATE INDEX audit_log_entity_idx ON public.audit_log(entity_type, entity_id);
GRANT SELECT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read audit" ON public.audit_log
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
-- No INSERT/UPDATE/DELETE policies = inserts only via service_role (server fns)

-- ============== PEER CHAMBERS ==============
CREATE TYPE public.chamber_status AS ENUM ('open', 'closed', 'archived');

CREATE TABLE public.peer_chambers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  description text,
  status public.chamber_status NOT NULL DEFAULT 'open',
  capacity int NOT NULL DEFAULT 6,
  steward_id uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.peer_chambers TO authenticated;
GRANT ALL ON public.peer_chambers TO service_role;
ALTER TABLE public.peer_chambers ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.peer_chamber_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chamber_id uuid NOT NULL REFERENCES public.peer_chambers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pseudonym text NOT NULL,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(chamber_id, user_id)
);
CREATE INDEX peer_chamber_members_chamber_idx ON public.peer_chamber_members(chamber_id);
GRANT SELECT, INSERT, DELETE ON public.peer_chamber_members TO authenticated;
GRANT ALL ON public.peer_chamber_members TO service_role;
ALTER TABLE public.peer_chamber_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_chamber_member(_user_id uuid, _chamber_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.peer_chamber_members
                 WHERE user_id = _user_id AND chamber_id = _chamber_id)
$$;

CREATE POLICY "Chambers visible to members & pastors" ON public.peer_chambers
  FOR SELECT TO authenticated
  USING (
    public.is_chamber_member(auth.uid(), id)
    OR public.has_role(auth.uid(),'pastor')
    OR public.has_role(auth.uid(),'admin')
    OR status = 'open'
  );

CREATE POLICY "Members read own membership" ON public.peer_chamber_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_chamber_member(auth.uid(), chamber_id)
         OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Members join open chambers" ON public.peer_chamber_members
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Members leave own membership" ON public.peer_chamber_members
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.peer_chamber_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chamber_id uuid NOT NULL REFERENCES public.peer_chambers(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pseudonym text NOT NULL,
  body text NOT NULL,
  risk_flagged boolean NOT NULL DEFAULT false,
  risk_keywords text[],
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX peer_chamber_messages_chamber_idx ON public.peer_chamber_messages(chamber_id, created_at);
GRANT SELECT, INSERT ON public.peer_chamber_messages TO authenticated;
GRANT ALL ON public.peer_chamber_messages TO service_role;
ALTER TABLE public.peer_chamber_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read messages" ON public.peer_chamber_messages
  FOR SELECT TO authenticated
  USING (
    public.is_chamber_member(auth.uid(), chamber_id)
    OR public.has_role(auth.uid(),'pastor')
    OR public.has_role(auth.uid(),'admin')
  );
CREATE POLICY "Members post messages" ON public.peer_chamber_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = author_id AND public.is_chamber_member(auth.uid(), chamber_id)
  );

CREATE TRIGGER peer_chambers_updated_at BEFORE UPDATE ON public.peer_chambers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
