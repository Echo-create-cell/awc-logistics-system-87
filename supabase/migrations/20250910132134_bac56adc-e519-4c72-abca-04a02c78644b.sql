-- Update the invoice SELECT policy to allow all users including partners to view all invoices
DROP POLICY IF EXISTS "Secure invoice read access" ON public.invoices;

CREATE POLICY "Secure invoice read access" 
ON public.invoices 
FOR SELECT 
TO authenticated
USING (
  CASE
    WHEN (get_current_user_role() = ANY (ARRAY['admin'::text, 'sales_director'::text, 'finance_officer'::text, 'sales_agent'::text, 'partner'::text])) THEN true
    ELSE false
  END
);