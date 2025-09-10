-- Update the invoice CREATE policy to allow all non-partner roles
DROP POLICY IF EXISTS "Invoice CREATE access" ON public.invoices;

CREATE POLICY "Invoice CREATE access" 
ON public.invoices 
FOR INSERT 
TO authenticated
WITH CHECK (
  (get_current_user_role() = ANY (ARRAY['admin'::text, 'sales_director'::text, 'finance_officer'::text, 'sales_agent'::text])) 
  AND (created_by = auth.uid())
);