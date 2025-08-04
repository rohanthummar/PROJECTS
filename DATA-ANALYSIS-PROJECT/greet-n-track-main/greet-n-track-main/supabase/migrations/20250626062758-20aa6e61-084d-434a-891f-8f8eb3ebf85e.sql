
-- Remove SMS-related columns and tables
ALTER TABLE public.profiles DROP COLUMN IF EXISTS sms_notifications;
DROP TABLE IF EXISTS public.sms_logs;

-- Add email notification preferences
ALTER TABLE public.profiles ADD COLUMN email_notifications boolean DEFAULT true;

-- Create table for email logs
CREATE TABLE public.email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  email_address TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on email_logs table
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for email_logs table
CREATE POLICY "Users can view their own email logs" 
  ON public.email_logs 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage email logs" 
  ON public.email_logs 
  FOR ALL 
  TO service_role;

-- Add index for better performance on email logs
CREATE INDEX idx_email_logs_user_id ON public.email_logs(user_id);
CREATE INDEX idx_email_logs_status ON public.email_logs(status);
