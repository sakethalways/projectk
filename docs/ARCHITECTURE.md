# GuideVerify System Architecture

Complete system architecture covering all 21 phases and 46 routes.

---

## System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                        User's Browser                                │
└────────────────────┬─────────────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┬──────────────┐
         ↓                       ↓              ↓
    ┌─────────────┐      ┌────────────┐   ┌──────────┐
    │ Tourism Site │      │Admin Panel │   │ Guide    │
    │(Next.js)    │      │ Dashboard  │   │Dashboard │
    └──────┬──────┘      └────────┬───┘   └────┬─────┘
           │                      │             │
           └──────────────────────┼─────────────┘
                                  │
                 ┌────────────────┴────────────────┐
                 │  API Routes (26 endpoints)     │
                 │  in /api folder                │
                 └────────────┬───────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ↓                   ↓                   ↓
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │Supabase Auth │  │   Database   │  │   Storage    │
    │(JWT Tokens)  │  │ (PostgreSQL) │  │  (Files)     │
    └──────────────┘  └──────────────┘  └──────────────┘
         │                   │                   │
         ├─ Users            ├─ users           ├─ profile-pictures
         ├─ Sessions         ├─ guides          └─ documents
         └─ auth.users       ├─ guide_itineraries
                             ├─ guide_availability
                             ├─ bookings
                             ├─ ratings_reviews
                             └─ saved_guides
```

---

## User Roles & Access

```
┌──────────────────────────────────────────────────────────────┐
│                    Authentication                            │
│                                                              │
│  Email + Password ──→ Supabase Auth ──→ JWT Token           │
│  (encrypted)           (bcrypt hash)      (session)          │
└──────────────┬─────────────────────────────────────────────────┘
               │
       ┌───────┴────────┬──────────────┬──────────────┐
       ↓                ↓              ↓              ↓
   ┌────────┐      ┌────────┐    ┌────────┐    ┌────────────┐
   │ Tourist │      │ Guide  │    │ Admin  │    │ Unauth User│
   │ (Can:) │      │ (Can:) │    │(Can:)  │    │ (Can:)     │
   ├────────┤      ├────────┤    ├────────┤    ├────────────┤
   │- Browse│      │- Register│   │- Login │    │- View home │
   │- Book  │      │- Set avail│  │- Review│    │- Register │
   │- Rate  │      │- Create│    │- Approve   │- Explore   │
   │- Save  │      │  tours │    │- Reject    │- Search    │
   │- Cancel│      │- Accept│    │- Deactivate
   │- Delete│      │  bookings   │- View ratings
   │Account │      │- Mark trip  │- Delete guide
   │        │      │  complete   │- Delete account
   │        │      │- View ratings
   │        │      │- Delete acc
   └────────┘      └────────┘    └────────┘    └────────────┘
```

---

## Database Schema (8 Tables)

```
auth.users (Supabase managed)
├─ id (UUID, primary key)
├─ email (unique)
├─ encrypted_password (bcrypt)
└─ created_at, updated_at

        ↓ User Registration Creates ↓

users
├─ id (UUID, references auth.users)
├─ email (unique)
├─ role (guide|tourist|admin)
└─ created_at, updated_at

        ↓ Guides Register ↓

guides
├─ id (UUID)
├─ user_id (references users)
├─ name, email, phone_number, location
├─ languages (TEXT array)
├─ profile_picture_url, document_url
├─ status (pending|approved|rejected)
├─ rejection_reason (nullable)
├─ is_deactivated (boolean)
├─ deactivation_reason (nullable)
└─ created_at, updated_at

        ├─ Guide Creates Tours ─→ guide_itineraries
        │                        ├─ id, guide_id, user_id
        │                        ├─ number_of_days, timings
        │                        ├─ description, places_to_visit
        │                        ├─ image_1_url, image_2_url
        │                        └─ created_at, updated_at
        │
        └─ Guide Sets Availability → guide_availability
                                   ├─ id, guide_id, user_id
                                   ├─ start_date, end_date
                                   ├─ is_available
                                   └─ created_at, updated_at

tourists (implicit via users where role='tourist')
   │
   ├─ Can Create Bookings → bookings
   │                      ├─ id, tourist_id, guide_id
   │                      ├─ itinerary_id, booking_date
   │                      ├─ status (pending|accepted|rejected|cancelled|completed|past)
   │                      ├─ price, price_type
   │                      └─ created_at, updated_at
   │
   ├─ Can Save Guides → saved_guides
   │                  ├─ id, tourist_id, guide_id
   │                  └─ created_at
   │
   └─ Can Rate → ratings_reviews
                ├─ id, booking_id (unique)
                ├─ tourist_id, guide_id
                ├─ rating (1-5), review_text
                └─ created_at, updated_at
```

---

## API Endpoints (26 Total)

### Authentication & Setup
1. `POST /api/run-migration` - Initialize database

### Guide Management (7)
2. `POST /api/approve-my-guide` - Guide submit for approval
3. `POST /api/create-itineraries` - Guide create tour package
4. `GET /api/get-guide-itinerary` - Get itinerary details
5. `GET /api/get-guide-availability` - Get availability dates
6. `GET /api/get-languages` - Get language list
7. `DELETE /api/admin-delete-guide` - Admin delete guide
8. `POST /api/admin-delete-user` - Admin delete tourist

### Discovery & Search (4)
9. `GET /api/search-guides` - Search approved guides
10. `GET /api/get-approved-guides` - Featured guides
11. `GET /api/get-tourists` - List tourists (admin)
12. `GET /api/get-admin-bookings` - All bookings (admin)

### Bookings (6)
13. `POST /api/create-booking` - Tourist book guide
14. `GET /api/get-tourist-bookings` - Tourist all bookings
15. `GET /api/get-guide-bookings` - Guide pending requests
16. `GET /api/get-guide-confirmed-bookings` - Guide accepted bookings
17. `GET /api/get-guide-past-bookings` - Guide trip history
18. `PATCH /api/update-booking-status` - Update booking status
19. `POST /api/sync-trips-completed` - Mark trip complete

### Saved Guides (3)
20. `POST /api/save-guide` - Save guide to library
21. `POST /api/unsave-guide` - Remove saved guide
22. `GET /api/get-saved-guides` - Get saved guides list

### Ratings & Reviews (4)
23. `POST /api/create-rating-review` - Create/edit rating
24. `DELETE /api/delete-rating-review` - Delete rating
25. `GET /api/get-ratings-reviews` - Get ratings list
26. `GET /api/get-booking-rating` - Check if booking rated

### Account Management (1)
27. `POST /api/delete-account` - Delete user account with cascade

---

## Data Flow: Complete Booking Lifecycle

```
Phase 1: Tourist Discovery
─────────────────────────
Tourist visits /tourist/explore-guides
  ↓
GET /api/search-guides
  ├─ Query: approved guides at location
  └─ Returns: Guide cards with availability

Tourist clicks "Book Now" on guide card
  ↓
BookGuideModal opens
  ├─ Step 1: Check guide availability
  ├─ Step 2: Select booking date
  ├─ Step 3: Choose itinerary/tour
  └─ Step 4: Confirmation

Phase 2: Booking Creation
──────────────────────────
Tourist clicks "Confirm Booking"
  ↓
POST /api/create-booking
  ├─ Create booking record: status = 'pending'
  ├─ Store: guide_id, itinerary_id, booking_date
  └─ Return: booking confirmation

Booking Status: PENDING

Phase 3: Guide Review
─────────────────────
Guide logs into /guide/dashboard
  ↓
GET /api/get-guide-bookings
  ├─ Query: bookings WHERE status = 'pending'
  └─ Shows: List of booking requests

Guide sees booking request with:
  ├─ Tourist name, phone, location
  ├─ Selected date & itinerary
  ├─ Two buttons: Accept / Reject

Phase 4: Guide Decision
───────────────────────
Case A: Guide Accepts
  ↓
PATCH /api/update-booking-status
  ├─ Update booking: status = 'accepted'
  └─ Booking moves to "Confirmed Bookings"

Booking Status: ACCEPTED (or "Confirmed")

Case B: Guide Rejects
  ↓
PATCH /api/update-booking-status
  ├─ Update booking: status = 'rejected'
  └─ Booking removed from requests

Booking Status: REJECTED

Phase 5: Active Booking (ACCEPTED only)
────────────────────────────────────────
Tourist can see in /tourist/booking-status
  ├─ Shows: Booking status = "Accepted"
  ├─ Can cancel with confirmation
  └─ If cancelled → status = 'cancelled'

Guide sees in /guide/confirmed-bookings
  ├─ Shows: Confirmed booking
  ├─ Tourist details available
  └─ Two buttons: View Details / Mark Completed

Phase 6: Trip Completion
────────────────────────
When booking date passes (or after trip):

Guide clicks "Mark Trip Completed"
  ↓
PATCH /api/update-booking-status
  ├─ Update booking: status = 'completed'
  └─ Booking moves to "Past Bookings"

Booking Status: COMPLETED

Phase 7: Past Bookings
──────────────────────
Tourist's /tourist/past-bookings
  ├─ Shows: Past trips
  ├─ Shows: "Rate Guide" button
  └─ Can write rating

Guide's /guide/past-bookings
  ├─ Shows: Historical trips
  └─ Can see ratings received

Phase 8: Rating
───────────────
Tourist clicks "Rate Guide"
  ↓
RatingReviewModal opens
  ├─ 1-5 star selector
  ├─ Optional review text
  └─ Confirm button

POST /api/create-rating-review
  ├─ Create ratings_reviews record
  ├─ booking_id (unique constraint)
  ├─ rating (1-5), review_text
  └─ Links tourist to guide

Guide can see in /guide/my-ratings
  ├─ All ratings received
  ├─ Average rating calculated
  ├─ Count of ratings
  └─ Read-only (cannot edit)

Admin can moderate in /admin/my-ratings
  ├─ All platform ratings
  ├─ Can delete inappropriate
  └─ Can view context

End Status: PAST (or COMPLETED)
```

---

## Request Flow: Guide Registration to Booking

```
NEW GUIDE REGISTRATION
├─ POST to Supabase Auth
├─ User created in auth.users
├─ User record created in users table (role='guide')
├─ Guide record created: status='pending'
├─ Profile picture uploaded to storage
├─ Document uploaded to storage
└─ Success message + logout

ADMIN VERIFICATION
├─ GET /admin/dashboard
├─ Shows all pending guides
├─ Admin clicks "View Details"
├─ Modal shows profile picture + document
├─ Admin clicks "Approve"
├─ UPDATE guides: status='approved'
└─ Guide can now login

GUIDE POST-APPROVAL
├─ Login at /guide/login
├─ Redirected to /guide/dashboard
├─ Can create itineraries
├─ Can set availability
├─ Can see booking requests

TOURIST DISCOVERY
├─ GET /api/search-guides
├─ Returns approved guides
├─ Tourist sees guide card
├─ Clicks "Book Now"

BOOKING CREATION
├─ POST /api/create-booking
├─ Creates booking record
├─ status='pending'
├─ Guide receives in notifications

GUIDE ACCEPTS
├─ PATCH /api/update-booking-status
├─ status='accepted'
├─ Tourist sees "Accepted"
├─ Can now plan trip

TRIP COMPLETED
├─ PATCH /api/update-booking-status
├─ status='completed'
├─ Moves to past bookings

TOURIST RATES
├─ POST /api/create-rating-review
├─ 1-5 stars + review
├─ Stored in ratings_reviews
├─ Guide can view

Full Cycle Complete ✓
```

---

## Security Layers

```
Layer 1: HTTPS + TLS
│ All data encrypted in transit
│ Certificate authority verified
└─ Browser ↔ Server

Layer 2: Supabase Auth
│ ├─ Password hashing (bcrypt)
│ ├─ JWT token generation
│ ├─ Token expiration (1 hour)
│ └─ Secure session cookies

Layer 3: Row-Level Security (RLS)
│ ├─ Users can only see their own data
│ ├─ Guides can only update their own profile
│ ├─ Tourists can only update their own bookings
│ ├─ Admins can see/update all
│ └─ Database enforced (can't be bypassed)

Layer 4: Application Logic
│ ├─ Role checking on protected pages
│ ├─ Status validation (can't skip approval)
│ ├─ Ownership verification
│ └─ Authorization headers checked

Layer 5: Input Validation
│ ├─ Client-side (TypeScript + Zod)
│ ├─ Server-side (re-validation)
│ ├─ File type + size checking
│ └─ Email format validation

Layer 6: Error Handling
│ ├─ Never expose sensitive info
│ ├─ Log errors securely
│ ├─ Return generic user messages
│ └─ Rate limiting (future)
```

---

## Page Routes (18 Pages + Home)

```
/ ─ Home Page (public)
   └─ Featured guides
   └─ Search guides
   └─ Admin login link

Guide Routes:
/guide/signup ─ Registration (public)
               ├─ Multi-step form
               └─ File uploads

/guide/login ─ Login page (public)
              ├─ Check status
              └─ Redirect per status

/guide/dashboard ─ Main dashboard (approved only)
                  ├─ Availability manager
                  ├─ Itinerary manager
                  └─ Booking requests

/guide/profile ─ View profile (guide only)

/guide/edit-profile ─ Edit profile (guide only)
                     ├─ Update info
                     └─ Change photo

/guide/my-ratings ─ View ratings (guide only)
                   └─ Read-only ratings received

Tourist Routes:
/tourist/signup ─ Create account (public)

/tourist/login ─ Login (public)

/tourist/dashboard ─ Main dashboard
                    ├─ Profile
                    ├─ Quick stats
                    └─ Recent bookings

/tourist/explore-guides ─ Browse guides
                         ├─ Search/filter
                         ├─ Guide cards
                         └─ Book buttons

/tourist/saved-guides ─ Saved guides library
                       └─ Manage favorites

/tourist/booking-status ─ Manage bookings
                         ├─ Active bookings
                         ├─ Cancel options
                         └─ Past bookings

/tourist/past-bookings ─ Trip history
                        └─ Rate guides here

/tourist/my-ratings ─ Ratings given
                     └─ Manage ratings

Admin Routes:
/admin/login ─ Login (public)
              └─ Email/password

/admin/dashboard ─ Verification center (admin only)
                  ├─ Pending guides (tabbed)
                  ├─ Approved guides
                  ├─ Rejected guides
                  └─ Manage actions

/admin/my-ratings ─ Moderate ratings (admin only)
                   └─ Delete inappropriate
```

---

## Frontend Architecture

```
Next.js 16 App
│
├─ Server Components (data fetching)
│  └─ Async functions read from Supabase
│
├─ Client Components (interactivity)
│  ├─ Forms with validation
│  ├─ Modal dialogs
│  ├─ Real-time updates
│  └─ State management (hooks)
│
├─ Middleware & Utilities
│  ├─ Supabase client initialization
│  ├─ Authentication helpers
│  ├─ Role checking functions
│  └─ Error handling
│
└─ Component Hierarchy
   ├─ Layouts (RootLayout, AdminLayout, etc)
   ├─ Pages (route components)
   ├─ Features (domain-specific components)
   │  ├─ BookGuideModal
   │  ├─ RatingReviewModal
   │  ├─ DeleteAccountModal
   │  └─ ...
   ├─ Common (reusable components)
   │  ├─ Navigation
   │  ├─ Sidebars
   │  └─ Cards
   └─ UI (shadcn/ui primitives)
      ├─ Button, Input, Select
      ├─ Dialog, Drawer, Sheet
      ├─ Table, Badge, Alert
      └─ 50+ components
```

---

## Mobile Responsiveness

```
Mobile (< 640px)
├─ Single column layout
├─ Hamburger navigation
├─ Full-width forms
├─ Bottom sheet modals
└─ Stacked cards

Tablet (640px - 1024px)
├─ Two column layout
├─ Visible sidebar (collapsed)
├─ Multi-column forms
├─ Center-aligned modals
└─ 2x2 grid cards

Desktop (> 1024px)
├─ Three+ column layout
├─ Fixed sidebar
├─ Side-by-side forms
├─ Center modals
└─ 3x3+ grid cards

Tailwind breakpoints used:
└─ sm: 640px
└─ md: 768px
└─ lg: 1024px
```

---

## Deployment Architecture

```
Development ──push─→ GitHub
                      │
                      │ webhook
                      ↓
                   Vercel Build
                      ├─ Install deps
                      ├─ Next.js build
                      ├─ Type check
                      └─ Deploy artifact
                      │
                      ↓
              Edge Network Deploy
                      ├─ Global CDN
                      ├─ HTTPS/SSL
                      ├─ Auto-scaling
                      └─ Health checks
                      │
                      ↓
                Live App Server

Points to:
┌────────────────────────────────┐
│     Supabase Backend           │
├────────────────────────────────┤
│ - PostgreSQL Database          │
│ - Auth (JWT tokens)            │
│ - Storage (files)              │
│ - Backups (automatic)          │
└────────────────────────────────┘
```

---

## Scalability Path

**Current:** 0-1,000 guides → ✓ Works well
- Single Supabase project
- Basic indexes
- Supabase automatic scaling

**Medium:** 1,000-10,000 guides → Add:
- Pagination on admin dashboard
- Search indexing
- Query caching
- CDN for images

**Large:** 10,000-100,000 guides → Add:
- Database read replicas
- Separate storage CDN
- Load balancing
- Analytics warehouse
- Advanced caching (Redis)

**Enterprise:** 100,000+ guides → Add:
- Multi-region deployment
- Database sharding
- Microservices
- Real-time messaging
- Advanced monitoring

---

## Performance Metrics

```
Target Performance:
├─ First Contentful Paint (FCP): < 1.5s
├─ Largest Contentful Paint (LCP): < 2.5s
├─ Cumulative Layout Shift (CLS): < 0.1
├─ Time to Interactive (TTI): < 2.5s
└─ First Input Delay (FID): < 100ms

Optimization Strategies:
├─ Image lazy loading
├─ CSS/JS minification
├─ Database query optimization
├─ Indexes on all columns
├─ RLS instead of app-level filtering
├─ Caching where applicable
└─ Edge deployment (Vercel)

Database Query Performance:
├─ Indexes on: user_id, guide_id, status, created_at
├─ EXPLAIN ANALYZE for complex queries
├─ Composite indexes for common filters
└─ Unused indexes pruned

Browser Optimization:
├─ Code splitting
├─ Tree shaking
├─ Dynamic imports
├─ Image optimization (WebP)
└─ Font subsetting
```

---

## Monitoring & Observability

```
Logs:
├─ Supabase logs (queries, errors)
├─ Vercel logs (deployment, runtime)
├─ Browser console (client-side)
└─ Custom logging (errors, debug)

Metrics:
├─ Page load time
├─ API response times
├─ Database query times
├─ Error rates
└─ User counts

Alerts:
├─ Error spike (> 5% error rate)
├─ Slow queries (> 1s)
├─ Database quota exceeded
├─ Deployment failure
└─ Down for more than 1 minute
```

---

**Total Architecture Summary:**
- ✅ 26 API endpoints
- ✅ 8 database tables with relationships
- ✅ 18+ pages with role-based access
- ✅ 50+ UI components
- ✅ 3 user roles with distinct permissions
- ✅ 6 user states (guest, pending, approved, rejected, rated, deleted)
- ✅ Multiple security layers
- ✅ Mobile-responsive design
- ✅ Production-ready deployment
- ✅ Scalable to 100,000+ guides
