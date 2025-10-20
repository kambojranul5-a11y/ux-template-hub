-- Migration: Add Analytics Tracking Tables

-- 1. Create page_views table to track all page visits
CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  page_url TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create sessions table to track user sessions and calculate bounce rate
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  first_page TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  page_count INTEGER DEFAULT 1,
  is_bounce BOOLEAN DEFAULT true,
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous users
CREATE POLICY "Enable insert for anon and authenticated users"
ON public.page_views
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Enable select for anon and authenticated users"
ON public.page_views
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Enable insert for sessions - anon and authenticated"
ON public.sessions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Enable select for sessions - anon and authenticated"
ON public.sessions
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Enable update for sessions - anon and authenticated"
ON public.sessions
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT, SELECT ON public.page_views TO anon, authenticated;
GRANT INSERT, SELECT, UPDATE ON public.sessions TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Create indexes for performance
CREATE INDEX idx_page_views_session_id ON public.page_views(session_id);
CREATE INDEX idx_page_views_viewed_at ON public.page_views(viewed_at);
CREATE INDEX idx_sessions_session_id ON public.sessions(session_id);
CREATE INDEX idx_sessions_started_at ON public.sessions(started_at);
CREATE INDEX idx_sessions_last_activity ON public.sessions(last_activity_at);

-- Function to calculate active users (sessions in last 5 minutes)
CREATE OR REPLACE FUNCTION get_active_users()
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
  SELECT COUNT(DISTINCT session_id)::INTEGER
  FROM public.sessions
  WHERE last_activity_at > NOW() - INTERVAL '5 minutes';
$$;

-- Function to calculate bounce rate
CREATE OR REPLACE FUNCTION get_bounce_rate()
RETURNS NUMERIC
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    CASE 
      WHEN COUNT(*) = 0 THEN 0
      ELSE ROUND((COUNT(*) FILTER (WHERE is_bounce = true)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
    END
  FROM public.sessions
  WHERE started_at > NOW() - INTERVAL '30 days';
$$;