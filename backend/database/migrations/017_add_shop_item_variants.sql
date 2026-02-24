-- Migration 017: Add variants to shop items
-- Each product (e.g. Tirzepatide) can have multiple variants (50mg, 30mg, per shot)

CREATE TABLE IF NOT EXISTS shop_item_variants (
    id SERIAL PRIMARY KEY,
    shop_item_id INTEGER NOT NULL REFERENCES shop_items(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,          -- e.g. "50mg", "30mg", "Per Shot"
    price DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shop_item_variants_item_id ON shop_item_variants(shop_item_id);

CREATE TRIGGER update_shop_item_variants_updated_at
    BEFORE UPDATE ON shop_item_variants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
