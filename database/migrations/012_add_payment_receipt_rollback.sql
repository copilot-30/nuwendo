-- Rollback Migration 012: Remove payment receipt columns

ALTER TABLE bookings DROP COLUMN IF EXISTS payment_receipt_url;
ALTER TABLE bookings DROP COLUMN IF EXISTS payment_receipt_uploaded_at;
ALTER TABLE bookings DROP COLUMN IF EXISTS payment_approved_by;
ALTER TABLE bookings DROP COLUMN IF EXISTS payment_approved_at;

DELETE FROM system_settings WHERE setting_key IN ('payment_qr_code', 'payment_instructions', 'payment_account_name', 'payment_account_number');

DROP INDEX IF EXISTS idx_bookings_pending_payment;
