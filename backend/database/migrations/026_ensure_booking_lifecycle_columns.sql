-- Migration 026: Ensure booking lifecycle columns exist across environments
-- This hard-fixes production schema drift (missing columns from prior migrations).

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS business_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS video_call_link TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS completed_by INTEGER,
ADD COLUMN IF NOT EXISTS cancelled_by_type VARCHAR(20),
ADD COLUMN IF NOT EXISTS cancelled_by_admin_id INTEGER,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS reschedule_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS original_booking_date DATE,
ADD COLUMN IF NOT EXISTS original_booking_time TIME,
ADD COLUMN IF NOT EXISTS rescheduled_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS rescheduled_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS reschedule_reason TEXT;

-- Ensure business_status has sane defaults for existing/new rows
UPDATE bookings
SET business_status = CASE
  WHEN status = 'cancelled' THEN 'cancelled'
  WHEN status = 'confirmed' THEN 'scheduled'
  ELSE 'scheduled'
END
WHERE business_status IS NULL;

ALTER TABLE bookings
ALTER COLUMN business_status SET DEFAULT 'scheduled';

-- Add CHECK constraint if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'bookings_business_status_check'
  ) THEN
    ALTER TABLE bookings
    ADD CONSTRAINT bookings_business_status_check
    CHECK (business_status IN ('scheduled', 'completed', 'cancelled', 'no_show'));
  END IF;
END $$;

-- Add foreign keys only if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'bookings_completed_by_fkey'
  ) THEN
    ALTER TABLE bookings
    ADD CONSTRAINT bookings_completed_by_fkey
    FOREIGN KEY (completed_by) REFERENCES admin_users(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'bookings_cancelled_by_admin_id_fkey'
  ) THEN
    ALTER TABLE bookings
    ADD CONSTRAINT bookings_cancelled_by_admin_id_fkey
    FOREIGN KEY (cancelled_by_admin_id) REFERENCES admin_users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_bookings_business_status ON bookings(business_status);
CREATE INDEX IF NOT EXISTS idx_bookings_completed_by ON bookings(completed_by);
CREATE INDEX IF NOT EXISTS idx_bookings_cancelled_by_admin_id ON bookings(cancelled_by_admin_id);
CREATE INDEX IF NOT EXISTS idx_bookings_reschedule_count ON bookings(reschedule_count);
