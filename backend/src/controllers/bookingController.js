import pool from '../config/database.js';

// Get all active services
const getServices = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, description, duration_minutes, price, category 
       FROM services 
       WHERE is_active = true 
       ORDER BY category, name`
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

// Get available time slots for a specific date
const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const bookingDate = new Date(date);
    const dayOfWeek = bookingDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Get time slots for this day of week
    const slotsResult = await pool.query(
      `SELECT id, start_time, end_time 
       FROM time_slots 
       WHERE day_of_week = $1 AND is_active = true
       ORDER BY start_time`,
      [dayOfWeek]
    );

    // Get already booked slots for this date
    const bookedResult = await pool.query(
      `SELECT booking_time 
       FROM bookings 
       WHERE booking_date = $1 AND status != 'cancelled'`,
      [date]
    );

    const bookedTimes = bookedResult.rows.map(row => row.booking_time);

    // Filter out booked slots
    const availableSlots = slotsResult.rows.filter(slot => {
      const slotTime = slot.start_time;
      return !bookedTimes.includes(slotTime);
    });

    res.json({
      success: true,
      date,
      dayOfWeek,
      availableSlots
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a booking
const createBooking = async (req, res) => {
  try {
    const { 
      email, 
      serviceId, 
      bookingDate, 
      bookingTime,
      appointmentType,
      firstName, 
      lastName, 
      phoneNumber, 
      notes,
      paymentMethod,
      paymentReference
    } = req.body;

    // Validate appointment type
    if (!['online', 'on-site'].includes(appointmentType)) {
      return res.status(400).json({ message: 'Invalid appointment type' });
    }

    // Get user by email
    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userId = userResult.rows[0].id;

    // Update user name if provided
    if (firstName || lastName) {
      await pool.query(
        'UPDATE users SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name) WHERE id = $3',
        [firstName, lastName, userId]
      );
    }

    // Get service price
    const serviceResult = await pool.query(
      'SELECT price FROM services WHERE id = $1',
      [serviceId]
    );

    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const amountPaid = serviceResult.rows[0].price;

    // Check if slot is still available for the specific appointment type
    const existingBooking = await pool.query(
      `SELECT id FROM bookings 
       WHERE booking_date = $1 
       AND booking_time = $2 
       AND appointment_type = $3
       AND status != 'cancelled'`,
      [bookingDate, bookingTime, appointmentType]
    );

    if (existingBooking.rows.length > 0) {
      return res.status(400).json({ message: 'This time slot is no longer available for ' + appointmentType + ' appointments' });
    }

    // Create booking
    const result = await pool.query(
      `INSERT INTO bookings (
        user_id, service_id, booking_date, booking_time, 
        appointment_type, phone_number, notes, payment_status, 
        payment_method, payment_reference, amount_paid, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id`,
      [
        userId, 
        serviceId, 
        bookingDate, 
        bookingTime,
        appointmentType,
        phoneNumber, 
        notes,
        'paid',
        paymentMethod,
        paymentReference,
        amountPaid,
        'confirmed'
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      bookingId: result.rows[0].id
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get booking details
const getBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT b.*, s.name as service_name, s.description as service_description,
              s.duration_minutes, u.email, u.first_name, u.last_name
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       JOIN users u ON b.user_id = u.id
       WHERE b.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({
      success: true,
      booking: result.rows[0]
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get patient bookings by email
const getPatientBookings = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Get user by email
    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.json({
        success: true,
        bookings: []
      });
    }

    const userId = userResult.rows[0].id;

    // Get all bookings for this user
    const result = await pool.query(
      `SELECT b.*, s.name as service_name, s.description as service_description,
              s.price, s.duration_minutes
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       WHERE b.user_id = $1
       ORDER BY b.booking_date DESC, b.booking_time DESC`,
      [userId]
    );

    res.json({
      success: true,
      bookings: result.rows
    });
  } catch (error) {
    console.error('Get patient bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export {
  getServices,
  getAvailableSlots,
  createBooking,
  getBooking,
  getPatientBookings
};
