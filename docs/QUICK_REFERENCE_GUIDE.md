# GuideVerify - Quick Reference Visual Guide

## 🏗️ High-Level System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                            │
│                    (Next.js Frontend - React)                    │
└──────────────────────────────────────────────────────────────────┘
                              ↕
     ┌─────────────────────────────────────────────────────────────┐
     │         Next.js App Routes (Frontend Pages)                 │
     ├─────────────────────────────────────────────────────────────┤
     │ Public:                Protected (Authenticated):           │
     │ - Home /               - /guide/dashboard                   │
     │ - /guide/signup        - /guide/profile                     │
     │ - /guide/login         - /guide/edit-profile                │
     │ - /admin/login         - /admin/dashboard                   │
     └─────────────────────────────────────────────────────────────┘
                              ↕
     ┌─────────────────────────────────────────────────────────────┐
     │         Next.js API Routes (Serverless Backend)             │
     ├─────────────────────────────────────────────────────────────┤
     │ GET  /api/search-guides          (Search & filter)          │
     │ GET  /api/get-approved-guides    (Featured)                 │
     │ GET  /api/get-guide-itinerary    (Tour details)             │
     │ POST /api/create-itineraries     (Create tour)              │
     │ POST /api/approve-my-guide       (Submit for approval)      │
     │ GET  /api/get-languages          (Language list)            │
     │ DELETE /api/admin-delete-guide   (Admin delete)             │
     └─────────────────────────────────────────────────────────────┘
                              ↕
          ┌──────────────────────┬──────────────────────┐
          ↓                      ↓                      ↓
     ┌─────────────┐      ┌──────────────┐      ┌─────────────┐
     │ Supabase    │      │   Supabase   │      │  Supabase   │
     │   Auth      │      │  PostgreSQL  │      │  Storage    │
     ├─────────────┤      ├──────────────┤      ├─────────────┤
     │ - JWT Token │      │ - guides     │      │ - profile-  │
     │ - Password  │      │ - users      │      │   pictures  │
     │   Hash      │      │ - guide_*    │      │ - documents │
     │ - Session   │      │ - auth.users │      │   (secured)  │
     └─────────────┘      └──────────────┘      └─────────────┘
```

---

## 👤 User Roles & Access

```
┌─────────────────────────────────────────────────────────────────┐
│                      ROLE: GUIDE (Default)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Status Progression:                                            │
│  [Register] → [Pending] → [Approved] → [Dashboard]             │
│                             ↓                                    │
│                       [Can Resubmit]                            │
│                                                                 │
│  After Approval:                                                │
│  ✓ Dashboard access /guide/dashboard                           │
│  ✓ View profile /guide/profile                                 │
│  ✓ Edit profile /guide/edit-profile                            │
│  ✓ Create itineraries (tours)                                  │
│  ✓ Set availability dates                                      │
│  ✓ Searchable by tourists                                      │
│                                                                 │
│  RLS Policies:                                                  │
│  - Can read own guides record                                  │
│  - Can create own itineraries                                  │
│  - Cannot see other guides' records                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      ROLE: ADMIN (Manual)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Dashboard: /admin/dashboard                                   │
│                                                                 │
│  Access:                                                        │
│  ✓ View all pending guides                                     │
│  ✓ View all approved guides                                    │
│  ✓ View all rejected guides                                    │
│  ✓ Approve/Reject applications                                 │
│  ✓ Deactivate/Activate approved guides                         │
│  ✓ Delete guides completely                                    │
│                                                                 │
│  View Details:                                                  │
│  ✓ Full profile picture (lightbox)                             │
│  ✓ Full document image (lightbox)                              │
│  ✓ All submitted information                                   │
│                                                                 │
│  Cannot:                                                        │
│  ✗ Edit guide information                                      │
│  ✗ Be registered via signup (manual creation only)             │
│  ✗ See tourist data (not implemented yet)                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      ROLE: PUBLIC (Visitor)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Access:                                                        │
│  ✓ Home page /                                                 │
│  ✓ Featured guides (3 approved guides)                         │
│  ✓ Search guides                                               │
│  ✓ View guide details (name, location, languages)             │
│                                                                 │
│  Cannot:                                                        │
│  ✗ View any URLs (unless public link)                          │
│  ✗ Contact information (future feature)                        │
│  ✗ Book tours (future feature)                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema Visual

```
┌─── AUTHENTICATION ────────────────────────────────┐
│  auth.users (Supabase Built-in Table)            │
│  ┌─────────────────────────────────────────────┐ │
│  │ id (UUID) ← Primary Key                     │ │
│  │ email (VARCHAR UNIQUE)                      │ │
│  │ encrypted_password (bcrypt hashed)          │ │
│  │ created_at, updated_at (TIMESTAMP)          │ │
│  └─────────────────────────────────────────────┘ │
│         ↓ (Foreign Key)                          │
│  ┌─────────────────────────────────────────────┐ │
│  │   users (Custom Metadata Table)             │ │
│  │ ┌─────────────────────────────────────────┐ │ │
│  │ │ id (UUID, FK → auth.users)          ◄──┼─┼─┐
│  │ │ email (VARCHAR UNIQUE)               │  │ │ │
│  │ │ role: "admin" | "guide"              │  │ │ │
│  │ │ created_at, updated_at               │  │ │ │
│  │ └─────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────┘

┌─── GUIDE PROFILES ────────────────────────────────┐
│  guides (Guide Information Table)                │
│  ┌─────────────────────────────────────────────┐ │
│  │ id (UUID, Primary Key)                      │ │
│  │ user_id (UUID, FK → auth.users)             │ │
│  │ name (VARCHAR)                              │ │
│  │ email, phone_number (VARCHAR)               │ │
│  │ location (VARCHAR 500)                      │ │
│  │ languages (TEXT[] - Array)                  │ │
│  │ document_type: "aadhar"|"driving_licence"   │ │
│  │ status: "pending"|"approved"|"rejected"     │ │
│  │ rejection_reason (TEXT nullable)            │ │
│  │ profile_picture_url (VARCHAR)               │ │
│  │ document_url (VARCHAR)                      │ │
│  │ is_deactivated (BOOLEAN)                    │ │
│  │ deactivation_reason (TEXT nullable)         │ │
│  │ is_resubmitted (BOOLEAN)                    │ │
│  │ created_at, updated_at (TIMESTAMP)          │ │
│  └─────────────────────────────────────────────┘ │
│         ↓ (Cascading FK)                         │
│  ┌─────────────────────────────────────────────┐ │
│  │  guide_itineraries (Tour Packages)          │ │
│  │ ┌─────────────────────────────────────────┐ │ │
│  │ │ id (UUID)                           ◄───┼─┼─┐
│  │ │ guide_id (FK → guides)               │  │ │ │
│  │ │ user_id (FK → auth.users)            │  │ │ │
│  │ │ number_of_days (INTEGER)             │  │ │ │
│  │ │ timings (VARCHAR)                    │  │ │ │
│  │ │ description (TEXT)                   │  │ │ │
│  │ │ places_to_visit (TEXT)               │  │ │ │
│  │ │ image_1_url, image_2_url (VARCHAR)   │  │ │ │
│  │ │ created_at, updated_at               │  │ │ │
│  │ └─────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────┘ │
│         ↓ (Cascading FK)                         │
│  ┌─────────────────────────────────────────────┐ │
│  │  guide_availability (Availability)          │ │
│  │ ┌─────────────────────────────────────────┐ │ │
│  │ │ id (UUID)                           ◄───┼─┼─┐
│  │ │ guide_id (FK → guides)               │  │ │ │
│  │ │ user_id (FK → auth.users)            │  │ │ │
│  │ │ start_date (DATE)                    │  │ │ │
│  │ │ end_date (DATE)                      │  │ │ │
│  │ │ is_available (BOOLEAN)               │  │ │ │
│  │ │ created_at, updated_at               │  │ │ │
│  │ └─────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────┘

┌─── FILE STORAGE ──────────────────────────────────┐
│  Supabase Storage Buckets                        │
│  ┌─────────────────────────────────────────────┐ │
│  │ Bucket: profile-pictures                    │ │
│  │ - Path: /{guide_id}/picture.jpg             │ │
│  │ - Max: 5 MB per file                        │ │
│  │ - Types: JPEG, PNG, WebP                    │ │
│  │ - Public: Yes (read-only URLs)              │ │
│  └─────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────┐ │
│  │ Bucket: documents                           │ │
│  │ - Path: /{guide_id}/document.jpg            │ │
│  │ - Max: 10 MB per file                       │ │
│  │ - Types: JPEG, PNG, PDF                     │ │
│  │ - Public: No (admin only)                   │ │
│  └─────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────┘
```

---

## 🔄 State Transitions

### Guide Status Flow

```
                    ┌────────────────┐
                    │   START HERE   │
                    └────────┬────────┘
                             │
                             ↓
              ┌──────────────────────────────┐
              │  /guide/signup               │
              │  1. Enter personal info      │
              │  2. Select location          │
              │  3. Choose languages         │
              │  4. Upload documents         │
              └──────────────────┬───────────┘
                                 │
                                 ↓
              ┌──────────────────────────────┐
              │  CREATE auth user            │
              │  CREATE guides record        │
              │  status = "PENDING"          │
              │  UPLOAD files to storage     │
              └──────────────────┬───────────┘
                                 │
                    ┌────────────┴────────────┐
                    │   Guide Status          │
                    │   = PENDING             │
                    ├─────────────────────────┤
                    │ Waiting for admin       │
                    │ review. Cannot login.   │
                    └────────────┬────────────┘
                                 │
                ┌────────────────┴────────────────┐
                │     Admin Reviews               │
                │  /admin/dashboard              │
                └────────────────┬────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │  Admin Decision         │
                    └─────────┬─────────┬─────┘
                              │         │
                    ┌─────────┘         └─────────┐
                    ↓                             ↓
          ┌──────────────────┐        ┌──────────────────┐
          │ CLICK APPROVE    │        │ CLICK REJECT     │
          └────────┬─────────┘        └────────┬─────────┘
                   │                           │
                   ↓                           ↓
        ┌────────────────────┐    ┌────────────────────┐
        │ status = APPROVED  │    │ status = REJECTED  │
        │ Guide can login    │    │ Show rejection     │
        │ Dashboard access   │    │ reason on login    │
        └────────────────────┘    └────────┬───────────┘
                   │                        │
                   │                ┌───────┴────────┐
                   │                │ Guide Options: │
                   │                ├────────────────┤
                   │                │ 1. Resubmit    │
                   │                │    application │
                   │                │ 2. Try again   │
                   │                │    later       │
                   │                └────────┬───────┘
                   │                         │
                   │                         ↓
                   │            ┌────────────────────┐
                   │            │ RESUBMIT click     │
                   │            │ /guide/signup      │
                   │            │ is_resubmitted=true│
                   │            │ status=PENDING(+)  │
                   │            └────────────────────┘
                   │
                   ↓
        ┌────────────────────────────┐
        │ Guide Dashboard Active     │
        ├────────────────────────────┤
        │ ✓ /guide/dashboard         │
        │ ✓ /guide/profile           │
        │ ✓ /guide/edit-profile      │
        │ ✓ Create itineraries       │
        │ ✓ Set availability         │
        │ ✓ Searchable by tourists   │
        └────────┬───────────────────┘
                 │
         ┌───────┴──────────┐
         │ Admin can also:  │
         ├──────────────────┤
         │ • Deactivate     │
         │   (is_deactivated)
         │ • Re-activate    │
         │ • Delete         │
         │   completely     │
         └──────────────────┘
```

---

## 🔐 Authentication & Authorization

```
┌────────────────────────────────────────────────────────────┐
│              AUTHENTICATION & AUTHORIZATION                │
└────────────────────────────────────────────────────────────┘

STEP 1: Authentication (Who are you?)
─────────────────────────────────────

User Input:
  EMAIL: john@example.com
  PASSWORD: SecurePass123!
         ↓
Supabase Auth:
  - Hash password using bcrypt
  - Compare with stored hash
  - Verify email exists
         ↓
Success: Generate JWT Token
  {
    "sub": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "role": "authenticated",
    "exp": 1234567890
  }
         ↓
Token stored in:
  ├─ Browser session
  ├─ HttpOnly cookie (Supabase)
  └─ Local storage (fallback)

─────────────────────────────────────

STEP 2: Authorization (What can you do?)
─────────────────────────────────────────

For each protected page:

1️⃣ Check User Logged In?
   ├─ Get JWT token from session
   ├─ Verify token is valid
   └─ Extract user ID
         ↓
2️⃣ Get User Role
   ├─ Query users table
   ├─ WHERE id = extracted_user_id
   └─ Get role: "admin" or "guide"
         ↓
3️⃣ Check Page Access
   ├─ If /admin/* and role != "admin"
   │  └─ Redirect to /unauthorized
   ├─ If /guide/* and role != "guide"
   │  └─ Redirect to /unauthorized
   └─ If /guide/dashboard and guide.status != "approved"
      └─ Redirect to /guide/login

─────────────────────────────────────

STEP 3: Row-Level Security (RLS)
─────────────────────────────────

For all database queries by guides:

Query: SELECT * FROM guides WHERE id = ?
       ↓
Database checks:
  "Can this user access this row?"
       ↓
RLS Policy: guides_read_authenticated
  ├─ User must be authenticated
  └─ User can read any approved guide
       ↓
RLS Policy: guides_update_admin
  ├─ Is user the guide owner? (auth.uid() = user_id)
  │  └─ Allow (can update own guide)
  ├─ Is user an admin?
  │  └─ Allow (can update any guide)
  └─ Otherwise: Deny

─────────────────────────────────────

STEP 4: API Route Security
──────────────────────────

Every API call flow:

Request → /api/endpoint
  ↓
GET JWT from Authorization header
  ↓
Verify JWT signature using Supabase key
  ↓
Extract user ID from token
  ↓
Check user role (if needed)
  ↓
Perform database operation
  ├─ RLS policies enforce at database level
  └─ Backend also performs checks
  ↓
Return response

Example:
  DELETE /api/admin-delete-guide?guideId=xxx
  ├─ Get JWT token
  ├─ Verify user is admin
  ├─ Delete guides record (cascade deletes related)
  ├─ Delete users record
  ├─ Delete auth.users record
  └─ Delete files from storage
```

---

## 📱 Component & Page Relationships

```
                          HOME PAGE (/)
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
    Search Guides      Featured Guides      Admin Access
         │                    │                    │
         ↓                    ↓                    ↓
   /api/search-guides  /api/get-approved   AdminLoginModal
         │               -guides                  │
         │                    │                    │
         ↓                    ↓                    ↓
    GuideCard          GuideCard           /admin/login
    (mapped)           (map first 3)           │
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                    GuideDetailModal
                    (click View Details)
                              │
                ┌─────────────┴─────────────┐
                │                           │
          GUIDE FLOW                  ADMIN FLOW
                │                           │
                ↓                           ↓
         /guide/signup              /admin/dashboard
              │                           │
              ├─ Step 1: Personal     ├─ Tab: Pending
              ├─ Step 2: Contact      ├─ Tab: Approved
              ├─ Step 3: Languages    ├─ Tab: Rejected
              ├─ Step 4: Doc Type     │
              └─ Step 5: Upload       ├─ GuideDetailModal
                    │                 │  (click View Details)
                    ↓                 │
            Status: Pending           ├─ AdminActionsModal
                    │                 │  (click Deactivate/Delete)
              (wait for admin)         │
                    │                 ├─ Deactivate
                    │                 ├─ Activate
                    │                 └─ Delete Completely
                    │
        ┌─ Approved ──┐
        │             │
        ↓             ↓
   /guide/login  Rejected + Email
        │          │
        ↓          ├─ Show reason
   /guide/          │
   dashboard        ├─ Resubmit option
        │           │
        ├─ Sidebar  ↓
        ├─ Stats   /guide/signup
        ├─ Avail.  (is_resubmitted=true)
        └─ Tours
```

---

## 🔄 Data Flow: Complete Guide Registration

```
┌─────────────────────────────────────────────────────────────────┐
│                    GUIDE REGISTRATION FLOW                      │
└─────────────────────────────────────────────────────────────────┘

CLIENT SIDE (React State)
──────────────────────────

useState({
  step: "signup",
  formData: {
    name, email, password, phone, location,
    languages[], document_type, document_id
  },
  files: {
    profile_picture: File,
    document: File
  },
  preview: { profile, document }
})

CLIENT VALIDATION
──────────────────
✓ Email format check
✓ Password strength check
✓ Phone format check
✓ File size check (5MB, 10MB)
✓ File type check (jpg, png, pdf)
✓ Required fields check

                    ↓

SUPABASE AUTH
──────────────
POST supabase.auth.signUp({
  email, password
})
         ↓
Generated:
├─ user.id: UUID
├─ JWT token: eyJ...
└─ Auth session

                    ↓

FILE UPLOADS
─────────────
1. Profile Picture
   POST /storage/profile-pictures/{user_id}/profile.jpg
   ├─ Data: Binary file
   ├─ Header: Authorization: Bearer {token}
   └─ Response: Public URL
              https://xxxx.supabase.co/storage/v1/...

2. Document Image
   POST /storage/documents/{user_id}/document.jpg
   ├─ Data: Binary file
   ├─ Header: Authorization: Bearer {token}
   └─ Response: Secure URL
              https://xxxx.supabase.co/storage/v1/authenticated/...

                    ↓

DATABASE INSERTS
─────────────────
1. CREATE users record (via Trigger)
   INSERT INTO users (id, email, role)
   VALUES (user_id, email, "guide")

2. CREATE guides record
   INSERT INTO guides (
     user_id, name, email, phone_number, location,
     languages, profile_picture_url, document_url,
     document_type, status
   )
   VALUES (
     user_id, "John", "john@...", "+919850...",
     "Shimla", ["English", "Hindi"], "https://...",
     "https://...", "aadhar", "pending"
   )

                    ↓

RESPONSE TO USER
─────────────────
Frontend Shows:
├─ Success message ✓
├─ "Verification pending by admin"
├─ "Contact: 9550574212"
├─ Auto-logout after 3 seconds
└─ Redirect to home page

                    ↓

DATABASE STATE
────────────────
auth.users
├─ id: 550e...
├─ email: john@example.com
└─ encrypted_password: hash

users
├─ id: 550e...
├─ email: john@example.com
├─ role: "guide"
└─ created_at: 2026-02-24T...

guides
├─ id: 660e...
├─ user_id: 550e...
├─ name: "John"
├─ status: "pending" ← Waiting for admin
├─ profile_picture_url: "https://..."
├─ document_url: "https://..."
├─ languages: ["English", "Hindi"]
└─ created_at: 2026-02-24T...

Storage
├─ profile-pictures/550e.../profile.jpg
└─ documents/550e.../document.jpg

                    ↓

ADMIN NOTIFICATION
───────────────────
Email to admin:
  Subject: New guide registration pending review
  Body: John Doe from Shimla
        Click to review: dashboard link

Dashboard updates:
├─ Pending count increases
└─ New guide appears in pending tab

                    ↓

ADMIN REVIEWS
──────────────
Admin logs in → /admin/dashboard
  ├─ Sees John's card in "Pending" tab
  ├─ Clicks "View Details"
  ├─ Modal opens:
  │  ├─ Profile picture (full-size, lightbox)
  │  ├─ Document image (full-size, lightbox)
  │  ├─ All info (name, location, languages, etc.)
  │  ├─ "Approve" button
  │  └─ "Reject" button
  │
  └─ Admin decides:
     ├─ APPROVE:
     │  UPDATE guides SET status = "approved"
     │  └─ John can now login
     │
     └─ REJECT:
        UPDATE guides SET 
          status = "rejected",
          rejection_reason = "Document unclear"
        └─ John sees reason on login page

                    ↓

GUIDE LOGIN (After Approval)
──────────────────────────────
John logs in at /guide/login:
├─ Email: john@example.com
├─ Password: SecurePass123!
      ↓
Check guides.status:
├─ status = "pending": Show "Waiting for approval"
├─ status = "rejected": Show "Rejected" + reason
└─ status = "approved": ✓ LOGGED IN
      ↓
Redirect to /guide/dashboard:
├─ Welcome message
├─ Availability manager
├─ Itinerary manager
└─ Profile access

                    ↓

SEARCHABLE
───────────
Public can search /api/search-guides:
├─ Query: location = "Shimla", language = "English"
└─ Results: John's guide appears

Tourists see:
├─ John's profile picture
├─ Location: Shimla
├─ Languages: English, Hindi
├─ "View Guide" button → Shows full details

End of Flow ✓
```

---

## 📊 Quick Statistics

```
╔════════════════════════════════════════════════════════════╗
║              GUIDEVRIFY PLATFORM STATISTICS               ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  CODE STATISTICS                                           ║
║  ├─ Total Components: 50+                                 ║
║  ├─ Total Pages: 8                                        ║
║  ├─ API Endpoints: 7                                      ║
║  ├─ Database Tables: 5                                    ║
║  ├─ TypeScript Files: 40+                                 ║
║  ├─ Lines of Code: 5000+                                  ║
║  └─ Documentation: 10+ files                              ║
║                                                            ║
║  FRONTEND                                                  ║
║  ├─ Framework: Next.js 16.1.6                             ║
║  ├─ UI Library: React 19.2.4                              ║
║  ├─ Language: TypeScript 5.7.3                            ║
║  ├─ Styling: Tailwind CSS 4.2.0                           ║
║  ├─ Icons: Lucide React                                   ║
║  ├─ UI Components: shadcn/ui (50+ components)             ║
║  └─ Forms: React Hook Form                                ║
║                                                            ║
║  BACKEND                                                   ║
║  ├─ API Framework: Next.js API Routes                     ║
║  ├─ Database: PostgreSQL (Supabase)                       ║
║  ├─ Auth: Supabase Auth (JWT)                             ║
║  ├─ Storage: Supabase Storage (Cloud)                     ║
║  ├─ Language: TypeScript                                  ║
║  └─ Security: RLS, bcrypt password hashing                ║
║                                                            ║
║  DEPLOYMENT                                                ║
║  ├─ Hosting: Vercel (Next.js optimized)                   ║
║  ├─ Database Hosting: Supabase managed                    ║
║  ├─ File Storage: Supabase Cloud Storage                  ║
║  ├─ Scalability: Serverless (auto-scaling)                ║
║  └─ Performance: ~1-2s page load                          ║
║                                                            ║
║  RESPONSIVE DESIGN                                         ║
║  ├─ Mobile: < 640px (full-stack responsive)               ║
║  ├─ Tablet: 640px - 1024px                                ║
║  ├─ Desktop: > 1024px                                     ║
║  ├─ Tailwind Breakpoints: sm (640), md (768), lg (1024)   ║
║  └─ Sidebars: Desktop fixed sidebar, Mobile hamburger     ║
║                                                            ║
║  SECURITY                                                  ║
║  ├─ Auth: JWT tokens with 1-hour expiry                   ║
║  ├─ Password: bcrypt hashing (Supabase)                   ║
║  ├─ Database: RLS policies on all tables                  ║
║  ├─ Files: Max 5MB (profile), 10MB (documents)            ║
║  ├─ Validation: Client-side + server-side                 ║
║  ├─ HTTPS: All connections encrypted                      ║
║  └─ CORS: Restricted to Supabase domains                  ║
║                                                            ║
║  FEATURES IMPLEMENTED                                      ║
║  ├─ Guide Registration (6-step form)                      ║
║  ├─ Multi-language Support (200+ languages)               ║
║  ├─ Location Autocomplete (Geoapify API)                  ║
║  ├─ File Upload Validation                                ║
║  ├─ Admin Dashboard (3 tabs: Pending/Approved/Rejected)  ║
║  ├─ Guide Resubmission Workflow                           ║
║  ├─ Itinerary Management                                  ║
║  ├─ Availability Management                               ║
║  ├─ Guide Search & Filtering                              ║
║  ├─ Featured Guides Display                               ║
║  └─ Responsive Design (Mobile-first)                      ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

---

## 🎯 Key Files to Know

```
├── app/
│   ├── page.tsx (Home - 180 lines)
│   │   └─ Featured guides, search interface
│   ├── globals.css (Tailwind setup)
│   │
│   ├── guide/
│   │   ├── signup/page.tsx (657 lines)
│   │   │   └─ 6-step registration + resubmission
│   │   ├── login/page.tsx (219 lines)
│   │   │   └─ Status checking, auth flow
│   │   ├── dashboard/page.tsx (181 lines)
│   │   │   └─ Approved guide dashboard
│   │   ├── profile/page.tsx
│   │   │   └─ Read-only profile
│   │   └── edit-profile/page.tsx
│   │       └─ Edit profile info
│   │
│   ├── admin/
│   │   ├── login/page.tsx (131 lines)
│   │   │   └─ Admin authentication
│   │   └── dashboard/page.tsx (430 lines)
│   │       └─ Manage guides (pending/approved/rejected)
│   │
│   └── api/
│       ├── search-guides/route.ts (121 lines)
│       │   └─ Fuzzy search + filtering
│       ├── get-approved-guides/route.ts
│       │   └─ Featured guides (3 total)
│       ├── create-itineraries/route.ts
│       │   └─ Create guide tours
│       ├── get-guide-itinerary/route.ts
│       │   └─ Fetch tour details
│       ├── approve-my-guide/route.ts
│       │   └─ Approve/reject applications
│       ├── get-languages/route.ts
│       │   └─ Return 200+ languages
│       └── admin-delete-guide/route.ts
│           └─ Admin deletion (cascade)
│
├── components/
│   ├── admin-sidebar.tsx (137 lines)
│   │   └─ Red theme, desktop/mobile
│   ├── guide-sidebar.tsx (126 lines)
│   │   └─ Blue theme, desktop/mobile
│   ├── guide-detail-modal.tsx
│   │   └─ Admin review modal (approve/reject)
│   ├── admin-actions-modal.tsx (267 lines)
│   │   └─ Deactivate/activate/delete
│   ├── guide-availability-manager.tsx
│   │   └─ Date range picker
│   ├── guide-itinerary-manager.tsx
│   │   └─ Tour management UI
│   ├── multi-language-select.tsx (186 lines)
│   │   └─ Searchable language selector
│   ├── location-autocomplete.tsx
│   │   └─ Geoapify API integration
│   ├── search-guides.tsx
│   │   └─ Search form & API call
│   ├── available-guides.tsx
│   │   └─ Featured guides display
│   └── ui/
│       └─ 50+ shadcn/ui components
│
├── lib/
│   ├── supabase-client.ts (100 lines)
│   │   └─ Supabase init + TypeScript types
│   ├── utils.ts
│   │   └─ Utility functions
│   ├── languages.ts
│   │   └─ 200+ language list
│   └── user-management.ts
│       └─ Admin actions (deactivate, activate, delete)
│
├── hooks/
│   ├── use-mobile.ts
│   │   └─ Mobile breakpoint detection
│   └── use-toast.ts
│       └─ Toast notifications
│
├── scripts/
│   └── setup-database.sql (88 lines)
│       └─ Database schema + RLS policies
│
├── styles/
│   └── globals.css
│       └─ Tailwind global styles
│
└── Documentation/
    ├── PROJECT_README.md (499 lines)
    │   └─ Project overview
    ├── ARCHITECTURE.md (588 lines)
    │   └─ System design
    ├── COMPLETE_PROJECT_ANALYSIS.md ← YOU ARE HERE
    │   └─ Comprehensive breakdown
    ├── IMPLEMENTATION_SUMMARY.md
    │   └─ Implementation details
    ├── QUICKSTART.md
    │   └─ 5-minute setup
    ├── TROUBLESHOOTING.md
    │   └─ Problem solving
    ├── SETUP_CHECKLIST.md
    │   └─ Verification steps
    └── DATABASE_SETUP.md
        └─ Manual database creation
```

---

**This quick reference guide complements the detailed analysis. Refer to specific files for deep dives into functionality.**

---

**Generated:** February 24, 2026
**GuideVerify Platform v1.0.0**
