# Quick Start Guide - 5 Minutes

Get GuideVerify running in **5 minutes** with this step-by-step guide.

---

## Prerequisites

- Node.js 18+
- pnpm (install via `npm install -g pnpm`)
- Supabase account (free at supabase.com)
- 5 minutes

---

## Step 1: Supabase Setup (2 min)

### 1.1 Create Supabase Project
1. Go to https://supabase.com
2. Sign up / log in
3. Click "New Project"
4. Fill in project name, password, region
5. Wait for project creation (~2 min)

### 1.2 Get API Credentials
1. Go to **Settings** > **API**
2. Copy and save these three values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role** key → `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 2: Create Storage Buckets (1 min)

1. Go to **Storage** in Supabase sidebar
2. Click **Create a new bucket**
3. Name: `profile-pictures` → Make it **Public** ✓
4. Click **Create bucket**
5. Repeat:
   - Name: `documents` → Make it **Public** ✓

✅ You now have 2 storage buckets

---

## Step 3: Database Setup (1 min)

1. Go to **SQL Editor** in Supabase
2. Click **New Query**
3. Copy entire content from `scripts/setup-database.sql`
4. Paste into editor
5. Click **Run**
6. ✅ All 8 tables created with indexes and RLS policies

**If uuid-ossp extension error:**
- Go to **Extensions** in sidebar
- Search "uuid-ossp"
- Click it to enable
- Try running SQL again

---

## Step 4: Create Admin Account (1 min)

1. Go to **Authentication** in Supabase
2. Click **Users** (top tab)
3. Click **Add user**
4. Email: `admin@example.com`
5. Password: `Admin@123456` (for testing)
6. Click **Save**
7. ✅ Admin account created

---

## Step 5: Configure Environment (1 min)

1. Clone/open this project
2. In project root, create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Save file

---

## Step 6: Start Application (1 min)

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

✅ Application running at http://localhost:3000

---

## 🧪 Test the Platform (5 min)

### Test 1: Guide Registration

1. Open http://localhost:3000
2. Click **"Register as Guide"**
3. Fill all fields:
   - Name: Test Guide
   - Email: guide@test.com
   - Password: Test@1234
   - Phone: 9123456789
   - Location: Your City
   - Leave Languages with default
   - Select document type
4. Upload any image for profile & document
5. Click **"Create Account"**
6. See: **"Verification pending by admin"**

✅ Guide registration working!

### Test 2: Admin Verification

1. Go to http://localhost:3000
2. Click **Footer** → "Admin Access" OR go to `/admin/login`
3. Login with:
   - Email: `admin@example.com`
   - Password: `Admin@123456`
4. See **Admin Dashboard**
5. Click **"Pending"** tab (should show your test guide)
6. Click **"View Details"**
7. Click **"Approve Guide"**
8. See status change to **"Approved"** tab

✅ Admin verification working!

### Test 3: Guide Dashboard (After Approval)

1. Go to `/guide/login`
2. Login with guide email: `guide@test.com`
3. Password: `Test@1234`
4. See **Guide Dashboard**
5. Sections visible:
   - Booking Requests (empty initially)
   - Availability Manager
   - Itinerary Manager

✅ Guide dashboard working!

### Test 4: Create Availability

1. In guide dashboard, click **"Add Availability"**
2. Select start date: Tomorrow
3. Select end date: Next week
4. Click **"Save Availability"**
5. See availability in calendar

✅ Availability management working!

### Test 5: Create Itinerary

1. Click **"Add Itinerary"**
2. Fill fields:
   - Days: 3
   - Timings: 9am-5pm
   - Description: Test tour
   - Places: Hill station, temple
3. Optional: Upload images
4. Click **"Create Itinerary"**
5. See itinerary in list

✅ Itinerary creation working!

### Test 6: Tourist Registration

1. Go to `/tourist/signup`
2. Fill form:
   - Name: Test Tourist
   - Email: tourist@test.com
   - Password: Test@1234
3. Click **"Create Account"**

✅ Tourist account created!

### Test 7: Browse Guides

1. Login as tourist (tourist@test.com)
2. Go to **"Explore Guides"**
3. See your test guide in list
4. See booking availability
5. Click **"Book Guide"**
6. Select date (from availability you set)
7. Select itinerary (from itinerary you created)
8. Click **"Confirm Booking"**

✅ Booking working!

### Test 8: Accept Booking (Guide)

1. Login as guide (guide@test.com)
2. Go to **"Booking Requests"**
3. See booking from tourist
4. Click **"Accept"**
5. See booking move to **"Confirmed Bookings"**

✅ Booking acceptance working!

### Test 9: Rate Guide (Tourist)

1. Login as tourist
2. Go to **"Past Bookings"**
3. After the booking date passes (or in testing, just proceed)
4. Click **"Rate Guide"**
5. Give 5 stars ⭐⭐⭐⭐⭐
6. Write review: "Great guide!"
7. Click **"Submit Rating"**

✅ Ratings system working!

### Test 10: View Ratings (Guide)

1. Login as guide
2. Go to **"My Ratings"** in sidebar
3. See the 5-star rating from tourist
4. See review text

✅ All systems working!

---

## 📍 Important URLs

| Page | URL |
|------|-----|
| Home | `http://localhost:3000` |
| Guide Signup | `/guide/signup` |
| Guide Login | `/guide/login` |
| Guide Dashboard | `/guide/dashboard` |
| Guide My Ratings | `/guide/my-ratings` |
| Tourist Signup | `/tourist/signup` |
| Tourist Login | `/tourist/login` |
| Tourist Dashboard | `/tourist/dashboard` |
| Explore Guides | `/tourist/explore-guides` |
| Saved Guides | `/tourist/saved-guides` |
| Booking Status | `/tourist/booking-status` |
| Past Bookings | `/tourist/past-bookings` |
| Tourist Ratings | `/tourist/my-ratings` |
| Admin Login | `/admin/login` |
| Admin Dashboard | `/admin/dashboard` |
| Admin Ratings | `/admin/my-ratings` |

---

## 🎯 What's Working

✅ Guide registration with file uploads  
✅ Tourist account creation  
✅ Admin verification system  
✅ Guide dashboard (approved guides only)  
✅ Availability management (date ranges)  
✅ Itinerary creation (tour packages)  
✅ Tourism browsing with search  
✅ Booking system (request → accept/reject)  
✅ Ratings & reviews (1-5 stars)  
✅ Save/unsave guides  
✅ Account deletion  
✅ Real-time status updates  
✅ Role-based access (3 roles)  
✅ Responsive mobile design  

---

## ⚠️ Common Issues & Solutions

### "Tables don't exist"
**Solution:** Run the SQL setup in Step 3

### "Can't upload files"
**Solution:** 
- Check buckets are **PUBLIC** in Supabase Storage
- Verify bucket names exactly: `profile-pictures`, `documents`

### "Admin login fails"
**Solution:**
- Verify admin user created: `admin@example.com`
- Check user visible in Supabase → Authentication → Users

### "Can't see guides in Explore"
**Solution:**
- Make sure guide is **Approved** (admin must approve first)
- Guide must have availability set
- Guide must have itinerary created

### "Booking doesn't appear"
**Solution:**
- Check guide has availability spanning the booking date
- Tourist must be logged in
- Guide must have at least one itinerary

---

## 🔐 Security Info

**For Testing Only:**
- Admin default email: `admin@example.com`
- Test password: `Admin@123456`
- ⚠️ Change before production!

**Passwords in Production:**
- Use strong, unique passwords
- Enable 2FA in Supabase
- Use environment variables for secrets

---

## 📞 Need Help?

1. **Setup issues** → See PROJECT_README.md
2. **Technical details** → See ARCHITECTURE.md
3. **Database schema** → See COMPLETE_PROJECT_ANALYSIS.md
4. **Storage setup** → See STORAGE_BUCKET_SETUP.md

---

## 🚀 Next Steps

1. ✅ You've completed setup
2. 📝 Test all the workflows above
3. 🎨 Customize styling (edit CSS files)
4. 🚀 Deploy to Vercel
5. 📊 Monitor Supabase usage

---

**You're all set! Enjoy GuideVerify! 🎉**

*Version 1.0.1 - February 25, 2026*
