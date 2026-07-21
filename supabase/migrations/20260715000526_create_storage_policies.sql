/*
# Create storage bucket policies for receipts images

1. Storage
- Bucket 'receipts' is public (created via execute_sql)
- Add policies to allow authenticated users to upload and read receipt images
2. Security
- SELECT: anyone can read (public bucket)
- INSERT: authenticated users can upload
*/

DROP POLICY IF EXISTS "receipts_bucket_read" ON storage.objects;
CREATE POLICY "receipts_bucket_read" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'receipts');

DROP POLICY IF EXISTS "receipts_bucket_upload" ON storage.objects;
CREATE POLICY "receipts_bucket_upload" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'receipts');
