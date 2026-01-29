-- Migration: Create services and bookings tables for patient funnel
-- Created: 2026-01-30

-- Services/Programs table
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER DEFAULT 60,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Time slots table (available booking times)
CREATE TABLE IF NOT EXISTS time_slots (
    id SERIAL PRIMARY KEY,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
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

-- Create indexes
CREATE INDEX idx_services_active ON services(is_active);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_service_id ON bookings(service_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_time_slots_day ON time_slots(day_of_week);

-- Create trigger for updated_at
CREATE TRIGGER update_services_updated_at 
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample services
INSERT INTO services (name, description, duration_minutes, price, category) VALUES
('General Consultation', 'A comprehensive health check-up and consultation with our medical professionals.', 30, 500.00, 'Consultation'),
('Dental Check-up', 'Complete dental examination including cleaning and oral health assessment.', 45, 800.00, 'Dental'),
('Eye Examination', 'Comprehensive eye exam including vision testing and eye health evaluation.', 30, 600.00, 'Ophthalmology'),
('Physical Therapy Session', 'One-on-one physical therapy session for rehabilitation and pain management.', 60, 1200.00, 'Therapy'),
('Laboratory Tests Package', 'Complete blood work and laboratory testing package.', 15, 1500.00, 'Laboratory'),
('Mental Health Counseling', 'Professional counseling session for mental health and wellness.', 60, 1000.00, 'Mental Health');

-- Insert sample time slots (Mon-Fri, 9AM-5PM, hourly slots)
INSERT INTO time_slots (day_of_week, start_time, end_time) VALUES
-- Monday (1)
(1, '09:00', '10:00'), (1, '10:00', '11:00'), (1, '11:00', '12:00'),
(1, '13:00', '14:00'), (1, '14:00', '15:00'), (1, '15:00', '16:00'), (1, '16:00', '17:00'),
-- Tuesday (2)
(2, '09:00', '10:00'), (2, '10:00', '11:00'), (2, '11:00', '12:00'),
(2, '13:00', '14:00'), (2, '14:00', '15:00'), (2, '15:00', '16:00'), (2, '16:00', '17:00'),
-- Wednesday (3)
(3, '09:00', '10:00'), (3, '10:00', '11:00'), (3, '11:00', '12:00'),
(3, '13:00', '14:00'), (3, '14:00', '15:00'), (3, '15:00', '16:00'), (3, '16:00', '17:00'),
-- Thursday (4)
(4, '09:00', '10:00'), (4, '10:00', '11:00'), (4, '11:00', '12:00'),
(4, '13:00', '14:00'), (4, '14:00', '15:00'), (4, '15:00', '16:00'), (4, '16:00', '17:00'),
-- Friday (5)
(5, '09:00', '10:00'), (5, '10:00', '11:00'), (5, '11:00', '12:00'),
(5, '13:00', '14:00'), (5, '14:00', '15:00'), (5, '15:00', '16:00'), (5, '16:00', '17:00'),
-- Saturday (6) - Half day
(6, '09:00', '10:00'), (6, '10:00', '11:00'), (6, '11:00', '12:00');

-- Add comments
COMMENT ON TABLE services IS 'Stores available services/programs for booking';
COMMENT ON TABLE time_slots IS 'Stores available time slots for each day of the week';
COMMENT ON TABLE bookings IS 'Stores patient bookings with payment information';
