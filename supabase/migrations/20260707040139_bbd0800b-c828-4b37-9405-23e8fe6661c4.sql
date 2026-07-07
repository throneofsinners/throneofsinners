DROP POLICY IF EXISTS "Authenticated may view visible pastors" ON public.pastors;

-- Only admins and pastors may read the raw pastors table (which includes email/phone).
-- All other users should use the public_pastors view which excludes contact details.
CREATE POLICY "Admins and pastors may view pastors"
ON public.pastors
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'pastor'));