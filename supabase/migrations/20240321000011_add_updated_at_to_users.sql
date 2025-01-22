-- Add updated_at column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Update existing rows to set updated_at
UPDATE public.users 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- Make updated_at not nullable
ALTER TABLE public.users 
ALTER COLUMN updated_at SET NOT NULL; 