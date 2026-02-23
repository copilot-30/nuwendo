-- Rollback for Migration 009

DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
DROP TABLE IF EXISTS system_settings CASCADE;
