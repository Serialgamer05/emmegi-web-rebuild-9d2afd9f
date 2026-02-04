-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create macchinari table for products
CREATE TABLE public.macchinari (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    descrizione TEXT,
    prezzo NUMERIC,
    foto_url TEXT,
    slug TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create user_sessions table for OTP
CREATE TABLE public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    otp_code TEXT,
    otp_type TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create admin_login_attempts table
CREATE TABLE public.admin_login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    attempt_count INTEGER DEFAULT 0,
    last_attempt TIMESTAMPTZ DEFAULT now(),
    is_locked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.macchinari ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for macchinari
CREATE POLICY "Anyone can view macchinari" ON public.macchinari FOR SELECT USING (true);
CREATE POLICY "Admins can insert macchinari" ON public.macchinari FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update macchinari" ON public.macchinari FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete macchinari" ON public.macchinari FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_sessions (service role only via edge functions)
CREATE POLICY "Service role access" ON public.user_sessions FOR ALL USING (true);

-- RLS Policies for admin_login_attempts
CREATE POLICY "Public access for login attempts" ON public.admin_login_attempts FOR ALL USING (true);

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true) ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Public read photos" ON storage.objects FOR SELECT USING (bucket_id = 'photos');
CREATE POLICY "Admins upload photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'photos');
CREATE POLICY "Admins update photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'photos');
CREATE POLICY "Admins delete photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'photos');

-- Insert sample macchinari data
INSERT INTO public.macchinari (nome, descrizione, prezzo, slug) VALUES
('Tornio CNC', 'Tornio a controllo numerico per lavorazioni di precisione', 45000, 'tornio-cnc'),
('Fresatrice Verticale', 'Fresatrice verticale industriale per metalli', 38000, 'fresatrice-verticale'),
('Pressa Idraulica 100T', 'Pressa idraulica da 100 tonnellate', 52000, 'pressa-idraulica-100t'),
('Saldatrice MIG/MAG', 'Saldatrice professionale MIG/MAG', 3500, 'saldatrice-mig-mag'),
('Centro di Lavoro 5 Assi', 'Centro di lavoro CNC a 5 assi', 120000, 'centro-lavoro-5-assi');