-- Drop existing policies for users table
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Only admins can create users" ON users;
DROP POLICY IF EXISTS "Only admins can update users" ON users;
DROP POLICY IF EXISTS "Only admins can delete users" ON users;

-- Create new policies with simpler role checks
-- Allow users to view their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

-- Allow admin and moderators to view all users
CREATE POLICY "Staff can view all users" ON users
    FOR SELECT USING (
        auth.jwt() ->> 'role' IN ('admin', 'moderator')
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

-- Make sure RLS is enabled for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY; 