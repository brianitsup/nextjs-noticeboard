-- First, disable RLS
ALTER TABLE notices DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies and functions
DROP POLICY IF EXISTS "categories_select_policy" ON categories;
DROP POLICY IF EXISTS "categories_all_admin_policy" ON categories;
DROP POLICY IF EXISTS "notices_select_policy" ON notices;
DROP POLICY IF EXISTS "notices_all_admin_policy" ON notices;
DROP FUNCTION IF EXISTS auth.check_user_role(text[]);

-- Create a simpler function to check user access
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
    AND role IN ('admin', 'editor', 'moderator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Simple Categories Policies

-- Anyone can read categories
CREATE POLICY "allow_public_read_categories"
ON categories FOR SELECT
USING (true);

-- Only admin users can modify categories
CREATE POLICY "allow_admin_modify_categories"
ON categories FOR INSERT
WITH CHECK (public.is_admin_user());

CREATE POLICY "allow_admin_update_categories"
ON categories FOR UPDATE
USING (public.is_admin_user());

CREATE POLICY "allow_admin_delete_categories"
ON categories FOR DELETE
USING (public.is_admin_user());

-- Simple Notices Policies

-- Public can read published notices
CREATE POLICY "allow_public_read_notices"
ON notices FOR SELECT
USING (published = true OR public.is_admin_user());

-- Only admin users can modify notices
CREATE POLICY "allow_admin_modify_notices"
ON notices FOR INSERT
WITH CHECK (public.is_admin_user());

CREATE POLICY "allow_admin_update_notices"
ON notices FOR UPDATE
USING (public.is_admin_user());

CREATE POLICY "allow_admin_delete_notices"
ON notices FOR DELETE
USING (public.is_admin_user());

-- Re-enable RLS
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Grant basic permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant table permissions
GRANT SELECT ON public.notices TO anon;
GRANT SELECT ON public.categories TO anon;
GRANT ALL ON public.notices TO authenticated;
GRANT ALL ON public.categories TO authenticated;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION public.is_admin_user TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin_user TO authenticated; 