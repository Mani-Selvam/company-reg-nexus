-- Create enum types for dropdowns
CREATE TYPE public.company_type_enum AS ENUM ('contractor', 'builder', 'developer', 'supplier');
CREATE TYPE public.designation_enum AS ENUM ('owner', 'director', 'manager', 'engineer');
CREATE TYPE public.turnover_range_enum AS ENUM ('below_1cr', '1cr_to_10cr', '10cr_to_50cr', 'above_50cr');
CREATE TYPE public.user_role_enum AS ENUM ('admin', 'company_user');

-- Master tables for geographical data
CREATE TABLE public.countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country_id UUID REFERENCES public.countries(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, country_id)
);

CREATE TABLE public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  state_id UUID REFERENCES public.states(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, state_id)
);

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role_enum NOT NULL DEFAULT 'company_user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role_enum)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company_type company_type_enum NOT NULL,
  logo_url TEXT,
  contact_person TEXT NOT NULL,
  designation designation_enum NOT NULL,
  mobile TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  pincode TEXT NOT NULL,
  city_id UUID REFERENCES public.cities(id) NOT NULL,
  state_id UUID REFERENCES public.states(id) NOT NULL,
  country_id UUID REFERENCES public.countries(id) NOT NULL,
  num_employees INTEGER,
  avg_annual_turnover turnover_range_enum NOT NULL,
  year_established INTEGER,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  login_type TEXT NOT NULL DEFAULT 'manual' CHECK (login_type IN ('manual', 'google')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for countries, states, cities (read-only for all authenticated users)
CREATE POLICY "Countries are viewable by authenticated users"
ON public.countries FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "States are viewable by authenticated users"
ON public.states FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Cities are viewable by authenticated users"
ON public.cities FOR SELECT
TO authenticated
USING (true);

-- RLS Policies for companies
CREATE POLICY "Admins can view all companies"
ON public.companies FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Company users can view their own company"
ON public.companies FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT company_id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can insert companies"
ON public.companies FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update companies"
ON public.companies FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete companies"
ON public.companies FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile for new user
  INSERT INTO public.profiles (user_id, login_type)
  VALUES (
    NEW.id,
    CASE 
      WHEN NEW.raw_user_meta_data->>'provider' = 'google' THEN 'google'
      ELSE 'manual'
    END
  );
  RETURN NEW;
END;
$$;

-- Trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample geographical data
INSERT INTO public.countries (name, code) VALUES
  ('India', 'IN'),
  ('United States', 'US'),
  ('United Kingdom', 'GB');

INSERT INTO public.states (name, country_id) VALUES
  ('Maharashtra', (SELECT id FROM public.countries WHERE code = 'IN')),
  ('Karnataka', (SELECT id FROM public.countries WHERE code = 'IN')),
  ('Delhi', (SELECT id FROM public.countries WHERE code = 'IN')),
  ('Tamil Nadu', (SELECT id FROM public.countries WHERE code = 'IN'));

INSERT INTO public.cities (name, state_id) VALUES
  ('Mumbai', (SELECT id FROM public.states WHERE name = 'Maharashtra')),
  ('Pune', (SELECT id FROM public.states WHERE name = 'Maharashtra')),
  ('Bangalore', (SELECT id FROM public.states WHERE name = 'Karnataka')),
  ('New Delhi', (SELECT id FROM public.states WHERE name = 'Delhi')),
  ('Chennai', (SELECT id FROM public.states WHERE name = 'Tamil Nadu'));