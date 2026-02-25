-- ============================================================
-- TOURIST FEATURE DATABASE MIGRATION
-- GuideVerify Platform - February 24, 2026
-- ============================================================

-- 1. CREATE tourist_profiles TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS tourist_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  location VARCHAR(500) NOT NULL,
  profile_picture_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes for tourist_profiles
CREATE INDEX IF NOT EXISTS idx_tourist_profiles_user_id ON tourist_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_tourist_profiles_email ON tourist_profiles(email);

-- ============================================================
-- 2. ENABLE RLS ON tourist_profiles TABLE
-- ============================================================

ALTER TABLE tourist_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. CREATE RLS POLICIES FOR tourist_profiles
-- ============================================================

-- Tourists can read their own profile
CREATE POLICY "tourists_read_own"
  ON tourist_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can read all tourist profiles
CREATE POLICY "tourist_profiles_read_admin"
  ON tourist_profiles
  FOR SELECT
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Tourists can insert their own profile
CREATE POLICY "tourists_insert_own"
  ON tourist_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Tourists can update their own profile
CREATE POLICY "tourists_update_own"
  ON tourist_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 4. UPDATE users TABLE WITH TOURIST ROLE (if not already)
-- ============================================================

-- Note: The users table already has role with CHECK constraint
-- The role values are: 'admin', 'guide', 'tourist'
-- If you need to verify/update the constraint:

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('admin', 'guide', 'tourist'));

-- ============================================================
-- 5. CREATE TRIGGER TO AUTO-CREATE TOURIST PROFILE RECORD
-- ============================================================

-- When a tourist signs up, automatically create their profile
-- This will be handled during signup via API, but keeping trigger for safety

CREATE OR REPLACE FUNCTION public.handle_new_tourist()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create profile if the new users record has role = 'tourist'
  IF NEW.role = 'tourist' THEN
    INSERT INTO public.tourist_profiles (user_id, email)
    VALUES (NEW.id, NEW.email);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS on_new_tourist_user on public.users;

CREATE TRIGGER on_new_tourist_user
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_tourist();

-- ============================================================
-- 6. VERIFY SETUP
-- ============================================================

-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('tourist_profiles', 'users', 'guides');

-- Check tourist_profiles columns
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'tourist_profiles' 
ORDER BY ordinal_position;

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename = 'tourist_profiles';

-- ============================================================
-- NOTES:
-- ============================================================
-- 1. Run this migration in Supabase SQL Editor
-- 2. Create storage bucket: "tourist-profiles" (see storage setup)
-- 3. Tourist signup will:
--    - Create auth.users record
--    - Create users record with role = 'tourist'
--    - Upload profile picture to storage
--    - Create tourist_profiles record with photo URL
-- 4. No approval needed - tourists access dashboard immediately
-- 5. Storage bucket should allow public read, authenticated write
