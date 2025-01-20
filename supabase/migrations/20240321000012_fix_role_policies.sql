-- First, let's create a function to check user roles
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    (
      SELECT role
      FROM users
      WHERE id = auth.uid()
    ),
    'public'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Drop existing policies
DROP POLICY IF EXISTS "categories_public_read" ON categories;
DROP POLICY IF EXISTS "notices_public_read" ON notices;

-- Categories policies
CREATE POLICY "enable_read_access_for_all_users" ON categories
  FOR SELECT USING (true);

CREATE POLICY "enable_categories_crud_for_admin_editor_moderator" ON categories
  FOR ALL
  USING (
    auth.user_role() IN ('admin', 'editor', 'moderator')
  );

-- Notices policies
CREATE POLICY "enable_read_access_for_published_notices" ON notices
  FOR SELECT
  USING (
    published = true OR
    (auth.user_role() IN ('admin', 'editor', 'moderator'))
  );

CREATE POLICY "enable_notices_crud_for_admin_editor_moderator" ON notices
  FOR ALL
  USING (
    auth.user_role() IN ('admin', 'editor', 'moderator')
  ); 