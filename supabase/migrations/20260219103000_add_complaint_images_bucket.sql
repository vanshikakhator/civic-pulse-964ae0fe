INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'complaint-images',
  'complaint-images',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Public can view complaint images'
  ) THEN
    CREATE POLICY "Public can view complaint images"
      ON storage.objects
      FOR SELECT
      USING (bucket_id = 'complaint-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can upload own complaint images'
  ) THEN
    CREATE POLICY "Users can upload own complaint images"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'complaint-images'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can update own complaint images'
  ) THEN
    CREATE POLICY "Users can update own complaint images"
      ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (
        bucket_id = 'complaint-images'
        AND (storage.foldername(name))[1] = auth.uid()::text
      )
      WITH CHECK (
        bucket_id = 'complaint-images'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can delete own complaint images'
  ) THEN
    CREATE POLICY "Users can delete own complaint images"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'complaint-images'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END
$$;
