-- Migration: Add Google Meet link to bookings
-- Created: 2026-02-02

-- Add meeting_link column to bookings table for online appointments
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS meeting_link VARCHAR(255);

-- Add index for quick lookup of bookings with meeting links
CREATE INDEX IF NOT EXISTS idx_bookings_meeting_link ON bookings(meeting_link) WHERE meeting_link IS NOT NULL;

-- Add comment
COMMENT ON COLUMN bookings.meeting_link IS 'Google Meet link for online appointments, auto-generated when admin confirms booking';
