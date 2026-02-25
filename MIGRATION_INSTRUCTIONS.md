# Database Migration - Adding trips_completed Column

## Quick SQL Command

Run this SQL in your Supabase SQL Editor:

```sql
ALTER TABLE guides ADD COLUMN IF NOT EXISTS trips_completed INTEGER DEFAULT 0;
```

## Steps to Run in Supabase Dashboard:

1. Go to: https://supabase.co/
2. Login to your account
3. Open project: **jvbfqdfiuqycnwwksorn** (GuideVerify)
4. Click on "SQL Editor" in the left sidebar
5. Click "New Query"
6. Copy and paste the SQL command above
7. Click "Run" button
8. You should see: "Query successful" message

## Verification

After running the migration, your guides table will have the new `trips_completed` column with:
- Default value: 0
- Type: INTEGER
- All existing guide records will have trips_completed = 0

## Why This Migration is Needed

The API code references the `trips_completed` column to track completed trips for guides, but the database schema didn't have this column yet. Adding this column allows:
- Guides to see their trip count on the dashboard
- Admins to see guide trip counts in the admin panel
- The sync endpoint to update trip counts when bookings are marked as completed or past
