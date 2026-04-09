-- Migration: Track cancellation actor on bookings

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS cancelled_by_type VARCHAR(20),
ADD COLUMN IF NOT EXISTS cancelled_by_admin_id INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP;

COMMENT ON COLUMN bookings.cancelled_by_type IS 'Who cancelled this booking: admin or patient';
COMMENT ON COLUMN bookings.cancelled_by_admin_id IS 'Admin user ID when cancellation is done by admin';
COMMENT ON COLUMN bookings.cancelled_at IS 'Timestamp when the booking was cancelled';
