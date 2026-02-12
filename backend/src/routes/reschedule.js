import express from 'express';
import {
  getRescheduleSettings,
  updateRescheduleSettings,
  rescheduleBooking,
  getRescheduleHistory,
  checkReschedulePermission
} from '../controllers/rescheduleController.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// Public/Patient routes
router.get('/settings', getRescheduleSettings);
router.post('/booking/:bookingId', rescheduleBooking);
router.get('/booking/:bookingId/history', getRescheduleHistory);
router.get('/booking/:bookingId/can-reschedule', checkReschedulePermission);

// Admin routes
router.put('/settings', adminAuth, updateRescheduleSettings);

export default router;
