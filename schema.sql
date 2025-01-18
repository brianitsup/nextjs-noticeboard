-- Create the notices table
create table public.notices (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  category text not null,
  posted_by text not null,
  posted_at timestamp with time zone default now(),
  expires_at timestamp with time zone not null,
  priority text default 'medium',
  is_sponsored boolean default false,
  created_at timestamp with time zone default now()
);

-- Add some sample data
INSERT INTO public.notices (title, content, category, posted_by, expires_at, priority, is_sponsored)
VALUES
  ('Tech Conference 2024', 'Join us for the biggest tech conference of the year...', 'event', 'Tech Events Co.', '2024-05-15', 'high', false),
  ('Premium Office Space', 'Luxury office spaces in downtown area...', 'advertisement', 'Commercial Real Estate Co.', '2024-04-21', 'high', true),
  ('Community Meeting', 'Monthly community meeting this Saturday at the Town Hall.', 'announcement', 'Town Council', '2024-03-25', 'medium', false),
  ('Summer Music Festival', 'Three days of live music, food, and entertainment in the city park.', 'event', 'City Events Committee', '2024-07-01', 'medium', false),
  ('Designer Fashion Sale', 'Exclusive designer collections at special prices.', 'advertisement', 'Luxury Fashion House', '2024-04-25', 'high', true); 