# GuideVerify Platform - Complete Project Analysis

**Last Updated:** February 24, 2026  
**Version:** 1.0.0  
**Status:** Production Ready

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Database Schema](#database-schema)
4. [Authentication & Security](#authentication--security)
5. [Frontend Architecture](#frontend-architecture)
6. [Backend Architecture](#backend-architecture)
7. [Complete User Flows](#complete-user-flows)
8. [Component Hierarchy](#component-hierarchy)
9. [API Endpoints](#api-endpoints)
10. [Data Flow Details](#data-flow-details)
11. [Key Features Implementation](#key-features-implementation)

---

## Project Overview

### What is GuideVerify?

A platform for **travel guide verification** that connects:
- **Guides**: Travel guides who register and get verified by admins
- **Admins**: Review guide applications and approve/reject them
- **Tourists**: Search and find verified guides (future phase)

### Core Purpose

1. **Guide Registration** → Upload profile & documents
2. **Admin Verification** → Review and approve/reject
3. **Guide Dashboard** → Manage itineraries and availability
4. **Search & Discovery** → Tourists find guides

### Key Metrics

- **Routes:** 14 total (4 API, 10 page routes)
- **Database Tables:** 5 (guides, guide_itineraries, guide_availability, users, auth.users)
- **Storage Buckets:** 2 (profile-pictures, documents)
- **Authentication:** Supabase Auth (JWT-based)
- **Authorization:** Row-Level Security (RLS) + Role-based access

---

## Technology Stack

### Frontend
```
┌─ Next.js 16.1.6 (React Meta Framework)
│  ├─ React 19.2.4 (UI Library)
│  ├─ TypeScript 5.7.3 (Type Safety)
│  ├─ Tailwind CSS 4.2.0 (Styling)
│  └─ React Hook Form + Resolver (Form Management)
│
├─ UI Components
│  ├─ Radix UI (Headless components)
│  ├─ shadcn/ui (Pre-styled components)
│  └─ Lucide React (Icons)
│
└─ State Management
   └─ React Hooks (useState, useEffect, useContext)
```

### Backend
```
┌─ Supabase
│  ├─ PostgreSQL (Database)
│  ├─ Auth (Authentication)
│  ├─ Storage (File uploads)
│  └─ API (PostgREST)
│
└─ Next.js API Routes (Serverless functions)
   └─ Route Handlers (Node.js runtime)
```

### Development Tools
```
├─ pnpm (Package manager)
├─ ESLint (Code quality)
├─ Autoprefixer + PostCSS (CSS processing)
└─ Git + GitHub (Version control)
```

### Environment Variables
```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## Database Schema

### Table: `auth.users` (Supabase Built-in)
```sql
id              UUID PRIMARY KEY
email           VARCHAR UNIQUE
encrypted_password VARCHAR (bcrypt hashed)
email_confirmed_at TIMESTAMP
created_at      TIMESTAMP
updated_at      TIMESTAMP
```
**Purpose:** Core authentication table managed by Supabase

---

### Table: `users`
```sql
id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
email           VARCHAR UNIQUE NOT NULL
role            VARCHAR DEFAULT 'guide' CHECK ('admin', 'guide')
created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()

-- Indexes
idx_users_email  ON (email)
idx_users_role   ON (role)
```
**Purpose:** Store user metadata and role information (admin vs guide)  
**Trigger:** Automatically created when auth user signs up

---

### Table: `guides`
```sql
id                    UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
name                  VARCHAR(255) NOT NULL
phone_number          VARCHAR(20) NOT NULL
email                 VARCHAR(255) NOT NULL
location              VARCHAR(500) NOT NULL
languages             TEXT[] (JSON array stored as ARRAY)
profile_picture_url   VARCHAR(500)
document_url          VARCHAR(500)
document_type         VARCHAR(50) CHECK ('aadhar', 'driving_licence')
status                VARCHAR(50) DEFAULT 'pending' CHECK ('pending', 'approved', 'rejected')
rejection_reason      TEXT
is_deactivated        BOOLEAN DEFAULT FALSE
deactivation_reason   TEXT
is_resubmitted        BOOLEAN DEFAULT FALSE
created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW()
updated_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW()

-- Indexes
idx_guides_user_id    ON (user_id)
idx_guides_status     ON (status)
idx_guides_email      ON (email)
```
**Purpose:** Core guide profile information  
**Statuses:**
- `pending` - Awaiting admin review
- `approved` - Verified and can login
- `rejected` - Not approved, can resubmit

---

### Table: `guide_itineraries`
```sql
id                   UUID PRIMARY KEY DEFAULT gen_random_uuid()
guide_id             UUID NOT NULL REFERENCES guides(id) ON DELETE CASCADE
user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
number_of_days       INTEGER NOT NULL
timings              VARCHAR(100) NOT NULL
description          TEXT NOT NULL
places_to_visit      TEXT NOT NULL
instructions         TEXT
image_1_url          VARCHAR(500)
image_2_url          VARCHAR(500)
created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW()
updated_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW()

-- Index
idx_guide_itineraries_guide_id ON (guide_id)
```
**Purpose:** Tour packages/itineraries created by guides  
**Example:**
- 3-day Himalayan trek
- 5-day city tour
- 1-day adventure package

---

### Table: `guide_availability`
```sql
id                 UUID PRIMARY KEY DEFAULT gen_random_uuid()
guide_id           UUID NOT NULL REFERENCES guides(id) ON DELETE CASCADE
user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
start_date         DATE NOT NULL
end_date           DATE NOT NULL
is_available       BOOLEAN DEFAULT TRUE
created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()

-- Index
idx_guide_availability_guide_id ON (guide_id)
```
**Purpose:** Track when guides are available for tours  
**Example:**
- Available: March 1-15, 2026
- Available: April 1-30, 2026

---

### Storage Buckets

#### Bucket: `profile-pictures`
```
Structure: /{guide_id}/{filename}
Max Size: 5 MB
Allowed Types: JPEG, PNG, WebP
Public: Yes (for viewing)
```

#### Bucket: `documents`
```
Structure: /{guide_id}/{filename}
Max Size: 10 MB
Allowed Types: JPEG, PNG, PDF
Public: No (admin only)
```

---

## Authentication & Security

### Authentication Flow

```
1. User Registration/Login → Supabase Auth
2. Password hashing → bcrypt (Supabase handle)
3. JWT Token generation → Supabase Auth
4. Token stored → Browser session
5. Token sent → Every API request (Authorization header)
6. Token verified → Supabase middleware
```

### JWT Token Structure
```json
{
  "sub": "user_id_uuid",
  "email": "guide@example.com",
  "role": "authenticated",
  "aud": "authenticated",
  "iat": 1234567890,
  "exp": 1234607890
}
```

### Row-Level Security (RLS) Policies

#### Guides Table

**Read Policy:**
```sql
CREATE POLICY "guides_read_authenticated"
  ON guides FOR SELECT
  USING (auth.role() = 'authenticated')
```
- Anyone logged in can read guide records
- Used for searching available guides

**Insert Policy:**
```sql
CREATE POLICY "guides_insert_own"
  ON guides FOR INSERT
  WITH CHECK (auth.uid() = user_id)
```
- Users can only insert their own guide record
- Prevents creating guides for other users

**Update Policy:**
```sql
CREATE POLICY "guides_update_admin"
  ON guides FOR UPDATE
  USING (
    auth.uid() = user_id OR 
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  )
```
- Guides can update their own record
- Admins can update any record

#### Users Table

**Read Policy:**
```sql
CREATE POLICY "users_read_own"
  ON users FOR SELECT
  USING (auth.uid() = id)
```
- Users can only read their own role

**Read All Policy:**
```sql
CREATE POLICY "users_read_all_authenticated"
  ON users FOR SELECT
  USING (auth.role() = 'authenticated')
```
- Authenticated users can read all roles (for role checking)

### Authorization Checks

All pages perform checks:

```typescript
// 1. Get current auth user
const { data: authData } = await supabase.auth.getUser();
if (!authData.user) router.push('/login'); // Not logged in

// 2. Get user role from users table
const { data: userData } = await supabase
  .from('users')
  .select('role')
  .eq('id', authData.user.id)
  .single();

// 3. Check role
if (userData.role !== 'admin') router.push('/unauthorized');
```

### Security Features

| Feature | Implementation |
|---------|---|
| **Password Hashing** | bcrypt (Supabase) |
| **Session Management** | JWT tokens with expiry |
| **HTTPS** | All communication encrypted |
| **CSRF Protection** | Supabase handles |
| **SQL Injection** | Parameterized queries via PostgREST |
| **File Upload Validation** | Client-side + server-side checks |
| **File Size Limits** | Profile: 5MB, Documents: 10MB |
| **RLS Policies** | Database-level access control |
| **Role-based Access** | Guide vs Admin routes |

---

## Frontend Architecture

### Project Structure

```
app/
├── page.tsx                    # Home page
├── layout.tsx                  # Root layout
│
├── admin/
│   ├── login/page.tsx         # Admin login
│   └── dashboard/page.tsx     # Admin dashboard
│
├── guide/
│   ├── login/page.tsx         # Guide login
│   ├── signup/page.tsx        # Guide signup/resubmit
│   ├── dashboard/page.tsx     # Guide dashboard (approved only)
│   ├── profile/page.tsx       # Guide profile view
│   └── edit-profile/page.tsx  # Guide profile edit
│
├── api/                        # Backend API routes
│   ├── search-guides/
│   ├── get-approved-guides/
│   ├── get-guide-itinerary/
│   ├── create-itineraries/
│   ├── approve-my-guide/
│   ├── get-languages/
│   └── admin-delete-guide/
│
└── globals.css                # Global styles

components/
├── admin-sidebar.tsx          # Admin side navigation
├── guide-sidebar.tsx          # Guide side navigation
├── admin-login-modal.tsx      # Admin login form
├── admin-actions-modal.tsx    # Deactivate/activate/delete
├── guide-detail-modal.tsx     # Admin review modal
├── guide-card.tsx             # Guide display card
├── search-guides.tsx          # Search interface
├── available-guides.tsx       # Featured guides
├── location-autocomplete.tsx  # Location picker
├── multi-language-select.tsx  # Language selector
├── guide-availability-manager.tsx # Availability management
├── guide-itinerary-manager.tsx    # Itinerary management
├── itinerary-modal.tsx        # Itinerary form modal
├── resubmission-form.tsx      # Resubmit after rejection
└── ui/                        # Atomic UI components
    ├── button.tsx
    ├── card.tsx
    ├── input.tsx
    ├── select.tsx
    ├── tabs.tsx
    ├── badge.tsx
    ├── dialog.tsx
    ├── alert.tsx
    └── ... (50+ components)

lib/
├── supabase-client.ts         # Supabase initialization
├── utils.ts                   # Utility functions
├── languages.ts               # Language list
└── user-management.ts         # Admin user functions

hooks/
├── use-mobile.ts              # Mobile detection
└── use-toast.ts               # Toast notifications

styles/
└── globals.css                # Tailwind globals

public/                         # Static assets
```

### Page Routes Summary

| Path | Role | Purpose |
|------|------|---------|
| `/` | Public | Home page with featured guides |
| `/guide/signup` | Public | Guide registration / resubmission |
| `/guide/login` | Public | Guide login (redirects based on status) |
| `/guide/dashboard` | Guide | Approved guide dashboard |
| `/guide/profile` | Guide | View own profile |
| `/guide/edit-profile` | Guide | Edit profile & details |
| `/admin/login` | Public | Admin login |
| `/admin/dashboard` | Admin | Manage guides (pending/approved/rejected) |

### Responsive Design Approach

**Mobile-First Strategy:**

```tsx
// Base styles: mobile (no breakpoint)
className="text-sm p-4 grid grid-cols-1"

// Tablet: sm (640px+)
className="sm:text-base sm:p-5 sm:grid-cols-2"

// Desktop: md (768px+) / lg (1024px+)
className="lg:text-lg lg:p-6 lg:grid-cols-3"
```

**Breakpoints Used:**
- `sm:` - 640px (tablets)
- `md:` - 768px (small desktops)
- `lg:` - 1024px (desktops)

**Key Components Made Responsive:**
- Navigation bar (hamburger on mobile)
- Stats cards (1 col → 3 col)
- Guide cards (stacked → side-by-side)
- Sidebars (full-width hamburger → fixed sidebar)
- Forms (full-width on mobile → centered on desktop)

---

## Backend Architecture

### API Routes Structure

```
app/api/
├── search-guides/route.ts              [GET]
├── get-approved-guides/route.ts        [GET]
├── get-guide-itinerary/route.ts        [GET]
├── create-itineraries/route.ts         [POST]
├── approve-my-guide/route.ts           [POST]
├── get-languages/route.ts              [GET]
└── admin-delete-guide/route.ts         [DELETE]
```

### API Endpoint Details

#### 1. **GET /api/search-guides**

**Parameters:**
```typescript
name?: string          // Guide name (case-insensitive substring)
location?: string      // Location (fuzzy match, 70-80% similarity)
language?: string      // Spoken language
availabilityDate?: ISO string // Date range check
```

**Response:**
```typescript
{
  guides: Guide[]      // Filtered approved, active guides
}
```

**Logic:**
1. Get all approved, non-deactivated guides
2. Filter by name (contains, case-insensitive)
3. Filter by location (fuzzy matching)
4. Filter by languages (array includes)
5. Filter by availability dates (overlap check)

**Used By:** Home page search, guide discovery

---

#### 2. **GET /api/get-approved-guides**

**Parameters:** None

**Response:**
```typescript
{
  guides: Guide[]      // All approved, active guides (3 max for featured)
}
```

**Logic:**
1. Query guides where status = 'approved' AND is_deactivated = false
2. Order by created_at descending
3. Limit to 3 (featured guides on home page)

**Used By:** Home page featured section, available guides component

---

#### 3. **GET /api/get-guide-itinerary?guide_id=xxx**

**Parameters:**
```typescript
guide_id: string       // UUID of guide
```

**Response:**
```typescript
{
  itinerary: GuideItinerary | null
}
```

**Logic:**
1. Query guide_itineraries table
2. Filter by guide_id
3. Return first/recent itinerary
4. Use service role key (server-side only)

**Used By:** Guide detail modal, guide profile page

---

#### 4. **POST /api/create-itineraries**

**Body:**
```typescript
{
  guideId: string
  numberOfDays: number
  timings: string
  description: string
  placesToVisit: string
  instructions?: string
  image_1?: File
  image_2?: File
}
```

**Response:**
```typescript
{
  success: boolean
  itinerary?: GuideItinerary
  error?: string
}
```

**Logic:**
1. Authenticate user (JWT check)
2. Verify ownership (user_id matches)
3. Upload images to storage (if provided)
4. Insert into guide_itineraries table
5. Return created itinerary

**Used By:** Guide itinerary manager component

---

#### 5. **POST /api/approve-my-guide**

**Body:**
```typescript
{
  approvalType: 'approve' | 'reject'
  rejectionReason?: string  // Required if reject
}
```

**Response:**
```typescript
{
  success: boolean
  error?: string
}
```

**Logic:**
1. Authenticate user (JWT check)
2. Get user's guide record
3. Update status to 'approved' or 'rejected'
4. If reject, store rejection_reason
5. Set is_resubmitted flag to false

**Used By:** Guide dashboard (if not pending)

---

#### 6. **GET /api/get-languages**

**Parameters:** None

**Response:**
```typescript
{
  languages: string[]  // Alphabetically sorted language list
}
```

**Logic:**
1. Read from hardcoded SORTED_LANGUAGES array
2. Return 200+ languages

**Used By:** Language selector component

---

#### 7. **DELETE /api/admin-delete-guide**

**Parameters:**
```typescript
guideId: string        // UUID of guide to delete
```

**Response:**
```typescript
{
  success: boolean
  error?: string
}
```

**Logic:**
1. Authenticate user with service role key (server-side)
2. Verify admin status
3. Delete guide record from guides table
4. Cascade delete related records (RLS + foreign keys)
5. Delete auth user from auth.users

**Used By:** Admin dashboard action modal

---

### Middleware & Security

**Supabase Client Initialization:**
```typescript
// /lib/supabase-client.ts
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Service role client (server-side only)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);
```

---

## Complete User Flows

### Flow 1: Guide Registration

```
START: Home page
  |
  ↓ Click "Register" button
  |
→ /guide/signup?step=choice
  |
  ├─ User clicks "New Guide Registration"
  │  ↓
  │  Multi-step form:
  │  1. Personal Info (name, email, password)
  │  2. Contact (phone, location via autocomplete)
  │  3. Languages (multi-select)
  │  4. Document type (Aadhar or Driving License)
  │  5. Document ID (number only)
  │  6. File uploads (profile picture, document)
  │
  │  Each step validation:
  │  ├─ Email format check
  │  ├─ Password strength check
  │  ├─ Phone number validation
  │  ├─ File size check (5MB, 10MB)
  │  └─ File type check (jpg, png, pdf)
  │
  │  Final submission:
  │  ├─ Create auth user → supabase.auth.signUp()
  │  ├─ Create users record (role: guide)
  │  ├─ Create guides record (status: pending)
  │  ├─ Upload profile picture → storage/profile-pictures/
  │  ├─ Upload document → storage/documents/
  │  ├─ Store file URLs in guides table
  │  └─ Show success message
  │
  └─ User sees: "Verification pending"
     "Contact: 9550574212"
     Logout button

END: Returns to home page
```

### Flow 2: Guide Resubmission (After Rejection)

```
START: Rejected guide tries to login
  |
  ↓ /guide/login
  |
  Enters email & password
  |
  Check status:
  ├─ Status = 'rejected'
  ├─ Show rejection reason
  ├─ Show "Resubmit Application" button
  │
  ↓ Clicks "Resubmit"
  |
→ /guide/signup?step=resubmit
  |
  Resubmission form:
  ├─ Shows previous rejection reason
  ├─ Can change: profile picture, document ID, document
  ├─ Can update language/location if needed
  ├─ Cannot change: email, name (can edit on profile later)
  │
  ↓ Submits updated files
  |
  Backend:
  ├─ Delete old files from storage
  ├─ Upload new files
  ├─ Update guides record with new URLs
  ├─ Reset status to 'pending'
  ├─ Set is_resubmitted = true (shows badge)
  └─ Logout user → redirect to /guide/login
  
  ↓ Resets message: "Resubmitted. Waiting for admin review."

END: Waiting for admin review
```

### Flow 3: Admin Dashboard Review

```
START: Admin login
  |
  ↓ /admin/login
  |
  Enters email & password
  |
  Check role:
  ├─ Verify role = 'admin'
  ├─ Generate JWT token
  └─ Redirect to /admin/dashboard
  |
→ /admin/dashboard
  |
  Dashboard loads:
  ├─ Shows 3 stat cards:
  │  ├─ Pending count: 5
  │  ├─ Approved count: 12
  │  └─ Rejected count: 3
  │
  ├─ Shows 3 tabs:
  │  ├─ Pending (default)
  │  ├─ Approved
  │  └─ Rejected
  │
  ├─ Pending tab shows guide cards with:
  │  ├─ Profile picture
  │  ├─ Name, email, phone
  │  ├─ Location, languages
  │  ├─ "Resubmitted" badge (if applicable)
  │  └─ "View Details" button
  │
  ↓ Click "View Details"
  |
  Modal opens:
  ├─ Full-size profile picture
  ├─ Full-size document image
  ├─ All guide information
  ├─ Two action buttons:
  │  ├─ "Approve" button
  │  │  ↓ Updates guides.status = 'approved'
  │  │  └─ Card moves to Approved tab
  │  │
  │  └─ "Reject" button
  │     Opens reason input
  │     ↓ Updates guides.status = 'rejected'
  │     ↓ Stores rejection_reason
  │     └─ Card moves to Rejected tab
  │
  ├─ Approved tab shows cards with:
  │  ├─ Green background
  │  ├─ All guide info
  │  ├─ Three action buttons:
  │  │  ├─ "View Details"
  │  │  ├─ "Deactivate" → Opens reason modal
  │  │  └─ "Delete" → Opens confirmation
  │  │
  │  └─ Deactivate:
  │     ├─ Sets is_deactivated = true
  │     ├─ Guide cannot login (shows "account deactivated" message)
  │     ├─ "Activate" button appears to reactivate
  │
  └─ Rejected tab shows cards with:
     ├─ Red background
     ├─ Rejection reason displayed
     ├─ If guide not resubmitted:
     │  └─ "Delete" button available
     └─ If guide resubmitted:
        └─ Card should move to Pending for re-review

END: Admin completes reviews, logout available in sidebar
```

### Flow 4: Guide Dashboard (After Approval)

```
START: Approved guide login
  |
  ↓ /guide/login
  |
  Enters email & password
  |
  Check status:
  ├─ Status = 'approved'
  ├─ NOT deactivated
  └─ Redirect to /guide/dashboard
  |
→ /guide/dashboard
  |
  Page shows:
  ├─ Sidebar with:
  │  ├─ "GuideVerify" logo (blue)
  │  ├─ Dashboard link (active)
  │  ├─ Profile link
  │  ├─ Edit Profile link
  │  └─ Logout button
  │
  ├─ Welcome card: "Welcome, [Name]! 👋"
  │
  ├─ Two main sections:
  │  ├─ Availability Manager
  │  │  ├─ Shows calendar
  │  │  ├─ Set availability date ranges
  │  │  ├─ Mark as available/unavailable
  │  │  └─ Button: "Add Availability"
  │  │
  │  └─ Itinerary Manager
  │     ├─ Shows created tours/packages
  │     ├─ For each itinerary:
  │     │  ├─ Days (3-day trek, 5-day city tour)
  │     │  ├─ Time timing (9am-5pm)
  │     │  ├─ Places to visit
  │     │  ├─ Description
  │     │  ├─ Edit button
  │     │  └─ Delete button
  │     │
  │     └─ Button: "Add Itinerary"
  │
  ↓ Click "Add Itinerary"
  |
  Modal opens:
  ├─ Form fields:
  │  ├─ Number of days (dropdown)
  │  ├─ Timings (e.g., "9am-5pm")
  │  ├─ Description (textarea)
  │  ├─ Places to visit (textarea)
  │  ├─ Instructions (optional)
  │  ├─ Image 1 upload
  │  └─ Image 2 upload
  │
  ↓ Submit
  |
  Backend:
  ├─ POST /api/create-itineraries
  ├─ Upload images if provided
  ├─ Create guide_itineraries record
  └─ Refresh UI with new itinerary

END: Guide's tours are searchable by tourists
```

### Flow 5: Guide Profile Management

```
START: Approved guide
  |
  ↓ Click "Profile" in sidebar
  |
→ /guide/profile
  |
  Shows read-only profile:
  ├─ Profile picture (large)
  ├─ Name with "Verified" badge
  ├─ Email
  ├─ Phone
  ├─ Location
  ├─ Languages (badges)
  ├─ Document type
  ├─ Status: "Approved ✓"
  ├─ Button: "Edit Profile"
  │
  ↓ Click "Edit Profile"
  |
→ /guide/edit-profile
  |
  Edit form shows:
  ├─ Profile picture (with upload to change)
  ├─ Name field
  ├─ Email (read-only)
  ├─ Phone number
  ├─ Location (with autocomplete)
  ├─ Languages (multi-select)
  ├─ Save button
  │
  ↓ Submit changes
  |
  Backend:
  ├─ Authenticate and verify ownership
  ├─ Upload new profile picture if changed
  ├─ Update guides table record
  └─ Show success message

END: Profile updated, return to dashboard
```

### Flow 6: Tourist Search (Public)

```
START: Home page
  |
  ↓ See "Featured Guides" section
  |
  Shows 3 featured guides:
  ├─ Profile picture
  ├─ Name
  ├─ Location
  ├─ Languages (badges)
  ├─ Rating/status
  └─ "View Guide" button
  |
  Can also use search:
  ├─ Search by guide name
  ├─ Filter by location
  ├─ Filter by language
  ├─ Filter by availability date
  │
  ↓ Click "Search"
  |
  GET /api/search-guides
  ├─ Query parameters: name, location, language, availabilityDate
  ├─ Return filtered approved, active guides
  ├─ Show results as cards
  │
  ↓ Click on a guide card
  |
  Shows detailed guide info:
  ├─ Full profile picture
  ├─ Name & location
  ├─ Contact info (email, phone)
  ├─ Languages
  ├─ Itinerary samples
  └─ Availability dates

END: Tourist views guide details (future: contact/book)
```

---

## Component Hierarchy

### Layout Structure: Home Page

```
Home Page (page.tsx)
├─ Navigation Bar
│  ├─ Logo
│  ├─ "Guide Login" button
│  └─ "Register" button
│
├─ Hero Section
│  ├─ Main heading
│  ├─ Subheading
│  └─ "Start Your Journey" CTA
│
├─ Featured Guides Section
│  ├─ SearchGuides (component)
│  │  ├─ Search input
│  │  ├─ Filter inputs
│  │  └─ "Search" button
│  │     ↓ Calls /api/search-guides
│  │
│  └─ AvailableGuides (component)
│     ├─ GuideCard (map over results)
│     │  ├─ Profile picture
│     │  ├─ Name & location
│     │  ├─ Languages
│     │  └─ "View Guide" button
│     │     ↓ Opens guide detail modal
│     │
│     └─ GuideDetailModal (conditional)
│        ├─ Lightbox-style modal
│        ├─ Full profile picture
│        ├─ Full details
│        └─ Contact info
│
├─ Features Section
│  ├─ Card: "Easy Registration"
│  ├─ Card: "Quick Verification"
│  └─ Card: "Connect Tourists"
│
└─ Admin Access
   └─ Hidden admin access button
      ↓ Opens AdminLoginModal
```

### Layout Structure: Guide Signup Page

```
Guide Signup Page (page.tsx)
├─ Step 1: Choice
│  ├─ "New Guide Registration" button
│  └─ "Resubmit Application" button
│
├─ Step 2: Personal Information (if new)
│  ├─ Name input
│  ├─ Email input
│  ├─ Password input
│  ├─ "Next" button
│  └─ "Back" button
│
├─ Step 3: Contact Details
│  ├─ Phone input
│  ├─ LocationAutocomplete (component)
│  │  ├─ Input field with suggestions
│  │  └─ Geoapify API integration
│  ├─ "Next" button
│  └─ "Back" button
│
├─ Step 4: Languages
│  ├─ MultiLanguageSelect (component)
│  │  ├─ Search input
│  │  ├─ Selected badges
│  │  └─ Dropdown list
│  ├─ "Next" button
│  └─ "Back" button
│
├─ Step 5: Document Selection
│  ├─ Radio: "Aadhar Card" / "Driving License"
│  ├─ Text input for ID number
│  ├─ "Next" button
│  └─ "Back" button
│
├─ Step 6: File Uploads
│  ├─ Profile picture upload
│  │  ├─ Drag-drop area
│  │  ├─ Image preview
│  │  └─ File validation
│  ├─ Document upload
│  │  ├─ Drag-drop area
│  │  ├─ Image/PDF preview
│  │  └─ File validation
│  ├─ "Submit" button
│  └─ "Back" button
│
└─ Success State
   ├─ Checkmark icon
   ├─ "Verification pending" message
   ├─ Contact info
   └─ Auto-logout after 3s
```

### Layout Structure: Admin Dashboard

```
Admin Dashboard (page.tsx)
├─ AdminSidebar (component)
│  ├─ Logo
│  ├─ Dashboard link (active)
│  └─ Logout button
│
├─ Main Content
│  ├─ Header: "Dashboard"
│  │
│  ├─ Stats Cards Grid (3 columns on desktop)
│  │  ├─ Pending count card
│  │  ├─ Approved count card
│  │  └─ Rejected count card
│  │
│  ├─ Tabs Container
│  │  ├─ TabsList
│  │  │  ├─ "Pending" trigger
│  │  │  ├─ "Approved" trigger
│  │  │  └─ "Rejected" trigger
│  │  │
│  │  ├─ TabsContent: Pending
│  │  │  └─ Guide cards grid
│  │  │     ├─ Profile picture
│  │  │     ├─ Guide info
│  │  │     ├─ Languages badges
│  │  │     ├─ "Resubmitted" badge (conditional)
│  │  │     └─ "View Details" button
│  │  │
│  │  ├─ TabsContent: Approved
│  │  │  └─ Green-themed guide cards
│  │  │     └─ Action buttons: View, Deactivate/Activate, Delete
│  │  │
│  │  └─ TabsContent: Rejected
│  │     └─ Red-themed guide cards
│  │        ├─ Rejection reason displayed
│  │        └─ Delete button (if not resubmitted)
│  │
│  ├─ GuideDetailModal (conditional)
│  │  ├─ Full-size profile picture (lightbox)
│  │  ├─ Full-size document (lightbox)
│  │  ├─ All guide details
│  │  ├─ "Approve" button
│  │  └─ "Reject" button + reason input
│  │
│  └─ AdminActionsModal (conditional)
│     ├─ Action: Deactivate
│     │  ├─ Reason input
│     │  └─ "Confirm" button
│     ├─ Action: Activate
│     │  └─ "Confirm" button
│     └─ Action: Delete
│        ├─ Confirmation message
│        ├─ "DELETE" text input
│        └─ "Confirm Delete" button
│
└─ Responsive Adjustments
   ├─ Mobile: 1 card per row, hamburger sidebar
   ├─ Tablet: 2-3 cards per row
   └─ Desktop: 3 cards per row, fixed sidebar
```

---

## API Endpoints

### Endpoint Summary Table

| Method | Path | Params | Response | Used By |
|--------|------|--------|----------|---------|
| GET | `/api/search-guides` | name, location, language, availabilityDate | `{ guides: Guide[] }` | Home search |
| GET | `/api/get-approved-guides` | None | `{ guides: Guide[] }` | Featured guides |
| GET | `/api/get-guide-itinerary` | guideId | `{ itinerary: GuideItinerary\|null }` | Guide detail modal |
| POST | `/api/create-itineraries` | Form data + files | `{ success, itinerary\|error }` | Itinerary manager |
| POST | `/api/approve-my-guide` | approvalType, rejectionReason | `{ success\|error }` | Signup success |
| GET | `/api/get-languages` | None | `{ languages: string[] }` | Language selector |
| DELETE | `/api/admin-delete-guide` | guideId | `{ success\|error }` | Admin dashboard |

---

## Data Flow Details

### Example: Complete Guide Registration Flow

```
Step 1: User submits signup form
─────────────────────────────────

Client (React state):
{
  formData: {
    name: "John Doe",
    email: "john@example.com",
    password: "SecurePass123!",
    phone_number: "+919876543210",
    location: "Shimla, Himachal Pradesh",
    languages: ["English", "Hindi", "Nepali"],
    document_type: "aadhar"
  },
  files: {
    profile_picture: File,
    document: File
  }
}

   ↓

Step 2: Frontend validation
─────────────────────────

Checks performed:
- Email format ✓
- Password strength ✓
- Phone length ✓
- Files exist ✓
- File sizes ✓
- Languages selected ✓

   ↓

Step 3: Create Supabase auth user
──────────────────────────────────

POST to supabase.auth.signUp({
  email: "john@example.com",
  password: "SecurePass123!"
})

Response:
{
  user: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    email: "john@example.com"
  },
  session: { access_token: "eyJ..." }
}

   ↓

Step 4: Upload profile picture to storage
──────────────────────────────────────

POST /storage/profile-pictures/{guide_id}/{filename}

Headers: Authorization: Bearer {access_token}

Supabase Storage:
- Creates bucket path
- Stores file
- Returns public URL: https://xxxx.supabase.co/storage/v1/object/public/profile-pictures/...

   ↓

Step 5: Upload document to storage
───────────────────────────────────

POST /storage/documents/{guide_id}/{filename}

Similar process, document stored securely

   ↓

Step 6: Create users record
────────────────────────────

INSERT INTO users:
{
  id: "550e8400-e29b-41d4-a716-446655440000",
  email: "john@example.com",
  role: "guide",
  created_at: NOW(),
  updated_at: NOW()
}

Actually: Automatic via Supabase trigger on auth.users

   ↓

Step 7: Create guides record
──────────────────────────────

INSERT INTO guides:
{
  id: "660e8400-e29b-41d4-a716-446655440111",
  user_id: "550e8400-e29b-41d4-a716-446655440000",
  name: "John Doe",
  phone_number: "+919876543210",
  email: "john@example.com",
  location: "Shimla, Himachal Pradesh",
  languages: ["English", "Hindi", "Nepali"],  -- stored as array
  profile_picture_url: "https://xxxx.supabase.co/storage/v1/object/public/profile-pictures/...",
  document_url: "https://xxxx.supabase.co/storage/v1/object/...",
  document_type: "aadhar",
  status: "pending",
  rejection_reason: null,
  is_deactivated: false,
  is_resubmitted: false,
  created_at: NOW(),
  updated_at: NOW()
}

   ↓

Step 8: Frontend response handling
──────────────────────────────────

Success:
- Show "Verification pending" message
- Display contact info: "Call 9550574212"
- Logout user automatically
- Redirect to home page

   ↓

Step 9: Admin receives notification (future)
──────────────────────────────────────

Email to admin:
"New guide registration: John Doe from Shimla"

   ↓

Step 10: Admin reviews in dashboard
────────────────────────────────────

GET /admin/dashboard:

SELECT * FROM guides WHERE status = 'pending'
Result includes John Doe's record

Admin clicks "View Details":
- Loads profile_picture_url (displays image)
- Loads document_url (displays document)
- Shows all fields

Admin clicks "Approve":

UPDATE guides SET status = 'approved' WHERE id = '...'

   ↓

Step 11: John logs in again
────────────────────────────

POST /guide/login:
- Email + password auth
- Query guides table: SELECT * WHERE user_id = '...'
- Check status: 'approved' ✓
- Redirect to /guide/dashboard

   ↓

Step 12: Guide can now create itineraries
──────────────────────────────────────────

In dashboard:
- Click "Add Itinerary"
- Fill form
- POST /api/create-itineraries
- Creates record in guide_itineraries table
- Images stored in storage

   ↓

Step 13: Tourists can find the guide
──────────────────────────────────────

Home page search:
GET /api/search-guides?location=Shimla&language=English

Backend:
SELECT * FROM guides WHERE status = 'approved' AND is_deactivated = false
- Filter by location (fuzzy match)
- Filter by language (array contains)
- Return results

Frontend:
- Display John's guide card
- Show profile picture, location, languages
- "View Guide" button shows modal with itineraries

End: Guide is discoverable and bookable
```

---

## Key Features Implementation

### 1. Multi-Language Support

**Storage Method:** PostgreSQL ARRAY type

```typescript
// In TypeScript
languages: string[]  // ["English", "Hindi", "Nepali"]

// In PostgreSQL
languages TEXT[]     // Stored as {"English", "Hindi", "Nepali"}

// Querying
WHERE languages @> ARRAY['English']  // Contains "English"
```

**Component:** `MultiLanguageSelect`
```typescript
// 200+ languages from SORTED_LANGUAGES array
const languages = [
  "English", "Hindi", "Bengali", "Tamil", "Telugu", ...
]

// User can select multiple languages
// Displayed as badges
// Searchable dropdown
```

---

### 2. Location Autocomplete

**Integration:** Geoapify API

```typescript
// LocationAutocomplete Component
- On input change: Call Geoapify API
- API returns list of places matching input
- User selects from dropdown
- Selected location stored in form

/**
 * Geoapify API: 
 * https://api.geoapify.com/v1/geocode/autocomplete
 * ?text={input}&apiKey={key}&limit=5
 */
```

**Features:**
- Real-time suggestions
- Supports Indian locations
- Full address handling
- Debounced API calls

---

### 3. Document Upload Validation

**Validation Flow:**

```typescript
// Client-side validation
function validateFile(file: File, type: 'profile' | 'document') {
  // Check file size
  const maxSize = type === 'profile' ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
  if (file.size > maxSize) throw new Error('File too large');

  // Check file type
  const allowed = type === 'profile' 
    ? ['image/jpeg', 'image/png', 'image/webp']
    : ['image/jpeg', 'image/png', 'application/pdf'];
  if (!allowed.includes(file.type)) throw new Error('Invalid file type');

  // Show preview
  const reader = new FileReader();
  reader.onloadend = () => setPreview(reader.result);
  reader.readAsDataURL(file);
}

// Server-side validation (during upload)
- Re-check file size
- Re-check MIME type
- Scan for malware (future)
```

---

### 4. Role-Based Access Control

**Implementation:**

```typescript
// Middleware check on all protected pages
async function checkAuthAndRole() {
  // 1. Check if user is logged in
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) router.push('/login');

  // 2. Fetch user role
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', authData.user.id)
    .single();

  // 3. Check role-based access
  if (currentPage === '/admin/dashboard' && userData.role !== 'admin') {
    router.push('/unauthorized');
  }
  
  if (currentPage === '/guide/dashboard' && userData.role !== 'guide') {
    router.push('/unauthorized');
  }
}
```

---

### 5. Resubmission Workflow

**Flow:**

```typescript
// After rejection, guide sees:
1. Rejection reason displayed on login page
2. "Resubmit Application" button

// Clicking button:
- Takes to resubmission form
- Pre-fills existing data
- Only allows updating:
  - Profile picture
  - Document image
  - Optional: location, languages
- Cannot change: email, name

// On submission:
1. Delete old files from storage
2. Upload new files
3. Update guides record with new URLs
4. Reset status to 'pending'
5. Set is_resubmitted = true (badge shows)
6. Logout user

// In admin dashboard:
- Card shows "Resubmitted" badge
- Admin reviews again with fresh perspective
```

---

### 6. Admin Management Features

**Deactivate Guide:**
```typescript
// When approved guide needs to be temporarily disabled
UPDATE guides SET 
  is_deactivated = true,
  deactivation_reason = "Reason text"
WHERE id = guide_id

// Guide effect:
- Cannot login (redirects to status page)
- Shows "account deactivated" message
- Admin can "Activate" to re-enable
```

**Delete Guide Completely:**
```typescript
// Cascading delete:
1. Delete from guide_itineraries (cascade)
2. Delete from guide_availability (cascade)
3. Delete from guides table
4. Delete from users table
5. Delete from auth.users (via trigger)
6. Delete files from storage

// Result: Completely wiped from system
```

---

### 7. Search & Filtering

**Search Algorithm:**

```typescript
// Name: Case-insensitive substring match
guides.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()))

// Location: Fuzzy matching (70-80% similarity)
function fuzzyMatch(haystack: string, needle: string, threshold: number) {
  // Calculates Levenshtein distance
  // Returns true if similarity >= threshold
}

// Location example:
"Shimla" matches "Shimla" (typo tolerance)
"Manali" matches "Mandi" (fuzzy)

// Language: Exact array match
guides.filter(g => g.languages.includes(selectedLanguage))

// Availability: Date range overlap
if (start_date <= query_date && query_date <= end_date) {
  // Guide available on this date
}
```

---

### 8. Responsive Design System

**Breakpoints & Approach:**

```css
/* Mobile-first (no breakpoint) */
.card { padding: 1rem; font-size: 0.875rem; }

/* Tablet (640px+) */
@media (min-width: 640px) {
  .card { padding: 1.25rem; font-size: 1rem; }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .card { padding: 1.5rem; font-size: 1.125rem; }
}
```

**Components Made Responsive:**

| Component | Mobile | Tablet | Desktop |
|-----------|--------|--------|---------|
| Navigation | Hamburger | Hamburger | Full nav |
| Sidebar | Offscreen | Offscreen | Fixed left |
| Cards grid | 1 column | 2 columns | 3 columns |
| Images | Small | Medium | Large |
| Typography | Small | Medium | Large |
| Buttons | Small icons | Medium | Large full-text |

---

### 9. Form Validation

**Multi-Step Form Validation:**

```typescript
// Each step validated before proceeding
Step 1: Personal Info
├─ Name: min 3 chars, max 100
├─ Email: valid format, unique check
└─ Password: min 8 chars, must have uppercase, number, special char

Step 2: Contact
├─ Phone: 10 digits Indian format
└─ Location: not empty, via autocomplete

Step 3: Languages
└─ At least 1 language selected

Step 4: Document
├─ Document type: Aadhar or Driving License
└─ ID number: format validation

Step 5: Files
├─ Profile picture: 5MB, jpg/png/webp
└─ Document: 10MB, jpg/png/pdf
```

---

### 10. Error Handling

**Global Error Handling:**

```typescript
// All API calls wrapped with try-catch
try {
  const result = await supabase.from('guides').select()
} catch (error) {
  // Log to console
  console.error('Query error:', error)
  
  // Show user-friendly message
  setError('Failed to load guides. Please try again.')
  
  // Optionally: Send to error tracking service
}

// Common errors:
- 400 Bad Request → Show specific field error
- 401 Unauthorized → Redirect to login
- 403 Forbidden → Show permission denied
- 500 Server Error → Show generic error message
```

---

## Summary Diagram: Complete System

```
┌─────────────────────────────────────────────────────────────┐
│                     GUIDEVRIFY PLATFORM                     │
└─────────────────────────────────────────────────────────────┘

┌─── FRONTEND (Next.js + React) ────────────────────────────┐
│                                                           │
│  Public Pages:                                            │
│  - Home (/)                                               │
│  - Guide Signup (/guide/signup)                           │
│  - Guide Login (/guide/login)                             │
│  - Admin Login (/admin/login)                             │
│                                                           │
│  Protected Pages:                                         │
│  - Guide Dashboard (/guide/dashboard)                     │
│  - Guide Profile (/guide/profile)                         │
│  - Guide Edit (/guide/edit-profile)                       │
│  - Admin Dashboard (/admin/dashboard)                     │
│                                                           │
│  Components:                                              │
│  - Sidebars (GuideSidebar, AdminSidebar)                  │
│  - Modals (GuideDetailModal, AdminActionsModal)           │
│  - Forms (MultiLanguageSelect, LocationAutocomplete)      │
│  - Cards (GuideCard, AvailableGuides)                     │
│  - UI Library (50+ shadcn components)                     │
│                                                           │
└─────────────────────────────────────────────────────────────┘
                           ↑ ↓
┌─── BACKEND (Next.js API Routes) ──────────────────────────┐
│                                                           │
│  GET  /api/search-guides                                  │
│  GET  /api/get-approved-guides                            │
│  GET  /api/get-guide-itinerary                            │
│  POST /api/create-itineraries                             │
│  POST /api/approve-my-guide                               │
│  GET  /api/get-languages                                  │
│  DELETE /api/admin-delete-guide                           │
│                                                           │
└─────────────────────────────────────────────────────────────┘
                           ↑ ↓
┌─── DATABASE (Supabase PostgreSQL) ────────────────────────┐
│                                                           │
│  Tables:                                                  │
│  - auth.users (auth)                                      │
│  - users (roles)                                          │
│  - guides (profiles)                                      │
│  - guide_itineraries (tours)                              │
│  - guide_availability (schedules)                         │
│                                                           │
│  Security:                                                │
│  - Row-Level Security (RLS)                               │
│  - Role-based policies                                    │
│  - Foreign key constraints                                │
│                                                           │
└─────────────────────────────────────────────────────────────┘
                           ↑ ↓
┌─── STORAGE (Supabase Storage) ────────────────────────────┐
│                                                           │
│  Buckets:                                                 │
│  - profile-pictures (5MB limit)                           │
│  - documents (10MB limit)                                 │
│                                                           │
└─────────────────────────────────────────────────────────────┘

┌─── EXTERNAL SERVICES ─────────────────────────────────────┐
│                                                           │
│  - Geoapify API (Location autocomplete)                   │
│  - Supabase Auth (JWT authentication)                     │
│  - Vercel (Hosting - optional)                            │
│                                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Takeaways

### Architecture Principles

1. **Separation of Concerns**
   - Frontend: UI/UX, form handling, client-side validation
   - Backend: Business logic, data validation, authorization
   - Database: Data storage, RLS policies, relationships

2. **Security First**
   - RLS policies on all sensitive tables
   - Role-based access control
   - JWT token validation
   - File upload validation

3. **Scalability**
   - Serverless functions (auto-scaling)
   - Supabase infrastructure (managed)
   - Indexed database queries
   - Efficient filtering on backend

4. **User Experience**
   - Mobile-first responsive design
   - Multi-step forms with validation
   - Real-time feedback
   - Clear error messages

### Data Flow Summary

```
Guide Registration → Profile Upload → Admin Review → Approval
        ↓                   ↓              ↓              ↓
  Supabase Auth      Storage Buckets   Dashboard    Guide Access
        ↓                   ↓              ↓              ↓
  JWT Token         Public URLs       Status Update  Dashboard Page
        ↓                   ↓              ↓              ↓
  Session           DB Records      RLS Policy    Itinerary/Availability
        ↓                   ↓              ↓              ↓
  Protected         Searchable        Published       Discoverable
```

### Critical Success Factors

1. **Authentication** - Supabase handles securely
2. **Authorization** - RLS policies at DB level
3. **File Management** - Validation + secure storage
4. **Performance** - Indexed queries, lazy loading
5. **UX** - Responsive, intuitive, fast feedback
6. **Maintenance** - TypeScript for type safety, modular components

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] RLS policies enabled
- [ ] Storage buckets created
- [ ] Admin user created
- [ ] Geoapify API key configured
- [ ] CORS settings verified
- [ ] Email templates created (future)
- [ ] Error tracking setup (future)
- [ ] Analytics configured (future)

---

**End of Analysis Document**

This document provides a complete understanding of the GuideVerify platform from top to bottom. All information is accurate as of February 24, 2026, Phase 12 (Admin Responsive Design Implementation).
