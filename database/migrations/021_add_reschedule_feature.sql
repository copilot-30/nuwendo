-- Migration: Add reschedule functionality
-- Adds reschedule tracking and settings

-- Add reschedule fields to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS original_booking_date DATE,
ADD COLUMN IF NOT EXISTS original_booking_time TIME,
ADD COLUMN IF NOT EXISTS reschedule_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rescheduled_by VARCHAR(50), -- 'admin' or 'patient'
ADD COLUMN IF NOT EXISTS rescheduled_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS reschedule_reason TEXT;

-- Create reschedule history table to track all changes
CREATE TABLE IF NOT EXISTS booking_reschedule_history (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    old_booking_date DATE NOT NULL,
    old_booking_time TIME NOT NULL,
    new_booking_date DATE NOT NULL,
    new_booking_time TIME NOT NULL,
    rescheduled_by VARCHAR(50) NOT NULL, -- 'admin' or 'patient'
    rescheduled_by_email VARCHAR(255),
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reschedule settings table
CREATE TABLE IF NOT EXISTS reschedule_settings (
    id SERIAL PRIMARY KEY,
    patient_min_hours_before INTEGER DEFAULT 24, -- Patients can't reschedule within X hours
    admin_min_hours_before INTEGER DEFAULT 1,    -- Admins can't reschedule within X hours
    max_reschedules_per_booking INTEGER DEFAULT 3, -- Maximum reschedules allowed
    allow_patient_reschedule BOOLEAN DEFAULT TRUE,
    allow_admin_reschedule BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default reschedule settings
INSERT INTO reschedule_settings (
    patient_min_hours_before,
    admin_min_hours_before,
    max_reschedules_per_booking,
    allow_patient_reschedule,
    allow_admin_reschedule
) VALUES (24, 1, 3, TRUE, TRUE)
ON CONFLICT DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bookings_reschedule_count ON bookings(reschedule_count);
CREATE INDEX IF NOT EXISTS idx_reschedule_history_booking_id ON booking_reschedule_history(booking_id);
CREATE INDEX IF NOT EXISTS idx_reschedule_history_rescheduled_by ON booking_reschedule_history(rescheduled_by);

-- Add trigger to update reschedule settings updated_at
CREATE OR REPLACE FUNCTION update_reschedule_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reschedule_settings_updated_at
    BEFORE UPDATE ON reschedule_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_reschedule_settings_updated_at();

-- Add comments
COMMENT ON TABLE booking_reschedule_history IS 'Tracks all booking reschedule changes';
COMMENT ON TABLE reschedule_settings IS 'System-wide reschedule policy settings';
COMMENT ON COLUMN reschedule_settings.patient_min_hours_before IS 'Minimum hours before appointment that patients can reschedule';
COMMENT ON COLUMN reschedule_settings.admin_min_hours_before IS 'Minimum hours before appointment that admins can reschedule';
