-- Migration 027: Backfill payment_status='rejected' for historical admin-rejected pending bookings
-- This ensures UI can label prior payment rejections as "Rejected".

UPDATE bookings
SET payment_status = 'rejected'
WHERE status = 'cancelled'
  AND cancelled_by_type = 'admin'
  AND COALESCE(payment_status, 'pending') = 'pending';
