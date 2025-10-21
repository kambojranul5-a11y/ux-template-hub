-- Create template_clicks table
CREATE TABLE IF NOT EXISTS public.template_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id TEXT NOT NULL,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.template_clicks ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert clicks
CREATE POLICY "Anyone can insert template clicks"
  ON public.template_clicks
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create policy to allow anyone to read clicks
CREATE POLICY "Anyone can read template clicks"
  ON public.template_clicks
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Grant permissions
GRANT INSERT, SELECT ON public.template_clicks TO anon, authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_template_clicks_template_id 
  ON public.template_clicks(template_id);

CREATE INDEX IF NOT EXISTS idx_template_clicks_clicked_at 
  ON public.template_clicks(clicked_at);