-- Add trips_completed column to guides table if it doesn't exist
ALTER TABLE guides ADD COLUMN IF NOT EXISTS trips_completed INTEGER DEFAULT 0;
