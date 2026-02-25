# Save/Unsave Guides Feature - Database Migration Required

## Quick Migration SQL

Run this SQL in your Supabase SQL Editor to add the saved_guides table:

```sql
-- Create saved_guides table
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

-- RLS Policies for saved_guides table
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

## Steps to Run in Supabase

1. **Open Supabase Dashboard**
   - URL: https://supabase.co/
   - Login with your credentials

2. **Select Project**
   - Project name: `GuideVerify` or `jvbfqdfiuqycnwwksorn`
   - Click to open

3. **Go to SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query" button

4. **Copy and Run This SQL**
   - Paste the SQL above into the query editor
   - Click the "Run" button (or press Ctrl+Enter)
   - Wait for: "Query successful" message

5. **Verify Success**
   - You should see: "Query completed in X ms"
   - The saved_guides table now exists in your database

## What This Migration Adds

### Table: `saved_guides`
```
Column Name       | Type          | Constraints
id                | UUID          | Primary Key
tourist_id        | UUID          | References auth.users(id)
guide_id          | UUID          | References guides(id)
created_at        | TIMESTAMP     | Default: now()
                  |               | Unique(tourist_id, guide_id)
```

### Indexes
- `idx_saved_guides_tourist_id` - For fetching saved guides by tourist
- `idx_saved_guides_guide_id` - For checking if guide is saved
- `idx_saved_guides_tourist_guide` - For unique constraint checking

### Row Level Security (RLS)
- Tourists can only read/insert/delete their own saved guides
- Ensures data privacy and security

## New Features Enabled

After running the migration, tourists will have access to:

✅ **Save/Unsave Guides**
- Click bookmark icon on any guide card to save
- Saved guides appear in Saved Guides section
- Unsave by clicking bookmark again

✅ **Saved Guides Section**
- New "Saved Guides" menu item in tourist sidebar
- View all saved guides in one place
- Book from saved guides (same as Explore Guides)

✅ **Guide Card Features**
- Bookmark button on every guide card (Explore & Saved sections)
- Visual indication if guide is saved (filled/outlined bookmark)
- Quick access to save/unsave functionality

## API Endpoints Added

- `POST /api/save-guide` - Save a guide
- `DELETE /api/unsave-guide` - Unsave a guide
- `GET /api/get-saved-guides` - Fetch saved guides for tourist

## Testing After Migration

Once you've run the SQL:

1. **Refresh your browser**
2. **Go to Explore Guides** as a tourist
3. **Click bookmark icon** on a guide card
4. **Visit Saved Guides** from sidebar
5. **Verify** the guide appears in saved guides
6. **Try booking** from saved guides (same process as explore)
7. **Try unsaving** by clicking bookmark again

## Troubleshooting

**Table already exists?**
- The `IF NOT EXISTS` clause handles this gracefully
- You can safely re-run this migration

**Permission denied error?**
- Make sure you're logged in as a Supabase admin/owner
- Check that you're in SQL Editor, not Table Editor

**Guides not showing in saved?**
- Ensure the guide is approved (status = 'approved')
- Verify you're logged in as a tourist
- Check browser console for any errors

## Questions?

If you encounter any issues:
1. Check that the migration SQL ran successfully
2. Verify the saved_guides table exists in your database (look in Tables section)
3. Try clearing browser cache and refreshing
4. Check browser console for error messages
