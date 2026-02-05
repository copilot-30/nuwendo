import express from 'express';
import pool from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Check shop access by email (public endpoint for legacy sessions)
router.get('/access/by-email', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Get user by email
    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.json({ 
        success: true, 
        hasAccess: false 
      });
    }

    const userId = userResult.rows[0].id;

    // Check shop access
    const accessResult = await pool.query(
      'SELECT has_access FROM patient_shop_access WHERE user_id = $1',
      [userId]
    );
    
    const hasAccess = accessResult.rows.length > 0 ? accessResult.rows[0].has_access : false;
    
    res.json({ 
      success: true, 
      hasAccess 
    });
  } catch (error) {
    console.error('Error checking shop access by email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check shop access' 
    });
  }
});

// Check if patient has shop access
router.get('/access', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT has_access FROM patient_shop_access WHERE user_id = $1',
      [req.user.userId]
    );
    
    const hasAccess = result.rows.length > 0 ? result.rows[0].has_access : false;
    
    res.json({ 
      success: true, 
      hasAccess 
    });
  } catch (error) {
    console.error('Error checking shop access:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check shop access' 
    });
  }
});

// Get shop items by email (public endpoint for legacy sessions)
router.get('/items/by-email', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Get user by email
    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const userId = userResult.rows[0].id;

    // Check if patient has access
    const accessResult = await pool.query(
      'SELECT has_access FROM patient_shop_access WHERE user_id = $1',
      [userId]
    );
    
    const hasAccess = accessResult.rows.length > 0 ? accessResult.rows[0].has_access : false;
    
    if (!hasAccess) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have access to the shop' 
      });
    }

    // Fetch shop items
    const result = await pool.query(`
      SELECT 
        id,
        name,
        description,
        price,
        category,
        image_url,
        stock_quantity
      FROM shop_items
      WHERE is_active = true
      ORDER BY category, name
    `);
    
    res.json({ 
      success: true, 
      items: result.rows 
    });
  } catch (error) {
    console.error('Error fetching shop items by email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch shop items' 
    });
  }
});

// Get all active shop items (only if patient has access)
router.get('/items', authMiddleware, async (req, res) => {
  try {
    // Check if patient has access
    const accessResult = await pool.query(
      'SELECT has_access FROM patient_shop_access WHERE user_id = $1',
      [req.user.userId]
    );
    
    const hasAccess = accessResult.rows.length > 0 ? accessResult.rows[0].has_access : false;
    
    if (!hasAccess) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have access to the shop' 
      });
    }

    const result = await pool.query(`
      SELECT 
        id,
        name,
        description,
        price,
        category,
        image_url,
        stock_quantity
      FROM shop_items
      WHERE is_active = true
      ORDER BY category, name
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

// Create shop order
router.post('/orders', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    // Check if patient has access
    const accessResult = await client.query(
      'SELECT has_access FROM patient_shop_access WHERE user_id = $1',
      [req.user.userId]
    );
    
    const hasAccess = accessResult.rows.length > 0 ? accessResult.rows[0].has_access : false;
    
    if (!hasAccess) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have access to the shop' 
      });
    }

    const { items, payment_receipt_url, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order must contain at least one item' 
      });
    }

    await client.query('BEGIN');

    // Calculate total amount
    let totalAmount = 0;
    for (const item of items) {
      const itemResult = await client.query(
        'SELECT price, stock_quantity FROM shop_items WHERE id = $1 AND is_active = true',
        [item.shop_item_id]
      );
      
      if (itemResult.rows.length === 0) {
        throw new Error(`Item ${item.shop_item_id} not found or not available`);
      }
      
      const itemData = itemResult.rows[0];
      if (itemData.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for item ${item.shop_item_id}`);
      }
      
      totalAmount += parseFloat(itemData.price) * item.quantity;
    }

    // Create order
    const orderResult = await client.query(`
      INSERT INTO shop_orders (user_id, total_amount, payment_receipt_url, notes)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [req.user.userId, totalAmount, payment_receipt_url, notes]);

    const orderId = orderResult.rows[0].id;

    // Add order items
    for (const item of items) {
      const itemResult = await client.query(
        'SELECT price FROM shop_items WHERE id = $1',
        [item.shop_item_id]
      );
      
      await client.query(`
        INSERT INTO shop_order_items (order_id, shop_item_id, quantity, price_at_purchase)
        VALUES ($1, $2, $3, $4)
      `, [orderId, item.shop_item_id, item.quantity, itemResult.rows[0].price]);

      // Update stock
      await client.query(
        'UPDATE shop_items SET stock_quantity = stock_quantity - $1 WHERE id = $2',
        [item.quantity, item.shop_item_id]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({ 
      success: true, 
      order: orderResult.rows[0],
      message: 'Order created successfully' 
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating order:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create order' 
    });
  } finally {
    client.release();
  }
});

// Get patient's orders
router.get('/orders', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.*,
        json_agg(
          json_build_object(
            'id', oi.id,
            'shop_item_id', oi.shop_item_id,
            'quantity', oi.quantity,
            'price_at_purchase', oi.price_at_purchase,
            'item_name', si.name
          )
        ) as items
      FROM shop_orders o
      LEFT JOIN shop_order_items oi ON o.id = oi.order_id
      LEFT JOIN shop_items si ON oi.shop_item_id = si.id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, [req.user.userId]);
    
    res.json({ 
      success: true, 
      orders: result.rows 
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch orders' 
    });
  }
});

export default router;
