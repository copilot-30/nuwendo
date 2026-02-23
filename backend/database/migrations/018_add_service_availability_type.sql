-- Migration 018: Add availability_type to services
-- This allows services to be available for online only, on-site only, both, or disabled

ALTER TABLE services ADD COLUMN IF NOT EXISTS availability_type VARCHAR(20) DEFAULT 'both' 
CHECK (availability_type IN ('online', 'on-site', 'both'));

-- Update existing services to 'both' (available for all appointment types)
UPDATE services SET availability_type = 'both' WHERE availability_type IS NULL;

-- Create index for filtering
CREATE INDEX IF NOT EXISTS idx_services_availability ON services(availability_type);
