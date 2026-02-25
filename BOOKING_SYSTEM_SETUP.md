# 🎯 BOOKING SYSTEM - COMPLETE SETUP & IMPLEMENTATION GUIDE

## 1. DATABASE SETUP - SQL CODE (Run in Supabase SQL Editor)

```sql
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

-- 5. CREATE FUNCTION TO UPDATE TIMESTAMP
CREATE OR REPLACE FUNCTION update_bookings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. CREATE TRIGGER FOR AUTO TIMESTAMP UPDATE
CREATE TRIGGER bookings_update_timestamp
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_bookings_timestamp();
```

---

## 2. API ENDPOINTS CREATED

### ✅ `/api/create-booking` (POST)
**Creates a new booking request**
- **Body**: `{ tourist_id, guide_id, itinerary_id, booking_date, price, price_type }`
- **Returns**: Booking object with `status: 'pending'`

### ✅ `/api/get-tourist-bookings` (GET)
**Get all bookings for logged-in tourist**
- **Headers**: `Authorization: Bearer {token}`
- **Returns**: Array of tourist's bookings with guide & itinerary details

### ✅ `/api/get-guide-bookings` (GET)
**Get all pending booking requests for guide's itineraries**
- **Headers**: `Authorization: Bearer {token}`
- **Returns**: Array of pending bookings for the guide

### ✅ `/api/update-booking-status` (PATCH)
**Update booking status (Accept/Reject/Cancel/Complete)**
- **Body**: `{ booking_id, status }`
- **Valid statuses**: `accepted`, `rejected`, `cancelled`, `completed`
- **Returns**: Updated booking object

### ✅ `/api/get-admin-bookings` (GET)
**Admin view all bookings**
- **Headers**: `Authorization: Bearer {token}`
- **Query**: `?status=active|past|all`
- **Returns**: Array of bookings filtered by status

---

## 3. BOOKING STATUS FLOW

```
PENDING → ACCEPTED → COMPLETED → PAST
↓
REJECTED → (can be deleted)

CANCELLED (can happen at any stage)
```

---

## 4. TYPESCRIPT TYPE

```typescript
export type Booking = {
  id: string;
  tourist_id: string;
  guide_id: string;
  itinerary_id: string;
  booking_date: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed' | 'past';
  price: number;
  price_type: 'per_day' | 'per_trip';
  created_at: string;
  updated_at: string;
};
```

---

## 5. NEXT STEPS - FRONTEND IMPLEMENTATION

### Phase 1: Tourist Side
- [ ] Add "Book Guide" button on guide cards
- [ ] Create booking modal (date selection → itinerary selection → confirmation)
- [ ] Create "Booking Status" page in tourist sidebar
- [ ] Display all bookings with status badges

### Phase 2: Guide Side  
- [ ] Create "Booking Requests" section
- [ ] Create "Confirmed Bookings" section
- [ ] Create "Past Bookings" section
- [ ] Add Accept/Reject/Cancel buttons

### Phase 3: Admin Side
- [ ] Create "Active Bookings" section
- [ ] Create "Past Bookings" section
- [ ] Add booking details view

---

## 6. IMPORTANT NOTES

✅ **All RLS policies are set up** for security
✅ **Timestamps auto-update** on each change
✅ **Cascading deletes** maintain referential integrity
✅ **Indexes created** for fast queries
✅ **Status validation** prevents invalid states

---

## READY TO IMPLEMENT! 🚀
