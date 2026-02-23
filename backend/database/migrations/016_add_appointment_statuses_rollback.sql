-- Rollback: Remove appointment status system
-- Created: 2026-02-19

-- Drop indexes
DROP INDEX IF EXISTS idx_bookings_completed_at;
DROP INDEX IF EXISTS idx_bookings_business_status;

-- Remove columns
ALTER TABLE bookings DROP COLUMN IF EXISTS completed_by;
ALTER TABLE bookings DROP COLUMN IF EXISTS completed_at;
ALTER TABLE bookings DROP COLUMN IF EXISTS admin_notes;
ALTER TABLE bookings DROP COLUMN IF EXISTS business_status;

-- Remove comments
COMMENT ON COLUMN bookings.status IS NULL;
