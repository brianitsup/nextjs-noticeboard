-- List all tables and their columns
SELECT 
    t.table_schema,
    t.table_name,
    c.column_name,
    c.data_type,
    c.column_default,
    c.is_nullable,
    c.character_maximum_length
FROM information_schema.tables t
JOIN information_schema.columns c 
    ON t.table_name = c.table_name 
    AND t.table_schema = c.table_schema
WHERE t.table_schema IN ('public', 'auth')
    AND t.table_type = 'BASE TABLE'
ORDER BY t.table_schema, t.table_name, c.ordinal_position;

-- List all constraints (primary keys, foreign keys, unique constraints)
SELECT
    tc.table_schema,
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
    AND tc.table_schema = ccu.table_schema
WHERE tc.table_schema IN ('public', 'auth')
ORDER BY tc.table_schema, tc.table_name, tc.constraint_name;

-- List all RLS policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname IN ('public', 'auth')
ORDER BY schemaname, tablename, policyname;

-- List tables with RLS status
SELECT 
    n.nspname as schema,
    c.relname as table_name,
    CASE WHEN c.relrowsecurity THEN 'enabled' ELSE 'disabled' END as rls_enabled,
    CASE WHEN c.relforcerowsecurity THEN 'enabled' ELSE 'disabled' END as rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname IN ('public', 'auth')
    AND c.relkind = 'r'
ORDER BY n.nspname, c.relname;

-- List table privileges
SELECT 
    table_schema,
    table_name,
    grantee, 
    string_agg(privilege_type, ', ') as privileges
FROM information_schema.role_table_grants 
WHERE table_schema IN ('public', 'auth')
GROUP BY table_schema, table_name, grantee
ORDER BY table_schema, table_name, grantee;

-- List indexes
SELECT
    schemaname as schema,
    tablename as table_name,
    indexname as index_name,
    indexdef as index_definition
FROM pg_indexes
WHERE schemaname IN ('public', 'auth')
ORDER BY schemaname, tablename, indexname;

-- List enum types
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname IN ('public', 'auth')
ORDER BY t.typname, e.enumsortorder;

-- List triggers
SELECT 
    event_object_schema as schema,
    event_object_table as table_name,
    trigger_name,
    event_manipulation as trigger_event,
    action_timing as trigger_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema IN ('public', 'auth')
ORDER BY event_object_schema, event_object_table, trigger_name; 