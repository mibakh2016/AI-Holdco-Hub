
-- Add missing columns needed by DocumentConfirmDialog and process-document edge function
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS processing_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS ai_suggested_metadata jsonb,
ADD COLUMN IF NOT EXISTS confirmed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS shareholder_id uuid REFERENCES public.shareholders(id),
ADD COLUMN IF NOT EXISTS entity_id uuid REFERENCES public.portfolio_entities(id),
ADD COLUMN IF NOT EXISTS valuation_id uuid REFERENCES public.valuations(id),
ADD COLUMN IF NOT EXISTS effective_date date;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
