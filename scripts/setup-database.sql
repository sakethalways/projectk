-- CORRECT DATABASE SETUP
-- Create guides table
CREATE TABLE IF NOT EXISTS guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  location VARCHAR(500) NOT NULL,
  profile_picture_url VARCHAR(500),
  document_url VARCHAR(500),
  document_type VARCHAR(50) CHECK (document_type IN ('aadhar', 'driving_licence')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  is_deactivated BOOLEAN DEFAULT false,
  deactivation_reason TEXT,
  is_resubmitted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create users table to store role information
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) DEFAULT 'guide' CHECK (role IN ('admin', 'guide', 'tourist')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create guide_availability table
CREATE TABLE IF NOT EXISTS guide_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create guide_itineraries table
CREATE TABLE IF NOT EXISTS guide_itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  number_of_days INTEGER NOT NULL,
  timings VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  places_to_visit TEXT NOT NULL,
  instructions TEXT,
  image_1_url VARCHAR(500),
  image_2_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_guides_user_id ON guides(user_id);
CREATE INDEX IF NOT EXISTS idx_guides_status ON guides(status);
CREATE INDEX IF NOT EXISTS idx_guides_email ON guides(email);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_guide_availability_guide_id ON guide_availability(guide_id);
CREATE INDEX IF NOT EXISTS idx_guide_availability_user_id ON guide_availability(user_id);
CREATE INDEX IF NOT EXISTS idx_guide_itineraries_guide_id ON guide_itineraries(guide_id);

-- Enable RLS on tables
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_itineraries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for guides table
CREATE POLICY "guides_read_authenticated"
  ON guides
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "guides_insert_own"
  ON guides
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "guides_update_admin"
  ON guides
  FOR UPDATE
  USING (
    auth.uid() = user_id OR 
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- RLS Policies for users table
CREATE POLICY "users_read_own"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_read_all_authenticated"
  ON users
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "users_insert_own"
  ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for guide_availability table
CREATE POLICY "guide_availability_read_public"
  ON guide_availability
  FOR SELECT
  USING (true);

CREATE POLICY "guide_availability_insert_own"
  ON guide_availability
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "guide_availability_update_own"
  ON guide_availability
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "guide_availability_delete_own"
  ON guide_availability
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for guide_itineraries table
CREATE POLICY "guide_itineraries_read_all"
  ON guide_itineraries
  FOR SELECT
  USING (true);

CREATE POLICY "guide_itineraries_insert_own"
  ON guide_itineraries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "guide_itineraries_update_own"
  ON guide_itineraries
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "guide_itineraries_delete_own"
  ON guide_itineraries
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically create user record when auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'guide');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to call function on auth.users insert
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
