-- Create the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
RETURNS TRIGGER AS $$
BEGIN
    -- Add a delay of 0.5 seconds
    PERFORM pg_sleep(0.5);
    
    -- Insert into public.users
    INSERT INTO public.users (
        id,
        email,
        role,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        'editor',
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_auth_user_created();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_auth_user_created() TO service_role; 