import express from 'express';
import { body, query } from 'express-validator';
import { adminAuth, requireRole } from '../middleware/adminAuth.js';
import {
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
} from '../controllers/adminController.js';

const router = express.Router();

// Apply admin authentication to all routes
router.use(adminAuth);

// Services management
router.get('/services', getServices);

router.post('/services', [
  body('name').notEmpty().withMessage('Service name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('duration_minutes').isInt({ min: 5, max: 480 }).withMessage('Duration must be between 5-480 minutes'),
  body('price').isDecimal({ decimal_digits: '0,2' }).withMessage('Valid price is required'),
  body('category').notEmpty().withMessage('Category is required')
], createService);

router.put('/services/:id', [
  body('name').notEmpty().withMessage('Service name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('duration_minutes').isInt({ min: 5, max: 480 }).withMessage('Duration must be between 5-480 minutes'),
  body('price').isDecimal({ decimal_digits: '0,2' }).withMessage('Valid price is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('is_active').isBoolean().withMessage('is_active must be boolean')
], updateService);

router.delete('/services/:id', requireRole(['super_admin']), deleteService);

// Time slots management
router.get('/time-slots', getTimeSlots);

router.post('/time-slots', [
  body('day_of_week').isInt({ min: 0, max: 6 }).withMessage('Day of week must be 0-6'),
  body('start_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time required (HH:MM)'),
  body('end_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time required (HH:MM)'),
  body('appointment_type').isIn(['online', 'on-site']).withMessage('Appointment type must be online or on-site')
], createTimeSlot);

router.put('/time-slots/:id', [
  body('day_of_week').isInt({ min: 0, max: 6 }).withMessage('Day of week must be 0-6'),
  body('start_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time required (HH:MM)'),
  body('end_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time required (HH:MM)'),
  body('appointment_type').isIn(['online', 'on-site']).withMessage('Appointment type must be online or on-site'),
  body('is_active').isBoolean().withMessage('is_active must be boolean')
], updateTimeSlot);

router.delete('/time-slots/:id', requireRole(['super_admin']), deleteTimeSlot);

// Bookings management
router.get('/bookings', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  query('status').optional().isIn(['pending', 'confirmed', 'completed', 'cancelled']).withMessage('Invalid status'),
  query('date_from').optional().isDate().withMessage('Invalid date format'),
  query('date_to').optional().isDate().withMessage('Invalid date format')
], getBookings);

router.patch('/bookings/:id/status', [
  body('status').isIn(['pending', 'confirmed', 'completed', 'cancelled']).withMessage('Invalid status')
], updateBookingStatus);

export default router;