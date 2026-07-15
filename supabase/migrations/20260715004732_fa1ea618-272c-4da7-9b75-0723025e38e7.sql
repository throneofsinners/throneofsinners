
-- Add location + tier gating to submissions
ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS free_visible boolean NOT NULL DEFAULT true;

-- Recreate public_voices view (definer semantics — bypass submissions RLS since
-- the view already filters to explicitly approved, opted-in rows).
DROP VIEW IF EXISTS public.public_voices;
CREATE VIEW public.public_voices AS
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

GRANT SELECT ON public.public_voices TO anon, authenticated;
