import express from 'express';
import { 
  getAppointments, 
  createAppointment,
  getMedications,
  addMedication,
  getMedicalRecords,
  addMedicalRecord,
  getDashboardStats,
  getPatientProfile,
  updatePatientProfile,
  getFullPatientProfile
} from '../controllers/patientController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public dashboard endpoint (uses userId from session)
router.get('/dashboard/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const db = req.app.get('db');

    // Get patient profile
    const profileResult = await db.query(`
      SELECT pp.first_name, pp.last_name, pp.email, pp.phone
      FROM patient_profiles pp
      WHERE pp.user_id = $1
    `, [userId]);

    // Get appointments with service details
    const appointmentsResult = await db.query(`
      SELECT 
        b.id,
        s.name as service_name,
        b.booking_date,
        ts.start_time,
        ts.appointment_type,
        b.status
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN time_slots ts ON b.time_slot_id = ts.id
      WHERE b.user_id = $1
      ORDER BY b.booking_date DESC, ts.start_time DESC
    `, [userId]);

    res.json({
      profile: profileResult.rows[0] || null,
      appointments: appointmentsResult.rows || []
    });
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get patient profile by email (public - no auth required)
router.get('/profile', getFullPatientProfile);

// Update patient profile by email (public - no auth required)
router.put('/profile/:email', updatePatientProfile);

// All other patient routes require authentication
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
