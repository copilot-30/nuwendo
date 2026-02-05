-- Rollback Migration: Drop shop system
-- Created: 2026-02-05

-- Drop triggers
DROP TRIGGER IF EXISTS update_shop_orders_updated_at ON shop_orders;
DROP TRIGGER IF EXISTS update_patient_shop_access_updated_at ON patient_shop_access;
DROP TRIGGER IF EXISTS update_shop_items_updated_at ON shop_items;

-- Drop indexes
DROP INDEX IF EXISTS idx_shop_order_items_order_id;
DROP INDEX IF EXISTS idx_shop_orders_status;
DROP INDEX IF EXISTS idx_shop_orders_user_id;
DROP INDEX IF EXISTS idx_patient_shop_access_has_access;
DROP INDEX IF EXISTS idx_patient_shop_access_user_id;
DROP INDEX IF EXISTS idx_shop_items_is_active;
DROP INDEX IF EXISTS idx_shop_items_category;

-- Drop tables
DROP TABLE IF EXISTS shop_order_items;
DROP TABLE IF EXISTS shop_orders;
DROP TABLE IF EXISTS patient_shop_access;
DROP TABLE IF EXISTS shop_items;
