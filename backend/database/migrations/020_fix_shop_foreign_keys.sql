-- Migration: Fix shop system foreign keys to reference admin_users
-- Created: 2026-02-05

-- Drop existing foreign key constraints
ALTER TABLE shop_items 
DROP CONSTRAINT IF EXISTS shop_items_created_by_fkey;

ALTER TABLE patient_shop_access 
DROP CONSTRAINT IF EXISTS patient_shop_access_granted_by_fkey;

-- Add correct foreign key constraints to admin_users
ALTER TABLE shop_items 
ADD CONSTRAINT shop_items_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES admin_users(id);

ALTER TABLE patient_shop_access 
ADD CONSTRAINT patient_shop_access_granted_by_fkey 
FOREIGN KEY (granted_by) REFERENCES admin_users(id);
