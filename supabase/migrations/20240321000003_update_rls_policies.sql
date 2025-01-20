-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view notices" ON notices;
DROP POLICY IF EXISTS "Authenticated users can view categories" ON categories;

-- Create new policies for notices
CREATE POLICY "Public users can view published notices" ON notices
    FOR SELECT USING (
        published = true
        OR auth.role() = 'authenticated'
    );

CREATE POLICY "Public users can view categories" ON categories
    FOR SELECT USING (true);

-- Update the existing policies to be more specific
DROP POLICY IF EXISTS "Authenticated users can create notices" ON notices;
CREATE POLICY "Authenticated users can create notices" ON notices
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own notices or admin/moderator can update all" ON notices;
CREATE POLICY "Users can update their own notices or admin/moderator can update all" ON notices
    FOR UPDATE
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

DROP POLICY IF EXISTS "Users can delete their own notices or admin can delete all" ON notices;
CREATE POLICY "Users can delete their own notices or admin can delete all" ON notices
    FOR DELETE
    USING (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    ); 