-- Create a temporary function to sync users
CREATE OR REPLACE FUNCTION sync_auth_users()
RETURNS void AS $$
DECLARE
    auth_user RECORD;
BEGIN
    -- Loop through all auth users
    FOR auth_user IN 
        SELECT id, email, created_at
        FROM auth.users
        WHERE id NOT IN (SELECT id FROM public.users)
    LOOP
        -- Call handle_new_user function for each user
        PERFORM public.handle_new_user();
        
        -- Manually insert if trigger didn't work
        INSERT INTO public.users (
            id,
            email,
            role,
            created_at,
            updated_at
        ) VALUES (
            auth_user.id,
            auth_user.email,
            'editor',
            COALESCE(auth_user.created_at, now()),
            now()
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            updated_at = now();
            
        RAISE NOTICE 'Synced user: %', auth_user.email;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run the sync function
SELECT sync_auth_users();

-- Drop the temporary function
DROP FUNCTION sync_auth_users();

-- Verify the sync
SELECT 
    (SELECT count(*) FROM auth.users) as auth_users_count,
    (SELECT count(*) FROM public.users) as public_users_count; 