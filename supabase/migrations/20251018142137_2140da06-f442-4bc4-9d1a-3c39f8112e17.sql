-- Create table to track template downloads
CREATE TABLE IF NOT EXISTS public.template_downloads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id TEXT NOT NULL,
  downloaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.template_downloads ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert downloads (public feature)
CREATE POLICY "Anyone can track downloads" 
ON public.template_downloads 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow anyone to view download stats (public feature)
CREATE POLICY "Anyone can view download stats" 
ON public.template_downloads 
FOR SELECT 
USING (true);

-- Create index for faster queries
CREATE INDEX idx_template_downloads_template_id ON public.template_downloads(template_id);
CREATE INDEX idx_template_downloads_downloaded_at ON public.template_downloads(downloaded_at);