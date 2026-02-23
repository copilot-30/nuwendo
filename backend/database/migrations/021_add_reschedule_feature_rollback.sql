-- Rollback: Remove reschedule functionality

-- Drop triggers and functions
DROP TRIGGER IF EXISTS trigger_update_reschedule_settings_updated_at ON reschedule_settings;
DROP FUNCTION IF EXISTS update_reschedule_settings_updated_at();

-- Drop indexes
DROP INDEX IF EXISTS idx_bookings_reschedule_count;
DROP INDEX IF EXISTS idx_reschedule_history_booking_id;
DROP INDEX IF EXISTS idx_reschedule_history_rescheduled_by;

-- Drop tables
DROP TABLE IF EXISTS booking_reschedule_history;
DROP TABLE IF EXISTS reschedule_settings;

-- Remove columns from bookings
ALTER TABLE bookings 
DROP COLUMN IF EXISTS original_booking_date,
DROP COLUMN IF EXISTS original_booking_time,
DROP COLUMN IF EXISTS reschedule_count,
DROP COLUMN IF EXISTS rescheduled_by,
DROP COLUMN IF EXISTS rescheduled_at,
DROP COLUMN IF EXISTS reschedule_reason;
