-- Add created_by column to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Add created_by column to notices table (different from posted_by which is a text field)
ALTER TABLE notices 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Update existing records to have the first admin user as creator
WITH first_admin AS (
  SELECT id FROM auth.users WHERE role = 'admin' LIMIT 1
)
UPDATE categories
SET created_by = (SELECT id FROM first_admin)
WHERE created_by IS NULL;

WITH first_admin AS (
  SELECT id FROM auth.users WHERE role = 'admin' LIMIT 1
)
UPDATE notices
SET created_by = (SELECT id FROM first_admin)
WHERE created_by IS NULL;

-- Make the columns required after setting default values
ALTER TABLE categories
ALTER COLUMN created_by SET NOT NULL;

ALTER TABLE notices
ALTER COLUMN created_by SET NOT NULL;

-- Enable RLS on both tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- Policies for categories

-- View policies (all authenticated users can view)
CREATE POLICY "Authenticated users can view categories"
ON categories FOR SELECT
USING (auth.role() = 'authenticated');

-- Create policies (admin and editor can create)
CREATE POLICY "Admins and editors can create categories"
ON categories FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND role IN ('admin', 'editor')
  )
);

-- Update policies (admin and editor can update their own, admin can update all)
CREATE POLICY "Users can update their own categories or admin can update all"
ON categories FOR UPDATE
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
)
WITH CHECK (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Delete policies (only admin can delete)
CREATE POLICY "Only admins can delete categories"
ON categories FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Policies for notices

-- View policies (all authenticated users can view)
CREATE POLICY "Authenticated users can view notices"
ON notices FOR SELECT
USING (auth.role() = 'authenticated');

-- Create policies (all authenticated users can create)
CREATE POLICY "Authenticated users can create notices"
ON notices FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Update policies (users can update their own, admin and moderator can update all)
CREATE POLICY "Users can update their own notices or admin/moderator can update all"
ON notices FOR UPDATE
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND role IN ('admin', 'moderator')
  )
)
WITH CHECK (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND role IN ('admin', 'moderator')
  )
);

-- Delete policies (users can delete their own, admin can delete all)
CREATE POLICY "Users can delete their own notices or admin can delete all"
ON notices FOR DELETE
USING (
  created_by = auth.uid()
  OR EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Add triggers to automatically set created_by
CREATE OR REPLACE FUNCTION public.set_created_by()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_created_by_on_categories
  BEFORE INSERT ON categories
  FOR EACH ROW
  EXECUTE FUNCTION public.set_created_by();

CREATE TRIGGER set_created_by_on_notices
  BEFORE INSERT ON notices
  FOR EACH ROW
  EXECUTE FUNCTION public.set_created_by(); 