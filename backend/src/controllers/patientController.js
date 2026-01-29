import pool from '../config/database.js';

// Get all appointments for a user
export const getAppointments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, doctor_name, specialty, appointment_date, appointment_time, status, notes
       FROM appointments 
       WHERE user_id = $1 
       ORDER BY appointment_date ASC, appointment_time ASC`,
      [req.user.userId]
    );

    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        doctorName: row.doctor_name,
        specialty: row.specialty,
        date: row.appointment_date,
        time: row.appointment_time,
        status: row.status,
        notes: row.notes
      }))
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching appointments' 
    });
  }
};

// Create new appointment
export const createAppointment = async (req, res) => {
  try {
    const { doctorName, specialty, date, time, notes } = req.body;

    const result = await pool.query(
      `INSERT INTO appointments (user_id, doctor_name, specialty, appointment_date, appointment_time, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.userId, doctorName, specialty, date, time, notes || null]
    );

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error creating appointment' 
    });
  }
};

// Get all medications for a user
export const getMedications = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, dosage, frequency, prescribed_by, start_date, end_date, is_active
       FROM medications 
       WHERE user_id = $1 AND is_active = TRUE
       ORDER BY name ASC`,
      [req.user.userId]
    );

    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        dosage: row.dosage,
        frequency: row.frequency,
        prescribedBy: row.prescribed_by,
        startDate: row.start_date,
        endDate: row.end_date,
        isActive: row.is_active
      }))
    });
  } catch (error) {
    console.error('Get medications error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching medications' 
    });
  }
};

// Add new medication
export const addMedication = async (req, res) => {
  try {
    const { name, dosage, frequency, prescribedBy, startDate } = req.body;

    const result = await pool.query(
      `INSERT INTO medications (user_id, name, dosage, frequency, prescribed_by, start_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.userId, name, dosage, frequency, prescribedBy, startDate || null]
    );

    res.status(201).json({
      success: true,
      message: 'Medication added successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Add medication error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error adding medication' 
    });
  }
};

// Get all medical records for a user
export const getMedicalRecords = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, record_type, doctor_name, record_date, status, file_url, notes
       FROM medical_records 
       WHERE user_id = $1 
       ORDER BY record_date DESC`,
      [req.user.userId]
    );

    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        type: row.record_type,
        doctorName: row.doctor_name,
        date: row.record_date,
        status: row.status,
        fileUrl: row.file_url,
        notes: row.notes
      }))
    });
  } catch (error) {
    console.error('Get medical records error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching medical records' 
    });
  }
};

// Add new medical record
export const addMedicalRecord = async (req, res) => {
  try {
    const { type, doctorName, date, fileUrl, notes } = req.body;

    const result = await pool.query(
      `INSERT INTO medical_records (user_id, record_type, doctor_name, record_date, file_url, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.userId, type, doctorName, date, fileUrl || null, notes || null]
    );

    res.status(201).json({
      success: true,
      message: 'Medical record added successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Add medical record error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error adding medical record' 
    });
  }
};

// Get dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const [appointments, medications, records] = await Promise.all([
      pool.query(
        'SELECT COUNT(*) FROM appointments WHERE user_id = $1 AND status = $2',
        [req.user.userId, 'upcoming']
      ),
      pool.query(
        'SELECT COUNT(*) FROM medications WHERE user_id = $1 AND is_active = TRUE',
        [req.user.userId]
      ),
      pool.query(
        'SELECT COUNT(*) FROM medical_records WHERE user_id = $1',
        [req.user.userId]
      )
    ]);

    res.json({
      success: true,
      data: {
        upcomingAppointments: parseInt(appointments.rows[0].count),
        activeMedications: parseInt(medications.rows[0].count),
        medicalRecords: parseInt(records.rows[0].count),
        healthStatus: 'Good' // This could be calculated based on various factors
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching dashboard stats' 
    });
  }
};
