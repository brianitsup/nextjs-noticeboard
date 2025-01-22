-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users" ON admin_activity_logs;
DROP POLICY IF EXISTS "Allow admins to view logs" ON admin_activity_logs;
DROP POLICY IF EXISTS "Allow admins to insert logs" ON admin_activity_logs;
DROP POLICY IF EXISTS "Admin select policy" ON admin_activity_logs;
DROP POLICY IF EXISTS "Admin insert policy" ON admin_activity_logs;
DROP POLICY IF EXISTS "Allow sign-in logging" ON admin_activity_logs;
DROP POLICY IF EXISTS "Admin access policy" ON admin_activity_logs;

-- Drop existing table if it exists
DROP TABLE IF EXISTS admin_activity_logs CASCADE;

-- Create admin activity logs table
CREATE TABLE IF NOT EXISTS admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create index for faster queries
CREATE INDEX idx_activity_logs_user_id ON admin_activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON admin_activity_logs(created_at DESC);

-- Set up RLS policies
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow sign-in logging for everyone (including unauthenticated)
CREATE POLICY "Allow sign-in logging"
ON admin_activity_logs
FOR INSERT
TO PUBLIC
WITH CHECK (
    action = 'Admin Login'
);

-- Allow admin users to view and insert other logs
CREATE POLICY "Admin access policy"
ON admin_activity_logs
FOR ALL
TO authenticated
USING (
    (auth.jwt() ->> 'role')::text = 'admin' OR
    (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin'
)
WITH CHECK (
    (auth.jwt() ->> 'role')::text = 'admin' OR
    (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin'
);

-- Grant necessary permissions (including PUBLIC)
GRANT USAGE ON SCHEMA public TO PUBLIC;
GRANT INSERT ON TABLE admin_activity_logs TO PUBLIC;

-- Ensure the auth.users is accessible
GRANT SELECT ON auth.users TO authenticated; 