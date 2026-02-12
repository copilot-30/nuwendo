import pool from '../config/database.js';

/**
 * Get reschedule settings
 */
export const getRescheduleSettings = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reschedule_settings ORDER BY id DESC LIMIT 1');
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reschedule settings not found' 
      });
    }
    
    res.json({ 
      success: true, 
      settings: result.rows[0] 
    });
  } catch (error) {
    console.error('Error fetching reschedule settings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch reschedule settings' 
    });
  }
};

/**
 * Update reschedule settings (Admin only)
 */
export const updateRescheduleSettings = async (req, res) => {
  try {
    const {
      patient_min_hours_before,
      admin_min_hours_before,
      max_reschedules_per_booking,
      allow_patient_reschedule,
      allow_admin_reschedule
    } = req.body;

    const result = await pool.query(
      `UPDATE reschedule_settings 
       SET patient_min_hours_before = $1,
           admin_min_hours_before = $2,
           max_reschedules_per_booking = $3,
           allow_patient_reschedule = $4,
           allow_admin_reschedule = $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = (SELECT id FROM reschedule_settings ORDER BY id DESC LIMIT 1)
       RETURNING *`,
      [
        patient_min_hours_before,
        admin_min_hours_before,
        max_reschedules_per_booking,
        allow_patient_reschedule,
        allow_admin_reschedule
      ]
    );

    res.json({ 
      success: true, 
      message: 'Reschedule settings updated successfully',
      settings: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating reschedule settings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update reschedule settings' 
    });
  }
};

/**
 * Check if reschedule is allowed
 */
const canReschedule = async (bookingId, userType) => {
  try {
    // Get booking details
    const bookingResult = await pool.query(
      'SELECT * FROM bookings WHERE id = $1',
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      return { allowed: false, reason: 'Booking not found' };
    }

    const booking = bookingResult.rows[0];

    // Get reschedule settings
    const settingsResult = await pool.query(
      'SELECT * FROM reschedule_settings ORDER BY id DESC LIMIT 1'
    );

    if (settingsResult.rows.length === 0) {
      return { allowed: false, reason: 'Reschedule settings not configured' };
    }

    const settings = settingsResult.rows[0];

    // Check if reschedule is globally allowed for user type
    if (userType === 'patient' && !settings.allow_patient_reschedule) {
      return { allowed: false, reason: 'Patient rescheduling is disabled' };
    }

    if (userType === 'admin' && !settings.allow_admin_reschedule) {
      return { allowed: false, reason: 'Admin rescheduling is disabled' };
    }

    // Check max reschedules
    if (booking.reschedule_count >= settings.max_reschedules_per_booking) {
      return { 
        allowed: false, 
        reason: `Maximum reschedules (${settings.max_reschedules_per_booking}) reached` 
      };
    }

    // Check time restriction
    const appointmentDateTime = new Date(`${booking.booking_date}T${booking.booking_time}`);
    const now = new Date();
    const hoursUntilAppointment = (appointmentDateTime - now) / (1000 * 60 * 60);

    const minHours = userType === 'admin' 
      ? settings.admin_min_hours_before 
      : settings.patient_min_hours_before;

    if (hoursUntilAppointment < minHours) {
      return { 
        allowed: false, 
        reason: `Cannot reschedule within ${minHours} hour(s) of appointment` 
      };
    }

    // Check booking status
    if (!['pending', 'approved'].includes(booking.status)) {
      return { 
        allowed: false, 
        reason: 'Can only reschedule pending or approved bookings' 
      };
    }

    return { allowed: true, settings, booking };
  } catch (error) {
    console.error('Error checking reschedule permission:', error);
    return { allowed: false, reason: 'Error checking permissions' };
  }
};

/**
 * Reschedule a booking
 */
export const rescheduleBooking = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { bookingId } = req.params;
    const { new_date, new_time, reason, rescheduled_by_email } = req.body;
    const userType = req.user?.role || req.body.user_type; // 'admin' or 'patient'

    await client.query('BEGIN');

    // Check if reschedule is allowed
    const permission = await canReschedule(bookingId, userType);
    
    if (!permission.allowed) {
      await client.query('ROLLBACK');
      return res.status(403).json({ 
        success: false, 
        message: permission.reason 
      });
    }

    const booking = permission.booking;

    // Store original dates if this is the first reschedule
    let originalDate = booking.original_booking_date || booking.booking_date;
    let originalTime = booking.original_booking_time || booking.booking_time;

    // Add to reschedule history
    await client.query(
      `INSERT INTO booking_reschedule_history (
        booking_id, old_booking_date, old_booking_time, 
        new_booking_date, new_booking_time, 
        rescheduled_by, rescheduled_by_email, reason
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        bookingId,
        booking.booking_date,
        booking.booking_time,
        new_date,
        new_time,
        userType,
        rescheduled_by_email || req.user?.email,
        reason
      ]
    );

    // Update booking
    const updateResult = await client.query(
      `UPDATE bookings 
       SET booking_date = $1,
           booking_time = $2,
           original_booking_date = $3,
           original_booking_time = $4,
           reschedule_count = reschedule_count + 1,
           rescheduled_by = $5,
           rescheduled_at = CURRENT_TIMESTAMP,
           reschedule_reason = $6
       WHERE id = $7
       RETURNING *`,
      [new_date, new_time, originalDate, originalTime, userType, reason, bookingId]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Booking rescheduled successfully',
      booking: updateResult.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error rescheduling booking:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reschedule booking' 
    });
  } finally {
    client.release();
  }
};

/**
 * Get reschedule history for a booking
 */
export const getRescheduleHistory = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const result = await pool.query(
      `SELECT * FROM booking_reschedule_history 
       WHERE booking_id = $1 
       ORDER BY created_at DESC`,
      [bookingId]
    );

    res.json({
      success: true,
      history: result.rows
    });
  } catch (error) {
    console.error('Error fetching reschedule history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch reschedule history' 
    });
  }
};

/**
 * Check if user can reschedule a booking
 */
export const checkReschedulePermission = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userType = req.user?.role || req.query.user_type;

    const permission = await canReschedule(bookingId, userType);

    res.json({
      success: true,
      allowed: permission.allowed,
      reason: permission.reason,
      remaining_reschedules: permission.settings 
        ? permission.settings.max_reschedules_per_booking - (permission.booking?.reschedule_count || 0)
        : 0
    });
  } catch (error) {
    console.error('Error checking reschedule permission:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check reschedule permission' 
    });
  }
};
