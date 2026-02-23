-- Migration: Add appointment_type to time_slots table
-- Created: 2026-01-30

-- Add appointment_type column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='time_slots' AND column_name='appointment_type'
    ) THEN
        ALTER TABLE time_slots 
        ADD COLUMN appointment_type VARCHAR(20) DEFAULT 'both' NOT NULL
        CHECK (appointment_type IN ('online', 'on-site', 'both'));
    END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN time_slots.appointment_type IS 'Type of appointment: online, on-site, or both';

-- Update existing records to 'both' (if any exist)
UPDATE time_slots SET appointment_type = 'both' WHERE appointment_type IS NULL;
