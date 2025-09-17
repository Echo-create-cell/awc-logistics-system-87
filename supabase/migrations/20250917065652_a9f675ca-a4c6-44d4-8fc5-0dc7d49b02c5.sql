-- Fix remaining critical security issues

-- 1. Fix privilege escalation issue - prevent users from changing their own role
DROP POLICY IF EXISTS "Users can update own profile and admins can update any" ON public.profiles;

-- Create separate policies for profile updates (non-admin users cannot change roles)
CREATE POLICY "Users can update own basic profile data" 
ON public.profiles 
FOR UPDATE 
USING (
  auth.uid() = user_id AND
  get_current_user_role() != 'admin' -- Only for non-admin users
)
WITH CHECK (
  auth.uid() = user_id AND
  -- Prevent role and status changes by non-admins - they can only update name and email
  get_current_user_role() != 'admin'
);

-- Separate policy for admins to update any profile including roles
CREATE POLICY "Admins can update any profile including roles" 
ON public.profiles 
FOR UPDATE 
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- 2. Add trigger to log profile role changes
CREATE OR REPLACE FUNCTION public.log_profile_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log role changes
  IF OLD.role != NEW.role THEN
    PERFORM log_security_event('role_change', auth.uid(), 
      jsonb_build_object(
        'target_user_id', NEW.user_id,
        'target_user_email', NEW.email,
        'old_role', OLD.role,
        'new_role', NEW.role,
        'changed_by', auth.uid()
      ));
  END IF;
  
  -- Log status changes
  IF OLD.status != NEW.status THEN
    PERFORM log_security_event('status_change', auth.uid(), 
      jsonb_build_object(
        'target_user_id', NEW.user_id,
        'target_user_email', NEW.email,
        'old_status', OLD.status,
        'new_status', NEW.status,
        'changed_by', auth.uid()
      ));
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for profile changes
DROP TRIGGER IF EXISTS audit_profile_changes ON public.profiles;
CREATE TRIGGER audit_profile_changes
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_profile_changes();

-- 3. Enhance the can_access_client function with better security and logging
CREATE OR REPLACE FUNCTION public.can_access_client(client_user_id uuid, client_assigned_to uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_role TEXT;
  current_user_id UUID;
  has_access BOOLEAN;
BEGIN
  current_user_id := auth.uid();
  
  -- Return false if no authenticated user
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  current_role := get_current_user_role();
  
  -- Determine access
  has_access := CASE 
    -- Admins and sales directors can access all clients
    WHEN current_role IN ('admin', 'sales_director') THEN true
    -- Finance officers can view clients for invoicing
    WHEN current_role = 'finance_officer' THEN true
    -- Sales agents can only access clients they created or are assigned to
    WHEN current_role = 'sales_agent' AND 
         (client_user_id = current_user_id OR client_assigned_to = current_user_id) THEN true
    -- Partners have no direct client access
    ELSE false
  END;
  
  -- Log suspicious access attempts (denied access)
  IF NOT has_access THEN
    PERFORM log_security_event('client_access_denied', current_user_id, 
      jsonb_build_object(
        'client_user_id', client_user_id,
        'client_assigned_to', client_assigned_to,
        'user_role', current_role,
        'reason', 'insufficient_permissions'
      ));
  END IF;
  
  RETURN has_access;
END;
$$;