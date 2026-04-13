import express from 'express';
import { body } from 'express-validator';
import { adminLogin, getAdminProfile, updateAdminAccount, adminLogout, getDashboardStats } from '../controllers/adminAuthController.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// Admin login
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], adminLogin);

// Get admin profile (protected)
router.get('/profile', adminAuth, getAdminProfile);

// Update admin account email/password (protected)
router.put('/account', adminAuth, [
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Please provide a valid email'),
  body('newPassword').optional({ checkFalsy: true }).isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], updateAdminAccount);

// Admin logout (protected)
router.post('/logout', adminAuth, adminLogout);

// Get dashboard stats (protected)
router.get('/dashboard/stats', adminAuth, getDashboardStats);

export default router;