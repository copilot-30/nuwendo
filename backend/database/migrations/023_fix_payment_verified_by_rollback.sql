-- Rollback Migration 023
-- Re-add the FK constraint (note: this will fail if data exists that doesn't match users.id)
ALTER TABLE shop_orders 
ADD CONSTRAINT shop_orders_payment_verified_by_fkey 
FOREIGN KEY (payment_verified_by) REFERENCES users(id);
