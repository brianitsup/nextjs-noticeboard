-- Drop existing notice policies
DROP POLICY IF EXISTS "Admin and moderators can view all notices" ON notices;
DROP POLICY IF EXISTS "Users can view their own notices" ON notices;
DROP POLICY IF EXISTS "Admin and moderators can create notices" ON notices;
DROP POLICY IF EXISTS "Admin and moderators can update all notices" ON notices;
DROP POLICY IF EXISTS "Admin can delete notices" ON notices;
DROP POLICY IF EXISTS "Public users can view published notices" ON notices;

-- Create new policies for notices

-- Allow public read access to published notices
CREATE POLICY "Enable read access for published notices" ON notices
  FOR SELECT
  USING (published = true);

-- Allow admin full access to all notices
CREATE POLICY "Enable full access for admin users" ON notices
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Allow moderators to view all notices and update them
CREATE POLICY "Enable view and update for moderators" ON notices
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'moderator'
    )
  );

CREATE POLICY "Enable update for moderators" ON notices
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'moderator'
    )
  );

-- Allow users to view their own notices
CREATE POLICY "Enable users to view own notices" ON notices
  FOR SELECT
  USING (created_by = auth.uid()); 