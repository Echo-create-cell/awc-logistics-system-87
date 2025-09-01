-- Update profile to link with correct Supabase auth user ID
UPDATE public.profiles 
SET user_id = '9ccca366-5fe9-499e-8dde-fb7021fa23cd'::uuid
WHERE email = 'i.arnold@africaworldcargo.com';