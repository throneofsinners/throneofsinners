
DROP VIEW IF EXISTS public.public_voices;
CREATE VIEW public.public_voices
WITH (security_invoker = on) AS
SELECT
  id, type, category,
  COALESCE(public_title, 'A voice from the sanctuary') AS title,
  public_excerpt AS excerpt,
  image_paths,
  public_approved_at AS approved_at,
  created_at,
  location,
  free_visible,
  CASE WHEN include_pastoral_response THEN pastoral_response ELSE NULL END AS pastoral_response
FROM public.submissions
WHERE display_publicly = true
  AND public_approved_at IS NOT NULL
  AND public_excerpt IS NOT NULL;

-- Only trusted server code (service role) reads this view; no direct API grants.
REVOKE ALL ON public.public_voices FROM anon, authenticated;
