import express from 'express';
import { body } from 'express-validator';
import { adminLogin, getAdminProfile, adminLogout, getDashboardStats } from '../controllers/adminAuthController.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// Admin login
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], adminLogin);

// Get admin profile (protected)
router.get('/profile', adminAuth, getAdminProfile);

// Admin logout (protected)
router.post('/logout', adminAuth, adminLogout);

// Get dashboard stats (protected)
router.get('/dashboard/stats', adminAuth, getDashboardStats);

export default router;