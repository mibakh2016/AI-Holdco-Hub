
-- Table to store equity purchase requests
CREATE TABLE public.purchase_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  units INTEGER NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_cost NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Public access for now (no auth yet)
ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert purchase requests"
  ON public.purchase_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read purchase requests"
  ON public.purchase_requests FOR SELECT
  USING (true);

-- Enable realtime for dashboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.purchase_requests;
