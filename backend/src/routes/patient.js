import express from 'express';
import { 
  getAppointments, 
  createAppointment,
  getMedications,
  addMedication,
  getMedicalRecords,
  addMedicalRecord,
  getDashboardStats
} from '../controllers/patientController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All patient routes require authentication
router.use(authMiddleware);

// Dashboard stats
router.get('/dashboard/stats', getDashboardStats);

// Appointments
router.get('/appointments', getAppointments);
router.post('/appointments', createAppointment);

// Medications
router.get('/medications', getMedications);
router.post('/medications', addMedication);

// Medical Records
router.get('/medical-records', getMedicalRecords);
router.post('/medical-records', addMedicalRecord);

export default router;
