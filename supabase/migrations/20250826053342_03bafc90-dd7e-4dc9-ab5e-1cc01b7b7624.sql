-- Create all system users with their specified credentials
-- Note: Supabase will hash these passwords automatically

-- Insert admin user (n.solange already exists, so we'll update if needed)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'i.arnold@africaworldcargo.com',
  crypt('Director@AWC', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "I. Arnold"}'
) ON CONFLICT (email) DO UPDATE SET
  encrypted_password = crypt('Director@AWC', gen_salt('bf')),
  updated_at = now();

INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'a.benon@africaworldcargo.com',
  crypt('Agent@AWC', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "A. Benon"}'
) ON CONFLICT (email) DO UPDATE SET
  encrypted_password = crypt('Agent@AWC', gen_salt('bf')),
  updated_at = now();

INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'n.mariemerci@africaworldcargo.com',
  crypt('Agent2@AWC', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "N. Marie-Merci"}'
) ON CONFLICT (email) DO UPDATE SET
  encrypted_password = crypt('Agent2@AWC', gen_salt('bf')),
  updated_at = now();

INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'u.epiphanie@africaworldcargo.com',
  crypt('Finance@AWC', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "U. Epiphanie"}'
) ON CONFLICT (email) DO UPDATE SET
  encrypted_password = crypt('Finance@AWC', gen_salt('bf')),
  updated_at = now();

INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'k.peter@africaworldcargo.com',
  crypt('Partner@AWC', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "K. Peter"}'
) ON CONFLICT (email) DO UPDATE SET
  encrypted_password = crypt('Partner@AWC', gen_salt('bf')),
  updated_at = now();

-- Update admin password if needed
UPDATE auth.users 
SET encrypted_password = crypt('Action@AWC', gen_salt('bf')),
    updated_at = now()
WHERE email = 'n.solange@africaworldcargo.com';

-- Now create corresponding profiles for all users
INSERT INTO profiles (user_id, name, email, role, status)
SELECT 
  au.id,
  'I. Arnold',
  'i.arnold@africaworldcargo.com',
  'sales_director'::user_role,
  'active'::user_status
FROM auth.users au 
WHERE au.email = 'i.arnold@africaworldcargo.com'
ON CONFLICT (user_id) DO UPDATE SET
  name = 'I. Arnold',
  role = 'sales_director'::user_role,
  status = 'active'::user_status;

INSERT INTO profiles (user_id, name, email, role, status)
SELECT 
  au.id,
  'A. Benon',
  'a.benon@africaworldcargo.com',
  'sales_agent'::user_role,
  'active'::user_status
FROM auth.users au 
WHERE au.email = 'a.benon@africaworldcargo.com'
ON CONFLICT (user_id) DO UPDATE SET
  name = 'A. Benon',
  role = 'sales_agent'::user_role,
  status = 'active'::user_status;

INSERT INTO profiles (user_id, name, email, role, status)
SELECT 
  au.id,
  'N. Marie-Merci',
  'n.mariemerci@africaworldcargo.com',
  'sales_agent'::user_role,
  'active'::user_status
FROM auth.users au 
WHERE au.email = 'n.mariemerci@africaworldcargo.com'
ON CONFLICT (user_id) DO UPDATE SET
  name = 'N. Marie-Merci',
  role = 'sales_agent'::user_role,
  status = 'active'::user_status;

INSERT INTO profiles (user_id, name, email, role, status)
SELECT 
  au.id,
  'U. Epiphanie',
  'u.epiphanie@africaworldcargo.com',
  'finance_officer'::user_role,
  'active'::user_status
FROM auth.users au 
WHERE au.email = 'u.epiphanie@africaworldcargo.com'
ON CONFLICT (user_id) DO UPDATE SET
  name = 'U. Epiphanie',
  role = 'finance_officer'::user_role,
  status = 'active'::user_status;

INSERT INTO profiles (user_id, name, email, role, status)
SELECT 
  au.id,
  'K. Peter',
  'k.peter@africaworldcargo.com',
  'partner'::user_role,
  'active'::user_status
FROM auth.users au 
WHERE au.email = 'k.peter@africaworldcargo.com'
ON CONFLICT (user_id) DO UPDATE SET
  name = 'K. Peter',
  role = 'partner'::user_role,
  status = 'active'::user_status;

-- Update admin profile
UPDATE profiles 
SET name = 'N. Solange',
    role = 'admin'::user_role,
    status = 'active'::user_status
WHERE email = 'n.solange@africaworldcargo.com';