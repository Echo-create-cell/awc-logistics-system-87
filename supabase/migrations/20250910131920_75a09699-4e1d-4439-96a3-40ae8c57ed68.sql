-- Update the invoice SELECT policy to allow all non-partner users to view all invoices
DROP POLICY IF EXISTS "Secure invoice read access" ON public.invoices;

CREATE POLICY "Secure invoice read access" 
ON public.invoices 
FOR SELECT 
TO authenticated
USING (
  CASE
    WHEN (get_current_user_role() = ANY (ARRAY['admin'::text, 'sales_director'::text, 'finance_officer'::text, 'sales_agent'::text])) THEN true
    WHEN ((get_current_user_role() = 'partner'::text) AND (quotation_id IN ( SELECT quotations.id
       FROM quotations
      WHERE ((quotations.created_by = auth.uid()) AND (quotations.status = 'won'::quotation_status))))) THEN true
    ELSE false
  END
);