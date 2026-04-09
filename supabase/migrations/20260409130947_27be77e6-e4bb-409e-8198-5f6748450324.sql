
INSERT INTO public.user_roles (user_id, role)
VALUES ('7c958787-bf53-4bf9-99d4-6d6bdb15f944', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
