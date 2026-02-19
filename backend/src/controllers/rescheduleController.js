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

    // Check booking status - can't reschedule cancelled bookings
    if (booking.status === 'cancelled') {
      return { 
        allowed: false, 
        reason: 'Cannot reschedule a cancelled booking' 
      };
    }

    // Check business status - can't reschedule completed or no-show appointments
    if (['completed', 'no_show'].includes(booking.business_status)) {
      return { 
        allowed: false, 
        reason: `Cannot reschedule ${booking.business_status === 'completed' ? 'completed' : 'no-show'} appointments` 
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

    // ✅ CRITICAL: Validate that the service supports the appointment type
    const serviceCheck = await client.query(
      `SELECT availability_type, name 
       FROM services 
       WHERE id = $1 AND is_active = true`,
      [booking.service_id]
    );

    if (serviceCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: 'Service not found or inactive' 
      });
    }

    const service = serviceCheck.rows[0];
    const appointmentType = booking.appointment_type;

    // Check if service availability matches appointment type
    // availability_type can be: 'online', 'on-site', or 'both'
    if (service.availability_type === 'online' && appointmentType !== 'online') {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: `This service (${service.name}) is only available for online appointments. You cannot reschedule an online appointment to on-site.` 
      });
    }

    if (service.availability_type === 'on-site' && appointmentType !== 'on-site') {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: `This service (${service.name}) is only available for on-site appointments. You cannot reschedule an on-site appointment to online.` 
      });
    }

    // If availability_type is 'both', allow either appointment type

    // ✅ CRITICAL: Check if the new time slot is available
    const conflictCheck = await client.query(
      `SELECT id, service_id, user_id, booking_date, booking_time 
       FROM bookings 
       WHERE booking_date = $1 
       AND booking_time = $2 
       AND id != $3
       AND status NOT IN ('cancelled')
       AND business_status NOT IN ('cancelled')`,
      [new_date, new_time, bookingId]
    );

    if (conflictCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ 
        success: false, 
        message: 'This time slot is already booked. Please select a different date or time.',
        conflict: true
      });
    }

    // ✅ Check if the new time slot is within working hours
    const dayOfWeek = new Date(new_date).getDay();
    
    // Use the same appointment type from the booking (already validated above)
    const workingHoursCheck = await client.query(
      `SELECT start_time, end_time, slot_interval_minutes 
       FROM working_hours 
       WHERE day_of_week = $1 
       AND appointment_type = $2
       AND is_active = true`,
      [dayOfWeek, appointmentType]
    );

    if (workingHoursCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: 'No working hours configured for this day and appointment type.',
        invalid_timeslot: true
      });
    }

    // Validate that the selected time is within working hours range
    const workingHours = workingHoursCheck.rows[0];
    const selectedTime = new_time;
    
    // Check if selected time falls within working hours range
    if (selectedTime < workingHours.start_time || selectedTime >= workingHours.end_time) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: 'Selected time is not available in our schedule. Please choose from available time slots.',
        invalid_timeslot: true
      });
    }

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
    // Reset business_status to 'scheduled' when rescheduled (fresh appointment)
    const updateResult = await client.query(
      `UPDATE bookings 
       SET booking_date = $1,
           booking_time = $2,
           original_booking_date = $3,
           original_booking_time = $4,
           reschedule_count = reschedule_count + 1,
           rescheduled_by = $5,
           rescheduled_at = CURRENT_TIMESTAMP,
           reschedule_reason = $6,
           business_status = 'scheduled'
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

/**
 * Get available time slots for rescheduling (excludes already booked slots)
 */
export const getAvailableTimeSlotsForReschedule = async (req, res) => {
  try {
    const { date, appointment_type = 'on-site' } = req.query;
    
    if (!date) {
      return res.status(400).json({ 
        success: false,
        message: 'Date is required' 
      });
    }

    const bookingDate = new Date(date);
    const dayOfWeek = bookingDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Get working hours for this day of week
    const workingHoursResult = await pool.query(
      `SELECT start_time, end_time, slot_interval_minutes 
       FROM working_hours 
       WHERE day_of_week = $1 
       AND appointment_type = $2 
       AND is_active = true`,
      [dayOfWeek, appointment_type]
    );

    if (workingHoursResult.rows.length === 0) {
      return res.json({
        success: true,
        date,
        dayOfWeek,
        availableSlots: [],
        bookedSlots: 0,
        message: 'No working hours configured for this day'
      });
    }

    const workingHours = workingHoursResult.rows[0];
    const intervalMinutes = workingHours.slot_interval_minutes || 30;

    // Generate time slots from working hours
    const generateTimeSlots = (startTime, endTime, interval) => {
      const slots = [];
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      for (let minutes = startMinutes; minutes < endMinutes; minutes += interval) {
        const hour = Math.floor(minutes / 60);
        const min = minutes % 60;
        const nextMin = minutes + interval;
        const nextHour = Math.floor(nextMin / 60);
        const nextMinute = nextMin % 60;
        
        const startTimeStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}:00`;
        const endTimeStr = `${String(nextHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}:00`;
        
        slots.push({
          start_time: startTimeStr,
          end_time: endTimeStr
        });
      }
      
      return slots;
    };

    const allSlots = generateTimeSlots(
      workingHours.start_time,
      workingHours.end_time,
      intervalMinutes
    );

    // Get already booked slots for this date (excluding cancelled)
    const bookedResult = await pool.query(
      `SELECT booking_time 
       FROM bookings 
       WHERE booking_date = $1 
       AND status NOT IN ('cancelled')
       AND business_status NOT IN ('cancelled')`,
      [date]
    );

    const bookedTimes = bookedResult.rows.map(row => row.booking_time);

    // Filter out booked slots
    const availableSlots = allSlots.filter(slot => {
      return !bookedTimes.includes(slot.start_time);
    });

    res.json({
      success: true,
      date,
      dayOfWeek,
      availableSlots,
      bookedSlots: bookedTimes.length
    });
  } catch (error) {
    console.error('Error getting available slots for reschedule:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get available time slots' 
    });
  }
};
