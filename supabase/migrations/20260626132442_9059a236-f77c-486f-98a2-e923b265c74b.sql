
-- Add image attachments to submissions
ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS image_paths text[] NOT NULL DEFAULT '{}';

-- Storage policies: only pastors/admins can read; service role writes via server fn
CREATE POLICY "Pastors can read submission photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'submission-photos'
  AND (public.has_role(auth.uid(), 'pastor') OR public.has_role(auth.uid(), 'admin'))
);
