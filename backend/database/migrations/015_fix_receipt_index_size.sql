-- Migration: Fix receipt index size issue
-- The previous index included payment_receipt_url which can exceed PostgreSQL's 8191 byte index limit
-- This migration removes the column from the index

-- Drop the problematic index
DROP INDEX IF EXISTS idx_bookings_pending_receipt;

-- Create a simpler index without the large column
CREATE INDEX IF NOT EXISTS idx_bookings_pending_receipt ON bookings(status) 
WHERE status = 'pending' AND payment_receipt_url IS NOT NULL;
