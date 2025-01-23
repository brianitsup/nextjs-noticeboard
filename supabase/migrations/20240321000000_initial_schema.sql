-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the categories table first
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the roles table
CREATE TABLE public.roles (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default roles
INSERT INTO public.roles (name, description) VALUES
    ('admin', 'Administrator with full access'),
    ('editor', 'Editor with content management access'),
    ('moderator', 'Moderator with limited access'),
    ('user', 'Regular user with basic access')
ON CONFLICT (name) DO UPDATE 
SET description = EXCLUDED.description;

-- Create users table
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    role_id INTEGER REFERENCES public.roles(id),
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create blog_posts table
CREATE TABLE public.blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT,
    excerpt TEXT,
    published BOOLEAN DEFAULT false,
    author_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notices table
CREATE TABLE public.notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    category_id UUID REFERENCES public.categories(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add created_by to categories
ALTER TABLE public.categories
ADD COLUMN created_by UUID REFERENCES auth.users(id);

-- Create function to automatically set updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at triggers
CREATE TRIGGER set_updated_at_categories
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_blog_posts
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_notices
    BEFORE UPDATE ON public.notices
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- Function to sync user role with auth.users
CREATE OR REPLACE FUNCTION public.sync_user_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the role_id in public.users based on the role in auth.users
    UPDATE public.users
    SET role_id = (SELECT id FROM public.roles WHERE name = NEW.role)
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for role synchronization
DROP TRIGGER IF EXISTS on_auth_user_role_change ON auth.users;
CREATE TRIGGER on_auth_user_role_change
    AFTER INSERT OR UPDATE OF role ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_role();

-- Function to check user role access
CREATE OR REPLACE FUNCTION public.check_user_role_access(user_id UUID)
RETURNS TABLE (
    role VARCHAR(255),
    is_admin BOOLEAN,
    has_admin_access BOOLEAN
) 
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.role::VARCHAR(255),
        CASE WHEN u.role = 'admin' THEN true ELSE false END as is_admin,
        CASE WHEN u.role IN ('admin', 'editor', 'moderator') THEN true ELSE false END as has_admin_access
    FROM auth.users u
    WHERE u.id = user_id;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON public.roles TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_role_access(UUID) TO authenticated;

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
DROP POLICY IF EXISTS "Users can read all categories" ON public.categories;
CREATE POLICY "Anyone can read categories"
    ON public.categories FOR SELECT
    USING (true);

CREATE POLICY "Admin users can manage categories"
    ON public.categories FOR ALL
    TO authenticated
    USING (auth.uid() IN (
        SELECT id FROM auth.users WHERE role IN ('admin', 'editor')
    ));

CREATE POLICY "Users can read published blog posts"
    ON public.blog_posts FOR SELECT
    TO authenticated
    USING (published = true OR auth.uid() = author_id);

CREATE POLICY "Admin users can manage blog posts"
    ON public.blog_posts FOR ALL
    TO authenticated
    USING (auth.uid() IN (
        SELECT id FROM auth.users WHERE role IN ('admin', 'editor')
    ));

CREATE POLICY "Users can read published notices"
    ON public.notices FOR SELECT
    TO authenticated
    USING (status = 'published' OR auth.uid() = created_by);

CREATE POLICY "Admin users can manage notices"
    ON public.notices FOR ALL
    TO authenticated
    USING (auth.uid() IN (
        SELECT id FROM auth.users WHERE role IN ('admin', 'editor', 'moderator')
    ));

-- Add function to create admin user
CREATE OR REPLACE FUNCTION auth.create_admin_user(
    admin_email TEXT,
    admin_password TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Create the user
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    )
    VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'admin',
        admin_email,
        crypt(admin_password, gen_salt('bf')),
        now(),
        '{"provider": "email", "providers": ["email"], "role": "admin"}'::jsonb,
        '{"email": "' || admin_email || '", "email_verified": true}'::jsonb,
        now(),
        now(),
        encode(gen_random_bytes(32), 'base64'),
        admin_email,
        encode(gen_random_bytes(32), 'base64'),
        encode(gen_random_bytes(32), 'base64')
    )
    RETURNING id INTO user_id;

    -- Create entry in public.users
    INSERT INTO public.users (id, role_id)
    VALUES (user_id, (SELECT id FROM public.roles WHERE name = 'admin'));

    RETURN user_id;
END;
$$;

-- Grant execute permission to service_role
GRANT EXECUTE ON FUNCTION auth.create_admin_user TO service_role; 