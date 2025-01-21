-- Drop existing tags column and recreate with proper constraints
ALTER TABLE blog_posts 
    DROP COLUMN IF EXISTS tags;

-- Recreate tags column with proper type and default
ALTER TABLE blog_posts 
    ADD COLUMN tags TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Create an index on tags for better performance
CREATE INDEX IF NOT EXISTS blog_posts_tags_idx ON blog_posts USING GIN (tags);

-- Add a check constraint to ensure tags are not null
ALTER TABLE blog_posts 
    ADD CONSTRAINT blog_posts_tags_not_null 
    CHECK (tags IS NOT NULL);

-- Function to clean tags array
CREATE OR REPLACE FUNCTION clean_tags_array()
RETURNS TRIGGER AS $$
BEGIN
    -- If tags is null, set it to empty array
    IF NEW.tags IS NULL THEN
        NEW.tags := ARRAY[]::TEXT[];
    END IF;
    
    -- Remove any empty strings or null values and trim whitespace
    NEW.tags := ARRAY(
        SELECT DISTINCT trim(tag)
        FROM unnest(NEW.tags) AS tag
        WHERE tag IS NOT NULL AND trim(tag) <> ''
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to clean tags before insert or update
DROP TRIGGER IF EXISTS clean_tags_trigger ON blog_posts;
CREATE TRIGGER clean_tags_trigger
    BEFORE INSERT OR UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION clean_tags_array(); 