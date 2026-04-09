-- Rollback: Remove cancellation policy settings

ALTER TABLE bookings
DROP COLUMN IF EXISTS cancellation_count;

ALTER TABLE reschedule_settings
DROP COLUMN IF EXISTS patient_cancel_min_hours_before,
DROP COLUMN IF EXISTS admin_cancel_min_hours_before,
DROP COLUMN IF EXISTS allow_patient_cancellation,
DROP COLUMN IF EXISTS allow_admin_cancellation;
