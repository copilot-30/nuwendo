-- Seed Shop Items for Nuwendo
-- Peptide products with variants

-- Clear existing shop data
DELETE FROM shop_item_variants;
DELETE FROM shop_items;

-- Insert parent products
INSERT INTO shop_items (name, description, category, price, stock_quantity, is_active)
VALUES
    ('Tirzepatide', 'GIP/GLP-1 receptor agonist for metabolic health and weight management.', 'Peptides', 0.00, 0, true),
    ('Semaglutide',  'GLP-1 receptor agonist for blood sugar control and weight management.',  'Peptides', 0.00, 0, true);

-- Note: price on the parent is 0 — the real prices live in the variants below.

-- Tirzepatide variants
INSERT INTO shop_item_variants (shop_item_id, name, price, stock_quantity, is_active, sort_order)
SELECT id, '50mg',     15000.00, 0, true, 1 FROM shop_items WHERE name = 'Tirzepatide'
UNION ALL
SELECT id, '30mg',      9000.00, 0, true, 2 FROM shop_items WHERE name = 'Tirzepatide'
UNION ALL
SELECT id, 'Per Shot',  2500.00, 0, true, 3 FROM shop_items WHERE name = 'Tirzepatide';

-- Semaglutide variants
INSERT INTO shop_item_variants (shop_item_id, name, price, stock_quantity, is_active, sort_order)
SELECT id, '8mg',       9000.00, 0, true, 1 FROM shop_items WHERE name = 'Semaglutide'
UNION ALL
SELECT id, '16mg',     16000.00, 0, true, 2 FROM shop_items WHERE name = 'Semaglutide'
UNION ALL
SELECT id, 'Per Shot',  2000.00, 0, true, 3 FROM shop_items WHERE name = 'Semaglutide';
