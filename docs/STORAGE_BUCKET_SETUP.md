# Storage Bucket Setup for Tourist Feature

## Instructions to Create Storage Buckets in Supabase

### Bucket 1: tourist-profiles

**Steps:**

1. Go to Supabase Dashboard → Your Project
2. Navigate to **Storage** → **Buckets**
3. Click **"New Bucket"**
4. Fill in details:

| Field | Value |
|-------|-------|
| **Name** | `tourist-profiles` |
| **Privacy** | Public |
| **File size limit** | 5 MB |

5. Click **Create Bucket**

**Configuration:**

Once created, click on the bucket name `tourist-profiles`:

1. Click **Policies** tab
2. Under **Authenticated users can upload**, create policy:
   - **Operation:** INSERT
   - **For** Authenticated users
   - **With permission:**
     ```
     (bucket_id = 'tourist-profiles')
     ```
   - Click **Save**

3. Under **Authenticated users can download**, create policy:
   - **Operation:** SELECT
   - **For** Everyone
   - **With permission:**
     ```
     (bucket_id = 'tourist-profiles')
     ```
   - Click **Save**

---

## Alternative: Use SQL to Create Bucket

Run this SQL in Supabase SQL Editor:

```sql
-- Create tourist-profiles bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('tourist-profiles', 'tourist-profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public to read files
CREATE POLICY "Public access to tourist-profiles"
ON storage.objects
FOR SELECT
USING (bucket_id = 'tourist-profiles');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload to tourist-profiles"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tourist-profiles');

-- Allow users to update their own files
CREATE POLICY "Users can update own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'tourist-profiles' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'tourist-profiles' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## File Structure in Bucket

```
tourist-profiles/
├── {tourist_user_id}/
│   ├── profile.jpg
│   └── profile.webp
└── {tourist_user_id}/
    └── profile.jpg
```

**Example:**
```
tourist-profiles/
├── 550e8400-e29b-41d4-a716-446655440000/
│   └── profile.jpg
└── 660e8400-e29b-41d4-a716-446655440111/
    └── profile.jpg
```

---

## File Size Limits

| File Type | Max Size |
|-----------|----------|
| Profile Picture | 5 MB |
| Allowed Types | JPEG, PNG, WebP |

---

## URL Format

Once uploaded, files are accessible at:

```
https://{PROJECT_ID}.supabase.co/storage/v1/object/public/tourist-profiles/{user_id}/{filename}
```

**Example:**
```
https://jvbfqdfiuqycnwwksorn.supabase.co/storage/v1/object/public/tourist-profiles/550e8400-e29b-41d4-a716-446655440000/profile.jpg
```

---

## Summary

✅ **Bucket Name:** `tourist-profiles`  
✅ **Privacy:** Public (anyone can read)  
✅ **Max File Size:** 5 MB  
✅ **Allowed Types:** JPEG, PNG, WebP  
✅ **Upload Permission:** Authenticated users only  

---

**Note:** Both methods (UI or SQL) achieve the same result. Choose whichever is more convenient for you.
