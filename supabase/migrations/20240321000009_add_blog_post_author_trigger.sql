-- Function to set author_id from auth.uid()
CREATE OR REPLACE FUNCTION set_author_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.author_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically set author_id on insert
DROP TRIGGER IF EXISTS set_author_id_on_blog_posts ON blog_posts;
CREATE TRIGGER set_author_id_on_blog_posts
  BEFORE INSERT ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION set_author_id(); 