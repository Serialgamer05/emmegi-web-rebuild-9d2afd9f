-- Assegna ruolo admin ai 3 utenti amministratori
INSERT INTO public.user_roles (user_id, role) VALUES 
  ('63949341-aad3-475b-95cb-aaeca297d061', 'admin'),  -- lucafinaldi3@gmail.com
  ('760baa7b-790f-4bb5-881d-28027c0791ba', 'admin'),  -- venturi2005@libero.it
  ('952e19e6-7d79-485a-bcf4-809c99236065', 'admin')   -- matvisio03@gmail.com
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';