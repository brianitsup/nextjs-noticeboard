-- Disable RLS temporarily
ALTER TABLE notices DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "categories_public_select" ON categories;
DROP POLICY IF EXISTS "notices_public_select" ON notices;
DROP POLICY IF EXISTS "allow_public_read_categories" ON categories;
DROP POLICY IF EXISTS "allow_admin_modify_categories" ON categories;
DROP POLICY IF EXISTS "allow_admin_update_categories" ON categories;
DROP POLICY IF EXISTS "allow_admin_delete_categories" ON categories;
DROP POLICY IF EXISTS "allow_public_read_notices" ON notices;
DROP POLICY IF EXISTS "allow_admin_modify_notices" ON notices;
DROP POLICY IF EXISTS "allow_admin_update_notices" ON notices;
DROP POLICY IF EXISTS "allow_admin_delete_notices" ON notices;

-- Drop any existing functions
DROP FUNCTION IF EXISTS public.is_admin_user();
DROP FUNCTION IF EXISTS auth.check_user_role(text[]);
DROP FUNCTION IF EXISTS auth.user_role();

-- Create the absolute simplest policies possible

-- Categories: Allow all operations for everyone
CREATE POLICY "enable_categories_access"
ON categories
FOR ALL
USING (true)
WITH CHECK (true);

-- Notices: Allow read for published notices, all operations for authenticated users
CREATE POLICY "enable_notices_access"
ON notices
FOR ALL
USING (true)
WITH CHECK (true);

-- Re-enable RLS
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Grant full permissions to both anonymous and authenticated users
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated; 