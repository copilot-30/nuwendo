-- Migration 012: Add payment receipt and QR code for manual payment verification

-- Add payment receipt column to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_receipt_url TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_receipt_uploaded_at TIMESTAMP;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_approved_by INTEGER REFERENCES admin_users(id);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_approved_at TIMESTAMP;

-- Add payment QR code to system settings
INSERT INTO system_settings (setting_key, setting_value, description)
VALUES ('payment_qr_code', '', 'Base64 encoded QR code image for payment')
ON CONFLICT (setting_key) DO NOTHING;

-- Add payment instructions to system settings
INSERT INTO system_settings (setting_key, setting_value, description)
VALUES ('payment_instructions', 'Please scan the QR code to pay via GCash or bank transfer. After payment, upload your receipt/screenshot for verification.', 'Instructions displayed on payment page')
ON CONFLICT (setting_key) DO NOTHING;

-- Add payment account name
INSERT INTO system_settings (setting_key, setting_value, description)
VALUES ('payment_account_name', 'Nuwendo Clinic', 'Account name for payment verification')
ON CONFLICT (setting_key) DO NOTHING;

-- Add payment account number
INSERT INTO system_settings (setting_key, setting_value, description)
VALUES ('payment_account_number', '', 'Account number for payment (GCash/Bank)')
ON CONFLICT (setting_key) DO NOTHING;

-- Add index for pending payments
CREATE INDEX IF NOT EXISTS idx_bookings_pending_payment ON bookings(status, payment_receipt_url) WHERE status = 'pending';

-- Add comments
COMMENT ON COLUMN bookings.payment_receipt_url IS 'URL or base64 of uploaded payment receipt';
COMMENT ON COLUMN bookings.payment_approved_by IS 'Admin who approved the payment';
