UPDATE auth.users SET role = 'admin', raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb WHERE id = '8149f235-d90f-4e34-bbae-c853c631092b';
