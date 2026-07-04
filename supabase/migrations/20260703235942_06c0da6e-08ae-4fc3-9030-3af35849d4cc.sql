DROP VIEW IF EXISTS public.public_voices;
CREATE VIEW public.public_voices WITH (security_invoker = on) AS
  SELECT
    s.id,
    s.type,
    s.category,
    COALESCE(s.public_title, 'A voice from the sanctuary') AS title,
    s.public_excerpt AS excerpt,
    s.image_paths AS image_paths,
    s.public_approved_at AS approved_at,
    s.created_at
  FROM public.submissions s
  WHERE s.display_publicly = true
    AND s.public_approved_at IS NOT NULL
    AND s.public_excerpt IS NOT NULL;

GRANT SELECT ON public.public_voices TO anon, authenticated;