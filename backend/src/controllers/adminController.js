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

// Get all time slots (now working hours)
const getTimeSlots = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT wh.*, 
              au1.full_name as created_by_name,
              au2.full_name as updated_by_name
       FROM working_hours wh
       LEFT JOIN admin_users au1 ON wh.created_by = au1.id
       LEFT JOIN admin_users au2 ON wh.updated_by = au2.id
       ORDER BY wh.day_of_week, wh.appointment_type`
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

// Create or update working hours for a day
const createTimeSlot = async (req, res) => {
  try {
    const { day_of_week, start_time, end_time, appointment_type, slot_interval_minutes } = req.body;
    const adminId = req.admin.adminId;

    // Validate that appointment_type is required
    if (!appointment_type || !['online', 'on-site'].includes(appointment_type)) {
      return res.status(400).json({ 
        message: 'Appointment type is required and must be either "online" or "on-site"' 
      });
    }

    // Validate times
    if (start_time >= end_time) {
      return res.status(400).json({ 
        message: 'Start time must be before end time' 
      });
    }

    // Check if working hours already exist for this day/type combination
    const existingResult = await pool.query(
      `SELECT id FROM working_hours 
       WHERE day_of_week = $1 
       AND appointment_type = $2`,
      [day_of_week, appointment_type]
    );

    let result;
    if (existingResult.rows.length > 0) {
      // Update existing working hours
      result = await pool.query(
        `UPDATE working_hours 
         SET start_time = $1, end_time = $2, slot_interval_minutes = $3, 
             updated_by = $4, updated_at = CURRENT_TIMESTAMP, is_active = TRUE
         WHERE day_of_week = $5 AND appointment_type = $6
         RETURNING *`,
        [start_time, end_time, slot_interval_minutes || 30, adminId, day_of_week, appointment_type]
      );
    } else {
      // Create new working hours
      result = await pool.query(
        `INSERT INTO working_hours (day_of_week, start_time, end_time, appointment_type, slot_interval_minutes, created_by, updated_by)
         VALUES ($1, $2, $3, $4, $5, $6, $6)
         RETURNING *`,
        [day_of_week, start_time, end_time, appointment_type, slot_interval_minutes || 30, adminId]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Working hours saved successfully',
      timeSlot: result.rows[0]
    });
  } catch (error) {
    console.error('Create time slot error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update working hours
const updateTimeSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { day_of_week, start_time, end_time, appointment_type, slot_interval_minutes, is_active } = req.body;
    const adminId = req.admin.adminId;

    // Validate appointment_type if provided
    if (appointment_type && !['online', 'on-site'].includes(appointment_type)) {
      return res.status(400).json({ 
        message: 'Appointment type must be either "online" or "on-site"' 
      });
    }

    // Validate times
    if (start_time && end_time && start_time >= end_time) {
      return res.status(400).json({ 
        message: 'Start time must be before end time' 
      });
    }

    const result = await pool.query(
      `UPDATE working_hours 
       SET day_of_week = COALESCE($1, day_of_week), 
           start_time = COALESCE($2, start_time), 
           end_time = COALESCE($3, end_time), 
           appointment_type = COALESCE($4, appointment_type), 
           slot_interval_minutes = COALESCE($5, slot_interval_minutes),
           is_active = COALESCE($6, is_active), 
           updated_by = $7,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [day_of_week, start_time, end_time, appointment_type, slot_interval_minutes, is_active, adminId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Working hours not found' });
    }

    res.json({
      success: true,
      message: 'Working hours updated successfully',
      timeSlot: result.rows[0]
    });
  } catch (error) {
    console.error('Update working hours error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete working hours
const deleteTimeSlot = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM working_hours WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Working hours not found' });
    }

    res.json({
      success: true,
      message: 'Working hours deleted successfully'
    });
  } catch (error) {
    console.error('Delete working hours error:', error);
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