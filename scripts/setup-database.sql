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
  trips_completed INTEGER DEFAULT 0,
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

-- Create saved_guides table
CREATE TABLE IF NOT EXISTS saved_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tourist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guide_id UUID NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(tourist_id, guide_id)
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
  tourist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  itinerary_id UUID NOT NULL REFERENCES guide_itineraries(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  number_of_days INTEGER NOT NULL,
  total_price DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create ratings_reviews table
CREATE TABLE IF NOT EXISTS ratings_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  tourist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guide_id UUID NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(booking_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'guide_approved',
    'guide_rejected',
    'guide_deactivated',
    'guide_reactivated',
    'guide_deleted',
    'guide_saved',
    'guide_unsaved',
    'booking_created',
    'booking_confirmed',
    'booking_completed',
    'booking_cancelled',
    'rating_received',
    'review_posted',
    'review_deleted',
    'trip_completed',
    'tourist_login',
    'message',
    'admin_action',
    'custom'
  )),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT NULL,
  related_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  related_guide_id UUID REFERENCES guides(id) ON DELETE SET NULL,
  related_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
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
CREATE INDEX IF NOT EXISTS idx_saved_guides_tourist_id ON saved_guides(tourist_id);
CREATE INDEX IF NOT EXISTS idx_saved_guides_guide_id ON saved_guides(guide_id);
CREATE INDEX IF NOT EXISTS idx_saved_guides_tourist_guide ON saved_guides(tourist_id, guide_id);
CREATE INDEX IF NOT EXISTS idx_bookings_guide_id ON bookings(guide_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tourist_id ON bookings(tourist_id);
CREATE INDEX IF NOT EXISTS idx_bookings_itinerary_id ON bookings(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_ratings_reviews_booking_id ON ratings_reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_ratings_reviews_tourist_id ON ratings_reviews(tourist_id);
CREATE INDEX IF NOT EXISTS idx_ratings_reviews_guide_id ON ratings_reviews(guide_id);
CREATE INDEX IF NOT EXISTS idx_ratings_reviews_tourist_guide ON ratings_reviews(tourist_id, guide_id);

-- Indexes for notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_related_guide_id ON notifications(related_guide_id);
CREATE INDEX IF NOT EXISTS idx_notifications_related_booking_id ON notifications(related_booking_id);

-- Enable RLS on tables
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

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

-- RLS Policies for saved_guides table
CREATE POLICY "saved_guides_read_own"
  ON saved_guides
  FOR SELECT
  USING (auth.uid() = tourist_id);

CREATE POLICY "saved_guides_insert_own"
  ON saved_guides
  FOR INSERT
  WITH CHECK (auth.uid() = tourist_id);

CREATE POLICY "saved_guides_delete_own"
  ON saved_guides
  FOR DELETE
  USING (auth.uid() = tourist_id);

-- RLS Policies for bookings table
CREATE POLICY "bookings_read_own"
  ON bookings
  FOR SELECT
  USING (auth.uid() = guide_id OR auth.uid() = tourist_id);

CREATE POLICY "bookings_insert_tourist"
  ON bookings
  FOR INSERT
  WITH CHECK (auth.uid() = tourist_id);

CREATE POLICY "bookings_update_guide_or_tourist"
  ON bookings
  FOR UPDATE
  USING (auth.uid() = guide_id OR auth.uid() = tourist_id);

CREATE POLICY "bookings_delete_admin"
  ON bookings
  FOR DELETE
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- RLS Policies for ratings_reviews table
CREATE POLICY "ratings_reviews_read_all"
  ON ratings_reviews
  FOR SELECT
  USING (true);

CREATE POLICY "ratings_reviews_insert_tourist"
  ON ratings_reviews
  FOR INSERT
  WITH CHECK (auth.uid() = tourist_id);

CREATE POLICY "ratings_reviews_update_tourist"
  ON ratings_reviews
  FOR UPDATE
  USING (auth.uid() = tourist_id);

CREATE POLICY "ratings_reviews_delete_tourist_or_admin"
  ON ratings_reviews
  FOR DELETE
  USING (
    auth.uid() = tourist_id OR 
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- RLS Policies for notifications table
CREATE POLICY "notifications_read_own"
  ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_insert_service"
  ON notifications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "notifications_update_own"
  ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_delete_own"
  ON notifications
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
