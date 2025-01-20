-- First, disable RLS temporarily
ALTER TABLE notices DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can update their own notices or admin/moderator can update all" ON notices;
DROP POLICY IF EXISTS "Users can delete their own notices or admin can delete all" ON notices;
DROP POLICY IF EXISTS "Users can view their own notices" ON notices;
DROP POLICY IF EXISTS "Admin and moderators can view all notices" ON notices;
DROP POLICY IF EXISTS "Admin and moderators can create notices" ON notices;
DROP POLICY IF EXISTS "Admin and moderators can update all notices" ON notices;
DROP POLICY IF EXISTS "Admin can delete notices" ON notices;
DROP POLICY IF EXISTS "Public users can view published notices" ON notices;

DROP POLICY IF EXISTS "Admin and moderators can view categories" ON categories;
DROP POLICY IF EXISTS "Admin can manage categories" ON categories;
DROP POLICY IF EXISTS "Users can update their own categories or admin can update all" ON categories;
DROP POLICY IF EXISTS "Public users can view categories" ON categories;

-- Create a temporary admin user if none exists
DO $$
DECLARE
    admin_id UUID;
BEGIN
    -- Get or create an admin user
    SELECT id INTO admin_id FROM auth.users LIMIT 1;
    
    IF admin_id IS NULL THEN
        -- No users exist, you might want to handle this case differently
        RAISE EXCEPTION 'No users exist in auth.users';
    END IF;

    -- Update existing text data to use the admin user's ID
    UPDATE notices 
    SET posted_by = admin_id,
        created_by = admin_id
    WHERE posted_by IS NOT NULL OR created_by IS NOT NULL;

    UPDATE categories
    SET created_by = admin_id
    WHERE created_by IS NOT NULL;
END
$$;

-- Now update column types to UUID
ALTER TABLE notices
  ALTER COLUMN posted_by TYPE UUID USING posted_by::UUID,
  ALTER COLUMN created_by TYPE UUID USING created_by::UUID;

ALTER TABLE categories
  ALTER COLUMN created_by TYPE UUID USING created_by::UUID;

-- Now update the constraints and relationships
ALTER TABLE notices
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN title SET NOT NULL,
  ALTER COLUMN content SET NOT NULL,
  ALTER COLUMN category_id SET NOT NULL,
  ALTER COLUMN posted_by SET NOT NULL,
  ALTER COLUMN posted_at SET DEFAULT NOW(),
  ALTER COLUMN posted_at SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN created_by SET NOT NULL,
  ALTER COLUMN is_sponsored SET DEFAULT false,
  ALTER COLUMN published SET DEFAULT false;

-- Add foreign key constraints to notices
ALTER TABLE notices
  ADD CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_posted_by FOREIGN KEY (posted_by) REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update categories table constraints and relationships
ALTER TABLE categories
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN name SET NOT NULL,
  ALTER COLUMN icon SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN created_by SET NOT NULL;

-- Add constraints to categories
ALTER TABLE categories
  ADD CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD CONSTRAINT unique_category_name UNIQUE (name);

-- Update users table constraints and relationships
ALTER TABLE users
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN role SET DEFAULT 'user',
  ALTER COLUMN role SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN created_at SET NOT NULL;

-- Add constraints to users
ALTER TABLE users
  ADD CONSTRAINT valid_role CHECK (role IN ('admin', 'moderator', 'user')),
  ADD CONSTRAINT unique_user_email UNIQUE (email);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notices_category ON notices(category_id);
CREATE INDEX IF NOT EXISTS idx_notices_posted_by ON notices(posted_by);
CREATE INDEX IF NOT EXISTS idx_notices_created_by ON notices(created_by);
CREATE INDEX IF NOT EXISTS idx_categories_created_by ON categories(created_by);
CREATE INDEX IF NOT EXISTS idx_notices_posted_at ON notices(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_notices_created_at ON notices(created_at DESC);

-- Update existing NULL values to maintain NOT NULL constraints
UPDATE notices 
SET posted_at = NOW()
WHERE posted_at IS NULL;

UPDATE notices 
SET created_at = NOW()
WHERE created_at IS NULL;

UPDATE notices 
SET is_sponsored = false
WHERE is_sponsored IS NULL;

UPDATE notices 
SET published = false
WHERE published IS NULL;

UPDATE categories 
SET created_at = NOW()
WHERE created_at IS NULL;

UPDATE categories 
SET icon = 'info'
WHERE icon IS NULL;

UPDATE users 
SET role = 'user'
WHERE role IS NULL;

-- Re-enable RLS at the end
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Recreate policies for notices
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

-- Recreate policies for categories
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

-- Add policy for public access to categories
CREATE POLICY "Public users can view categories" ON categories
  FOR SELECT
  USING (true);