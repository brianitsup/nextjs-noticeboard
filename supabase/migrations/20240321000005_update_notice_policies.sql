-- Update notice policies
DROP POLICY IF EXISTS "Public users can view published notices" ON notices;
DROP POLICY IF EXISTS "Users can update their own notices or admin/moderator can update all" ON notices;
DROP POLICY IF EXISTS "Users can delete their own notices or admin can delete all" ON notices;

-- Create new policies for notices
CREATE POLICY "Admin and moderators can view all notices" ON notices
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Users can view their own notices" ON notices
  FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "Admin and moderators can create notices" ON notices
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Admin and moderators can update all notices" ON notices
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Admin can delete notices" ON notices
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Update category policies
DROP POLICY IF EXISTS "Public users can view categories" ON categories;

CREATE POLICY "Admin and moderators can view categories" ON categories
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Admin can manage categories" ON categories
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  ); 