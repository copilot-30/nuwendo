-- Rollback Migration: Revert shop system foreign keys
-- Created: 2026-02-05

-- Drop foreign key constraints
ALTER TABLE shop_items 
DROP CONSTRAINT IF EXISTS shop_items_created_by_fkey;

ALTER TABLE patient_shop_access 
DROP CONSTRAINT IF EXISTS patient_shop_access_granted_by_fkey;

-- Restore original foreign key constraints to users
ALTER TABLE shop_items 
ADD CONSTRAINT shop_items_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES users(id);

ALTER TABLE patient_shop_access 
ADD CONSTRAINT patient_shop_access_granted_by_fkey 
FOREIGN KEY (granted_by) REFERENCES users(id);
