-- Completely disable RLS for all tables
ALTER TABLE notices DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "enable_categories_access" ON categories;
DROP POLICY IF EXISTS "enable_notices_access" ON notices;

-- Grant ALL permissions to anonymous users
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- Grant USAGE on public schema
GRANT USAGE ON SCHEMA public TO anon;

-- Grant access to future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON SEQUENCES TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON FUNCTIONS TO anon; 