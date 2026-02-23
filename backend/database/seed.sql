-- Seed data for Nuwendo database
-- This file seeds only essential data (admin user)

-- ============================================
-- ADMIN USER
-- ============================================
-- Default admin account for initial setup
-- Email: nuwendomc@gmail.com
-- Password: jalaka09
-- ⚠️ CHANGE THIS PASSWORD IN PRODUCTION!

-- Password hash for "jalaka09"

INSERT INTO admin_users (username, email, password_hash, full_name, role) 
VALUES (
    'admin', 
    'nuwendomc@gmail.com', 
    '$2b$10$nlPjwIXVFIjXyNt4YCdZveYTpzMJ8FOaX5pT2BXRH6BsLf1j1c4tu',
    'Nuwendo Admin',
    'super_admin'
) ON CONFLICT (username) DO UPDATE SET
    email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

-- Also add by email in case of conflicts
INSERT INTO admin_users (username, email, password_hash, full_name, role) 
VALUES (
    'nuwendoadmin', 
    'nuwendomc@gmail.com', 
    '$2b$10$nlPjwIXVFIjXyNt4YCdZveYTpzMJ8FOaX5pT2BXRH6BsLf1j1c4tu',
    'Nuwendo Admin',
    'super_admin'
) ON CONFLICT (email) DO UPDATE SET
    username = EXCLUDED.username,
    password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

-- ============================================
-- NOTES
-- ============================================
-- Admin is seeded automatically via migration 005_create_admin_system.sql
-- 
-- To seed services (optional):
--   psql -d nuwendo_db -f seed-services.sql
-- 
-- To seed working hours/schedule (optional):
--   psql -d nuwendo_db -f seed-schedule.sql
-- 
-- Services and schedules can also be managed via the admin panel

