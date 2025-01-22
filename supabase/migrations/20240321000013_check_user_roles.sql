-- Check if we need to recreate the user_role type
DO $$ 
BEGIN
    -- Drop the check constraint if it exists
    ALTER TABLE public.users DROP CONSTRAINT IF EXISTS check_valid_role;
    
    -- Drop and recreate the type
    DROP TYPE IF EXISTS user_role CASCADE;
    CREATE TYPE user_role AS ENUM ('admin', 'editor', 'moderator');
    
    -- Add the check constraint back
    ALTER TABLE public.users
    ADD CONSTRAINT check_valid_role CHECK (role::text = ANY (ARRAY['admin'::text, 'editor'::text, 'moderator'::text]));
    
    -- Update any invalid roles to 'editor'
    UPDATE public.users
    SET role = 'editor'
    WHERE role::text NOT IN ('admin', 'editor', 'moderator');
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error occurred: %', SQLERRM;
END $$; 