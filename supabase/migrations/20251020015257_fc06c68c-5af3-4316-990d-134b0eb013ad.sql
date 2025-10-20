-- Drop old policies
DROP POLICY IF EXISTS "Anyone can track downloads" ON public.template_downloads;
DROP POLICY IF EXISTS "Only admins can view download stats" ON public.template_downloads;

-- Create new permissive policies for anon users
CREATE POLICY "Enable insert for anon and authenticated users"
ON public.template_downloads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Enable select for anon and authenticated users"
ON public.template_downloads
FOR SELECT
TO anon, authenticated
USING (true);

-- Grant permissions to anonymous role
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT, SELECT ON public.template_downloads TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;