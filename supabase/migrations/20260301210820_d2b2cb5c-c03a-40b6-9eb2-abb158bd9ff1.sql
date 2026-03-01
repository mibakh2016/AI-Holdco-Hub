
-- Add logo_url column to portfolio_entities
ALTER TABLE public.portfolio_entities ADD COLUMN logo_url text;

-- Create a public storage bucket for entity logos
INSERT INTO storage.buckets (id, name, public) VALUES ('entity-logos', 'entity-logos', true);

-- Allow authenticated users to upload logos
CREATE POLICY "Authenticated users can upload entity logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'entity-logos' AND auth.role() = 'authenticated');

-- Allow public read access to logos
CREATE POLICY "Public can view entity logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'entity-logos');

-- Allow authenticated users to update/delete logos
CREATE POLICY "Authenticated users can update entity logos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'entity-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete entity logos"
ON storage.objects FOR DELETE
USING (bucket_id = 'entity-logos' AND auth.role() = 'authenticated');
