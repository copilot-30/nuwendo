-- Migration 009: Create global settings table for slot duration and other configurations

CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER REFERENCES users(id)
);

-- Insert default slot duration (60 minutes = 1 hour)
INSERT INTO system_settings (setting_key, setting_value, description)
VALUES ('slot_duration_minutes', '60', 'Duration of each time slot in minutes');

-- Insert minimum advance booking time (24 hours)
INSERT INTO system_settings (setting_key, setting_value, description)
VALUES ('min_advance_hours', '24', 'Minimum hours in advance required for booking');

-- Create index
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);

-- Add trigger for updated_at
CREATE TRIGGER update_system_settings_updated_at 
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE system_settings IS 'Global system configuration settings';
