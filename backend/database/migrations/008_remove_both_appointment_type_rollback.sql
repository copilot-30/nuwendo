-- Rollback for Migration 008

-- Restore the original CHECK constraint with 'both'
ALTER TABLE time_slots 
DROP CONSTRAINT IF EXISTS time_slots_appointment_type_check;

ALTER TABLE time_slots 
ADD CONSTRAINT time_slots_appointment_type_check 
CHECK (appointment_type IN ('online', 'on-site', 'both'));

-- Restore default to 'both'
ALTER TABLE time_slots 
ALTER COLUMN appointment_type SET DEFAULT 'both';
