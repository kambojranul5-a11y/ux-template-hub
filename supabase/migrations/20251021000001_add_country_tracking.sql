-- Add country tracking to sessions table
ALTER TABLE public.sessions 
ADD COLUMN IF NOT EXISTS country TEXT;

-- Create index for country queries
CREATE INDEX IF NOT EXISTS idx_sessions_country ON public.sessions(country);

-- Add country to page_views for more granular tracking
ALTER TABLE public.page_views 
ADD COLUMN IF NOT EXISTS country TEXT;

-- Create index for country queries
CREATE INDEX IF NOT EXISTS idx_page_views_country ON public.page_views(country);
