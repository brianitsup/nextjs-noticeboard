-- Enable the required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create an enum for user roles if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'editor', 'moderator');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_role user_role := 'editor'::user_role;
BEGIN
    -- Insert the new user into public.users
    INSERT INTO public.users (
        id,
        email,
        role,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        default_role,
        COALESCE(NEW.created_at, now()),
        now()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = now();

    -- Log the action
    RAISE LOG 'New user created in public.users: %', NEW.email;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log any errors
    RAISE LOG 'Error in handle_new_user function: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, anon, authenticated, service_role;

-- Add helpful comments
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a corresponding record in public.users when a new user is created in auth.users';
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Ensures every auth.users record has a corresponding public.users record'; 