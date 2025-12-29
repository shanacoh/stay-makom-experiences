-- Add adult_only column to experiences table
ALTER TABLE experiences ADD COLUMN IF NOT EXISTS adult_only BOOLEAN DEFAULT FALSE;