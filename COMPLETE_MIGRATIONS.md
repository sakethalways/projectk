# Complete Database Migrations - All Required Changes

## Combined Migration SQL

Run these SQL commands in your Supabase SQL Editor in this order:

### 1. Add trips_completed column (if not already added from earlier migration)

```sql
ALTER TABLE guides ADD COLUMN IF NOT EXISTS trips_completed INTEGER DEFAULT 0;
```

### 2. Create saved_guides table for save/unsave feature

```sql
CREATE TABLE IF NOT EXISTS saved_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tourist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guide_id UUID NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(tourist_id, guide_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_saved_guides_tourist_id ON saved_guides(tourist_id);
CREATE INDEX IF NOT EXISTS idx_saved_guides_guide_id ON saved_guides(guide_id);
CREATE INDEX IF NOT EXISTS idx_saved_guides_tourist_guide ON saved_guides(tourist_id, guide_id);

-- Enable RLS
ALTER TABLE saved_guides ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "saved_guides_read_own"
  ON saved_guides
  FOR SELECT
  USING (auth.uid() = tourist_id);

CREATE POLICY "saved_guides_insert_own"
  ON saved_guides
  FOR INSERT
  WITH CHECK (auth.uid() = tourist_id);

CREATE POLICY "saved_guides_delete_own"
  ON saved_guides
  FOR DELETE
  USING (auth.uid() = tourist_id);
```

## Step-by-Step Execution in Supabase

1. **Open Supabase Dashboard** → https://supabase.co/
2. **Login** with your credentials
3. **Select Project** → `GuideVerify` (jvbfqdfiuqycnwwksorn)
4. **Click SQL Editor** in left sidebar
5. **Click "New Query"** button
6. **Copy SQL from Section 1** (trips_completed) 
7. **Paste** into query editor
8. **Click Run** button
9. **Verify** "Query successful" message
10. **Create another query** for Section 2 (saved_guides)
11. **Repeat steps 6-9**

## Verification Checklist

✅ After migrations complete, verify:
- [ ] `guides` table has `trips_completed` column (integer)
- [ ] `saved_guides` table exists with 4 columns (id, tourist_id, guide_id, created_at)
- [ ] Unique constraint on (tourist_id, guide_id) exists
- [ ] 3 RLS policies exist for saved_guides
- [ ] 3 indexes created on saved_guides

## Features Now Enabled

### Trip Counting (Phase 16)
- Guides see trip count on dashboard
- Admins see trip counts in guide modal
- Trip count increments when bookings marked complete/past

### Save/Unsave Guides (New)
- Tourists can save/unsave guides
- "Saved Guides" menu section in sidebar
- Bookmark button on all guide cards
- Can book directly from saved guides

## Related Files

**Database Schema**:
- [scripts/setup-database.sql](scripts/setup-database.sql) - Complete schema definition
- This includes all table definitions for future reference

**API Endpoints**:
- `POST /api/save-guide` - Save a guide
- `DELETE /api/unsave-guide` - Unsave a guide
- `GET /api/get-saved-guides` - Fetch saved guides
- `GET /api/sync-trips-completed` - Sync trip counts

**New Pages**:
- `/tourist/saved-guides` - Tourist saved guides view
- `/api/save-guide` - Save API endpoint
- `/api/unsave-guide` - Unsave API endpoint
- `/api/get-saved-guides` - Get saved guides API endpoint

**Updated Components**:
- `components/tourist-sidebar.tsx` - Added Saved Guides menu item
- `components/tourist-guide-card.tsx` - Added save/unsave button
- `components/saved-guides.tsx` - New saved guides component
- `lib/supabase-client.ts` - Added SavedGuide type

## Troubleshooting

### Error: "column already exists"
- Safe to ignore - means column/table was already created
- Happens when migrations are run multiple times
- `IF NOT EXISTS` and `ADD COLUMN IF NOT EXISTS` handle this

### Error: "UNIQUE constraint violation"
- Usually just means data already exists
- Try: Drop the existing index/constraint first (admin only)
- Or: Run migration with fresh database

### Guides not showing after save
- Refresh browser page
- Check browser console for errors (F12)
- Verify guide has status='approved' and is_deactivated=false

### Save button not working
- Ensure you're logged in as a tourist
- Check Authorization header being sent
- Look at browser Network tab for API responses

## Support

For detailed per-feature information, see:
- [DATABASE_MIGRATION_GUIDE.md](DATABASE_MIGRATION_GUIDE.md) - Trip counting migrations
- [SAVED_GUIDES_MIGRATION.md](SAVED_GUIDES_MIGRATION.md) - Save/unsave feature details
