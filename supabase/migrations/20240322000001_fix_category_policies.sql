-- First, drop all existing category policies to start fresh
DROP POLICY IF EXISTS "Admins and editors can create categories" ON categories;
DROP POLICY IF EXISTS "Only admins can delete categories" ON categories;
DROP POLICY IF EXISTS "admin_all_categories" ON categories;
DROP POLICY IF EXISTS "Public can view categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can insert categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can update categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can delete categories" ON categories;

-- Create a helper function to check admin/moderator status without recursion
CREATE OR REPLACE FUNCTION is_admin_or_moderator()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      auth.jwt()->>'role' = 'admin' 
      OR 
      auth.jwt()->>'role' = 'moderator'
      OR
      current_setting('request.jwt.claims', true)::jsonb->>'role' = 'admin'
      OR
      current_setting('request.jwt.claims', true)::jsonb->>'role' = 'moderator',
      false
    )
  );
END;
$$;

-- 1. Public read access (maintains existing behavior)
CREATE POLICY "categories_public_read"
ON categories
FOR SELECT
USING (true);

-- 2. Admin/Moderator full access (combines previous admin and moderator policies)
CREATE POLICY "categories_admin_full_access"
ON categories
FOR ALL
USING (is_admin_or_moderator())
WITH CHECK (is_admin_or_moderator());

-- 3. Editor create access (maintains editor creation rights)
CREATE POLICY "categories_editor_create"
ON categories
FOR INSERT
WITH CHECK (
  auth.jwt()->>'role' = 'editor'
  OR
  current_setting('request.jwt.claims', true)::jsonb->>'role' = 'editor'
);

-- 4. Creator update access (allows creators to update their own categories)
CREATE POLICY "categories_creator_update"
ON categories
FOR UPDATE
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- Grant appropriate permissions
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

COMMENT ON POLICY "categories_public_read" ON categories IS 'Anyone can view categories';
COMMENT ON POLICY "categories_admin_full_access" ON categories IS 'Admins and moderators have full access';
COMMENT ON POLICY "categories_editor_create" ON categories IS 'Editors can create new categories';
COMMENT ON POLICY "categories_creator_update" ON categories IS 'Users can update their own categories'; 