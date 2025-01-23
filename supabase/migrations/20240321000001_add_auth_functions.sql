-- Function to update user role in auth.users
CREATE OR REPLACE FUNCTION auth.set_user_role(
    user_id UUID,
    new_role TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    -- Verify the role exists
    IF NOT EXISTS (SELECT 1 FROM public.roles WHERE name = new_role) THEN
        RAISE EXCEPTION 'Invalid role: %', new_role;
    END IF;

    -- Update the role in auth.users
    UPDATE auth.users
    SET role = new_role,
        raw_app_meta_data = raw_app_meta_data || 
            jsonb_build_object('role', new_role)
    WHERE id = user_id;

    -- The sync_user_role trigger will handle updating public.users
END;
$$;

-- Grant execute permission to service_role
GRANT EXECUTE ON FUNCTION auth.set_user_role TO service_role;

-- Function to get user role
CREATE OR REPLACE FUNCTION auth.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM auth.users
    WHERE id = user_id;
    
    RETURN COALESCE(user_role, 'user');
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION auth.get_user_role TO authenticated; 