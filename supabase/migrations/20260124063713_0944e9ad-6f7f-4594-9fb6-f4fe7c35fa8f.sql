-- Add otp_type column to user_sessions table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'user_sessions' 
                 AND column_name = 'otp_type') THEN
    ALTER TABLE public.user_sessions ADD COLUMN otp_type TEXT DEFAULT 'verification';
  END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_sessions_email_otp ON public.user_sessions(email, otp_code);