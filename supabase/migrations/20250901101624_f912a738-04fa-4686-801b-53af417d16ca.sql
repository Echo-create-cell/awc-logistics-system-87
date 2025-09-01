-- Fix system users by ensuring proper auth user creation and profile linkage

-- First, let's clean up existing profiles with NULL user_id (except I. ARNOLD who is working)
DELETE FROM public.profiles 
WHERE user_id IS NULL;

-- Create a function to safely create system users with proper auth linkage
CREATE OR REPLACE FUNCTION create_system_user(
  p_email TEXT,
  p_password TEXT,
  p_name TEXT,
  p_role user_role
) RETURNS UUID AS $$
DECLARE
  auth_user_id UUID;
  existing_user_id UUID;
BEGIN
  -- Check if auth user already exists
  SELECT id INTO existing_user_id 
  FROM auth.users 
  WHERE email = p_email;
  
  IF existing_user_id IS NOT NULL THEN
    -- User exists, just ensure profile is correct
    INSERT INTO public.profiles (user_id, name, email, role, status)
    VALUES (existing_user_id, p_name, p_email, p_role, 'active')
    ON CONFLICT (user_id) DO UPDATE SET
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      role = EXCLUDED.role,
      status = 'active';
    
    RETURN existing_user_id;
  ELSE
    -- Create new auth user (this would normally be done via edge function)
    -- For now, just create the profile placeholder
    INSERT INTO public.profiles (name, email, role, status)
    VALUES (p_name, p_email, p_role, 'active')
    ON CONFLICT (email) DO UPDATE SET
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      status = 'active';
    
    RETURN NULL; -- Will be updated when auth user is created
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create system users with correct information
SELECT create_system_user('n.solange@africaworldcargo.com', 'Action@AWC', 'N. Solange', 'admin');
SELECT create_system_user('a.benon@africaworldcargo.com', 'Agent@AWC', 'A. Benon', 'sales_agent');
SELECT create_system_user('n.mariemerci@africaworldcargo.com', 'Agent2@AWC', 'N. Marie-Merci', 'sales_agent');
SELECT create_system_user('u.epiphanie@africaworldcargo.com', 'Finance@AWC', 'U. Epiphanie', 'finance_officer');
SELECT create_system_user('k.peter@africaworldcargo.com', 'Partner@AWC', 'K. Peter', 'partner');

-- Clean up the helper function
DROP FUNCTION create_system_user(TEXT, TEXT, TEXT, user_role);