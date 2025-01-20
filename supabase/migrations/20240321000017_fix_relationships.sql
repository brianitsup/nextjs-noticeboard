-- First, disable RLS
ALTER TABLE notices DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- Drop existing foreign key constraints
ALTER TABLE notices DROP CONSTRAINT IF EXISTS fk_category;
ALTER TABLE notices DROP CONSTRAINT IF EXISTS notices_category_id_fkey;

-- Create a single, clean foreign key constraint
ALTER TABLE notices ADD CONSTRAINT notices_category_id_fkey
  FOREIGN KEY (category_id)
  REFERENCES categories(id)
  ON DELETE CASCADE;

-- Drop existing policies
DROP POLICY IF EXISTS "allow_public_read_categories" ON categories;
DROP POLICY IF EXISTS "allow_admin_modify_categories" ON categories;
DROP POLICY IF EXISTS "allow_admin_update_categories" ON categories;
DROP POLICY IF EXISTS "allow_admin_delete_categories" ON categories;
DROP POLICY IF EXISTS "allow_public_read_notices" ON notices;
DROP POLICY IF EXISTS "allow_admin_modify_notices" ON notices;
DROP POLICY IF EXISTS "allow_admin_update_notices" ON notices;
DROP POLICY IF EXISTS "allow_admin_delete_notices" ON notices;

-- Create simplified policies

-- Categories: Allow public read access
CREATE POLICY "categories_public_select"
ON categories FOR SELECT
TO public
USING (true);

-- Notices: Allow public read access for published notices
CREATE POLICY "notices_public_select"
ON notices FOR SELECT
TO public
USING (published = true);

-- Re-enable RLS
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Grant basic permissions
GRANT USAGE ON SCHEMA public TO public;

-- Grant table permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO public; 