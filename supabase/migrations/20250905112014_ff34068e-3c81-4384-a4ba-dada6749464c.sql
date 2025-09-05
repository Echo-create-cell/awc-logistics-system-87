-- Phase 1: Critical Invoice Data Protection
-- Remove overly permissive policies and implement role-based access

-- DROP existing overly permissive policies
DROP POLICY IF EXISTS "Users can create and manage invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can manage invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can manage invoice charges" ON public.invoice_charges;

-- CREATE proper invoice policies
CREATE POLICY "Invoice CREATE access" ON public.invoices
FOR INSERT 
TO authenticated
WITH CHECK (
  get_current_user_role() IN ('admin', 'sales_director', 'finance_officer') 
  AND created_by = auth.uid()
);

CREATE POLICY "Invoice UPDATE access" ON public.invoices
FOR UPDATE 
TO authenticated
USING (
  created_by = auth.uid() 
  OR get_current_user_role() IN ('admin', 'sales_director')
);

CREATE POLICY "Invoice DELETE access" ON public.invoices
FOR DELETE 
TO authenticated
USING (
  get_current_user_role() IN ('admin', 'sales_director')
);

-- CREATE proper invoice_items policies
CREATE POLICY "Invoice items CREATE access" ON public.invoice_items
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM invoices 
    WHERE invoices.id = invoice_items.invoice_id 
    AND (
      invoices.created_by = auth.uid() 
      OR get_current_user_role() IN ('admin', 'sales_director', 'finance_officer')
    )
  )
);

CREATE POLICY "Invoice items UPDATE access" ON public.invoice_items
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM invoices 
    WHERE invoices.id = invoice_items.invoice_id 
    AND (
      invoices.created_by = auth.uid() 
      OR get_current_user_role() IN ('admin', 'sales_director')
    )
  )
);

CREATE POLICY "Invoice items DELETE access" ON public.invoice_items
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM invoices 
    WHERE invoices.id = invoice_items.invoice_id 
    AND get_current_user_role() IN ('admin', 'sales_director')
  )
);

-- CREATE proper invoice_charges policies
CREATE POLICY "Invoice charges CREATE access" ON public.invoice_charges
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM invoice_items 
    JOIN invoices ON invoices.id = invoice_items.invoice_id
    WHERE invoice_items.id = invoice_charges.invoice_item_id 
    AND (
      invoices.created_by = auth.uid() 
      OR get_current_user_role() IN ('admin', 'sales_director', 'finance_officer')
    )
  )
);

CREATE POLICY "Invoice charges UPDATE access" ON public.invoice_charges
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM invoice_items 
    JOIN invoices ON invoices.id = invoice_items.invoice_id
    WHERE invoice_items.id = invoice_charges.invoice_item_id 
    AND (
      invoices.created_by = auth.uid() 
      OR get_current_user_role() IN ('admin', 'sales_director')
    )
  )
);

CREATE POLICY "Invoice charges DELETE access" ON public.invoice_charges
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM invoice_items 
    JOIN invoices ON invoices.id = invoice_items.invoice_id
    WHERE invoice_items.id = invoice_charges.invoice_item_id 
    AND get_current_user_role() IN ('admin', 'sales_director')
  )
);

-- Phase 2: Quotation Data Security
-- Remove overly permissive quotation policies
DROP POLICY IF EXISTS "Users can manage quotations" ON public.quotations;
DROP POLICY IF EXISTS "Users can manage quotation commodities" ON public.quotation_commodities;

-- CREATE proper quotation policies
CREATE POLICY "Quotation CREATE access" ON public.quotations
FOR INSERT 
TO authenticated
WITH CHECK (
  get_current_user_role() IN ('admin', 'sales_director', 'sales_agent') 
  AND created_by = auth.uid()
);

CREATE POLICY "Quotation UPDATE access" ON public.quotations
FOR UPDATE 
TO authenticated
USING (
  created_by = auth.uid() 
  OR get_current_user_role() IN ('admin', 'sales_director')
);

CREATE POLICY "Quotation DELETE access" ON public.quotations
FOR DELETE 
TO authenticated
USING (
  get_current_user_role() IN ('admin', 'sales_director')
);

-- CREATE proper quotation_commodities policies
CREATE POLICY "Quotation commodities CREATE access" ON public.quotation_commodities
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM quotations 
    WHERE quotations.id = quotation_commodities.quotation_id 
    AND (
      quotations.created_by = auth.uid() 
      OR get_current_user_role() IN ('admin', 'sales_director')
    )
  )
);

CREATE POLICY "Quotation commodities UPDATE access" ON public.quotation_commodities
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM quotations 
    WHERE quotations.id = quotation_commodities.quotation_id 
    AND (
      quotations.created_by = auth.uid() 
      OR get_current_user_role() IN ('admin', 'sales_director')
    )
  )
);

CREATE POLICY "Quotation commodities DELETE access" ON public.quotation_commodities
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM quotations 
    WHERE quotations.id = quotation_commodities.quotation_id 
    AND (
      quotations.created_by = auth.uid() 
      OR get_current_user_role() IN ('admin', 'sales_director')
    )
  )
);