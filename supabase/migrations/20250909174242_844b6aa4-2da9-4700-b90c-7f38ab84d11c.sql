-- Fix critical security vulnerability: Implement proper role-based access for invoices
-- Drop the overly permissive policy that allows all users to view all invoices
DROP POLICY IF EXISTS "All users can view invoices" ON public.invoices;

-- Create secure role-based invoice access policy
CREATE POLICY "Secure invoice read access" 
ON public.invoices 
FOR SELECT 
USING (
  CASE 
    -- Admins and sales directors can view all invoices
    WHEN public.get_current_user_role() IN ('admin', 'sales_director') THEN true
    -- Finance officers can view all invoices for accounting purposes
    WHEN public.get_current_user_role() = 'finance_officer' THEN true
    -- Sales agents can only view invoices they created
    WHEN public.get_current_user_role() = 'sales_agent' AND created_by = auth.uid() THEN true
    -- Partners can only view invoices for quotations they have access to
    WHEN public.get_current_user_role() = 'partner' AND 
         quotation_id IN (
           SELECT id FROM public.quotations 
           WHERE created_by = auth.uid() AND status = 'won'
         ) THEN true
    -- Default: deny access
    ELSE false
  END
);