-- Rollback: Drop patient tables
-- Created: 2026-01-29

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
DROP TRIGGER IF EXISTS update_medications_updated_at ON medications;
DROP TRIGGER IF EXISTS update_medical_records_updated_at ON medical_records;

DROP INDEX IF EXISTS idx_appointments_user_id;
DROP INDEX IF EXISTS idx_appointments_date;
DROP INDEX IF EXISTS idx_medications_user_id;
DROP INDEX IF EXISTS idx_medications_active;
DROP INDEX IF EXISTS idx_medical_records_user_id;
DROP INDEX IF EXISTS idx_medical_records_date;

DROP TABLE IF EXISTS medical_records CASCADE;
DROP TABLE IF EXISTS medications CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
