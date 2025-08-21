-- Fix security vulnerability: Restrict profiles table access to authenticated users only

-- Drop the overly permissive policy that allows anyone to view all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a secure policy that only allows authenticated users to view profiles
CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (true);

-- Add a policy for public access only to specific fields if needed for app functionality
-- This is commented out as it should only be enabled if the app specifically needs it
-- CREATE POLICY "Public can view basic profile info" 
-- ON public.profiles 
-- FOR SELECT 
-- TO anon 
-- USING (false); -- Start with false, enable specific cases if needed