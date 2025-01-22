-- Function to get policy information
CREATE OR REPLACE FUNCTION get_policies_info(target_table text)
RETURNS TABLE (
    policy_name text,
    table_name text,
    command text,
    roles text[],
    using_expr text,
    with_check_expr text,
    permissive text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.policyname::text,
        p.tablename::text,
        p.cmd::text,
        p.roles::text[],
        p.qual::text,
        p.with_check::text,
        p.permissive::text
    FROM pg_policies p
    WHERE p.schemaname = 'public'
    AND p.tablename = target_table;
END;
$$; 