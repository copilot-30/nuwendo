-- Migration 010: Replace individual time_slots with working_hours
-- This simplifies schedule management by defining start/end times per day
-- and auto-generating 30-minute intervals

-- Create new working_hours table
CREATE TABLE IF NOT EXISTS working_hours (
    id SERIAL PRIMARY KEY,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    appointment_type VARCHAR(20) NOT NULL CHECK (appointment_type IN ('online', 'on-site')),
    slot_interval_minutes INTEGER DEFAULT 30 CHECK (slot_interval_minutes > 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES admin_users(id),
    updated_by INTEGER REFERENCES admin_users(id),
    UNIQUE(day_of_week, appointment_type)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_working_hours_day_type ON working_hours(day_of_week, appointment_type);

-- First, update NULL appointment_types to 'on-site' in time_slots
UPDATE time_slots 
SET appointment_type = 'on-site' 
WHERE appointment_type IS NULL;

-- Migrate existing data: Convert individual time_slots to working_hours
-- For each day_of_week + appointment_type combination, find min/max times
INSERT INTO working_hours (day_of_week, start_time, end_time, appointment_type, is_active)
SELECT 
    day_of_week,
    MIN(start_time) as start_time,
    MAX(end_time) as end_time,
    appointment_type,
    TRUE
FROM time_slots
WHERE is_active = TRUE AND appointment_type IS NOT NULL
GROUP BY day_of_week, appointment_type
ON CONFLICT (day_of_week, appointment_type) DO NOTHING;

-- Drop old time_slots table (we no longer need individual slots)
DROP TABLE IF EXISTS time_slots CASCADE;

-- Note: Any bookings that referenced time_slot_id should use booking_time instead
-- which is already stored in the bookings table
