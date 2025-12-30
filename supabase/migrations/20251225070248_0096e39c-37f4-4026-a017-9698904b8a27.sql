-- Create enum types for the application
CREATE TYPE public.mission_status AS ENUM ('pending', 'processing', 'completed');
CREATE TYPE public.disaster_type AS ENUM ('flood', 'earthquake', 'cyclone', 'fire', 'landslide', 'tsunami', 'other');
CREATE TYPE public.road_status AS ENUM ('blocked', 'partial', 'clear');
CREATE TYPE public.urgency_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.risk_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.app_role AS ENUM ('admin', 'operator');
CREATE TYPE public.file_type AS ENUM ('image', 'video');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'operator',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create missions table
CREATE TABLE public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status mission_status NOT NULL DEFAULT 'pending',
  disaster_type disaster_type NOT NULL,
  region TEXT NOT NULL,
  authority_lat DOUBLE PRECISION,
  authority_lon DOUBLE PRECISION,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create uploads table
CREATE TABLE public.uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  file_type file_type NOT NULL,
  storage_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vision_outputs table (filled by AI agents)
CREATE TABLE public.vision_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  road_id TEXT NOT NULL,
  status road_status NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL,
  confidence DOUBLE PRECISION DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create comms_outputs table (filled by AI agents)
CREATE TABLE public.comms_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  location_cluster TEXT NOT NULL,
  urgency urgency_level NOT NULL DEFAULT 'medium',
  people_estimated INTEGER DEFAULT 0,
  needs TEXT[] DEFAULT '{}',
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  confidence DOUBLE PRECISION DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create navigation_outputs table (filled by AI agents)
CREATE TABLE public.navigation_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  route_geojson JSONB DEFAULT '{}',
  eta_minutes INTEGER DEFAULT 0,
  risk_level risk_level NOT NULL DEFAULT 'low',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create explanations table (filled by AI agents)
CREATE TABLE public.explanations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  summary_text TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vision_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comms_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.explanations ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'operator');
  
  RETURN new;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for missions
CREATE POLICY "Users can create missions"
  ON public.missions FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view their own missions"
  ON public.missions FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can view all missions"
  ON public.missions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own missions"
  ON public.missions FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can update all missions"
  ON public.missions FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for uploads
CREATE POLICY "Users can create uploads for their missions"
  ON public.uploads FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.missions 
    WHERE id = mission_id AND created_by = auth.uid()
  ));

CREATE POLICY "Users can view uploads for their missions"
  ON public.uploads FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.missions 
    WHERE id = mission_id AND created_by = auth.uid()
  ));

CREATE POLICY "Admins can view all uploads"
  ON public.uploads FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for vision_outputs (read-only for users, AI writes via API)
CREATE POLICY "Users can view vision outputs for their missions"
  ON public.vision_outputs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.missions 
    WHERE id = mission_id AND created_by = auth.uid()
  ));

CREATE POLICY "Admins can view all vision outputs"
  ON public.vision_outputs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for comms_outputs
CREATE POLICY "Users can view comms outputs for their missions"
  ON public.comms_outputs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.missions 
    WHERE id = mission_id AND created_by = auth.uid()
  ));

CREATE POLICY "Admins can view all comms outputs"
  ON public.comms_outputs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for navigation_outputs
CREATE POLICY "Users can view navigation outputs for their missions"
  ON public.navigation_outputs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.missions 
    WHERE id = mission_id AND created_by = auth.uid()
  ));

CREATE POLICY "Admins can view all navigation outputs"
  ON public.navigation_outputs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for explanations
CREATE POLICY "Users can view explanations for their missions"
  ON public.explanations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.missions 
    WHERE id = mission_id AND created_by = auth.uid()
  ));

CREATE POLICY "Admins can view all explanations"
  ON public.explanations FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.missions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vision_outputs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comms_outputs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.navigation_outputs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.explanations;

-- Create storage bucket for mission files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('mission-files', 'mission-files', true);

-- Storage policies
CREATE POLICY "Authenticated users can upload files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'mission-files' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view mission files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'mission-files');

CREATE POLICY "Users can delete their own files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'mission-files' AND auth.uid()::text = (storage.foldername(name))[1]);