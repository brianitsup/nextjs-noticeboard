-- Remove any existing policies
DROP POLICY IF EXISTS "Admin and moderators can view all notices" ON notices;
DROP POLICY IF EXISTS "Admin and moderators can create notices" ON notices;
DROP POLICY IF EXISTS "Admin and moderators can update all notices" ON notices;
DROP POLICY IF EXISTS "Admin can delete notices" ON notices;
DROP POLICY IF EXISTS "Admin and moderators can view categories" ON categories;
DROP POLICY IF EXISTS "Admin can manage categories" ON categories;

-- Add role validation to users table
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_valid_role;
ALTER TABLE users ADD CONSTRAINT check_valid_role 
  CHECK (role IN ('admin', 'moderator', 'user'));

-- Create policies for notices
CREATE POLICY "Admin and moderators can view all notices" ON notices
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'moderator')
    )
  );

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

-- Create policies for categories
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

-- Enable RLS on tables
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Update first user to admin if no admin exists
DO $$
DECLARE
    admin_exists boolean;
    first_user_id uuid;
BEGIN
    -- Check if admin exists
    SELECT EXISTS (
        SELECT 1 FROM users WHERE role = 'admin'
    ) INTO admin_exists;

    IF NOT admin_exists THEN
        -- Get first user
        SELECT id INTO first_user_id FROM auth.users ORDER BY created_at LIMIT 1;
        
        IF first_user_id IS NOT NULL THEN
            -- Update first user to admin
            UPDATE users 
            SET role = 'admin'
            WHERE id = first_user_id;
        END IF;
    END IF;
END
$$; 