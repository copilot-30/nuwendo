-- Rollback Migration: Remove video_call_link from bookings table
-- Created: 2026-02-02

ALTER TABLE bookings 
DROP COLUMN IF EXISTS video_call_link;
