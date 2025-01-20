-- Temporarily disable RLS
ALTER TABLE notices DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable read access for published notices" ON notices;
DROP POLICY IF EXISTS "Enable full access for admin users" ON notices;
DROP POLICY IF EXISTS "Enable view and update for moderators" ON notices;
DROP POLICY IF EXISTS "Enable update for moderators" ON notices;
DROP POLICY IF EXISTS "Enable users to view own notices" ON notices;
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
DROP POLICY IF EXISTS "Enable full access for admin users" ON categories;
DROP POLICY IF EXISTS "Enable view and update for moderators" ON categories;

-- Create simplified policies

-- Categories: Allow read access for everyone, write access for authenticated users
CREATE POLICY "Enable read access for everyone" ON categories
  FOR SELECT
  USING (true);

CREATE POLICY "Enable write access for authenticated users" ON categories
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Notices: Allow read access for published notices, write access for authenticated users
CREATE POLICY "Enable read access for published notices" ON notices
  FOR SELECT
  USING (published = true);

CREATE POLICY "Enable write access for authenticated users" ON notices
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Re-enable RLS
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY; 