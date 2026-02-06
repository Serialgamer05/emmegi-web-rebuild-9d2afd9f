-- Delete sample machinery data
DELETE FROM public.macchinari WHERE nome IN ('Tornio CNC', 'Fresatrice Verticale', 'Pressa Idraulica 100T', 'Saldatrice MIG/MAG', 'Centro di Lavoro 5 Assi');

-- Ensure fixed admin emails have admin role assigned when they sign in
-- First, check if user_roles table has proper constraints
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_key;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_unique UNIQUE (user_id);

-- Update RLS policies for user_roles to allow reading own role
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
CREATE POLICY "Users can read own role" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Admins can manage roles
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));