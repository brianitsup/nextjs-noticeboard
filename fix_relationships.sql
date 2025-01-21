-- Check and fix relationships
SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notices');
SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'categories');
ALTER TABLE IF EXISTS notices DROP CONSTRAINT IF EXISTS fk_category;
ALTER TABLE notices ADD CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE;
