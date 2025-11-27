-- Create role enum
CREATE TYPE public.app_role AS ENUM ('user', 'admin');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check if user has a role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
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

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create project_of_the_week table
CREATE TABLE public.project_of_the_week (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  selected_by UUID REFERENCES auth.users(id) NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  message_for_winner TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (week_start, week_end)
);

-- Enable RLS on project_of_the_week
ALTER TABLE public.project_of_the_week ENABLE ROW LEVEL SECURITY;

-- RLS policies for project_of_the_week
CREATE POLICY "Anyone can view project of the week"
  ON public.project_of_the_week
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert project of the week"
  ON public.project_of_the_week
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Function to get current week's Monday
CREATE OR REPLACE FUNCTION public.get_week_start()
RETURNS DATE
LANGUAGE SQL
STABLE
AS $$
  SELECT CURRENT_DATE - (EXTRACT(DOW FROM CURRENT_DATE)::INTEGER - 1);
$$;

-- Function to get current week's Sunday
CREATE OR REPLACE FUNCTION public.get_week_end()
RETURNS DATE
LANGUAGE SQL
STABLE
AS $$
  SELECT CURRENT_DATE + (7 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER);
$$;