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
    const { date, type, serviceId } = req.query;
    
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
    
    // Get service duration if serviceId is provided
    let serviceDuration = 0;
    if (serviceId) {
      const serviceResult = await pool.query(
        'SELECT duration_minutes FROM services WHERE id = $1',
        [serviceId]
      );
      if (serviceResult.rows.length > 0) {
        serviceDuration = serviceResult.rows[0].duration_minutes;
      }
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
    
    // Get working hours for this day of week and appointment type
    const workingHoursResult = await pool.query(
      `SELECT start_time, end_time, slot_interval_minutes 
       FROM working_hours 
       WHERE day_of_week = $1 
       AND is_active = true 
       AND appointment_type = $2`,
      [dayOfWeek, appointmentType]
    );
    
    // If no working hours defined for this day/type, return empty
    if (workingHoursResult.rows.length === 0) {
      return res.json({
        success: true,
        date,
        dayOfWeek,
        appointmentType,
        serviceDuration,
        availableSlots: []
      });
    }
    
    const workingHours = workingHoursResult.rows[0];
    const slotInterval = workingHours.slot_interval_minutes || 30;
    
    // Generate time slots based on working hours
    const generateTimeSlots = () => {
      const slots = [];
      // Normalize time format (remove seconds if present)
      const normalizeTime = (time) => {
        const parts = time.split(':');
        return `${parts[0]}:${parts[1]}`;
      };
      
      let currentTime = normalizeTime(workingHours.start_time);
      const endTime = normalizeTime(workingHours.end_time);
      
      while (currentTime < endTime) {
        const nextTime = addMinutesToTime(currentTime, slotInterval);
        
        // Only add slots that don't extend past end time
        if (nextTime <= endTime) {
          slots.push({
            start_time: currentTime,
            end_time: nextTime
          });
        }
        
        currentTime = nextTime;
      }
      
      return slots;
    };
    
    const timeSlotsResult = { rows: generateTimeSlots() };
    
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
    
    // Build list of blocked times based on service durations
    const blockedTimes = new Set();
    
    bookedResult.rows.forEach(row => {
      const startTime = row.booking_time;
      const durationMinutes = row.duration_minutes;
      
      // Block the start time
      blockedTimes.add(startTime);
      
      // For online appointments: each slot is 30 minutes
      // Block all 30-minute slots that this appointment occupies
      if (appointmentType === 'online') {
        // Calculate how many 30-minute slots this service needs
        const slotsNeeded = Math.ceil(durationMinutes / 30);
        
        // Block all subsequent slots
        for (let i = 1; i < slotsNeeded; i++) {
          const blockedSlot = addMinutesToTime(startTime, i * 30);
          blockedTimes.add(blockedSlot);
        }
      }
      // For on-site appointments: each slot is 60 minutes
      // Block all 60-minute slots that this appointment occupies
      else if (appointmentType === 'on-site') {
        // Calculate how many 60-minute slots this service needs
        const slotsNeeded = Math.ceil(durationMinutes / 60);
        
        // Block all subsequent slots
        for (let i = 1; i < slotsNeeded; i++) {
          const blockedSlot = addMinutesToTime(startTime, i * 60);
          blockedTimes.add(blockedSlot);
        }
      }
    });
    
    // Filter out booked/blocked slots
    const availableSlots = timeSlotsResult.rows.filter(slot => {
      // Check if this slot is blocked
      if (blockedTimes.has(slot.start_time)) {
        return false;
      }
      
      // If we have a service duration, check if enough consecutive slots are available
      if (serviceDuration > 0) {
        const slotInterval = appointmentType === 'online' ? 30 : 60;
        const slotsNeeded = Math.ceil(serviceDuration / slotInterval);
        
        // Check if the next (slotsNeeded - 1) slots are also available
        for (let i = 1; i < slotsNeeded; i++) {
          const nextSlot = addMinutesToTime(slot.start_time, i * slotInterval);
          if (blockedTimes.has(nextSlot)) {
            return false; // One of the required consecutive slots is blocked
          }
        }
      }
      
      return true;
    });
    
    res.json({
      success: true,
      date,
      dayOfWeek,
      appointmentType,
      serviceDuration,
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
