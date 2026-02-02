-- Migration: Add video_call_link to bookings table
-- Created: 2026-02-02

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS video_call_link TEXT;

COMMENT ON COLUMN bookings.video_call_link IS 'Google Meet link for online consultations';
