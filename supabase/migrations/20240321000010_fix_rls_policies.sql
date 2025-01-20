-- Temporarily disable RLS
ALTER TABLE notices DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable read access for published notices" ON notices;
DROP POLICY IF EXISTS "Enable write access for authenticated users" ON notices;
DROP POLICY IF EXISTS "Enable read access for everyone" ON categories;
DROP POLICY IF EXISTS "Enable write access for authenticated users" ON categories;

-- Create simplified policies without role checks

-- Categories: Allow public read access, no authentication needed
CREATE POLICY "categories_public_read" ON categories
  FOR SELECT
  USING (true);

-- Notices: Allow public read access for published notices only
CREATE POLICY "notices_public_read" ON notices
  FOR SELECT
  USING (published = true);

-- Re-enable RLS
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY; 