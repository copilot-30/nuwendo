import express from 'express';
import { body, query, param } from 'express-validator';
import { 
  getServices, 
  createBooking, 
  getBooking, 
  getPatientBookings, 
  cancelBooking, 
  getPublicPaymentSettings, 
  uploadPaymentReceipt
} from '../controllers/bookingController.js';

const router = express.Router();

// Get all services
router.get('/services', getServices);

// Get public payment settings (QR code, instructions)
router.get('/payment-settings', getPublicPaymentSettings);

// Create a booking
router.post('/create', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('serviceId').isInt().withMessage('Service ID is required'),
  body('bookingDate').notEmpty().withMessage('Booking date is required'),
  body('bookingTime').notEmpty().withMessage('Booking time is required'),
  body('appointmentType').isIn(['online', 'on-site']).withMessage('Appointment type must be online or on-site'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('phoneNumber').notEmpty().withMessage('Phone number is required')
], createBooking);

// Upload payment receipt
router.post('/:id/receipt', [
  param('id').isInt().withMessage('Booking ID is required'),
  body('receiptData').notEmpty().withMessage('Receipt data is required'),
  body('email').isEmail().withMessage('Valid email is required')
], uploadPaymentReceipt);

// Get patient bookings by email
router.get('/patient', [
  query('email').isEmail().withMessage('Valid email is required')
], getPatientBookings);

// Cancel a booking (24 hours before required)
router.put('/:id/cancel', [
  param('id').isInt().withMessage('Booking ID is required'),
  body('email').isEmail().withMessage('Valid email is required')
], cancelBooking);

// Get booking details
router.get('/:id', getBooking);

export default router;
