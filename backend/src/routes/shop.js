import express from 'express';
import pool from '../config/database.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// Helper: fetch variants for a list of item ids
const fetchVariants = async (itemIds) => {
  if (itemIds.length === 0) return [];
  const result = await pool.query(
    `SELECT * FROM shop_item_variants WHERE shop_item_id = ANY($1) ORDER BY shop_item_id, sort_order, id`,
    [itemIds]
  );
  return result.rows;
};

// Get all shop items (with variants)
router.get('/', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT si.*, au.username as created_by_name
      FROM shop_items si
      LEFT JOIN admin_users au ON si.created_by = au.id
      ORDER BY si.created_at DESC
    `);
    const items = result.rows;
    const variants = await fetchVariants(items.map(i => i.id));
    const itemsWithVariants = items.map(item => ({
      ...item,
      variants: variants.filter(v => v.shop_item_id === item.id)
    }));
    res.json({ success: true, items: itemsWithVariants });
  } catch (error) {
    console.error('Error fetching shop items:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch shop items' });
  }
});

// Get single shop item (with variants)
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM shop_items WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Shop item not found' });
    }
    const item = result.rows[0];
    const variants = await fetchVariants([item.id]);
    res.json({ success: true, item: { ...item, variants } });
  } catch (error) {
    console.error('Error fetching shop item:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch shop item' });
  }
});

// Create shop item (with optional variants)
router.post('/', adminAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, description, category, image_url, stock_quantity, is_active, variants = [] } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    await client.query('BEGIN');
    const itemResult = await client.query(`
      INSERT INTO shop_items (name, description, price, category, image_url, stock_quantity, is_active, created_by)
      VALUES ($1, $2, 0, $3, $4, $5, $6, $7)
      RETURNING *
    `, [name, description, category, image_url, stock_quantity || 0, is_active !== false, req.admin.adminId]);
    const item = itemResult.rows[0];
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      await client.query(`
        INSERT INTO shop_item_variants (shop_item_id, name, price, is_active, sort_order)
        VALUES ($1, $2, $3, $4, $5)
      `, [item.id, v.name, v.price, v.is_active !== false, i + 1]);
    }
    await client.query('COMMIT');
    const savedVariants = await fetchVariants([item.id]);
    res.status(201).json({ success: true, item: { ...item, variants: savedVariants }, message: 'Shop item created successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating shop item:', error);
    res.status(500).json({ success: false, message: 'Failed to create shop item' });
  } finally {
    client.release();
  }
});

// Update shop item (replaces variants entirely)
router.put('/:id', adminAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { name, description, category, image_url, stock_quantity, is_active, variants } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    await client.query('BEGIN');
    const result = await client.query(`
      UPDATE shop_items
      SET name=$1, description=$2, category=$3, image_url=$4, stock_quantity=$5, is_active=$6, updated_at=CURRENT_TIMESTAMP
      WHERE id=$7
      RETURNING *
    `, [name, description, category, image_url, stock_quantity || 0, is_active !== false, id]);
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Shop item not found' });
    }
    if (Array.isArray(variants)) {
      await client.query('DELETE FROM shop_item_variants WHERE shop_item_id = $1', [id]);
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        await client.query(`
          INSERT INTO shop_item_variants (shop_item_id, name, price, is_active, sort_order)
          VALUES ($1, $2, $3, $4, $5)
        `, [id, v.name, v.price, v.is_active !== false, i + 1]);
      }
    }
    await client.query('COMMIT');
    const savedVariants = await fetchVariants([parseInt(id)]);
    res.json({ success: true, item: { ...result.rows[0], variants: savedVariants }, message: 'Shop item updated successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating shop item:', error);
    res.status(500).json({ success: false, message: 'Failed to update shop item' });
  } finally {
    client.release();
  }
});

// Delete shop item (variants cascade via FK)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM shop_items WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Shop item not found' });
    }
    res.json({ success: true, message: 'Shop item deleted successfully' });
  } catch (error) {
    console.error('Error deleting shop item:', error);
    res.status(500).json({ success: false, message: 'Failed to delete shop item' });
  }
});

// Get all patients with shop access status
router.get('/access/patients', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.email, u.first_name, u.last_name,
             COALESCE(psa.has_access, false) as has_shop_access,
             psa.granted_at, psa.notes, au.username as granted_by_name
      FROM users u
      LEFT JOIN patient_shop_access psa ON u.id = psa.user_id
      LEFT JOIN admin_users au ON psa.granted_by = au.id
      ORDER BY u.first_name, u.last_name
    `);
    res.json({ success: true, patients: result.rows });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch patients' });
  }
});

// Update patient shop access
router.put('/access/:userId', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { has_access, notes } = req.body;
    const checkResult = await pool.query('SELECT id FROM patient_shop_access WHERE user_id = $1', [userId]);
    let result;
    if (checkResult.rows.length > 0) {
      result = await pool.query(`
        UPDATE patient_shop_access
        SET has_access=$1, notes=$2, granted_by=$3, granted_at=CURRENT_TIMESTAMP, updated_at=CURRENT_TIMESTAMP
        WHERE user_id=$4 RETURNING *
      `, [has_access, notes, req.admin.adminId, userId]);
    } else {
      result = await pool.query(`
        INSERT INTO patient_shop_access (user_id, has_access, notes, granted_by, granted_at)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *
      `, [userId, has_access, notes, req.admin.adminId]);
    }
    res.json({ success: true, access: result.rows[0], message: `Shop access ${has_access ? 'granted' : 'revoked'} successfully` });
  } catch (error) {
    console.error('Error updating shop access:', error);
    res.status(500).json({ success: false, message: 'Failed to update shop access' });
  }
});

export default router;
