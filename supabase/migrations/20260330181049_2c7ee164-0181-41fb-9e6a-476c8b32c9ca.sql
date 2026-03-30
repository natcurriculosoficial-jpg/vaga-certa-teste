
-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table (core of the system)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT,
  city TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  situation TEXT,
  area TEXT,
  target_role TEXT,
  level TEXT,
  objective TEXT,
  onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.email, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Experiences table
CREATE TABLE public.experiences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT '',
  period TEXT,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own experiences" ON public.experiences FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_experiences_updated_at BEFORE UPDATE ON public.experiences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Education table
CREATE TABLE public.education (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institution TEXT NOT NULL DEFAULT '',
  course TEXT NOT NULL DEFAULT '',
  period TEXT,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own education" ON public.education FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_education_updated_at BEFORE UPDATE ON public.education FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Skills table
CREATE TABLE public.skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'hard',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own skills" ON public.skills FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Languages table
CREATE TABLE public.languages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'Básico',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own languages" ON public.languages FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Saved jobs table
CREATE TABLE public.saved_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL DEFAULT '',
  location TEXT,
  type TEXT,
  url TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'saved',
  notes TEXT,
  match_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own saved jobs" ON public.saved_jobs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_saved_jobs_updated_at BEFORE UPDATE ON public.saved_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Usage logs for monetization tracking
CREATE TABLE public.usage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own usage" ON public.usage_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own usage" ON public.usage_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_experiences_user ON public.experiences(user_id);
CREATE INDEX idx_education_user ON public.education(user_id);
CREATE INDEX idx_skills_user ON public.skills(user_id);
CREATE INDEX idx_languages_user ON public.languages(user_id);
CREATE INDEX idx_saved_jobs_user ON public.saved_jobs(user_id);
CREATE INDEX idx_saved_jobs_status ON public.saved_jobs(user_id, status);
CREATE INDEX idx_usage_logs_user ON public.usage_logs(user_id);
CREATE INDEX idx_usage_logs_action ON public.usage_logs(user_id, action, created_at);
