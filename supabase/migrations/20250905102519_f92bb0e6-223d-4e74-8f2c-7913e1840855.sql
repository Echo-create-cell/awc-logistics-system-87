-- Update quotation access policy to allow sales agents to see approved quotations
DROP POLICY IF EXISTS "Secure quotation access" ON quotations;

CREATE POLICY "Secure quotation access" 
ON quotations 
FOR SELECT 
USING (
  -- Users can see their own quotations
  (created_by = auth.uid()) OR 
  -- Admins and sales directors can see all
  (get_current_user_role() = ANY (ARRAY['admin'::text, 'sales_director'::text])) OR 
  -- Finance officers can see all
  (get_current_user_role() = 'finance_officer'::text) OR
  -- Sales agents can see all approved quotations for invoice generation
  (get_current_user_role() = 'sales_agent'::text AND status = 'won'::quotation_status)
);

-- Update invoice access policy to allow sales agents to see invoices they create from approved quotations
DROP POLICY IF EXISTS "Secure invoice access" ON invoices;

CREATE POLICY "Secure invoice access" 
ON invoices 
FOR SELECT 
USING (
  -- Users can see invoices they created
  (created_by = auth.uid()) OR 
  -- Admins and sales directors can see all
  (get_current_user_role() = ANY (ARRAY['admin'::text, 'sales_director'::text])) OR 
  -- Finance officers can see all
  (get_current_user_role() = 'finance_officer'::text)
);

-- Ensure sales agents can create invoices from approved quotations
DROP POLICY IF EXISTS "Users can manage invoices" ON invoices;

CREATE POLICY "Users can create and manage invoices" 
ON invoices 
FOR ALL
USING (
  -- Allow all authenticated users to manage invoices (existing broad policy)
  true
)
WITH CHECK (
  -- Allow all authenticated users to create invoices (existing broad policy)
  true
);