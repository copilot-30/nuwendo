-- Rollback Migration 026: Remove booking lifecycle columns and related indexes/constraints

DROP INDEX IF EXISTS idx_bookings_reschedule_count;
DROP INDEX IF EXISTS idx_bookings_cancelled_by_admin_id;
DROP INDEX IF EXISTS idx_bookings_completed_by;
DROP INDEX IF EXISTS idx_bookings_business_status;

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_cancelled_by_admin_id_fkey;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_completed_by_fkey;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_business_status_check;

ALTER TABLE bookings
DROP COLUMN IF EXISTS reschedule_reason,
DROP COLUMN IF EXISTS rescheduled_by,
DROP COLUMN IF EXISTS rescheduled_at,
DROP COLUMN IF EXISTS original_booking_time,
DROP COLUMN IF EXISTS original_booking_date,
DROP COLUMN IF EXISTS reschedule_count,
DROP COLUMN IF EXISTS cancelled_at,
DROP COLUMN IF EXISTS cancelled_by_admin_id,
DROP COLUMN IF EXISTS cancelled_by_type,
DROP COLUMN IF EXISTS completed_by,
DROP COLUMN IF EXISTS completed_at,
DROP COLUMN IF EXISTS admin_notes,
DROP COLUMN IF EXISTS video_call_link,
DROP COLUMN IF EXISTS business_status;
