-- Create system user profiles (without ON CONFLICT since there's no email unique constraint)
-- We'll delete existing records first to avoid duplicates

-- Delete existing test profiles to start fresh
DELETE FROM profiles WHERE email IN (
  'n.solange@africaworldcargo.com',
  'i.arnold@africaworldcargo.com', 
  'a.benon@africaworldcargo.com',
  'n.mariemerci@africaworldcargo.com',
  'u.epiphanie@africaworldcargo.com',
  'k.peter@africaworldcargo.com'
);

-- Insert all user profiles with their roles
INSERT INTO profiles (id, user_id, name, email, role, status, created_at, updated_at)
VALUES 
  (gen_random_uuid(), gen_random_uuid(), 'N. Solange', 'n.solange@africaworldcargo.com', 'admin'::user_role, 'active'::user_status, now(), now()),
  (gen_random_uuid(), gen_random_uuid(), 'I. Arnold', 'i.arnold@africaworldcargo.com', 'sales_director'::user_role, 'active'::user_status, now(), now()),
  (gen_random_uuid(), gen_random_uuid(), 'A. Benon', 'a.benon@africaworldcargo.com', 'sales_agent'::user_role, 'active'::user_status, now(), now()),
  (gen_random_uuid(), gen_random_uuid(), 'N. Marie-Merci', 'n.mariemerci@africaworldcargo.com', 'sales_agent'::user_role, 'active'::user_status, now(), now()),
  (gen_random_uuid(), gen_random_uuid(), 'U. Epiphanie', 'u.epiphanie@africaworldcargo.com', 'finance_officer'::user_role, 'active'::user_status, now(), now()),
  (gen_random_uuid(), gen_random_uuid(), 'K. Peter', 'k.peter@africaworldcargo.com', 'partner'::user_role, 'active'::user_status, now(), now());

-- Create reference table for user credentials (for documentation)
DROP TABLE IF EXISTS user_credentials_reference;
CREATE TABLE user_credentials_reference (
  email TEXT PRIMARY KEY,
  password TEXT,
  name TEXT,
  role TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert the exact credentials specified
INSERT INTO user_credentials_reference (email, password, name, role, notes)
VALUES 
  ('n.solange@africaworldcargo.com', 'Action@AWC', 'N. Solange', 'admin', 'System Administrator'),
  ('i.arnold@africaworldcargo.com', 'Director@AWC', 'I. Arnold', 'sales_director', 'Sales Director'),
  ('a.benon@africaworldcargo.com', 'Agent@AWC', 'A. Benon', 'sales_agent', 'Sales Agent 1'),
  ('n.mariemerci@africaworldcargo.com', 'Agent2@AWC', 'N. Marie-Merci', 'sales_agent', 'Sales Agent 2'),
  ('u.epiphanie@africaworldcargo.com', 'Finance@AWC', 'U. Epiphanie', 'finance_officer', 'Finance Officer'),
  ('k.peter@africaworldcargo.com', 'Partner@AWC', 'K. Peter', 'partner', 'Partner User');

-- Add comment for reference
COMMENT ON TABLE user_credentials_reference IS 'Reference table containing all system user credentials for AWC Logistics. These users should be created via Supabase Auth with the exact passwords listed.';