# System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     User's Web Browser                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Next.js 16 App (Frontend)                      │
│  ┌─────────────┬──────────────┬────────────────┬────────────┐   │
│  │  Home Page  │ Guide Pages  │ Admin Pages    │ Components │   │
│  └─────────────┴──────────────┴────────────────┴────────────┘   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │           React Components (19.2.4)                        │ │
│  │           TypeScript Type Safety (5.7.3)                   │ │
│  │           Tailwind CSS Styling (4.2.0)                     │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
          ┌───────────────────┴───────────────────┐
          ↓                                       ↓
┌──────────────────────┐          ┌──────────────────────┐
│  Supabase Auth       │          │  Supabase Database   │
│  (JWT Tokens)        │          │  (PostgreSQL)        │
│  - Login             │          │  - Data CRUD         │
│  - Register          │          │  - RLS Policies      │
│  - Sign Out          │          │  - Row Level Auth    │
└──────────────────────┘          └──────────────────────┘
          ↓                                       ↓
          └───────────────────┬───────────────────┘
                              ↓
                  ┌─────────────────────┐
                  │ Supabase Storage    │
                  │ - profile-pictures  │
                  │ - documents         │
                  └─────────────────────┘
```

---

## Data Flow Diagram

### Guide Registration Flow
```
┌──────────────────┐
│  Guide fills     │
│  signup form     │
└────────┬─────────┘
         ↓
┌──────────────────────────────────────┐
│ Client-side validation               │
│ - Email format                       │
│ - Required fields                    │
│ - File size check                    │
└────────┬─────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│ POST to Supabase Auth                │
│ - Create auth user                   │
│ - Hash password (bcrypt)             │
│ - Generate JWT token                 │
└────────┬─────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│ Database Operations                  │
│ - INSERT users table                 │
│ - INSERT guides table                │
│ - status = 'pending'                 │
└────────┬─────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│ File Upload                          │
│ - Profile picture → storage bucket   │
│ - Document → storage bucket          │
│ - Get public URLs                    │
│ - Save URLs in guides record         │
└────────┬─────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│ Success Response                     │
│ "Verification pending by admin"      │
│ "Contact 9550574212"                 │
└──────────────────────────────────────┘
```

### Admin Approval Flow
```
┌──────────────────────┐
│ Admin logs in        │
│ (email/password)     │
└────────┬─────────────┘
         ↓
┌──────────────────────────────────────┐
│ Supabase Auth verifies               │
│ - Check password hash                │
│ - Generate JWT token                 │
│ - Return auth user                   │
└────────┬─────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│ Check Admin Role                     │
│ - Query users table                  │
│ - WHERE email = admin@example.com    │
│ - role = 'admin' ✓                   │
└────────┬─────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│ Load Dashboard                       │
│ - SELECT * FROM guides               │
│ - GROUP BY status                    │
│ - Show pending/approved/rejected     │
└────────┬─────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│ Admin Reviews Guide                  │
│ - Click "View Details"               │
│ - Load profile picture from storage  │
│ - Load document from storage         │
│ - Display all info                   │
└────────┬─────────────────────────────┘
         ↓
        / \
       /   \  Admin decision?
      /     \
     /       \
 APPROVE   REJECT
    |         |
    ↓         ↓
    ┌──────────────────────────────────────┐
    │ UPDATE guides table                  │
    │ SET status = 'approved'              │
    │ WHERE id = guide_id                  │
    └──────────────────────────────────────┘
    │
    ├─(with reason)─→ SET rejection_reason = 'text'
    |
    ↓
┌──────────────────────────────────────┐
│ Guide Notification (Future)          │
│ - Send email                         │
│ - Send SMS                           │
│ - In-app notification                │
└──────────────────────────────────────┘
```

### Guide Login After Verification
```
┌──────────────────────────────────────┐
│ Guide enters email/password           │
└────────┬─────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│ Supabase Auth                        │
│ - Verify password hash               │
│ - Generate JWT token                 │
└────────┬─────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│ Check Guide Status                   │
│ SELECT status FROM guides            │
│ WHERE user_id = auth_user_id         │
└────────┬─────────────────────────────┘
         ↓
        / | \
       /  |  \
  PEND APP REJ
   /   |    \
  ↓    ↓     ↓
WAIT ✓OK  DENY
  |    |     |
  ↓    ↓     ↓
MSG  HOME  MSG
"V"    |   "R"
pend   |   reject
   REDIRECT  msg
   TO HOME   DENY
```

---

## Database Schema Relationships

```
┌─────────────────────────────────┐
│          users                  │
├─────────────────────────────────┤
│ id (UUID) ←──────┐              │
│ email (VARCHAR)  │              │
│ role (VARCHAR)   │              │
│ created_at       │              │
│ updated_at       │              │
└─────────────────────────────────┘
                                  │
                                  │ 1-to-1
                                  │ (usually)
                                  │
┌─────────────────────────────────┐
│          guides                 │
├─────────────────────────────────┤
│ id (UUID)                       │
│ user_id (UUID) ─────────────────┘
│ name (VARCHAR)
│ email (VARCHAR)
│ phone_number (VARCHAR)
│ location (VARCHAR)
│ profile_picture_url (VARCHAR)
│ document_url (VARCHAR)
│ document_type (VARCHAR)
│ status (VARCHAR)
│   - pending
│   - approved
│   - rejected
│ rejection_reason (TEXT)
│ created_at (TIMESTAMP)
│ updated_at (TIMESTAMP)
└─────────────────────────────────┘
```

---

## Authentication & Authorization Flow

```
┌─────────────────────────────────────────────────────────────┐
│           User Visits /guide/dashboard                      │
└────────────────────┬────────────────────────────────────────┘
                     ↓
         ┌───────────────────────┐
         │ Check if logged in    │
         │ (Supabase.auth.getUser)
         └────┬──────────────────┘
              ↓
         ┌─────────────┐
         │ Logged in?  │
         └────┬────┬───┘
              │    │
             NO   YES
              │    │
              ↓    ↓
           /login CHECK
           [page]  ROLE
              ↓
              ↓
         ┌──────────────────┐
         │ Is guide?        │
         │ role='guide'     │
         └────┬─────┬───────┘
              │     │
             NO    YES
              │     │
              ↓     ↓
           DENY  CHECK
          [401]  STATUS
              ↓
              ↓
         ┌──────────────────┐
         │ status=          │
         │ 'approved'?      │
         └────┬─────┬───────┘
              │     │
             NO    YES
              │     │
              ↓     ↓
           DENY   ✓ALLOW
          [msg]   [show
           msg    dashboard]
```

---

## File Storage Architecture

```
Supabase Storage
├── profile-pictures (PUBLIC)
│   ├── {user_id}/profile-{timestamp}.jpg
│   ├── {user_id}/profile-{timestamp}.jpg
│   └── ...
│
└── documents (PUBLIC)
    ├── {user_id}/document-{timestamp}.jpg
    ├── {user_id}/document-{timestamp}.jpg
    └── ...
```

**URLs Generated:**
```
https://{project}.supabase.co/storage/v1/object/public/profile-pictures/{user_id}/profile-{timestamp}.jpg
https://{project}.supabase.co/storage/v1/object/public/documents/{user_id}/document-{timestamp}.jpg
```

---

## Component Hierarchy

```
<RootLayout>
  ├── <ThemeProvider>
  ├── <Navigation>
  │   ├── Logo
  │   ├── GuideLoginLink
  │   └── GuideRegisterLink
  │
  └── <Routes>
      │
      ├── / (Home Page)
      │   ├── Hero Section
      │   ├── Features Cards
      │   ├── How It Works
      │   ├── Footer
      │   └── <AdminLoginModal>
      │       ├── Email Input
      │       └── Password Input
      │
      ├── /guide/signup
      │   ├── Form Section
      │   │   ├── Name Input
      │   │   ├── Email Input
      │   │   ├── Phone Input
      │   │   ├── Location Textarea
      │   │   ├── Document Type Select
      │   │   ├── File Upload (Profile)
      │   │   └── File Upload (Document)
      │   └── Success Message
      │
      ├── /guide/login
      │   ├── Email Input
      │   ├── Password Input
      │   ├── Status Messages
      │   │   ├── Pending Message
      │   │   └── Rejected Message
      │   └── Login Button
      │
      ├── /guide/dashboard
      │   ├── Profile Card
      │   │   └── Profile Picture
      │   └── Details Card
      │       ├── Email Display
      │       ├── Phone Display
      │       ├── Location Display
      │       └── Document Info
      │
      ├── /admin/login
      │   ├── Email Input
      │   ├── Password Input
      │   └── Login Button
      │
      └── /admin/dashboard
          ├── Navigation
          ├── Stats Cards
          │   ├── Pending Count
          │   ├── Approved Count
          │   └── Rejected Count
          ├── Tabs
          │   ├── Pending Tab
          │   │   ├── Guide Card (repeating)
          │   │   │   ├── Profile Picture
          │   │   │   ├── Name
          │   │   │   ├── Email
          │   │   │   ├── Phone
          │   │   │   └── View Details Button
          │   │   │       └── <GuideDetailModal>
          │   │   │           ├── Tabs
          │   │   │           │   ├── Info Tab
          │   │   │           │   ├── Photo Tab
          │   │   │           │   └── Document Tab
          │   │   │           ├── Approve Button
          │   │   │           └── Reject Button
          │   │   └── ...more guides
          │   │
          │   ├── Approved Tab
          │   │   ├── Guide Cards (approved)
          │   │   └── ...more guides
          │   │
          │   └── Rejected Tab
          │       ├── Guide Cards (rejected)
          │       ├── Rejection Reason Display
          │       └── ...more guides
          │
          └── Footer
              └── Logout Button
```

---

## Request/Response Cycle

```
CLIENT REQUEST                      SERVER RESPONSE
                                   
Guide Registration:
POST /api/signup ─────────────────→ ✓ User created
  {form data}                       ✓ Guide created
  {files}                           ✓ Files uploaded
                        ←─────────── {success message}
                        ←─────────── {redirect to login}

Admin Login:
POST /auth/v1/token ──────────────→ ✓ Password verified
  {email, password}                 ✓ JWT generated
                        ←─────────── {JWT token}
                        ←─────────── {redirect to dashboard}

Get Guides:
GET /guides ────────────────────────→ ✓ Filter by status
  {auth token}                      ✓ Check RLS policies
  {status: pending}                 ✓ Return guide records
                        ←─────────── {JSON array of guides}

Approve Guide:
PATCH /guides/{id} ─────────────────→ ✓ Check auth is admin
  {status: approved}                ✓ Update record
  {auth token}                      ✓ Check RLS permission
                        ←─────────── {updated guide object}

Reject Guide:
PATCH /guides/{id} ─────────────────→ ✓ Check auth is admin
  {status: rejected}                ✓ Update record
  {rejection_reason}                ✓ Save reason
  {auth token}                      ✓ Check RLS permission
                        ←─────────── {updated guide object}
```

---

## Security Layers

```
User Request
    ↓
Layer 1: HTTPS Encryption
    ├─ All data encrypted in transit
    └─ SSL/TLS certificates
    ↓
Layer 2: Supabase Auth
    ├─ Password hashing (bcrypt)
    ├─ JWT token validation
    └─ Session management
    ↓
Layer 3: Row Level Security (RLS)
    ├─ User can only access own data
    ├─ Admin can access all data
    └─ Policies enforced at database level
    ↓
Layer 4: Application Logic
    ├─ Role checking
    ├─ Status validation
    └─ Access control
    ↓
Layer 5: Data Validation
    ├─ Input sanitization
    ├─ Type checking (TypeScript)
    └─ Error handling
    ↓
Protected Resource
```

---

## Scalability Considerations

### Current Setup (0-1000 guides)
- ✅ PostgreSQL with proper indexes
- ✅ Supabase automatic backups
- ✅ Caching via Supabase
- ✅ Storage for unlimited files

### If Scaling to 10,000+ guides
- Add pagination to admin dashboard
- Implement search and filtering
- Add database query caching
- Consider CDN for file delivery
- Monitor database performance

### If Scaling to 100,000+ guides
- Database replication
- Read replicas for reporting
- Separate storage infrastructure
- Load balancing for frontend
- Analytics data warehouse

---

## Error Handling Flow

```
User Action
    ↓
Try/Catch Block
    ├─ Network Error
    │  └─ "Connection failed, try again"
    │
    ├─ Validation Error
    │  └─ "Please check your inputs"
    │
    ├─ Auth Error
    │  └─ "Invalid credentials"
    │
    ├─ Database Error
    │  └─ "Data operation failed"
    │
    ├─ File Upload Error
    │  └─ "File upload failed"
    │
    └─ Other Errors
       └─ "An error occurred"
    ↓
Log to console
    ↓
Display to user
    ↓
User can retry
```

---

## Deployment Pipeline

```
Local Development
    ↓ (git push)
    ↓
GitHub Repository
    ↓ (webhook)
    ↓
Vercel Build
    ├─ Install dependencies
    ├─ Build Next.js app
    ├─ Run tests (optional)
    └─ Generate artifacts
    ↓
Vercel Deployment
    ├─ Deploy to edge network
    ├─ Set environment variables
    ├─ Start server
    └─ Verify health checks
    ↓
Live Application
    ├─ HTTPS enabled
    ├─ CDN caching
    └─ Auto-scaling enabled
    ↓
Supabase Backend
    ├─ Same credentials
    ├─ Database accessible
    └─ Storage accessible
```

---

## Key Integration Points

```
┌──────────────────────────────────────────────────────────────┐
│  Next.js App                                                 │
│  - Client Components (React)                                 │
│  - Server Components (async data)                            │
│  - API Routes (if needed)                                    │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 │ @supabase/supabase-js
                 ↓
         ┌───────────────────────┐
         │ Supabase Client       │
         └────┬──────────────────┘
              │
              ├─ .auth (authentication)
              ├─ .from() (database queries)
              └─ .storage (file uploads)
                 │
                 ├─ Supabase Auth
                 ├─ PostgreSQL
                 └─ Object Storage
```

---

This architecture provides:
- ✅ Clean separation of concerns
- ✅ Scalable database design
- ✅ Secure authentication flow
- ✅ Proper data access control
- ✅ Error handling at each layer
- ✅ Performance optimization
- ✅ Easy to extend and modify
