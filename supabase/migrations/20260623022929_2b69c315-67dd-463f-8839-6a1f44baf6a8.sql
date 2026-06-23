
-- 1) Lock SECURITY DEFINER helpers to authenticated only
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_chamber_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_membership_tier(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_chamber_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_membership_tier(uuid) TO authenticated;

-- 2) crisis_alerts policies for pastors & admins
GRANT SELECT, UPDATE ON public.crisis_alerts TO authenticated;
GRANT ALL ON public.crisis_alerts TO service_role;

CREATE POLICY "Pastors and admins read crisis alerts"
  ON public.crisis_alerts FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'pastor') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Pastors and admins acknowledge crisis alerts"
  ON public.crisis_alerts FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'pastor') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'pastor') OR public.has_role(auth.uid(), 'admin'));

-- 3) Pastor email/phone exposure: drop public anon SELECT, expose safe view
DROP POLICY IF EXISTS "Public can view visible pastors" ON public.pastors;

CREATE POLICY "Authenticated may view visible pastors"
  ON public.pastors FOR SELECT
  TO authenticated
  USING (is_visible = true);

REVOKE SELECT ON public.pastors FROM anon;

CREATE OR REPLACE VIEW public.public_pastors
WITH (security_invoker = true) AS
SELECT id, display_name, title, bio, photo_url,
       twitter, instagram, facebook, website, sort_order, is_visible
FROM public.pastors
WHERE is_visible = true;

GRANT SELECT ON public.public_pastors TO anon, authenticated;

-- 4) Tighten chamber join: enforce status='open' AND under capacity
DROP POLICY IF EXISTS "Members join open chambers" ON public.peer_chamber_members;

CREATE POLICY "Members join open uncrowded chambers"
  ON public.peer_chamber_members FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.peer_chambers c
      WHERE c.id = peer_chamber_members.chamber_id
        AND c.status = 'open'
        AND (
          SELECT count(*) FROM public.peer_chamber_members m
          WHERE m.chamber_id = c.id
        ) < c.capacity
    )
  );

-- 5) submissions: explicit pastor/admin SELECT policy
CREATE POLICY "Pastors and admins read submissions"
  ON public.submissions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'pastor') OR public.has_role(auth.uid(), 'admin'));
