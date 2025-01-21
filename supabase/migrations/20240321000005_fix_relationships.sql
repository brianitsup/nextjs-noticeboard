-- First, drop any existing foreign key constraints
ALTER TABLE notices DROP CONSTRAINT IF EXISTS fk_category;
ALTER TABLE notices DROP CONSTRAINT IF EXISTS fk_category_id;
ALTER TABLE notices DROP CONSTRAINT IF EXISTS notices_category_id_fkey;

-- Drop any existing indexes that might conflict
DROP INDEX IF EXISTS idx_notices_category;
DROP INDEX IF EXISTS idx_notices_category_id;

-- Add the correct foreign key constraint
ALTER TABLE notices
  ADD CONSTRAINT fk_category_id 
  FOREIGN KEY (category_id) 
  REFERENCES categories(id) 
  ON DELETE CASCADE;

-- Create the proper index
CREATE INDEX idx_notices_category_id ON notices(category_id);

-- Enable RLS on both tables
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can view published notices" ON notices;
DROP POLICY IF EXISTS "Authenticated users can manage their notices" ON notices;
DROP POLICY IF EXISTS "Public can view categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON categories;

-- Create policies for notices
CREATE POLICY "Public can view published notices"
  ON notices FOR SELECT
  USING (published = true);

CREATE POLICY "Authenticated users can view all notices"
  ON notices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert notices"
  ON notices FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update their notices"
  ON notices FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('admin', 'moderator')
    )
    OR created_by = auth.uid()
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('admin', 'moderator')
    )
    OR created_by = auth.uid()
  );

CREATE POLICY "Authenticated users can delete their notices"
  ON notices FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('admin', 'moderator')
    )
    OR created_by = auth.uid()
  );

-- Create policies for categories
CREATE POLICY "Public can view categories"
  ON categories FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Authenticated users can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Authenticated users can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('admin', 'moderator')
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Authenticated users can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('admin', 'moderator')
    )
  );

-- Update the notices table to use proper JSON embedding
COMMENT ON TABLE notices IS 
  E'@graphql({"foreign_keys":{"category_id":{"table":"categories","column":"id"}}})';

-- Update the categories table for proper relationship naming
COMMENT ON TABLE categories IS 
  E'@graphql({"primary_key":"id"})';

-- Add explicit relationship names
COMMENT ON CONSTRAINT fk_category_id ON notices IS 
  E'@graphql({"foreign_name":"notices","local_name":"category"})'; 