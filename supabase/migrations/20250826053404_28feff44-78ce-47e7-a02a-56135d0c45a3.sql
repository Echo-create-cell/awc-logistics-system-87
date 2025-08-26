-- Create all system users with their specified credentials
-- First, we'll use Supabase's built-in functions to create users properly

-- Create users using Supabase's auth functions
-- Note: We'll create the profiles directly since the auth.users will be created via the application

-- Insert/update profiles for all users
INSERT INTO profiles (id, user_id, name, email, role, status, created_at, updated_at)
VALUES 
  (gen_random_uuid(), gen_random_uuid(), 'N. Solange', 'n.solange@africaworldcargo.com', 'admin'::user_role, 'active'::user_status, now(), now()),
  (gen_random_uuid(), gen_random_uuid(), 'I. Arnold', 'i.arnold@africaworldcargo.com', 'sales_director'::user_role, 'active'::user_status, now(), now()),
  (gen_random_uuid(), gen_random_uuid(), 'A. Benon', 'a.benon@africaworldcargo.com', 'sales_agent'::user_role, 'active'::user_status, now(), now()),
  (gen_random_uuid(), gen_random_uuid(), 'N. Marie-Merci', 'n.mariemerci@africaworldcargo.com', 'sales_agent'::user_role, 'active'::user_status, now(), now()),
  (gen_random_uuid(), gen_random_uuid(), 'U. Epiphanie', 'u.epiphanie@africaworldcargo.com', 'finance_officer'::user_role, 'active'::user_status, now(), now()),
  (gen_random_uuid(), gen_random_uuid(), 'K. Peter', 'k.peter@africaworldcargo.com', 'partner'::user_role, 'active'::user_status, now(), now())
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  updated_at = now();

-- Create a temporary table to store user credentials for system reference
CREATE TABLE IF NOT EXISTS user_credentials_temp (
  email TEXT PRIMARY KEY,
  password TEXT,
  name TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert the user credentials
INSERT INTO user_credentials_temp (email, password, name, role)
VALUES 
  ('n.solange@africaworldcargo.com', 'Action@AWC', 'N. Solange', 'admin'),
  ('i.arnold@africaworldcargo.com', 'Director@AWC', 'I. Arnold', 'sales_director'),
  ('a.benon@africaworldcargo.com', 'Agent@AWC', 'A. Benon', 'sales_agent'),
  ('n.mariemerci@africaworldcargo.com', 'Agent2@AWC', 'N. Marie-Merci', 'sales_agent'),
  ('u.epiphanie@africaworldcargo.com', 'Finance@AWC', 'U. Epiphanie', 'finance_officer'),
  ('k.peter@africaworldcargo.com', 'Partner@AWC', 'K. Peter', 'partner')
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- Add a comment explaining the credentials
COMMENT ON TABLE user_credentials_temp IS 'Temporary table storing user credentials for system setup. These users need to be created via Supabase Auth API with the specified passwords.';