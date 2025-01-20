-- Drop the duplicate foreign key constraint
ALTER TABLE notices DROP CONSTRAINT IF EXISTS notices_category_id_fkey;

-- Keep only the fk_category constraint
ALTER TABLE notices DROP CONSTRAINT IF EXISTS fk_category;
ALTER TABLE notices ADD CONSTRAINT fk_category 
  FOREIGN KEY (category_id) 
  REFERENCES categories(id) 
  ON DELETE CASCADE; 