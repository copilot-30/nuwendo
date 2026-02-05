import express from 'express';
import pool from '../config/database.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// Get all shop items
router.get('/', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        si.*,
        au.username as created_by_name
      FROM shop_items si
      LEFT JOIN admin_users au ON si.created_by = au.id
      ORDER BY si.created_at DESC
    `);
    
    res.json({ 
      success: true, 
      items: result.rows 
    });
  } catch (error) {
    console.error('Error fetching shop items:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch shop items' 
    });
  }
});

// Get single shop item
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM shop_items WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Shop item not found' 
      });
    }
    
    res.json({ 
      success: true, 
      item: result.rows[0] 
    });
  } catch (error) {
    console.error('Error fetching shop item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch shop item' 
    });
  }
});

// Create shop item
router.post('/', adminAuth, async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      category, 
      image_url, 
      stock_quantity,
      is_active 
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and price are required' 
      });
    }

    const result = await pool.query(`
      INSERT INTO shop_items (
        name, 
        description, 
        price, 
        category, 
        image_url, 
        stock_quantity,
        is_active,
        created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      name, 
      description, 
      price, 
      category, 
      image_url, 
      stock_quantity || 0,
      is_active !== undefined ? is_active : true,
      req.admin.adminId
    ]);

    res.status(201).json({ 
      success: true, 
      item: result.rows[0],
      message: 'Shop item created successfully'
    });
  } catch (error) {
    console.error('Error creating shop item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create shop item' 
    });
  }
});

// Update shop item
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      price, 
      category, 
      image_url, 
      stock_quantity,
      is_active 
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and price are required' 
      });
    }

    const result = await pool.query(`
      UPDATE shop_items 
      SET 
        name = $1,
        description = $2,
        price = $3,
        category = $4,
        image_url = $5,
        stock_quantity = $6,
        is_active = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `, [
      name, 
      description, 
      price, 
      category, 
      image_url, 
      stock_quantity,
      is_active,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Shop item not found' 
      });
    }

    res.json({ 
      success: true, 
      item: result.rows[0],
      message: 'Shop item updated successfully'
    });
  } catch (error) {
    console.error('Error updating shop item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update shop item' 
    });
  }
});

// Delete shop item
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM shop_items WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Shop item not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Shop item deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting shop item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete shop item' 
    });
  }
});

// Get all patients with shop access status
router.get('/access/patients', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        COALESCE(psa.has_access, false) as has_shop_access,
        psa.granted_at,
        psa.notes,
        au.username as granted_by_name
      FROM users u
      LEFT JOIN patient_shop_access psa ON u.id = psa.user_id
      LEFT JOIN admin_users au ON psa.granted_by = au.id
      ORDER BY u.first_name, u.last_name
    `);
    
    res.json({ 
      success: true, 
      patients: result.rows 
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch patients' 
    });
  }
});

// Update patient shop access
router.put('/access/:userId', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { has_access, notes } = req.body;

    // Check if record exists
    const checkResult = await pool.query(
      'SELECT id FROM patient_shop_access WHERE user_id = $1',
      [userId]
    );

    let result;
    if (checkResult.rows.length > 0) {
      // Update existing record
      result = await pool.query(`
        UPDATE patient_shop_access 
        SET 
          has_access = $1,
          notes = $2,
          granted_by = $3,
          granted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $4
        RETURNING *
      `, [has_access, notes, req.admin.adminId, userId]);
    } else {
      // Insert new record
      result = await pool.query(`
        INSERT INTO patient_shop_access (
          user_id, 
          has_access, 
          notes, 
          granted_by, 
          granted_at
        )
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        RETURNING *
      `, [userId, has_access, notes, req.admin.adminId]);
    }

    res.json({ 
      success: true, 
      access: result.rows[0],
      message: `Shop access ${has_access ? 'granted' : 'revoked'} successfully`
    });
  } catch (error) {
    console.error('Error updating shop access:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update shop access' 
    });
  }
});

export default router;
