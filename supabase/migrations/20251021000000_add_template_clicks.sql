-- Create table to track template clicks (preview button)
CREATE TABLE IF NOT EXISTS public.template_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id TEXT NOT NULL,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.template_clicks ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert clicks (public feature)
CREATE POLICY "Anyone can track clicks" 
ON public.template_clicks 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow anyone to view click stats (public feature)
CREATE POLICY "Anyone can view click stats" 
ON public.template_clicks 
FOR SELECT 
USING (true);

-- Create index for faster queries
CREATE INDEX idx_template_clicks_template_id ON public.template_clicks(template_id);
CREATE INDEX idx_template_clicks_clicked_at ON public.template_clicks(clicked_at);
