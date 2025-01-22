-- Create a function to handle blog post creation with proper array handling
CREATE OR REPLACE FUNCTION create_blog_post(
    title text,                                    -- NOT NULL
    content text,                                  -- NOT NULL
    excerpt text,                                  -- NOT NULL
    slug text,                                     -- NOT NULL, UNIQUE
    published boolean DEFAULT false,               -- Match table default
    author_id uuid DEFAULT auth.uid(),            -- Default to current user
    created_at timestamptz DEFAULT TIMEZONE('utc'::text, NOW()),  -- Match table default
    updated_at timestamptz DEFAULT TIMEZONE('utc'::text, NOW()),  -- Match table default
    tags text[] DEFAULT '{}'::text[],
    featured_image text DEFAULT NULL,
    meta_description text DEFAULT NULL
) RETURNS SETOF blog_posts AS $$
DECLARE
    new_post blog_posts;
BEGIN
    -- Validate NOT NULL constraints
    IF title IS NULL OR content IS NULL OR excerpt IS NULL OR slug IS NULL THEN
        RAISE EXCEPTION 'title, content, excerpt, and slug cannot be null';
    END IF;

    -- Validate author_id exists in auth.users
    IF author_id IS NULL THEN
        RAISE EXCEPTION 'author_id cannot be null';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = author_id) THEN
        RAISE EXCEPTION 'author_id does not exist in auth.users';
    END IF;

    -- Validate slug uniqueness
    IF EXISTS (SELECT 1 FROM blog_posts WHERE slug = create_blog_post.slug) THEN
        RAISE EXCEPTION 'slug must be unique';
    END IF;

    INSERT INTO blog_posts (
        title,
        content,
        excerpt,
        slug,
        published,
        author_id,
        created_at,
        updated_at,
        tags,
        featured_image,
        meta_description
    ) VALUES (
        title,
        content,
        excerpt,
        slug,
        COALESCE(published, false),  -- Ensure default if NULL
        author_id,
        COALESCE(created_at, TIMEZONE('utc'::text, NOW())),  -- Ensure default if NULL
        COALESCE(updated_at, TIMEZONE('utc'::text, NOW())),  -- Ensure default if NULL
        tags,
        featured_image,
        meta_description
    )
    RETURNING * INTO new_post;

    RETURN NEXT new_post;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 