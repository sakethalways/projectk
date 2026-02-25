-- Add pricing columns to guide_itineraries table
ALTER TABLE guide_itineraries 
ADD COLUMN IF NOT EXISTS price INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS price_type VARCHAR(20) DEFAULT 'per_day' CHECK (price_type IN ('per_day', 'per_trip'));

-- Create index for querying by price_type if needed
CREATE INDEX IF NOT EXISTS idx_guide_itineraries_price_type ON guide_itineraries(price_type);

-- Update all existing itineraries to have default price of 100 per day if they don't have one
UPDATE guide_itineraries 
SET price = 100, price_type = 'per_day'
WHERE price IS NULL OR price_type IS NULL;
