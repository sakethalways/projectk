# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Set Up Supabase (2 min)
1. Create account at https://supabase.com
2. Create a new project
3. Go to Project Settings > API
4. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Service Role Key → `SUPABASE_SERVICE_ROLE_KEY`

### Step 2: Create Storage Buckets (1 min)
In Supabase Storage:
- Create `profile-pictures` (Public)
- Create `documents` (Public)

### Step 3: Run Database Setup (1 min)
1. Go to Supabase SQL Editor
2. Copy entire content from `scripts/setup-database.sql`
3. Paste and execute
4. (If uuid-ossp error: Enable extension from Extensions tab first)

### Step 4: Create Admin Account (0.5 min)
In Supabase Auth:
- Create new user: `admin@example.com`
- Set any password (you'll use this to login to admin dashboard)

### Step 5: Run App (0.5 min)
```bash
pnpm install
pnpm dev
```

Visit `http://localhost:3000`

---

## 📋 Quick Test Workflow

### Test as Guide:
1. Home page → "Guide Register"
2. Fill all fields with test data
3. Upload any image for profile picture & document
4. Click "Create Account"
5. See success: "Verification pending by admin"

### Test as Admin:
1. Home page → Footer → "Admin Access"
2. Email: `admin@example.com`
3. Password: (whatever you set)
4. See all pending guides
5. Click "View Details" on any guide
6. Click "Approve Guide" or "Reject"

### Test Guide Login After Approval:
1. The guide receives approval
2. Guide goes to login page
3. Enters email
4. Password issue: You need to set a password manually

**⚠️ Password Reset Note:**
For guides to login, you need to set their password. You can:
- Use Supabase email templates for password reset
- Or during testing, create test guides with known passwords
- Or implement password reset functionality (future feature)

---

## 🎯 Key URLs

- **Home:** `http://localhost:3000`
- **Guide Signup:** `http://localhost:3000/guide/signup`
- **Guide Login:** `http://localhost:3000/guide/login`
- **Guide Dashboard:** `http://localhost:3000/guide/dashboard` (after approval)
- **Admin Login:** `http://localhost:3000/admin/login`
- **Admin Dashboard:** `http://localhost:3000/admin/dashboard`

---

## 📱 Current Features

✅ Guide registration with profile picture upload
✅ Guide ID document upload (Aadhar/Driving License)
✅ Admin dashboard showing all registered guides
✅ Approve/Reject guides with reasons
✅ Status-based access control
✅ Verified guide dashboard
✅ Role-based authentication
✅ Responsive mobile design

---

## 🔧 Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=<your-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

---

## ⚡ Common Issues

**Issue:** "Tables don't exist"
- Run the SQL setup script in Supabase

**Issue:** "Can't upload files"
- Check storage buckets are PUBLIC
- Verify bucket names: `profile-pictures`, `documents`

**Issue:** "Admin login fails"
- Make sure auth user exists in Supabase Auth
- Verify user has role='admin' in users table

**Issue:** "Guide can't login after approval"
- Guide needs password set in Supabase Auth
- Currently auto-generated - implement password reset or manual setup

---

## 📧 Next Features (Your List)

You mentioned you'll add:
- Tourist user registration
- Guide-tourist matching
- Dashboard features for both user types

Ready whenever you are!

---

**Support:** Contact 9550574212
