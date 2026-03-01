
-- Enable pgvector in public schema
CREATE EXTENSION IF NOT EXISTS vector SCHEMA public;

-- Now create the similarity search function
CREATE OR REPLACE FUNCTION public.match_document_chunks(
  query_embedding vector(768),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  page_number INTEGER,
  chunk_text TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql STABLE
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    dc.page_number,
    dc.chunk_text,
    (1 - (dc.embedding <=> query_embedding))::FLOAT AS similarity
  FROM public.document_chunks dc
  WHERE dc.is_active = true
    AND (1 - (dc.embedding <=> query_embedding))::FLOAT > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
