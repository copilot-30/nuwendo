-- Rollback: Remove Google Meet link from bookings
-- Created: 2026-02-02

DROP INDEX IF EXISTS idx_bookings_meeting_link;
ALTER TABLE bookings DROP COLUMN IF EXISTS meeting_link;
