-- Fix: Business Intelligence Exposed to Public
-- Restrict download analytics to admins only

-- Remove the overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view download stats" ON public.template_downloads;

-- Add admin-only SELECT policy  
CREATE POLICY "Only admins can view download stats" 
ON public.template_downloads 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));