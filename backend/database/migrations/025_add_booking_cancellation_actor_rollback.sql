-- Rollback: Remove booking cancellation actor tracking

ALTER TABLE bookings
DROP COLUMN IF EXISTS cancelled_at,
DROP COLUMN IF EXISTS cancelled_by_admin_id,
DROP COLUMN IF EXISTS cancelled_by_type;
