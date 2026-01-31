-- Migration 008: Remove 'both' from appointment types and update existing slots
-- This ensures each day is either fully online or fully on-site

-- First, update NULL values to 'on-site'
UPDATE time_slots 
SET appointment_type = 'on-site' 
WHERE appointment_type IS NULL;

-- Update existing 'both' slots to 'on-site' (default)
UPDATE time_slots 
SET appointment_type = 'on-site' 
WHERE appointment_type = 'both';

-- Update the CHECK constraint to only allow 'online' or 'on-site'
ALTER TABLE time_slots 
DROP CONSTRAINT IF EXISTS time_slots_appointment_type_check;

ALTER TABLE time_slots 
ADD CONSTRAINT time_slots_appointment_type_check 
CHECK (appointment_type IN ('online', 'on-site'));

-- Remove default since admin must explicitly choose
ALTER TABLE time_slots 
ALTER COLUMN appointment_type DROP DEFAULT;

-- Add comment
COMMENT ON COLUMN time_slots.appointment_type IS 'Type of appointment: online or on-site. Each day should be consistent (all online or all on-site).';
