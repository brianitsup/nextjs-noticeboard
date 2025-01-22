-- Create a function to handle new user creation
CREATE OR REPLACE FUNCTION create_new_user(
    user_id UUID,
    user_email TEXT,
    user_role TEXT DEFAULT 'editor'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.users (
        id,
        email,
        role,
        created_at,
        updated_at
    ) VALUES (
        user_id,
        user_email,
        user_role::user_role,  -- Explicit cast to user_role type
        NOW(),
        NOW()
    );
END;
$$; 