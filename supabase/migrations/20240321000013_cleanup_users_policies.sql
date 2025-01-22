-- First, drop all existing policies
DROP POLICY IF EXISTS "Admins can create users" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Enable delete for admins" ON users;
DROP POLICY IF EXISTS "Enable insert for admins" ON users;
DROP POLICY IF EXISTS "Enable read for users" ON users;
DROP POLICY IF EXISTS "Enable update for users and admins" ON users;
DROP POLICY IF EXISTS "enable_read_for_authenticated_users" ON users;
DROP POLICY IF EXISTS "Staff can view all users" ON users;
DROP POLICY IF EXISTS "Users can view own data" ON users;

-- Create simplified policies
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (
        auth.uid() = id
    );

-- Allow admins and moderators to view all users
CREATE POLICY "Staff can view all users" ON users
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'moderator'
    );

-- Only admins can create users
CREATE POLICY "Admins can create users" ON users
    FOR INSERT WITH CHECK (
        auth.jwt() ->> 'role' = 'admin'
    );

-- Only admins can update users
CREATE POLICY "Admins can update users" ON users
    FOR UPDATE USING (
        auth.jwt() ->> 'role' = 'admin'
    );

-- Only admins can delete users
CREATE POLICY "Admins can delete users" ON users
    FOR DELETE USING (
        auth.jwt() ->> 'role' = 'admin'
    );

-- Make sure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY; 