-- First, disable RLS
ALTER TABLE notices DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "enable_read_access_for_all_users" ON categories;
DROP POLICY IF EXISTS "enable_categories_crud_for_admin_editor_moderator" ON categories;
DROP POLICY IF EXISTS "enable_read_access_for_published_notices" ON notices;
DROP POLICY IF EXISTS "enable_notices_crud_for_admin_editor_moderator" ON notices;

-- Create function to check if user has admin access
CREATE OR REPLACE FUNCTION auth.has_admin_access()
RETURNS BOOLEAN AS $$
BEGIN
  -- If not authenticated, return false
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  -- Check if user has admin/editor/moderator role
  RETURN EXISTS (
    SELECT 1
    FROM users
    WHERE id = auth.uid()
    AND role IN ('admin', 'editor', 'moderator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Categories Policies

-- 1. Allow public read access to all categories
CREATE POLICY "categories_public_read_access" ON categories
  FOR SELECT
  USING (true);

-- 2. Allow admin/editor/moderator to manage categories
CREATE POLICY "categories_admin_access" ON categories
  FOR ALL
  USING (auth.has_admin_access());

-- Notices Policies

-- 1. Allow public read access to published notices
CREATE POLICY "notices_public_read_access" ON notices
  FOR SELECT
  USING (published = true);

-- 2. Allow admin/editor/moderator to manage all notices
CREATE POLICY "notices_admin_access" ON notices
  FOR ALL
  USING (auth.has_admin_access());

-- Re-enable RLS
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role; 