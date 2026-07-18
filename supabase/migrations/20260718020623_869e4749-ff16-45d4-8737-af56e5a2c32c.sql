
ALTER TABLE public.pastors
  ADD COLUMN IF NOT EXISTS user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz,
  ALTER COLUMN is_visible SET DEFAULT false;

UPDATE public.pastors p
SET user_id = u.id
FROM auth.users u
WHERE p.user_id IS NULL AND lower(u.email) = lower(p.email)
  AND NOT EXISTS (SELECT 1 FROM public.pastors p2 WHERE p2.user_id = u.id);

DROP POLICY IF EXISTS "Pastors read own pastor profile" ON public.pastors;
CREATE POLICY "Pastors read own pastor profile" ON public.pastors
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Pastors update own pastor profile" ON public.pastors;
CREATE POLICY "Pastors update own pastor profile" ON public.pastors
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.ensure_pastor_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE u_email text; u_name text;
BEGIN
  IF NEW.role NOT IN ('pastor','admin') THEN RETURN NEW; END IF;
  SELECT email, COALESCE(raw_user_meta_data->>'display_name', split_part(email,'@',1))
    INTO u_email, u_name FROM auth.users WHERE id = NEW.user_id;

  UPDATE public.pastors SET user_id = NEW.user_id
    WHERE user_id IS NULL AND lower(email) = lower(u_email)
    AND NOT EXISTS (SELECT 1 FROM public.pastors p2 WHERE p2.user_id = NEW.user_id);

  IF NOT EXISTS (SELECT 1 FROM public.pastors WHERE user_id = NEW.user_id) THEN
    INSERT INTO public.pastors (user_id, display_name, email, is_visible)
    VALUES (NEW.user_id, COALESCE(u_name,'New Pastor'), u_email, false);
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_ensure_pastor_profile ON public.user_roles;
CREATE TRIGGER trg_ensure_pastor_profile
AFTER INSERT ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.ensure_pastor_profile();

-- Backfill (one row per user, avoiding duplicates from multi-role users)
INSERT INTO public.pastors (user_id, display_name, email, is_visible)
SELECT DISTINCT ON (ur.user_id)
       ur.user_id,
       COALESCE(u.raw_user_meta_data->>'display_name', split_part(u.email,'@',1), 'New Pastor'),
       u.email, false
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE ur.role IN ('pastor','admin')
  AND NOT EXISTS (SELECT 1 FROM public.pastors p WHERE p.user_id = ur.user_id)
ORDER BY ur.user_id, ur.role;

CREATE OR REPLACE FUNCTION public.recommend_partner_matches(_submission_id uuid, _limit int DEFAULT 10)
RETURNS TABLE (id uuid, tracking_token text, category text, location text, content text,
               created_at timestamptz, status submission_status, score numeric, shared_location text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE src RECORD;
BEGIN
  SELECT s.category, s.location, s.type INTO src FROM public.submissions s WHERE s.id = _submission_id;
  IF src IS NULL THEN RETURN; END IF;

  RETURN QUERY
  WITH src_tokens AS (
    SELECT lower(trim(t)) AS tok
    FROM regexp_split_to_table(COALESCE(src.location,''), '[,/;·|]+') t
    WHERE length(trim(t)) > 1
  ),
  candidates AS (
    SELECT s.id, s.tracking_token, s.category, s.location, s.content, s.created_at, s.status,
           regexp_split_to_array(lower(COALESCE(s.location,'')), '[,/;·|]+') AS toks
    FROM public.submissions s
    WHERE s.type = src.type AND s.id <> _submission_id
      AND s.status NOT IN ('resolved')
  )
  SELECT c.id, c.tracking_token, c.category, c.location, c.content, c.created_at, c.status,
         ( CASE WHEN c.category = src.category AND src.category IS NOT NULL THEN 2 ELSE 0 END
         + COALESCE((SELECT count(*)::int FROM src_tokens st
                     WHERE EXISTS (SELECT 1 FROM unnest(c.toks) x WHERE trim(x) = st.tok)),0)
         )::numeric AS score,
         COALESCE((SELECT string_agg(st.tok, ', ') FROM src_tokens st
                   WHERE EXISTS (SELECT 1 FROM unnest(c.toks) x WHERE trim(x) = st.tok)),'') AS shared_location
  FROM candidates c
  ORDER BY score DESC, c.created_at DESC
  LIMIT _limit;
END; $$;

REVOKE EXECUTE ON FUNCTION public.recommend_partner_matches(uuid, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.recommend_partner_matches(uuid, int) TO authenticated, service_role;
