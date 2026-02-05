import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Get all active services (public endpoint for patients)
router.get('/', async (req, res) => {
  try {
    const { appointmentType } = req.query;
    
    let query = 'SELECT id, name, description, duration_minutes, price, category, availability_type FROM services WHERE is_active = true';
    
    // Filter by appointment type if provided
    if (appointmentType === 'online') {
      query += " AND (availability_type = 'online' OR availability_type = 'both')";
    } else if (appointmentType === 'on-site') {
      query += " AND (availability_type = 'on-site' OR availability_type = 'both')";
    }
    
    query += ' ORDER BY category, name';
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      services: result.rows
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services'
    });
  }
});

// Get single service by ID (public endpoint)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, name, description, duration_minutes, price, category, availability_type FROM services WHERE id = $1 AND is_active = true',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    res.json({
      success: true,
      service: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service'
    });
  }
});

export default router;
