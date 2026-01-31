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

// Get patient profile by email (public endpoint)
export const getPatientProfile = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Get user with profile
    const userResult = await pool.query(
      `SELECT u.id, u.email, u.first_name, u.last_name,
              pp.phone_number, pp.address, pp.date_of_birth,
              pp.gender, pp.blood_type, pp.allergies, pp.medical_conditions
       FROM users u
       LEFT JOIN patient_profiles pp ON u.id = pp.user_id
       WHERE u.email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];

    res.json({
      success: true,
      profile: {
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email,
        phone: user.phone_number || '',
        address: user.address || '',
        dateOfBirth: user.date_of_birth || '',
        gender: user.gender || '',
        bloodType: user.blood_type || '',
        allergies: user.allergies || '',
        medicalConditions: user.medical_conditions || ''
      }
    });
  } catch (error) {
    console.error('Get patient profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update patient profile by email (public endpoint)
export const updatePatientProfile = async (req, res) => {
  try {
    const { email } = req.params;
    const { firstName, lastName, phone, address, age, height, weight, reasonForConsult, healthGoals } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Get user ID
    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userId = userResult.rows[0].id;

    // Update user table (first_name, last_name)
    if (firstName || lastName) {
      await pool.query(
        `UPDATE users 
         SET first_name = COALESCE($1, first_name), 
             last_name = COALESCE($2, last_name),
             updated_at = NOW()
         WHERE id = $3`,
        [firstName, lastName, userId]
      );
    }

    // Check if patient_profile exists
    const profileExists = await pool.query(
      'SELECT id FROM patient_profiles WHERE user_id = $1',
      [userId]
    );

    // Build medical_conditions JSON with extra fields
    const medicalConditionsData = JSON.stringify({
      age: age || '',
      height: height || '',
      weight: weight || '',
      reasonForConsult: reasonForConsult || '',
      healthGoals: healthGoals || []
    });

    if (profileExists.rows.length === 0) {
      // Create new profile
      await pool.query(
        `INSERT INTO patient_profiles (user_id, phone_number, address, medical_conditions)
         VALUES ($1, $2, $3, $4)`,
        [userId, phone || '', address || '', medicalConditionsData]
      );
    } else {
      // Update existing profile
      await pool.query(
        `UPDATE patient_profiles 
         SET phone_number = COALESCE($1, phone_number),
             address = COALESCE($2, address),
             medical_conditions = COALESCE($3, medical_conditions),
             updated_at = NOW()
         WHERE user_id = $4`,
        [phone, address, medicalConditionsData, userId]
      );
    }

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update patient profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get full patient profile with extended details by email
export const getFullPatientProfile = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Get user with profile
    const userResult = await pool.query(
      `SELECT u.id, u.email, u.first_name, u.last_name,
              pp.phone_number, pp.address, pp.medical_conditions
       FROM users u
       LEFT JOIN patient_profiles pp ON u.id = pp.user_id
       WHERE u.email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];

    // Parse medical_conditions JSON for extended data
    let extendedData = {};
    if (user.medical_conditions) {
      try {
        extendedData = JSON.parse(user.medical_conditions);
      } catch (e) {
        // Not JSON, treat as plain text
        extendedData = { notes: user.medical_conditions };
      }
    }

    res.json({
      success: true,
      profile: {
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email,
        phone: user.phone_number || '',
        address: user.address || '',
        age: extendedData.age || '',
        height: extendedData.height || '',
        weight: extendedData.weight || '',
        reasonForConsult: extendedData.reasonForConsult || '',
        healthGoals: extendedData.healthGoals || []
      }
    });
  } catch (error) {
    console.error('Get full patient profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};