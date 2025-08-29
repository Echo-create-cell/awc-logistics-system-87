-- Create missing profiles for existing auth users
-- These users exist in Supabase Auth but are missing from profiles table

INSERT INTO public.profiles (email, name, role, status) VALUES
('i.arnold@africaworldcargo.com', 'I. ARNOLD', 'sales_director', 'active'),
('a.benon@africaworldcargo.com', 'A. BENON', 'sales_agent', 'active'), 
('n.mariemerci@africaworldcargo.com', 'N. MARIEMERCI', 'finance_officer', 'active'),
('u.epiphanie@africaworldcargo.com', 'U. EPIPHANIE', 'finance_officer', 'active'),
('k.peter@africaworldcargo.com', 'K. PETER', 'partner', 'active')
ON CONFLICT (email) DO NOTHING;