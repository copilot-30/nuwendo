import express from 'express';
import { body, query } from 'express-validator';
import { getServices, getAvailableSlots, createBooking, getBooking } from '../controllers/bookingController.js';

const router = express.Router();

// Get all services
router.get('/services', getServices);

// Get available time slots for a date
router.get('/slots', [
  query('date').notEmpty().withMessage('Date is required')
], getAvailableSlots);

// Create a booking
router.post('/create', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('serviceId').isInt().withMessage('Service ID is required'),
  body('bookingDate').notEmpty().withMessage('Booking date is required'),
  body('bookingTime').notEmpty().withMessage('Booking time is required'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('phoneNumber').notEmpty().withMessage('Phone number is required')
], createBooking);

// Get booking details
router.get('/:id', getBooking);

export default router;
