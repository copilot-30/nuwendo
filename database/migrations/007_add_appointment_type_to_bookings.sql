-- Migration: Add appointment_type to bookings table
-- Created: 2026-01-30

-- Add appointment_type column
ALTER TABLE bookings 
ADD COLUMN appointment_type VARCHAR(20) DEFAULT 'on-site' NOT NULL
CHECK (appointment_type IN ('online', 'on-site'));

-- Add comment for documentation
COMMENT ON COLUMN bookings.appointment_type IS 'Type of appointment: online or on-site';

-- Update existing records to 'on-site' (if any exist)
UPDATE bookings SET appointment_type = 'on-site' WHERE appointment_type IS NULL;
