-- Migration: Create admin users and seed admin account
-- Created: 2026-01-30

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CREATE INDEX IF NOT EXISTSes
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);

-- CREATE OR REPLACE TRIGGER for updated_at
CREATE OR REPLACE TRIGGER update_admin_users_updated_at 
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add admin session tokens table
CREATE TABLE IF NOT EXISTS admin_sessions (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admin_users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);

-- Seed default admin account
-- Username: admin, Password: jalaka09
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

-- Add comments
COMMENT ON TABLE admin_users IS 'Stores admin user accounts';
COMMENT ON TABLE admin_sessions IS 'Stores admin session tokens';
COMMENT ON COLUMN admin_users.password_hash IS 'bcrypt hashed password';
COMMENT ON COLUMN admin_users.role IS 'admin role: admin, super_admin, manager';

-- Update services table to track who created/updated
ALTER TABLE services ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES admin_users(id);
ALTER TABLE services ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES admin_users(id);

-- Set default creator for existing services (assuming first admin created them)
UPDATE services SET created_by = 1 WHERE created_by IS NULL;
