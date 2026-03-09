-- Migration 023: Fix payment_verified_by FK — was referencing users(id) but should reference admin_users(id)

-- Drop the wrong FK constraint
ALTER TABLE shop_orders DROP CONSTRAINT IF EXISTS shop_orders_payment_verified_by_fkey;

-- Change column type to store admin ID without FK constraint (admin_users is a separate table)
-- We keep it as integer to store admin_users.id but without the FK to avoid cross-table constraint issues
ALTER TABLE shop_orders ALTER COLUMN payment_verified_by TYPE INTEGER;
