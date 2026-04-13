CREATE TYPE public.application_status AS ENUM ('Applied', 'Interviewing', 'Offer', 'Rejected');

CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  status public.application_status NOT NULL DEFAULT 'Applied',
  date_applied DATE NOT NULL DEFAULT CURRENT_DATE,
  job_link TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own applications"
  ON public.applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applications"
  ON public.applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications"
  ON public.applications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own applications"
  ON public.applications FOR DELETE
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO storage.buckets (id, name, public)
VALUES ('application-images', 'application-images', true);

CREATE POLICY "Anyone can view application images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'application-images');

CREATE POLICY "Authenticated users can upload application images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'application-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own application images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'application-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own application images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'application-images' AND auth.uid()::text = (storage.foldername(name))[1]);