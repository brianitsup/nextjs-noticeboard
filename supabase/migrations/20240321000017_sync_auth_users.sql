-- Drop existing role constraints
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS check_valid_role;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS valid_role;

-- Drop and recreate the role type
DROP TYPE IF EXISTS public.user_role CASCADE;
CREATE TYPE public.user_role AS ENUM ('admin', 'editor', 'moderator');

-- Add the role constraint
ALTER TABLE public.users 
ADD CONSTRAINT check_valid_role 
CHECK (role::text = ANY (ARRAY['admin'::text, 'editor'::text, 'moderator'::text]));

-- Sync existing auth users to public users
INSERT INTO public.users (id, email, role, updated_at)
SELECT 
    au.id,
    au.email,
    'editor',
    NOW()
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- Show results of sync
SELECT 
    au.email as auth_email,
    pu.email as public_email,
    pu.role
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
ORDER BY au.email; 