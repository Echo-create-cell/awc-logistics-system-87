-- Fix Security 2 Error: Employee Personal Information Could Be Stolen by Hackers
-- Remove the overly permissive policy on profiles table
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Create secure policy for profiles - users can only see their own profile and admins can see all
CREATE POLICY "Users can view their own profile and admins can view all" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR 
  public.get_current_user_role() IN ('admin', 'sales_director')
);

-- Fix Security 2 Error: Confidential Business Information Could Be Leaked
-- Remove overly permissive policies on business tables

-- Secure quotations table
DROP POLICY IF EXISTS "Users can view all quotations" ON public.quotations;
CREATE POLICY "Secure quotation access" 
ON public.quotations 
FOR SELECT 
USING (
  -- Users can view quotations they created or are assigned to
  created_by = auth.uid() 
  OR 
  -- Admins and sales directors can view all
  public.get_current_user_role() IN ('admin', 'sales_director')
  OR
  -- Finance officers can view for invoicing
  public.get_current_user_role() = 'finance_officer'
);

-- Secure invoices table  
DROP POLICY IF EXISTS "Users can view all invoices" ON public.invoices;
CREATE POLICY "Secure invoice access"
ON public.invoices
FOR SELECT 
USING (
  -- Users can view invoices they created
  created_by = auth.uid()
  OR
  -- Admins and sales directors can view all
  public.get_current_user_role() IN ('admin', 'sales_director') 
  OR
  -- Finance officers can view all invoices
  public.get_current_user_role() = 'finance_officer'
);

-- Secure invoice_items table
DROP POLICY IF EXISTS "Users can view invoice items" ON public.invoice_items;
CREATE POLICY "Secure invoice items access"
ON public.invoice_items
FOR SELECT
USING (
  -- Only allow access if user can access the parent invoice
  EXISTS (
    SELECT 1 FROM public.invoices 
    WHERE invoices.id = invoice_items.invoice_id
    AND (
      invoices.created_by = auth.uid()
      OR 
      public.get_current_user_role() IN ('admin', 'sales_director', 'finance_officer')
    )
  )
);

-- Secure invoice_charges table
DROP POLICY IF EXISTS "Users can view invoice charges" ON public.invoice_charges;
CREATE POLICY "Secure invoice charges access"
ON public.invoice_charges  
FOR SELECT
USING (
  -- Only allow access if user can access the parent invoice item
  EXISTS (
    SELECT 1 FROM public.invoice_items 
    JOIN public.invoices ON invoices.id = invoice_items.invoice_id
    WHERE invoice_items.id = invoice_charges.invoice_item_id
    AND (
      invoices.created_by = auth.uid()
      OR
      public.get_current_user_role() IN ('admin', 'sales_director', 'finance_officer')
    )
  )
);

-- Secure quotation_commodities table
DROP POLICY IF EXISTS "Users can view quotation commodities" ON public.quotation_commodities;
CREATE POLICY "Secure quotation commodities access"
ON public.quotation_commodities
FOR SELECT
USING (
  -- Only allow access if user can access the parent quotation
  EXISTS (
    SELECT 1 FROM public.quotations
    WHERE quotations.id = quotation_commodities.quotation_id
    AND (
      quotations.created_by = auth.uid()
      OR
      public.get_current_user_role() IN ('admin', 'sales_director', 'finance_officer')
    )
  )
);