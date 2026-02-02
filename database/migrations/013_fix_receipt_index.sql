-- Migration: Fix receipt index
-- Created: 2026-02-01

-- Drop the index on payment_receipt_url if it exists
DROP INDEX IF EXISTS idx_bookings_pending_payment;

-- Recreate the index with proper condition
CREATE INDEX IF NOT EXISTS idx_bookings_pending_receipt ON bookings(status, payment_receipt_url) 
WHERE status = 'pending' AND payment_receipt_url IS NOT NULL;