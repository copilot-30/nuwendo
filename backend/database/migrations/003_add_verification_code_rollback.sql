-- Rollback: Remove verification code columns
-- Created: 2026-01-29

DROP INDEX IF EXISTS idx_users_verification_code;

ALTER TABLE users 
  DROP COLUMN IF EXISTS verification_code,
  DROP COLUMN IF EXISTS verification_code_expires;
