-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    featured_image TEXT,
    meta_description TEXT,
    tags TEXT[]
);

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON blog_posts(slug);

-- Create index for published posts
CREATE INDEX IF NOT EXISTS blog_posts_published_idx ON blog_posts(published);

-- Enable Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON blog_posts;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON blog_posts;
DROP POLICY IF EXISTS "Enable update for post owners" ON blog_posts;
DROP POLICY IF EXISTS "Enable delete for post owners" ON blog_posts;

-- Create new policies
CREATE POLICY "Public can view published posts" ON blog_posts
    FOR SELECT USING (published = true);

CREATE POLICY "Admin and editors can view all posts" ON blog_posts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND role IN ('admin', 'editor', 'moderator')
        )
    );

CREATE POLICY "Admin and editors can create posts" ON blog_posts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Admin and editors can update posts" ON blog_posts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Admin and editors can delete posts" ON blog_posts
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND role IN ('admin', 'editor')
        )
    ); 