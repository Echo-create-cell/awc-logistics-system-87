-- Fix Critical Security Issues (Corrected)

-- 1. Drop overly permissive policies on invoice_items and invoice_charges
DROP POLICY IF EXISTS "All users can view invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "All users can view invoice charges" ON public.invoice_charges;

-- 2. Create secure RLS policies for invoice_items
CREATE POLICY "Secure invoice items read access" 
ON public.invoice_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.invoices 
    WHERE invoices.id = invoice_items.invoice_id 
    AND (
      -- Admins and sales directors can see all
      get_current_user_role() IN ('admin', 'sales_director') OR
      -- Finance officers can see all for invoicing
      get_current_user_role() = 'finance_officer' OR
      -- Users can see invoices they created
      invoices.created_by = auth.uid() OR
      -- Sales agents can see items for won quotations they're associated with
      (get_current_user_role() = 'sales_agent' AND 
       EXISTS (
         SELECT 1 FROM public.quotations 
         WHERE quotations.id = invoices.quotation_id 
         AND quotations.status = 'won'
         AND quotations.created_by = auth.uid()
       ))
    )
  )
);

-- 3. Create secure RLS policies for invoice_charges
CREATE POLICY "Secure invoice charges read access" 
ON public.invoice_charges 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.invoice_items 
    JOIN public.invoices ON invoices.id = invoice_items.invoice_id
    WHERE invoice_items.id = invoice_charges.invoice_item_id 
    AND (
      -- Admins and sales directors can see all
      get_current_user_role() IN ('admin', 'sales_director') OR
      -- Finance officers can see all for invoicing
      get_current_user_role() = 'finance_officer' OR
      -- Users can see charges for invoices they created
      invoices.created_by = auth.uid() OR
      -- Sales agents can see charges for won quotations they're associated with
      (get_current_user_role() = 'sales_agent' AND 
       EXISTS (
         SELECT 1 FROM public.quotations 
         WHERE quotations.id = invoices.quotation_id 
         AND quotations.status = 'won'
         AND quotations.created_by = auth.uid()
       ))
    )
  )
);

-- 4. Create security audit log table first
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view security audit logs
CREATE POLICY "Admins can view security audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (get_current_user_role() = 'admin');

-- 5. Add audit logging function for security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type TEXT,
  user_id UUID,
  details JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log to security audit table
  INSERT INTO public.security_audit_log (event_type, user_id, details, created_at)
  VALUES (event_type, user_id, details, now());
EXCEPTION
  WHEN others THEN
    -- Don't fail the operation if logging fails
    NULL;
END;
$$;