-- Complete Database Schema for Nuwendo-- Create tables for Nowendo application

-- This file represents the full database structure after all migrations

-- Users table

-- =====================================================CREATE TABLE IF NOT EXISTS users (

-- USERS AND AUTHENTICATION    id SERIAL PRIMARY KEY,

-- =====================================================    username VARCHAR(50) UNIQUE NOT NULL,

    email VARCHAR(100) UNIQUE NOT NULL,

-- Users table (from migration 001)    password_hash VARCHAR(255) NOT NULL,

CREATE TABLE IF NOT EXISTS users (    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    id SERIAL PRIMARY KEY,    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

    username VARCHAR(50) UNIQUE,);

    email VARCHAR(100) UNIQUE NOT NULL,

    password_hash VARCHAR(255) NOT NULL,-- Example table: Posts

    first_name VARCHAR(100),CREATE TABLE IF NOT EXISTS posts (

    last_name VARCHAR(100),    id SERIAL PRIMARY KEY,

    role VARCHAR(20) DEFAULT 'patient' CHECK (role IN ('patient', 'admin')),    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,

    verification_code VARCHAR(10),    title VARCHAR(200) NOT NULL,

    verification_code_expires TIMESTAMP,    content TEXT,

    is_verified BOOLEAN DEFAULT FALSE,    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

);

-- Create indexes

-- =====================================================CREATE INDEX idx_users_email ON users(email);

-- PATIENT INFORMATIONCREATE INDEX idx_posts_user_id ON posts(user_id);

-- =====================================================

-- Patient profiles table (from migration 002)
CREATE TABLE IF NOT EXISTS patient_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender VARCHAR(20),
    phone_number VARCHAR(20),
    address TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    blood_type VARCHAR(5),
    allergies TEXT,
    medical_conditions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SERVICES AND SCHEDULING
-- =====================================================

-- Services/Programs table (from migration 004)
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER DEFAULT 60,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
);

-- Time slots table (from migration 004 + 006 + 008)
CREATE TABLE IF NOT EXISTS time_slots (
    id SERIAL PRIMARY KEY,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    appointment_type VARCHAR(20) NOT NULL CHECK (appointment_type IN ('online', 'on-site')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- BOOKINGS
-- =====================================================

-- Bookings table (from migration 004 + 007)
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    appointment_type VARCHAR(20) DEFAULT 'on-site' NOT NULL CHECK (appointment_type IN ('online', 'on-site')),
    status VARCHAR(50) DEFAULT 'pending',
    phone_number VARCHAR(20),
    notes TEXT,
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    amount_paid DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ADMIN SYSTEM
-- =====================================================

-- Admin audit log (from migration 005)
CREATE TABLE IF NOT EXISTS admin_audit_log (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System settings (from migration 009)
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER REFERENCES users(id)
);

-- Insert default settings
INSERT INTO system_settings (setting_key, setting_value, description)
VALUES 
  ('slot_duration_minutes', '60', 'Duration of each time slot in minutes'),
  ('min_advance_hours', '24', 'Minimum hours in advance required for booking')
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- INDEXES
-- =====================================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_verification ON users(verification_code, verification_code_expires);

-- Patient profile indexes
CREATE INDEX IF NOT EXISTS idx_patient_profiles_user_id ON patient_profiles(user_id);

-- Service indexes
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);

-- Time slot indexes
CREATE INDEX IF NOT EXISTS idx_time_slots_day ON time_slots(day_of_week);
CREATE INDEX IF NOT EXISTS idx_time_slots_type ON time_slots(appointment_type);

-- Booking indexes
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_type ON bookings(appointment_type);
CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON bookings(booking_date, booking_time);

-- Admin audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_admin_id ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_table ON admin_audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_created ON admin_audit_log(created_at);

-- System settings indexes
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_profiles_updated_at 
    BEFORE UPDATE ON patient_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at 
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at 
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE users IS 'Stores user accounts (patients and admins)';
COMMENT ON TABLE patient_profiles IS 'Extended patient information and medical history';
COMMENT ON TABLE services IS 'Available services/programs for booking';
COMMENT ON TABLE time_slots IS 'Available time slots for each day of the week';
COMMENT ON TABLE bookings IS 'Patient bookings with payment information';
COMMENT ON TABLE admin_audit_log IS 'Tracks all admin actions for accountability';
COMMENT ON TABLE system_settings IS 'Global system configuration settings';

COMMENT ON COLUMN users.role IS 'User role: patient or admin';
COMMENT ON COLUMN users.verification_code IS 'Email verification code (6 digits)';
COMMENT ON COLUMN time_slots.appointment_type IS 'Type of appointment: online or on-site. All slots on a day must match.';
COMMENT ON COLUMN time_slots.day_of_week IS 'Day of week: 0=Sunday, 1=Monday, ..., 6=Saturday';
COMMENT ON COLUMN bookings.appointment_type IS 'Type of appointment: online or on-site';
COMMENT ON COLUMN bookings.status IS 'Booking status: pending, confirmed, completed, cancelled';
COMMENT ON COLUMN bookings.payment_status IS 'Payment status: pending, paid, refunded';
