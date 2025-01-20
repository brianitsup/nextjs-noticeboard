-- First, disable RLS
ALTER TABLE notices DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- Drop existing policies and functions
DROP POLICY IF EXISTS "categories_public_read_access" ON categories;
DROP POLICY IF EXISTS "categories_admin_access" ON categories;
DROP POLICY IF EXISTS "notices_public_read_access" ON notices;
DROP POLICY IF EXISTS "notices_admin_access" ON notices;
DROP FUNCTION IF EXISTS auth.has_admin_access();

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

-- Categories Policies

-- 1. Public read access for all categories
CREATE POLICY "enable_public_read_for_categories"
ON categories FOR SELECT
USING (true);

-- 2. Admin/editor/moderator full access for categories
CREATE POLICY "enable_admin_access_for_categories"
ON categories FOR ALL
USING (
  auth.role() = 'authenticated' 
  AND 
  auth.check_user_role(ARRAY['admin', 'editor', 'moderator'])
);

-- Notices Policies

-- 1. Public read access for published notices
CREATE POLICY "enable_public_read_for_notices"
ON notices FOR SELECT
USING (
  published = true 
  OR 
  (auth.role() = 'authenticated' AND auth.check_user_role(ARRAY['admin', 'editor', 'moderator']))
);

-- 2. Admin/editor/moderator full access for notices
CREATE POLICY "enable_admin_access_for_notices"
ON notices FOR ALL
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