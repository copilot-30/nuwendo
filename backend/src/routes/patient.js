import express from 'express';
import { 
  getPatientProfile,
  updatePatientProfile,
  getFullPatientProfile
} from '../controllers/patientController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get patient profile by email (public - no auth required)
router.get('/profile', getFullPatientProfile);

// Update patient profile by email (public - no auth required)
router.put('/profile/:email', updatePatientProfile);

export default router;
