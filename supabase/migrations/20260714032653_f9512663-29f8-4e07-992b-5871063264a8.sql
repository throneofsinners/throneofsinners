
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS include_pastoral_response boolean NOT NULL DEFAULT false;

-- Allow anon and authenticated to read only approved, opt-in-public rows.
-- The public_voices view (security_invoker) needs this so the /voices page works.
GRANT SELECT ON public.submissions TO anon;
GRANT SELECT ON public.submissions TO authenticated;

DROP POLICY IF EXISTS "Anyone can read approved public submissions" ON public.submissions;
CREATE POLICY "Anyone can read approved public submissions"
  ON public.submissions FOR SELECT
  TO anon, authenticated
  USING (
    display_publicly = true
    AND public_approved_at IS NOT NULL
    AND public_excerpt IS NOT NULL
  );

GRANT SELECT ON public.public_voices TO anon, authenticated;

-- Recreate view to include pastoral_response (only when the pastor opted to share it).
DROP VIEW IF EXISTS public.public_voices;
CREATE VIEW public.public_voices
WITH (security_invoker=on) AS
  SELECT
    id,
    type,
    category,
    COALESCE(public_title, 'A voice from the sanctuary') AS title,
    public_excerpt AS excerpt,
    image_paths,
    public_approved_at AS approved_at,
    created_at,
    CASE WHEN include_pastoral_response THEN pastoral_response ELSE NULL END AS pastoral_response
  FROM public.submissions
  WHERE display_publicly = true
    AND public_approved_at IS NOT NULL
    AND public_excerpt IS NOT NULL;

GRANT SELECT ON public.public_voices TO anon, authenticated;
