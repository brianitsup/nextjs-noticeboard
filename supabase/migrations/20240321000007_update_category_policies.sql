-- Drop existing category policies
DROP POLICY IF EXISTS "Admin and moderators can view categories" ON categories;
DROP POLICY IF EXISTS "Admin can manage categories" ON categories;
DROP POLICY IF EXISTS "Public users can view categories" ON categories;

-- Create new policies for categories
-- Allow public read access to categories
CREATE POLICY "Enable read access for all users" ON categories
  FOR SELECT
  USING (true);

-- Allow admin to manage categories
CREATE POLICY "Enable full access for admin users" ON categories
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Allow moderators to view and update categories
CREATE POLICY "Enable view and update for moderators" ON categories
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'moderator'
    )
  ); 