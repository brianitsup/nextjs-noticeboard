-- Drop existing policies
DROP POLICY IF EXISTS "Public can view published posts" ON blog_posts;
DROP POLICY IF EXISTS "Staff can view all posts" ON blog_posts;
DROP POLICY IF EXISTS "Users can view own posts" ON blog_posts;
DROP POLICY IF EXISTS "Staff can create posts" ON blog_posts;
DROP POLICY IF EXISTS "Staff and owners can update posts" ON blog_posts;
DROP POLICY IF EXISTS "Staff and owners can delete posts" ON blog_posts;

-- Create new policies with simpler role checks
-- Allow public users to view published posts
CREATE POLICY "Public can view published posts" ON blog_posts
    FOR SELECT USING (published = true);

-- Allow admin, editor, and moderator to view all posts
CREATE POLICY "Staff can view all posts" ON blog_posts
    FOR SELECT USING (
        auth.jwt() ->> 'role' IN ('admin', 'editor', 'moderator')
    );

-- Allow post owners to view their own posts
CREATE POLICY "Users can view own posts" ON blog_posts
    FOR SELECT USING (auth.uid() = author_id);

-- Allow admin and editor to create posts
CREATE POLICY "Staff can create posts" ON blog_posts
    FOR INSERT WITH CHECK (
        auth.jwt() ->> 'role' IN ('admin', 'editor')
    );

-- Allow post owners and admin/editor to update posts
CREATE POLICY "Staff and owners can update posts" ON blog_posts
    FOR UPDATE USING (
        auth.uid() = author_id OR
        auth.jwt() ->> 'role' IN ('admin', 'editor')
    );

-- Allow post owners and admin/editor to delete posts
CREATE POLICY "Staff and owners can delete posts" ON blog_posts
    FOR DELETE USING (
        auth.uid() = author_id OR
        auth.jwt() ->> 'role' IN ('admin', 'editor')
    ); 