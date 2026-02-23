-- Rollback: Remove appointment_type from time_slots table
-- Created: 2026-01-30

-- Remove the column
ALTER TABLE time_slots DROP COLUMN IF EXISTS appointment_type;
