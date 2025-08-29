-- Fix critical security vulnerability: Remove plaintext passwords and restrict profile access

-- First, remove the plaintext password column as it's a security risk
-- Passwords should be handled by Supabase Auth, not stored in plaintext
ALTER TABLE public.profiles DROP COLUMN IF EXISTS "Password";

-- Drop and recreate the overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile and admins can view all" ON public.profiles;

CREATE POLICY "Users can view own profile and admins can view all"
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  public.get_current_user_role() = 'admin'
);

-- Also update the update policy to be more explicit about admin access
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile and admins can update any" ON public.profiles;

CREATE POLICY "Users can update own profile and admins can update any"
ON public.profiles 
FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  public.get_current_user_role() = 'admin'
)
WITH CHECK (
  auth.uid() = user_id OR 
  public.get_current_user_role() = 'admin'
);