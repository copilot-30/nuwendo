import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Helper function to add minutes to a time string
const addMinutesToTime = (timeStr, minutes) => {
  const [hours, mins] = timeStr.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
};

// Get available time slots for a specific date (public endpoint)
router.get('/', async (req, res) => {
  try {
    const { date, type } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required'
      });
    }

    // Validate appointment type
    const appointmentType = type || 'on-site';
    if (!['online', 'on-site'].includes(appointmentType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment type. Must be online or on-site'
      });
    }
    
    // Get minimum advance hours setting from database (default 24)
    const settingsResult = await pool.query(
      `SELECT setting_value FROM system_settings WHERE setting_key = 'min_advance_hours'`
    );
    const minAdvanceHours = settingsResult.rows.length > 0 
      ? parseInt(settingsResult.rows[0].setting_value) 
      : 24;
    
    // Check if requested date is at least minAdvanceHours in the future
    const requestedDate = new Date(date);
    const now = new Date();
    const minBookingDate = new Date(now.getTime() + (minAdvanceHours * 60 * 60 * 1000));
    
    if (requestedDate < minBookingDate) {
      return res.status(400).json({
        success: false,
        message: `Bookings must be made at least ${minAdvanceHours} hours in advance. Please select a date on or after ${minBookingDate.toISOString().split('T')[0]}.`
      });
    }
    
    // Get day of week (0 = Sunday, 6 = Saturday)
    const dayOfWeek = requestedDate.getDay();
    
    // Get all active time slots for this day of week and appointment type
    const timeSlotsResult = await pool.query(
      `SELECT id, start_time, end_time, appointment_type 
       FROM time_slots 
       WHERE day_of_week = $1 
       AND is_active = true 
       AND appointment_type = $2
       ORDER BY start_time`,
      [dayOfWeek, appointmentType]
    );
    
    // Get already booked slots for this date and type, including service duration
    const bookedResult = await pool.query(
      `SELECT b.booking_time, s.duration_minutes 
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       WHERE b.booking_date = $1 
       AND b.appointment_type = $2
       AND b.status NOT IN ('cancelled')`,
      [date, appointmentType]
    );
    
    // Build list of blocked times
    // For online appointments with 60 min services, both the start slot AND the next 30-min slot are blocked
    const blockedTimes = new Set();
    bookedResult.rows.forEach(row => {
      blockedTimes.add(row.booking_time);
      
      // For online appointments, if service is 60 mins, also block the next slot
      if (appointmentType === 'online' && row.duration_minutes >= 60) {
        const nextSlot = addMinutesToTime(row.booking_time, 30);
        blockedTimes.add(nextSlot);
      }
    });
    
    // Filter out booked/blocked slots
    const availableSlots = timeSlotsResult.rows.filter(slot => {
      return !blockedTimes.has(slot.start_time);
    });
    
    res.json({
      success: true,
      date,
      dayOfWeek,
      appointmentType,
      availableSlots
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch availability'
    });
  }
});

export default router;
