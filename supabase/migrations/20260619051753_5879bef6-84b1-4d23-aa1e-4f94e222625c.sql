
-- 1. Lock down SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_chamber_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.apply_invitation() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_chamber_member(uuid, uuid) TO authenticated, service_role;

-- 2. Remove overly permissive INSERT policies (server uses service role, which bypasses RLS)
DROP POLICY IF EXISTS "Anyone may submit" ON public.submissions;
DROP POLICY IF EXISTS "Anyone may raise an alert" ON public.crisis_alerts;

-- 3. Admin management policies for pastor_invitations
CREATE POLICY "Admins insert invites" ON public.pastor_invitations
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update invites" ON public.pastor_invitations
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete invites" ON public.pastor_invitations
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. Admin DELETE policy for pastoral_responses
CREATE POLICY "Admins delete responses" ON public.pastoral_responses
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 5. Tighten peer_chambers SELECT — remove blanket open-chamber exposure
DROP POLICY IF EXISTS "Chambers visible to members & pastors" ON public.peer_chambers;
CREATE POLICY "Chambers visible to members & pastors" ON public.peer_chambers
  FOR SELECT TO authenticated
  USING (
    public.is_chamber_member(auth.uid(), id)
    OR public.has_role(auth.uid(), 'pastor'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );
