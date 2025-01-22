-- Enable the pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create a function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_role text := 'editor';
BEGIN
    -- Add a small delay
    PERFORM pg_sleep(0.5);
    
    -- Insert the new user into public.users if they don't exist
    INSERT INTO public.users (id, email, role, created_at)
    VALUES (
        NEW.id,
        NEW.email,
        default_role,
        COALESCE(NEW.created_at, now())
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        email = EXCLUDED.email,
        updated_at = now();
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log the error (will appear in Supabase logs)
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION handle_new_user() TO postgres, anon, authenticated, service_role;

-- Add a comment to explain the trigger
COMMENT ON FUNCTION handle_new_user() IS 
'Automatically creates a corresponding record in public.users when a new user is created in auth.users'; 