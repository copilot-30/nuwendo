-- Rollback Migration 017: Revert availability windows system

-- Remove end_time column from bookings
ALTER TABLE bookings DROP COLUMN IF EXISTS end_time;

-- Drop availability_windows table
DROP TABLE IF EXISTS availability_windows CASCADE;

-- Drop indexes
DROP INDEX IF EXISTS idx_availability_day;
DROP INDEX IF EXISTS idx_availability_type;
DROP INDEX IF EXISTS idx_availability_active;
DROP INDEX IF EXISTS idx_bookings_date_time;
