-- Rollback Migration 010: Restore time_slots table

-- Recreate time_slots table
CREATE TABLE IF NOT EXISTS time_slots (
    id SERIAL PRIMARY KEY,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    appointment_type VARCHAR(20) NOT NULL CHECK (appointment_type IN ('online', 'on-site')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES admin_users(id),
    updated_by INTEGER REFERENCES admin_users(id)
);

-- Restore data from working_hours by generating individual 30-minute slots
-- This is a best-effort restoration
DO $$
DECLARE
    wh_record RECORD;
    slot_start TIME;
    slot_end TIME;
BEGIN
    FOR wh_record IN SELECT * FROM working_hours WHERE is_active = TRUE LOOP
        slot_start := wh_record.start_time;
        
        WHILE slot_start < wh_record.end_time LOOP
            -- Calculate slot end (30 minutes later)
            slot_end := slot_start + INTERVAL '30 minutes';
            
            -- Don't create a slot that extends past the working hours end time
            IF slot_end <= wh_record.end_time THEN
                INSERT INTO time_slots (day_of_week, start_time, end_time, appointment_type, is_active, created_by, updated_by)
                VALUES (wh_record.day_of_week, slot_start, slot_end, wh_record.appointment_type, TRUE, wh_record.created_by, wh_record.updated_by);
            END IF;
            
            -- Move to next slot
            slot_start := slot_end;
        END LOOP;
    END LOOP;
END $$;

-- Drop working_hours table
DROP TABLE IF EXISTS working_hours CASCADE;
