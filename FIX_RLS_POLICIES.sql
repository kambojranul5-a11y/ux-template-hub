-- FIX: Download Tracking - 401 Unauthorized Error
-- Run this SQL in Supabase SQL Editor to fix RLS policies

-- Step 1: Check current policies
SELECT * FROM pg_policies WHERE tablename = 'template_downloads';

-- Step 2: Drop all existing policies for template_downloads
DROP POLICY IF EXISTS "Anyone can track downloads" ON public.template_downloads;
DROP POLICY IF EXISTS "Anyone can view download stats" ON public.template_downloads;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.template_downloads;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.template_downloads;

-- Step 3: Disable RLS temporarily (to test)
-- ALTER TABLE public.template_downloads DISABLE ROW LEVEL SECURITY;

-- Step 4: Re-enable RLS (if you disabled it)
ALTER TABLE public.template_downloads ENABLE ROW LEVEL SECURITY;

-- Step 5: Create new permissive policies that allow all operations
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

-- Step 6: Grant necessary permissions to anon role
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON public.template_downloads TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.template_downloads TO authenticated;

-- Step 7: Verify policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'template_downloads';

-- Step 8: Test insert (should work now)
-- INSERT INTO public.template_downloads (template_id) VALUES ('test-1');

-- Step 9: Test select (should work now)
-- SELECT * FROM public.template_downloads;
