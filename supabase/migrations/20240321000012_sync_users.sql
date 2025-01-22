-- First, check the current roles in the users table
SELECT DISTINCT role FROM public.users;

-- Insert missing users from auth.users into public.users
INSERT INTO public.users (id, email, role, created_at)
SELECT 
    au.id,
    au.email,
    CASE 
        WHEN au.raw_app_meta_data->>'role' = 'admin' THEN 'admin'
        WHEN au.raw_app_meta_data->>'role' = 'moderator' THEN 'moderator'
        ELSE 'editor'
    END::user_role as role,
    COALESCE(au.created_at, now()) as created_at
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 
    FROM public.users pu 
    WHERE pu.id = au.id
);

-- Verify the sync
SELECT 
    (SELECT count(*) FROM auth.users) as auth_users_count,
    (SELECT count(*) FROM public.users) as public_users_count;

-- Show the results
SELECT u.email, u.role, au.raw_app_meta_data->>'role' as auth_role
FROM public.users u
JOIN auth.users au ON au.id = u.id
ORDER BY u.created_at DESC; 