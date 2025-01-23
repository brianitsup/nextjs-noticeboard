-- Create test users with different roles
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@noticeboard.com', crypt('admin123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"],"role":"admin"}'::jsonb, '{"name":"Admin User"}'::jsonb),
  ('00000000-0000-0000-0000-000000000002', 'editor@noticeboard.com', crypt('editor123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"],"role":"editor"}'::jsonb, '{"name":"Editor User"}'::jsonb),
  ('00000000-0000-0000-0000-000000000003', 'moderator@noticeboard.com', crypt('moderator123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"],"role":"moderator"}'::jsonb, '{"name":"Moderator User"}'::jsonb),
  ('00000000-0000-0000-0000-000000000004', 'user@noticeboard.com', crypt('user123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"],"role":"user"}'::jsonb, '{"name":"Regular User"}'::jsonb);

-- Create test categories
INSERT INTO public.categories (id, name, slug, description, created_by)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Announcements', 'announcements', 'Official announcements and updates', '00000000-0000-0000-0000-000000000001'),
  ('22222222-2222-2222-2222-222222222222', 'Events', 'events', 'Upcoming events and activities', '00000000-0000-0000-0000-000000000001'),
  ('33333333-3333-3333-3333-333333333333', 'News', 'news', 'Latest news and updates', '00000000-0000-0000-0000-000000000001'),
  ('44444444-4444-4444-4444-444444444444', 'Community', 'community', 'Community discussions and updates', '00000000-0000-0000-0000-000000000001'),
  ('55555555-5555-5555-5555-555555555555', 'Resources', 'resources', 'Helpful resources and links', '00000000-0000-0000-0000-000000000001');

-- Create test notices with different statuses and priorities
INSERT INTO public.notices (
  title,
  content,
  priority,
  status,
  published_at,
  expires_at,
  category_id,
  created_by
)
SELECT
  CASE floor(random() * 5)
    WHEN 0 THEN 'Important Announcement'
    WHEN 1 THEN 'Upcoming Event'
    WHEN 2 THEN 'Breaking News'
    WHEN 3 THEN 'Community Update'
    ELSE 'Resource Share'
  END || ' #' || generate_series,
  CASE floor(random() * 5)
    WHEN 0 THEN 'This is an important announcement for all members.'
    WHEN 1 THEN 'Join us for this exciting upcoming event!'
    WHEN 2 THEN 'Breaking news that affects our community.'
    WHEN 3 THEN 'Latest updates from our community members.'
    ELSE 'Check out these helpful resources.'
  END || ' (Notice #' || generate_series || ')',
  CASE floor(random() * 3)
    WHEN 0 THEN 'low'
    WHEN 1 THEN 'medium'
    ELSE 'high'
  END,
  CASE floor(random() * 3)
    WHEN 0 THEN 'draft'
    WHEN 1 THEN 'published'
    ELSE 'archived'
  END,
  CASE floor(random() * 2)
    WHEN 0 THEN now()
    ELSE now() - interval '1 day' * floor(random() * 30)
  END,
  CASE floor(random() * 2)
    WHEN 0 THEN now() + interval '1 day' * floor(random() * 30)
    ELSE NULL
  END,
  (SELECT id FROM public.categories ORDER BY random() LIMIT 1),
  (SELECT id FROM auth.users ORDER BY random() LIMIT 1)
FROM generate_series(1, 50);

-- Create user profiles in public.users table
INSERT INTO public.users (id, role_id, display_name)
SELECT 
  id,
  CASE 
    WHEN raw_app_meta_data->>'role' = 'admin' THEN 1
    WHEN raw_app_meta_data->>'role' = 'editor' THEN 2
    WHEN raw_app_meta_data->>'role' = 'moderator' THEN 3
    ELSE 4
  END,
  raw_user_meta_data->>'name'
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET 
  role_id = EXCLUDED.role_id,
  display_name = EXCLUDED.display_name;