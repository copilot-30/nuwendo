import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Get available time slots for a specific date (public endpoint)
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required'
      });
    }
    
    // Get day of week (0 = Sunday, 6 = Saturday)
    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.getDay();
    
    // Get all active time slots for this day of week
    const timeSlotsResult = await pool.query(
      'SELECT id, start_time, end_time FROM time_slots WHERE day_of_week = $1 AND is_active = true ORDER BY start_time',
      [dayOfWeek]
    );
    
    // Get already booked slots for this date
    const bookedResult = await pool.query(
      `SELECT booking_time FROM bookings 
       WHERE booking_date = $1 
       AND status NOT IN ('cancelled')`,
      [date]
    );
    
    const bookedTimes = bookedResult.rows.map(row => row.booking_time);
    
    // Filter out booked slots
    const availableSlots = timeSlotsResult.rows.filter(slot => {
      return !bookedTimes.includes(slot.start_time);
    });
    
    res.json({
      success: true,
      date,
      dayOfWeek,
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
