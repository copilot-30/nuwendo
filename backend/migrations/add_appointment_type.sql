-- Add appointment_type column to time_slots table
ALTER TABLE time_slots 
ADD COLUMN IF NOT EXISTS appointment_type VARCHAR(20) DEFAULT 'both' CHECK (appointment_type IN ('online', 'on-site', 'both'));

-- Update existing slots to 'both' (available for both online and on-site)
UPDATE time_slots SET appointment_type = 'both' WHERE appointment_type IS NULL;

-- Add comment
COMMENT ON COLUMN time_slots.appointment_type IS 'Type of appointment: online, on-site, or both';
