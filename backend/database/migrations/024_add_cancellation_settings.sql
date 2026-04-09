-- Migration: Add cancellation policy settings
-- Extends reschedule_settings to support cancellation controls

ALTER TABLE reschedule_settings
ADD COLUMN IF NOT EXISTS patient_cancel_min_hours_before INTEGER DEFAULT 24,
ADD COLUMN IF NOT EXISTS admin_cancel_min_hours_before INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS allow_patient_cancellation BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS allow_admin_cancellation BOOLEAN DEFAULT TRUE;

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS cancellation_count INTEGER DEFAULT 0;

UPDATE reschedule_settings
SET patient_cancel_min_hours_before = COALESCE(patient_cancel_min_hours_before, 24),
    admin_cancel_min_hours_before = COALESCE(admin_cancel_min_hours_before, 1),
    allow_patient_cancellation = COALESCE(allow_patient_cancellation, TRUE),
    allow_admin_cancellation = COALESCE(allow_admin_cancellation, TRUE);

UPDATE bookings
SET cancellation_count = COALESCE(cancellation_count, 0);

COMMENT ON COLUMN reschedule_settings.patient_cancel_min_hours_before IS 'Minimum hours before appointment that patients can cancel';
COMMENT ON COLUMN reschedule_settings.admin_cancel_min_hours_before IS 'Minimum hours before appointment that admins can cancel';
COMMENT ON COLUMN reschedule_settings.allow_patient_cancellation IS 'Whether patients are allowed to cancel appointments';
COMMENT ON COLUMN reschedule_settings.allow_admin_cancellation IS 'Whether admins are allowed to cancel appointments';
COMMENT ON COLUMN bookings.cancellation_count IS 'Number of times this booking has been cancelled';
