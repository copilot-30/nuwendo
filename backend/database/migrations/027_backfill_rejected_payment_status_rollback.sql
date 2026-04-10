-- Rollback Migration 027: Restore backfilled rejected statuses back to pending

UPDATE bookings
SET payment_status = 'pending'
WHERE status = 'cancelled'
  AND cancelled_by_type = 'admin'
  AND payment_status = 'rejected';
