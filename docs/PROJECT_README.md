# GuideVerify Platform - Complete Documentation

A complete, production-ready guide verification and booking platform built with Next.js 16, React 19, Supabase, and Tailwind CSS.

![Status](https://img.shields.io/badge/Status-Production%20Ready-green)
![Version](https://img.shields.io/badge/Version-1.0.1-blue)
![Routes](https://img.shields.io/badge/Routes-46-blue)
![Build](https://img.shields.io/badge/Build-Success-green)

---

## 🎯 Project Overview

**GuideVerify** is a complete platform that connects tourists with local travel guides through a verification system. It includes:

- **Admin Role**: Verify and manage tour guides
- **Guide Role**: Create profiles, manage availability, itineraries, bookings, and view ratings
- **Tourist Role**: Browse guides, book tours, save favorites, rate completed tours, manage account

**Total Implementation**: 21 phases with 46 API/page routes

---

## ✨ Complete Feature List

### 🔐 Authentication & Security
- ✅ Guide registration (multi-step form)
- ✅ Tourist account creation
- ✅ Admin login
- ✅ Role-based access control (3 roles)
- ✅ Password hashing with bcrypt
- ✅ Row-level security (RLS) policies
- ✅ Protected routes with redirects
- ✅ Session management with JWT tokens

### 👤 Guide Management
- ✅ Registration with profile picture & ID document upload
- ✅ Account status tracking (pending, approved, rejected)
- ✅ Resubmission after rejection
- ✅ Dashboard for approved guides
- ✅ Profile editing and management
- ✅ View ratings received (read-only)

### 🏨 Guide Services
- ✅ Availability date range management (calendar-based)
- ✅ Multiple itinerary/tour creation
- ✅ Tour details: days, timing, description, places, instructions
- ✅ Tour image uploads (up to 2 images per itinerary)
- ✅ Price management (per day/per trip)

### 👨‍💼 Admin Dashboard
- ✅ View all pending guide applications
- ✅ Detailed guide review with full photo and document viewing
- ✅ Approve guides with automatic status update
- ✅ Reject with detailed reasons (saved for appeal)
- ✅ Manage approved guides (view, deactivate, reactivate, delete)
- ✅ View and moderate all ratings & reviews
- ✅ Real-time booking management

### 🧳 Tourist Features
- ✅ Tourist profile creation and management
- ✅ Search approved guides by name, location, language
- ✅ Browse guides with filtering
- ✅ Save favorite guides to library
- ✅ Unsave guides anytime
- ✅ View saved guides collection

### 📅 Booking System
- ✅ Book guides with date selection
- ✅ Select itinerary from available tours
- ✅ Booking confirmation modal
- ✅ View booking status (pending, accepted, rejected, cancelled, completed)
- ✅ Cancel bookings at any stage
- ✅ Automatic transition from active → past bookings
- ✅ Guide can accept/reject booking requests
- ✅ Guide can mark completed trips
- ✅ Tourist can view history of past trips

### ⭐ Ratings & Reviews System
- ✅ Rate guides 1-5 stars (only after booking completed)
- ✅ Write optional review (up to 500 characters)
- ✅ Edit ratings (tourists)
- ✅ Delete ratings (tourists & admins)
- ✅ Tourist: View all ratings given
- ✅ Guide: View all ratings received (read-only)
- ✅ Admin: Moderate and delete ratings
- ✅ Calculate average rating per guide
- ✅ Rating count tracking

### 🗑️ Account Management
- ✅ Secure account deletion (password verification required)
- ✅ Cascade delete all user data
- ✅ Delete bookings, ratings, saved guides
- ✅ Delete from auth and user database
- ✅ Redirect to home after deletion
- ✅ Confirmation modal with warnings

---

## 🗄️ Database Schema

**8 Tables with 26+ Indexes and RLS Policies**

| Table | Purpose | Rows |
|-------|---------|------|
| `auth.users` | Supabase authentication core | Managed by Supabase |
| `users` | User metadata + role tracking | 1 per user |
| `guides` | Guide profiles with status | 1 per guide |
| `guide_itineraries` | Tour packages | Multiple per guide |
| `guide_availability` | Availability date ranges | Multiple per guide |
| `bookings` | Booking records | Multiple per tourist |
| `ratings_reviews` | 1-5 star ratings | Multiple per guide |
| `saved_guides` | Saved guide references | Multiple per tourist |

**Advanced Features:**
- CASCADE DELETE on all foreign keys
- UNIQUE constraints for data integrity
- CHECK constraints for valid values
- Multiple indexes for performance
- RLS policies for security

---

## 📊 API Endpoints (26 Total)

### Authentication & Users
- `POST /api/run-migration` - Initialize database

### Guide Features
- `GET /api/get-approved-guides` - Featured guides on home
- `GET /api/get-languages` - Languages dropdown list
- `POST /api/approve-my-guide` - Guide self-approval/submission
- `POST /api/create-itineraries` - Create tour packages
- `GET /api/get-guide-itinerary` - View itinerary details
- `POST /api/create-booking` - Tourist creates booking
- `GET /api/get-guide-availability` - Check guide availability dates

### Booking Management
- `GET /api/get-tourist-bookings` - Tourist's active bookings
- `GET /api/get-guide-bookings` - Pending requests for guide
- `GET /api/get-guide-confirmed-bookings` - Accepted bookings
- `GET /api/get-guide-past-bookings` - Historical bookings
- `GET /api/get-admin-bookings` - All platform bookings
- `PATCH /api/update-booking-status` - Update booking status
- `POST /api/sync-trips-completed` - Mark trip completed

### Guide Discovery
- `GET /api/search-guides` - Search with filters
- `POST /api/save-guide` - Save guide to library
- `POST /api/unsave-guide` - Remove saved guide
- `GET /api/get-saved-guides` - View saved guides
- `GET /api/get-tourists` - Get tourist profiles (admin)

### Ratings & Reviews
- `POST /api/create-rating-review` - Create/update rating
- `DELETE /api/delete-rating-review` - Delete rating
- `GET /api/get-ratings-reviews` - Fetch ratings list
- `GET /api/get-booking-rating` - Check if booking rated

### Account Management
- `POST /api/delete-account` - Secure account deletion
- `DELETE /api/admin-delete-guide` - Admin delete guide

---

## 🛠️ Technology Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| Next.js | React Meta-Framework | 16.1.6 |
| React | UI Library | 19.2.4 |
| TypeScript | Type Safety | 5.7.3 |
| Tailwind CSS | Utility CSS Styling | 4.2.0 |
| Supabase | Backend + Database | 2.47.0 |
| PostgreSQL | Relational Database | Latest (in Supabase) |
| Radix UI | Headless Components | Latest |
| shadcn/ui | Pre-styled Components | Latest |
| Lucide React | Icon Library | 0.564.0 |
| React Hook Form | Form Management | 7.54.1 |
| Zod | Schema Validation | 3.24.1 |

---

## 📁 Project Structure

```
projectk/
├── app/                              # Next.js app directory
│   ├── page.tsx                     # Home page
│   ├── layout.tsx                   # Root layout
│   ├── globals.css                  # Global styles
│   ├── admin/                       # Admin pages
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   └── my-ratings/page.tsx
│   ├── guide/                       # Guide pages
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── edit-profile/page.tsx
│   │   └── my-ratings/page.tsx
│   ├── tourist/                     # Tourist pages
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── explore-guides/page.tsx
│   │   ├── saved-guides/page.tsx
│   │   ├── booking-status/page.tsx
│   │   ├── past-bookings/page.tsx
│   │   └── my-ratings/page.tsx
│   └── api/                         # 26 API endpoints
│       ├── search-guides/route.ts
│       ├── create-booking/route.ts
│       ├── get-guide-bookings/route.ts
│       ├── create-rating-review/route.ts
│       ├── delete-account/route.ts
│       └── ... (20+ more endpoints)
│
├── components/                       # React components
│   ├── admin-login-modal.tsx
│   ├── admin-ratings-reviews.tsx
│   ├── admin-sidebar.tsx
│   ├── book-guide-modal.tsx
│   ├── delete-account-modal.tsx
│   ├── guide-booking-requests.tsx
│   ├── guide-confirmed-bookings.tsx
│   ├── guide-past-bookings.tsx
│   ├── guide-ratings-reviews.tsx
│   ├── rating-review-modal.tsx
│   ├── search-guides.tsx
│   ├── tourist-ratings-reviews.tsx
│   ├── saved-guides.tsx
│   └── ui/                          # 50+ shadcn/ui components
│
├── hooks/                            # Custom React hooks
│   ├── use-mobile.ts
│   └── use-toast.ts
│
├── lib/                              # Utilities
│   ├── supabase-client.ts
│   └── utils.ts
│
├── scripts/                          # Database setup
│   └── setup-database.sql
│
├── styles/                           # CSS files
│   └── globals.css
│
├── public/                           # Static assets
│   └── (images, icons)
│
├── docs/                             # Documentation
│   ├── PROJECT_README.md
│   ├── QUICKSTART.md
│   ├── ARCHITECTURE.md
│   ├── STORAGE_BUCKET_SETUP.md
│   └── COMPLETE_PROJECT_ANALYSIS.md
│
└── Configuration files
    ├── package.json
    ├── tsconfig.json
    ├── next.config.mjs
    ├── tailwind.config.js
    ├── postcss.config.mjs
    └── .env.local
```

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Node.js 18+
- pnpm package manager
- Supabase account (free at supabase.com)

### Setup Steps

1. **Clone and install:**
   ```bash
   cd projectk
   pnpm install
   ```

2. **Set up Supabase:**
   - Create project at supabase.com
   - Go to Settings > API > Copy credentials
   - Create storage buckets: `profile-pictures`, `documents`
   - Run `scripts/setup-database.sql` in SQL editor

3. **Configure environment:**
   ```bash
   # Create .env.local
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

4. **Start development:**
   ```bash
   pnpm dev
   ```

5. **Access application:**
   - Home: http://localhost:3000
   - Admin: http://localhost:3000 (footer link)
   - Create test accounts and explore!

**See QUICKSTART.md for detailed step-by-step guide**

---

## 🔐 Security Features

### Authentication
- Supabase Auth with secure password hashing (bcrypt)
- JWT token-based sessions
- Automatic session expiry
- CSRF protection builtin

### Authorization
- Role-based access control (3 roles: admin, guide, tourist)
- Row-level security (RLS) policies on all tables
- Status-based access (guide approval check)
- Protected routes with redirects

### Data Protection
- Input validation (client + server)
- SQL injection prevention (parameterized queries)
- Type safety with TypeScript
- Error handling without exposing sensitive info
- File upload validation (type & size)

### Database Safety
- CASCADE DELETE on foreign keys
- UNIQUE constraints for data integrity
- CHECK constraints for valid values
- Automatic timestamps for audit trail

---

## 📱 Responsive Design

- Mobile-first CSS approach
- Breakpoints: 640px, 768px, 1024px
- Touch-friendly interface
- Works on all devices (375px - 1440px+)
- Optimized images and lazy loading

---

## 🧪 Testing Guide

### Test Guide Registration
1. Visit home page
2. Click "Register as Guide"
3. Fill multi-step form with test data
4. Upload profile picture and document
5. Submit and see "Verification pending"

### Test Admin Dashboard
1. Click "Admin Access" in footer
2. Login with `admin@example.com` (created in setup)
3. Review pending guides
4. Click "View Details"
5. Approve or reject with reason

### Test Tourist Booking
1. Create tourist account
2. Browse guides in "Explore"
3. Click "Book Now" on any guide
4. Select date and itinerary
5. Confirm booking request
6. (Switch to guide account and accept)
7. Rate after booking completed

### Test Ratings
1. Complete a booking
2. Visit "My Ratings"
3. Rate guide 1-5 stars
4. Add optional review
5. Edit or delete rating
6. View in guide's "My Ratings"

---

## 📊 Performance

- First Contentful Paint: < 1s
- Largest Contentful Paint: < 2.5s  
- Cumulative Layout Shift: < 0.1
- Database queries optimized with indexes
- Images lazy-loaded
- CSS and JS minified in production

---

## 🚀 Deployment

### Deploy to Vercel
```bash
# 1. Push to GitHub
git add .
git commit -m "Initial commit"
git push origin main

# 2. Connect to Vercel
# - Visit vercel.com
# - Import from GitHub
# - Select repository
# - Add environment variables
# - Deploy

# 3. Add to .env.production
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## 📖 Documentation Files

1. **PROJECT_README.md** (this file) - Project overview
2. **QUICKSTART.md** - 5-minute setup guide
3. **ARCHITECTURE.md** - System design and data flow
4. **STORAGE_BUCKET_SETUP.md** - File storage configuration
5. **COMPLETE_PROJECT_ANALYSIS.md** - Comprehensive technical reference

---

## 🔄 Update Checklist

- [x] Phase 1-3: Guide verification system
- [x] Phase 4-8: Guide dashboard and management
- [x] Phase 9-15: Tourist system and search
- [x] Phase 16-18: Booking system
- [x] Phase 19: Ratings & reviews
- [x] Phase 20: Account deletion
- [x] Phase 21: Bug fixes and FK constraint fixes

---

## 📞 Support

**For setup issues:** See QUICKSTART.md  
**For technical questions:** See ARCHITECTURE.md  
**For implementation details:** See COMPLETE_PROJECT_ANALYSIS.md

---

## 🎉 What You Have

✅ 46 fully functional routes  
✅ 26 API endpoints with proper error handling  
✅ 8 database tables with complete schema  
✅ Complete authentication system  
✅ Role-based access control  
✅ Booking system with status tracking  
✅ Ratings & reviews with moderation  
✅ Account deletion with cascade delete  
✅ Responsive mobile-first UI  
✅ Complete documentation  

---

## 🚀 Next Steps

1. Read QUICKSTART.md and set up
2. Test with sample data
3. Explore ARCHITECTURE.md for technical details
4. Deploy to Vercel when ready
5. Add custom branding/styling
6. Monitor Supabase usage

---

**Built with ❤️ for seamless guide verification and booking**

*Version 1.0.1 - February 25, 2026*
