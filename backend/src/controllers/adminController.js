import pool from '../config/database.js';

// Get all services for admin management
const getServices = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, 
              au1.full_name as created_by_name,
              au2.full_name as updated_by_name
       FROM services s
       LEFT JOIN admin_users au1 ON s.created_by = au1.id
       LEFT JOIN admin_users au2 ON s.updated_by = au2.id
       ORDER BY s.category, s.name`
    );
    
    res.json({
      success: true,
      services: result.rows
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new service
const createService = async (req, res) => {
  try {
    const { name, description, duration_minutes, price, category } = req.body;
    const adminId = req.admin.adminId;

    const result = await pool.query(
      `INSERT INTO services (name, description, duration_minutes, price, category, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $6)
       RETURNING *`,
      [name, description, duration_minutes, price, category, adminId]
    );

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service: result.rows[0]
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update service
const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, duration_minutes, price, category, is_active } = req.body;
    const adminId = req.admin.adminId;

    const result = await pool.query(
      `UPDATE services 
       SET name = $1, description = $2, duration_minutes = $3, price = $4, 
           category = $5, is_active = $6, updated_by = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [name, description, duration_minutes, price, category, is_active, adminId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({
      success: true,
      message: 'Service updated successfully',
      service: result.rows[0]
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete service
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if service has bookings
    const bookingsResult = await pool.query(
      'SELECT COUNT(*) as count FROM bookings WHERE service_id = $1',
      [id]
    );

    if (parseInt(bookingsResult.rows[0].count) > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete service with existing bookings. Please deactivate instead.' 
      });
    }

    const result = await pool.query(
      'DELETE FROM services WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all time slots
const getTimeSlots = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ts.*, 
              au1.full_name as created_by_name,
              au2.full_name as updated_by_name
       FROM time_slots ts
       LEFT JOIN admin_users au1 ON ts.created_by = au1.id
       LEFT JOIN admin_users au2 ON ts.updated_by = au2.id
       ORDER BY ts.day_of_week, ts.start_time`
    );
    
    res.json({
      success: true,
      timeSlots: result.rows
    });
  } catch (error) {
    console.error('Get time slots error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new time slot
const createTimeSlot = async (req, res) => {
  try {
    const { day_of_week, start_time, end_time } = req.body;
    const adminId = req.admin.adminId;

    // Check for overlapping slots
    const overlappingResult = await pool.query(
      `SELECT id FROM time_slots 
       WHERE day_of_week = $1 
       AND (
         (start_time <= $2 AND end_time > $2) OR
         (start_time < $3 AND end_time >= $3) OR
         (start_time >= $2 AND end_time <= $3)
       )`,
      [day_of_week, start_time, end_time]
    );

    if (overlappingResult.rows.length > 0) {
      return res.status(400).json({ 
        message: 'Time slot overlaps with existing slot' 
      });
    }

    const result = await pool.query(
      `INSERT INTO time_slots (day_of_week, start_time, end_time, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $4)
       RETURNING *`,
      [day_of_week, start_time, end_time, adminId]
    );

    res.status(201).json({
      success: true,
      message: 'Time slot created successfully',
      timeSlot: result.rows[0]
    });
  } catch (error) {
    console.error('Create time slot error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update time slot
const updateTimeSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { day_of_week, start_time, end_time, is_active } = req.body;
    const adminId = req.admin.adminId;

    // Check for overlapping slots (excluding current slot)
    const overlappingResult = await pool.query(
      `SELECT id FROM time_slots 
       WHERE day_of_week = $1 AND id != $2
       AND (
         (start_time <= $3 AND end_time > $3) OR
         (start_time < $4 AND end_time >= $4) OR
         (start_time >= $3 AND end_time <= $4)
       )`,
      [day_of_week, id, start_time, end_time]
    );

    if (overlappingResult.rows.length > 0) {
      return res.status(400).json({ 
        message: 'Time slot overlaps with existing slot' 
      });
    }

    const result = await pool.query(
      `UPDATE time_slots 
       SET day_of_week = $1, start_time = $2, end_time = $3, is_active = $4, updated_by = $5
       WHERE id = $6
       RETURNING *`,
      [day_of_week, start_time, end_time, is_active, adminId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Time slot not found' });
    }

    res.json({
      success: true,
      message: 'Time slot updated successfully',
      timeSlot: result.rows[0]
    });
  } catch (error) {
    console.error('Update time slot error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete time slot
const deleteTimeSlot = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM time_slots WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Time slot not found' });
    }

    res.json({
      success: true,
      message: 'Time slot deleted successfully'
    });
  } catch (error) {
    console.error('Delete time slot error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all bookings with pagination and filters
const getBookings = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, date_from, date_to, search } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    if (status) {
      whereConditions.push(`b.status = $${paramIndex++}`);
      queryParams.push(status);
    }

    if (date_from) {
      whereConditions.push(`b.booking_date >= $${paramIndex++}`);
      queryParams.push(date_from);
    }

    if (date_to) {
      whereConditions.push(`b.booking_date <= $${paramIndex++}`);
      queryParams.push(date_to);
    }

    if (search) {
      whereConditions.push(`(u.first_name ILIKE $${paramIndex} OR u.last_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) as total
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       ${whereClause}`,
      queryParams
    );

    queryParams.push(limit, offset);

    const result = await pool.query(
      `SELECT b.*, 
              u.first_name, u.last_name, u.email,
              s.name as service_name, s.duration_minutes, s.price
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN services s ON b.service_id = s.id
       ${whereClause}
       ORDER BY b.created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      queryParams
    );

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      bookings: result.rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_records: total,
        per_page: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update booking status
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      'UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      booking: result.rows[0]
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export {
  getServices,
  createService,
  updateService,
  deleteService,
  getTimeSlots,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
  getBookings,
  updateBookingStatus
};