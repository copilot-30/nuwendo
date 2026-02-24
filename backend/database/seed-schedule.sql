-- Seed Working Hours for Nuwendo
-- Current schedule from production database
-- Run this after migrations to populate working hours

-- Clear existing working hours before re-seeding
DELETE FROM working_hours;

-- Insert Working Hours
-- Format: day_of_week (0=Sunday, 1=Monday, ..., 6=Saturday)

INSERT INTO working_hours (day_of_week, start_time, end_time, appointment_type, is_active) VALUES
    -- Sunday - Online only (7:30 AM - 5:30 PM)
    (0, '07:30:00', '17:30:00', 'online', true),

    -- Monday - Online only (7:30 AM - 5:30 PM)
    (1, '07:30:00', '17:30:00', 'online', true),

    -- Tuesday - Online only (7:30 AM - 5:30 PM)
    (2, '07:30:00', '17:30:00', 'online', true),

    -- Wednesday - On-site only (9:00 AM - 5:00 PM)
    (3, '09:00:00', '17:00:00', 'on-site', true),

    -- Thursday - On-site only (9:00 AM - 5:00 PM)
    (4, '09:00:00', '17:00:00', 'on-site', true),

    -- Friday - On-site only (9:00 AM - 5:00 PM)
    (5, '09:00:00', '17:00:00', 'on-site', true),

    -- Saturday - Online only (7:30 AM - 5:30 PM)
    (6, '07:30:00', '17:30:00', 'online', true)

ON CONFLICT (day_of_week, appointment_type) DO UPDATE SET
    start_time = EXCLUDED.start_time,
    end_time = EXCLUDED.end_time,
    is_active = EXCLUDED.is_active;

-- Summary:
-- Online consultations: Sun, Mon, Tue, Sat (7:30 AM - 5:30 PM)
-- On-site consultations: Wed, Thu, Fri (9:00 AM - 5:00 PM)
