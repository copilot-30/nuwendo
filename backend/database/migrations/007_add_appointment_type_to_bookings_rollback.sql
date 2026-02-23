-- Rollback: Remove appointment_type from bookings table
-- Created: 2026-01-30

-- Remove the column
ALTER TABLE bookings DROP COLUMN IF EXISTS appointment_type;
