-- First, disable RLS
ALTER TABLE notices DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies (including ones we might have missed)
DROP POLICY IF EXISTS "enable_public_read_for_categories" ON categories;
DROP POLICY IF EXISTS "enable_admin_access_for_categories" ON categories;
DROP POLICY IF EXISTS "enable_public_read_for_notices" ON notices;
DROP POLICY IF EXISTS "enable_admin_access_for_notices" ON notices;
DROP POLICY IF EXISTS "categories_public_read_access" ON categories;
DROP POLICY IF EXISTS "categories_admin_access" ON categories;
DROP POLICY IF EXISTS "notices_public_read_access" ON notices;
DROP POLICY IF EXISTS "notices_admin_access" ON notices;
DROP POLICY IF EXISTS "enable_read_access_for_all_users" ON categories;
DROP POLICY IF EXISTS "enable_categories_crud_for_admin_editor_moderator" ON categories;
DROP POLICY IF EXISTS "enable_read_access_for_published_notices" ON notices;
DROP POLICY IF EXISTS "enable_notices_crud_for_admin_editor_moderator" ON notices;

-- Drop existing functions
DROP FUNCTION IF EXISTS auth.has_admin_access();
DROP FUNCTION IF EXISTS auth.check_user_role(text[]);
DROP FUNCTION IF EXISTS auth.user_role();

-- Create a secure function to check user permissions
CREATE OR REPLACE FUNCTION auth.check_user_role(required_roles text[])
RETURNS BOOLEAN AS $$
BEGIN
  -- For unauthenticated access
  IF auth.role() = 'anon' THEN
    RETURN false;
  END IF;

  -- For authenticated users, check their role
  RETURN EXISTS (
    SELECT 1
    FROM users
    WHERE id = auth.uid()
    AND role = ANY(required_roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new policies with unique names

-- Categories Policies
CREATE POLICY "categories_select_policy" ON categories
  FOR SELECT USING (true);

CREATE POLICY "categories_all_admin_policy" ON categories
  FOR ALL
  USING (
    auth.role() = 'authenticated' 
    AND 
    auth.check_user_role(ARRAY['admin', 'editor', 'moderator'])
  );

-- Notices Policies
CREATE POLICY "notices_select_policy" ON notices
  FOR SELECT
  USING (
    published = true 
    OR 
    (auth.role() = 'authenticated' AND auth.check_user_role(ARRAY['admin', 'editor', 'moderator']))
  );

CREATE POLICY "notices_all_admin_policy" ON notices
  FOR ALL
  USING (
    auth.role() = 'authenticated' 
    AND 
    auth.check_user_role(ARRAY['admin', 'editor', 'moderator'])
  );

-- Re-enable RLS
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated; 