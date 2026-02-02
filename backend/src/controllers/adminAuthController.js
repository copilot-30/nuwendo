import pool from '../config/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Helper function to create audit log
const createAuditLog = async (adminId, action, tableName = null, recordId = null, oldValues = null, newValues = null) => {
  try {
    await pool.query(
      `INSERT INTO admin_audit_log (admin_id, action, table_name, record_id, old_values, new_values)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [adminId, action, tableName, recordId, oldValues ? JSON.stringify(oldValues) : null, newValues ? JSON.stringify(newValues) : null]
    );
  } catch (error) {
    console.error('Create audit log error:', error);
  }
};

// Admin login
const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Get admin user
    const result = await pool.query(
      'SELECT id, username, email, password_hash, full_name, role, is_active FROM admin_users WHERE username = $1 AND is_active = true',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const admin = result.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    await pool.query(
      'UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [admin.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        adminId: admin.id, 
        username: admin.username, 
        role: admin.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Store session in database
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours
    await pool.query(
      'INSERT INTO admin_sessions (admin_id, token, expires_at) VALUES ($1, $2, $3)',
      [admin.id, token, expiresAt]
    );

    // Log the login
    await createAuditLog(admin.id, 'Admin login', 'admin_sessions', null, null, { username: admin.username, email: admin.email });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          full_name: admin.full_name,
          role: admin.role
        }
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get admin profile
const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.admin.adminId;

    const result = await pool.query(
      'SELECT id, username, email, full_name, role, last_login FROM admin_users WHERE id = $1',
      [adminId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({
      success: true,
      admin: result.rows[0]
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin logout
const adminLogout = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const adminId = req.admin?.adminId;
    
    if (token) {
      // Remove session from database
      await pool.query('DELETE FROM admin_sessions WHERE token = $1', [token]);
    }

    // Log the logout
    if (adminId) {
      await createAuditLog(adminId, 'Admin logout', 'admin_sessions', null, null, null);
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // Total bookings
    const totalBookingsResult = await pool.query(
      'SELECT COUNT(*) as total FROM bookings'
    );

    // Today's appointments
    const todayAppointmentsResult = await pool.query(
      'SELECT COUNT(*) as today FROM bookings WHERE booking_date = $1',
      [today]
    );

    // This week's appointments
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setDate(thisWeekStart.getDate() + 6);

    const thisWeekResult = await pool.query(
      'SELECT COUNT(*) as week FROM bookings WHERE booking_date BETWEEN $1 AND $2',
      [thisWeekStart.toISOString().split('T')[0], thisWeekEnd.toISOString().split('T')[0]]
    );

    // Revenue this month
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    
    const revenueResult = await pool.query(
      'SELECT COALESCE(SUM(amount_paid), 0) as revenue FROM bookings WHERE booking_date >= $1 AND payment_status = $2',
      [thisMonthStart.toISOString().split('T')[0], 'paid']
    );

    // Pending payments
    const pendingPaymentsResult = await pool.query(
      `SELECT b.id, b.booking_date, b.booking_time, b.status, b.amount_paid, b.payment_status, b.phone_number,
              u.first_name, u.last_name, u.email,
              s.name as service_name
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN services s ON b.service_id = s.id
       WHERE b.payment_status = 'pending' AND b.status != 'cancelled'
       ORDER BY b.booking_date ASC, b.booking_time ASC
       LIMIT 10`
    );

    // Calculate total pending amount
    const pendingAmountResult = await pool.query(
      `SELECT COALESCE(SUM(amount_paid), 0) as total FROM bookings 
       WHERE payment_status = 'pending' AND status != 'cancelled'`
    );

    // Recent bookings
    const recentBookingsResult = await pool.query(
      `SELECT b.id, b.booking_date, b.booking_time, b.status, b.amount_paid, b.payment_status,
              u.first_name, u.last_name, u.email,
              s.name as service_name
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN services s ON b.service_id = s.id
       ORDER BY b.created_at DESC
       LIMIT 10`
    );

    res.json({
      success: true,
      stats: {
        totalBookings: parseInt(totalBookingsResult.rows[0].total),
        todayAppointments: parseInt(todayAppointmentsResult.rows[0].today),
        thisWeekAppointments: parseInt(thisWeekResult.rows[0].week),
        monthlyRevenue: parseFloat(revenueResult.rows[0].revenue),
        pendingPayments: pendingPaymentsResult.rows,
        pendingPaymentsTotal: parseFloat(pendingAmountResult.rows[0].total),
        recentBookings: recentBookingsResult.rows
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export {
  adminLogin,
  getAdminProfile,
  adminLogout,
  getDashboardStats
};