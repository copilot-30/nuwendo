-- Seed Services for Nuwendo
-- Services currently in production database
-- Run this after migrations to populate initial services

-- Clear existing services (optional - comment out if you want to keep existing)
-- DELETE FROM services WHERE id > 0;

-- Insert Services
INSERT INTO services (name, description, duration_minutes, price, category, is_active) VALUES
    ('Nuwendo Starter', 'Comprehensive Consultation + Laboratory Test Request + Nutrition Plan + Follow-up', 60, 3700.00, 'Services', true),
    ('Comprehensive Consultation', 'Complete health consultation with our metabolic specialist', 60, 2000.00, 'Services', true),
    ('Nutrition Plan', 'Personalized nutrition plan tailored to your metabolic needs', 60, 1500.00, 'Services', true),
    ('Follow-up', 'Follow-up consultation to track your progress', 30, 800.00, 'Services', true),
    ('Medical Certificate', 'Official medical certificate for various purposes', 15, 500.00, 'Services', true)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    duration_minutes = EXCLUDED.duration_minutes,
    price = EXCLUDED.price,
    category = EXCLUDED.category,
    is_active = EXCLUDED.is_active;

-- Note: ON CONFLICT requires a unique constraint on 'name' column
-- If you don't have it, you can add it with:
-- CREATE UNIQUE INDEX IF NOT EXISTS services_name_unique ON services(name);
