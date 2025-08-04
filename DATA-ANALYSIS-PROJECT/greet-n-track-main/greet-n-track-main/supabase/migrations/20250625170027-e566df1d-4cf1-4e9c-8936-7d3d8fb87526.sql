
-- Add SMS notification preferences to profiles table
ALTER TABLE public.profiles ADD COLUMN sms_notifications boolean DEFAULT true;

-- Create table for SMS logs
CREATE TABLE public.sms_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  phone_number TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on sms_logs table
ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for sms_logs table
CREATE POLICY "Users can view their own SMS logs" 
  ON public.sms_logs 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage SMS logs" 
  ON public.sms_logs 
  FOR ALL 
  TO service_role;

-- Add index for better performance on SMS logs
CREATE INDEX idx_sms_logs_user_id ON public.sms_logs(user_id);
CREATE INDEX idx_sms_logs_status ON public.sms_logs(status);
