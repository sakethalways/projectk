-- ====================================
-- BOOKING SYSTEM - COMPLETE SQL SCHEMA
-- ====================================

-- 1. CREATE BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tourist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guide_id UUID NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
  itinerary_id UUID NOT NULL REFERENCES guide_itineraries(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled', 'completed', 'past')),
  price INTEGER NOT NULL,
  price_type VARCHAR(20) NOT NULL CHECK (price_type IN ('per_day', 'per_trip')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_bookings_tourist_id ON bookings(tourist_id);
CREATE INDEX IF NOT EXISTS idx_bookings_guide_id ON bookings(guide_id);
CREATE INDEX IF NOT EXISTS idx_bookings_itinerary_id ON bookings(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);

-- 3. ENABLE ROW LEVEL SECURITY
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES FOR BOOKINGS TABLE

-- Policy: Tourists can view their own bookings
CREATE POLICY "bookings_view_own"
  ON bookings
  FOR SELECT
  USING (auth.uid() = tourist_id);

-- Policy: Guides can view bookings for their itineraries
CREATE POLICY "bookings_guide_view_own"
  ON bookings
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM guides WHERE id = bookings.guide_id
    )
  );

-- Policy: Admins can view all bookings
CREATE POLICY "bookings_admin_view_all"
  ON bookings
  FOR SELECT
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Policy: Tourists can create bookings
CREATE POLICY "bookings_tourist_create"
  ON bookings
  FOR INSERT
  WITH CHECK (auth.uid() = tourist_id);

-- Policy: Guides can update bookings (status changes)
CREATE POLICY "bookings_guide_update"
  ON bookings
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM guides WHERE id = bookings.guide_id
    )
  );

-- Policy: Tourists can update THEIR bookings (cancel/delete rejected)
CREATE POLICY "bookings_tourist_update"
  ON bookings
  FOR UPDATE
  USING (auth.uid() = tourist_id);

-- Policy: Tourists can delete rejected/cancelled bookings
CREATE POLICY "bookings_tourist_delete"
  ON bookings
  FOR DELETE
  USING (
    auth.uid() = tourist_id AND 
    status IN ('rejected', 'cancelled')
  );

-- 5. CREATE FUNCTION TO AUTO UPDATE PAST BOOKINGS
CREATE OR REPLACE FUNCTION update_past_bookings()
RETURNS void AS $$
BEGIN
  UPDATE bookings
  SET status = 'past'
  WHERE status = 'completed' 
  AND booking_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- 6. CREATE FUNCTION TO UPDATE TIMESTAMP
CREATE OR REPLACE FUNCTION update_bookings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. CREATE TRIGGER FOR AUTO TIMESTAMP UPDATE
CREATE TRIGGER bookings_update_timestamp
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_bookings_timestamp();
