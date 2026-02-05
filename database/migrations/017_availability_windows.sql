-- Migration 017: Switch to availability windows system
-- This replaces the working_hours approach with a more flexible availability system
-- Slots are now calculated dynamically based on availability windows and existing bookings

-- Step 1: Create availability_windows table (replaces working_hours)
-- This stores the doctor's available time blocks per day of week
CREATE TABLE IF NOT EXISTS availability_windows (
    id SERIAL PRIMARY KEY,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    appointment_type VARCHAR(20) NOT NULL CHECK (appointment_type IN ('online', 'on-site')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES admin_users(id),
    updated_by INTEGER REFERENCES admin_users(id),
    CONSTRAINT valid_time_range CHECK (start_time < end_time),
    UNIQUE(day_of_week, appointment_type)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_availability_day ON availability_windows(day_of_week);
CREATE INDEX IF NOT EXISTS idx_availability_type ON availability_windows(appointment_type);
CREATE INDEX IF NOT EXISTS idx_availability_active ON availability_windows(is_active);

-- Step 2: Add end_time to bookings table for proper duration tracking
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS end_time TIME;

-- Step 3: Migrate existing working_hours data to availability_windows
INSERT INTO availability_windows (day_of_week, start_time, end_time, appointment_type, is_active, created_by, updated_by)
SELECT 
    day_of_week,
    start_time,
    end_time,
    appointment_type,
    is_active,
    created_by,
    updated_by
FROM working_hours
ON CONFLICT (day_of_week, appointment_type) DO NOTHING;

-- Step 4: Update existing bookings to have end_time based on service duration
UPDATE bookings b
SET end_time = (booking_time + (COALESCE(s.duration_minutes, 30) || ' minutes')::INTERVAL)::TIME
FROM services s
WHERE b.service_id = s.id
AND b.end_time IS NULL;

-- Step 5: Create index on bookings for faster availability calculations
CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON bookings(booking_date, booking_time, end_time);

-- Note: working_hours table is kept for now as backup, can be dropped in future migration
