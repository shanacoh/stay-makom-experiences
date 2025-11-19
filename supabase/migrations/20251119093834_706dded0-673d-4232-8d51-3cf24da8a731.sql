-- Add region_type to experiences table
ALTER TABLE experiences 
ADD COLUMN region_type TEXT;

-- Add a comment explaining the field
COMMENT ON COLUMN experiences.region_type IS 'Type of region: seaside, mountains, desert, city_break, countryside, etc.';

-- Create an index for better performance when filtering by region_type
CREATE INDEX idx_experiences_region_type ON experiences(region_type);