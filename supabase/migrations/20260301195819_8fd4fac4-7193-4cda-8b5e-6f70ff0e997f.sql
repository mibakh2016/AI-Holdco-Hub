
-- Create document_chunks table for vector search
CREATE TABLE IF NOT EXISTS public.document_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  page_number INTEGER,
  chunk_text TEXT NOT NULL,
  embedding vector(768),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

-- Admins can manage all chunks
CREATE POLICY "Admins can manage document chunks"
  ON public.document_chunks
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view chunks of published documents
CREATE POLICY "Users can view chunks of published documents"
  ON public.document_chunks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.id = document_chunks.document_id
      AND d.status = 'published'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON public.document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_active ON public.document_chunks(is_active);
