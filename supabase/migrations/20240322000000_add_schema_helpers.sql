-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_schema_info();

-- Create a function to get schema information
CREATE OR REPLACE FUNCTION get_schema_info()
RETURNS TABLE (
    table_name information_schema.sql_identifier,
    column_info jsonb,
    constraints jsonb,
    policies jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH table_columns AS (
        SELECT 
            t.table_name,
            jsonb_agg(
                jsonb_build_object(
                    'column_name', c.column_name,
                    'data_type', c.data_type,
                    'is_nullable', c.is_nullable,
                    'column_default', c.column_default
                )
            ) as columns
        FROM information_schema.tables t
        JOIN information_schema.columns c ON t.table_name = c.table_name
        WHERE t.table_schema = 'public'
        AND t.table_type = 'BASE TABLE'
        GROUP BY t.table_name
    ),
    table_constraints AS (
        SELECT 
            tc.table_name,
            jsonb_agg(
                jsonb_build_object(
                    'constraint_name', tc.constraint_name,
                    'constraint_type', tc.constraint_type
                )
            ) as constraints
        FROM information_schema.table_constraints tc
        WHERE tc.table_schema = 'public'
        GROUP BY tc.table_name
    ),
    table_policies AS (
        SELECT 
            tablename as table_name,
            jsonb_agg(
                jsonb_build_object(
                    'policyname', policyname,
                    'cmd', cmd,
                    'roles', roles,
                    'qual', qual,
                    'with_check', with_check
                )
            ) as policies
        FROM pg_policies
        WHERE schemaname = 'public'
        GROUP BY tablename
    )
    SELECT 
        tc.table_name,
        tc.columns as column_info,
        COALESCE(tcon.constraints, '[]'::jsonb) as constraints,
        COALESCE(tp.policies, '[]'::jsonb) as policies
    FROM table_columns tc
    LEFT JOIN table_constraints tcon ON tc.table_name = tcon.table_name
    LEFT JOIN table_policies tp ON tc.table_name = tp.table_name;
END;
$$; 