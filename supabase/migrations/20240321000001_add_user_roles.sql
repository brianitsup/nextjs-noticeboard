-- Create an enum for user roles
CREATE TYPE auth.user_role AS ENUM ('admin', 'editor', 'moderator');

-- Add role column to auth.users
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS role auth.user_role DEFAULT 'editor';

-- Create a function to get user role
CREATE OR REPLACE FUNCTION auth.get_user_role()
RETURNS auth.user_role
LANGUAGE sql
STABLE
AS $$
  SELECT CAST(role AS auth.user_role) FROM auth.users WHERE id = auth.uid();
$$;

-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create policies for user management
CREATE POLICY "Users can view their own data" ON auth.users
    FOR SELECT
    USING (
        auth.uid() = id
        OR EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "Only admins can create users" ON auth.users
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can update users" ON auth.users
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can delete users" ON auth.users
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    ); 