-- Seed data for Nuwendo database
-- This file seeds only essential data (admin user)

-- ============================================
-- ADMIN USER
-- ============================================
-- Default admin account for initial setup
-- Username: admin
-- Password: admin123
-- ⚠️ CHANGE THIS PASSWORD IMMEDIATELY IN PRODUCTION!

INSERT INTO admin_users (username, email, password_hash, full_name, role) 
VALUES (
    'admin', 
    'admin@nuwendo.com', 
    '$2b$10$8K1p/ckUZnWrcpqr4L1.XeCWKlJvDqJWvOyKJKHJv9xS6EKhg/eRe', 
    'System Administrator',
    'super_admin'
) ON CONFLICT (username) DO UPDATE SET
    email = EXCLUDED.email,
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
-- To change admin password: cd backend && node fix-admin-password.js

