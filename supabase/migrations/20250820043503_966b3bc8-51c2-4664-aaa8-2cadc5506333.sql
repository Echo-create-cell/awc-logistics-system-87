-- First, let's check if we need to add a relationship between users and clients
-- Add created_by field to clients table if it doesn't exist
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id);

-- Create a security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Create function to check if user can access client
CREATE OR REPLACE FUNCTION public.can_access_client(client_user_id UUID, client_assigned_to UUID)
RETURNS BOOLEAN 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
SET search_path = public
AS $$
  SELECT 
    CASE 
      -- Admins and sales directors can access all clients
      WHEN public.get_current_user_role() IN ('admin', 'sales_director') THEN true
      -- Finance officers can view clients for invoicing
      WHEN public.get_current_user_role() = 'finance_officer' THEN true
      -- Sales agents can only access clients they created or are assigned to
      WHEN public.get_current_user_role() = 'sales_agent' AND 
           (client_user_id = auth.uid() OR client_assigned_to = auth.uid()) THEN true
      -- Partners have no direct client access
      ELSE false
    END;
$$;

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can view all clients" ON public.clients;
DROP POLICY IF EXISTS "Users can manage clients" ON public.clients;

-- Create secure role-based policies for SELECT
CREATE POLICY "Secure client read access" 
ON public.clients 
FOR SELECT 
TO authenticated 
USING (
  public.can_access_client(created_by, assigned_to)
);

-- Create secure policies for INSERT - only sales agents, directors, and admins can create clients
CREATE POLICY "Secure client create access" 
ON public.clients 
FOR INSERT 
TO authenticated 
WITH CHECK (
  public.get_current_user_role() IN ('admin', 'sales_director', 'sales_agent') AND
  created_by = auth.uid()
);

-- Create secure policies for UPDATE - same users who can read can update, but with restrictions
CREATE POLICY "Secure client update access" 
ON public.clients 
FOR UPDATE 
TO authenticated 
USING (
  public.can_access_client(created_by, assigned_to) AND
  public.get_current_user_role() IN ('admin', 'sales_director', 'sales_agent')
)
WITH CHECK (
  public.can_access_client(created_by, assigned_to) AND
  public.get_current_user_role() IN ('admin', 'sales_director', 'sales_agent')
);

-- Create secure policies for DELETE - only admins and sales directors
CREATE POLICY "Secure client delete access" 
ON public.clients 
FOR DELETE 
TO authenticated 
USING (
  public.get_current_user_role() IN ('admin', 'sales_director')
);