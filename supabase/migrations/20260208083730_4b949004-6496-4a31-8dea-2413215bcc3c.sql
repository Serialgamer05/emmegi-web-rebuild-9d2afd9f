-- Add matviso03@gmail.com as admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('3e3c135c-8b6b-4435-8d61-7a47e2801d01', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';