-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON blog_posts;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON blog_posts;
DROP POLICY IF EXISTS "Enable update for post owners" ON blog_posts;
DROP POLICY IF EXISTS "Enable delete for post owners" ON blog_posts;
DROP POLICY IF EXISTS "Public can view published posts" ON blog_posts;
DROP POLICY IF EXISTS "Admin and editors can view all posts" ON blog_posts;
DROP POLICY IF EXISTS "Admin and editors can create posts" ON blog_posts;
DROP POLICY IF EXISTS "Admin and editors can update posts" ON blog_posts;
DROP POLICY IF EXISTS "Admin and editors can delete posts" ON blog_posts;

-- Create new policies
-- Allow public users to view published posts
CREATE POLICY "Public can view published posts" ON blog_posts
    FOR SELECT USING (published = true);

-- Allow admin, editor, and moderator to view all posts
CREATE POLICY "Staff can view all posts" ON blog_posts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND role IN ('admin', 'editor', 'moderator')
        )
    );

-- Allow post owners to view their own posts
CREATE POLICY "Users can view own posts" ON blog_posts
    FOR SELECT USING (auth.uid() = author_id);

-- Allow admin and editor to create posts
CREATE POLICY "Staff can create posts" ON blog_posts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND role IN ('admin', 'editor')
        )
    );

-- Allow post owners and admin/editor to update posts
CREATE POLICY "Staff and owners can update posts" ON blog_posts
    FOR UPDATE USING (
        auth.uid() = author_id OR
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND role IN ('admin', 'editor')
        )
    );

-- Allow post owners and admin/editor to delete posts
CREATE POLICY "Staff and owners can delete posts" ON blog_posts
    FOR DELETE USING (
        auth.uid() = author_id OR
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND role IN ('admin', 'editor')
        )
    ); 