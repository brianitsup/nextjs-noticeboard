-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.notices CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;

-- Create the categories table
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  description text,
  icon text not null,
  created_at timestamp with time zone default now()
);

-- Insert default categories
INSERT INTO public.categories (name, description, icon)
VALUES
  ('announcement', 'Official announcements and notifications', 'Bell'),
  ('advertisement', 'Promotional content and advertisements', 'Megaphone'),
  ('promotion', 'Special offers and promotions', 'AlertCircle'),
  ('event', 'Upcoming events and gatherings', 'Calendar');

-- Create the notices table
create table public.notices (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  category_id uuid not null references public.categories(id),
  posted_by text not null,
  posted_at timestamp with time zone default now(),
  expires_at timestamp with time zone not null,
  priority text default 'medium',
  is_sponsored boolean default false,
  created_at timestamp with time zone default now()
);

-- Add some sample data
INSERT INTO public.notices (title, content, category_id, posted_by, expires_at, priority, is_sponsored)
VALUES
  ('Tech Conference 2024', 'Join us for the biggest tech conference of the year...', (SELECT id FROM categories WHERE name = 'event'), 'Tech Events Co.', '2024-05-15', 'high', false),
  ('Premium Office Space', 'Luxury office spaces in downtown area...', (SELECT id FROM categories WHERE name = 'advertisement'), 'Commercial Real Estate Co.', '2024-04-21', 'high', true),
  ('Community Meeting', 'Monthly community meeting this Saturday at the Town Hall.', (SELECT id FROM categories WHERE name = 'announcement'), 'Town Council', '2024-03-25', 'medium', false),
  ('Summer Music Festival', 'Three days of live music, food, and entertainment in the city park.', (SELECT id FROM categories WHERE name = 'event'), 'City Events Committee', '2024-07-01', 'medium', false),
  ('Designer Fashion Sale', 'Exclusive designer collections at special prices.', (SELECT id FROM categories WHERE name = 'advertisement'), 'Luxury Fashion House', '2024-04-25', 'high', true); 