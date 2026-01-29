import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if session exists in database
    const sessionResult = await pool.query(
      'SELECT admin_id FROM admin_sessions WHERE token = $1 AND expires_at > CURRENT_TIMESTAMP',
      [token]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid or expired session.' });
    }

    // Check if admin is still active
    const adminResult = await pool.query(
      'SELECT id, username, role, is_active FROM admin_users WHERE id = $1 AND is_active = true',
      [decoded.adminId]
    );

    if (adminResult.rows.length === 0) {
      return res.status(401).json({ message: 'Admin account not found or inactive.' });
    }

    req.admin = {
      adminId: decoded.adminId,
      username: decoded.username,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Role-based authorization middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ message: 'Insufficient permissions.' });
    }

    next();
  };
};

export { adminAuth, requireRole };