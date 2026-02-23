-- Migration: Add proper appointment status system
-- Created: 2026-02-19
-- Description: Separates time-based status from business status

-- Add new business_status column
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS business_status VARCHAR(50) DEFAULT 'scheduled' 
CHECK (business_status IN ('scheduled', 'completed', 'cancelled', 'no_show'));

-- Rename existing status to appointment_status (for backward compatibility)
-- The existing status column will be used for payment/booking flow status

-- Add admin_notes for completion notes
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add completed_at timestamp
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;

-- Add completed_by (admin who marked it as completed)
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS completed_by INTEGER REFERENCES admin_users(id);

-- Migrate existing data
-- Map old statuses to new business_status
UPDATE bookings 
SET business_status = CASE 
    WHEN status = 'cancelled' THEN 'cancelled'
    WHEN status = 'confirmed' THEN 'scheduled'
    WHEN status = 'pending' THEN 'scheduled'
    ELSE 'scheduled'
END
WHERE business_status = 'scheduled'; -- Only update if not already set

-- Create index for business_status
CREATE INDEX IF NOT EXISTS idx_bookings_business_status ON bookings(business_status);

-- Create index for completed_at
CREATE INDEX IF NOT EXISTS idx_bookings_completed_at ON bookings(completed_at);

-- Add comment to explain the difference
COMMENT ON COLUMN bookings.status IS 'Payment/booking flow status: pending, confirmed, cancelled';
COMMENT ON COLUMN bookings.business_status IS 'Business status: scheduled, completed, cancelled, no_show - controlled by admin';
COMMENT ON COLUMN bookings.admin_notes IS 'Admin notes about the appointment (e.g., completion notes, cancellation reason)';
