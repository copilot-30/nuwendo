-- Migration: Add verification code and expiry to users table
-- Created: 2026-01-29

ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS verification_code VARCHAR(6),
  ADD COLUMN IF NOT EXISTS verification_code_expires TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_users_verification_code ON users(verification_code);

COMMENT ON COLUMN users.verification_code IS '6-digit verification code sent to email';
COMMENT ON COLUMN users.verification_code_expires IS 'Expiration time for verification code (10 minutes)';
