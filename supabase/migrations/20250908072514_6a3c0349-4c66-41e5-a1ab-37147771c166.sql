-- Update RLS policy to allow all authenticated users to view invoices
DROP POLICY IF EXISTS "Secure invoice access" ON public.invoices;

CREATE POLICY "All users can view invoices" 
ON public.invoices 
FOR SELECT 
TO authenticated
USING (true);

-- Update related invoice_items policy to match
DROP POLICY IF EXISTS "Secure invoice items access" ON public.invoice_items;

CREATE POLICY "All users can view invoice items" 
ON public.invoice_items 
FOR SELECT 
TO authenticated
USING (true);

-- Update invoice_charges policy to match
DROP POLICY IF EXISTS "Secure invoice charges access" ON public.invoice_charges;

CREATE POLICY "All users can view invoice charges" 
ON public.invoice_charges 
FOR SELECT 
TO authenticated
USING (true);