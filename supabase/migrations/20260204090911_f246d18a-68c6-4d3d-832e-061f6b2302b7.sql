-- Drop permissive policies
DROP POLICY IF EXISTS "Service role access" ON public.user_sessions;
DROP POLICY IF EXISTS "Public access for login attempts" ON public.admin_login_attempts;

-- More restrictive policies for user_sessions (read-only for anon, write via service role)
CREATE POLICY "Anon can read sessions" ON public.user_sessions FOR SELECT TO anon USING (true);

-- More restrictive policies for admin_login_attempts  
CREATE POLICY "Anon can read attempts" ON public.admin_login_attempts FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert attempts" ON public.admin_login_attempts FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update attempts" ON public.admin_login_attempts FOR UPDATE TO anon USING (true);