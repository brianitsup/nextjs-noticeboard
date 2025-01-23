-- Create admin user
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
    '8149f235-d90f-4e34-bbae-c853c631092b',
    'authenticated',
    'admin',
    'admin@example.com',
    crypt('admin123!', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"], "role": "admin"}'::jsonb,
    '{"email": "admin@example.com", "email_verified": true}'::jsonb,
    now(),
    now(),
    encode(gen_random_bytes(32), 'base64'),
    'admin@example.com',
    encode(gen_random_bytes(32), 'base64'),
    encode(gen_random_bytes(32), 'base64')
);

-- Create entry in public.users
INSERT INTO public.users (id, role_id)
VALUES ('8149f235-d90f-4e34-bbae-c853c631092b', (SELECT id FROM public.roles WHERE name = 'admin')); 