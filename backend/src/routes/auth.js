import express from 'express';
import { body } from 'express-validator';
import { 
  sendVerificationCode, 
  verifyCode, 
  completeRegistration,
  login, 
  getProfile, 
  updateProfile,
  patientLoginSendCode,
  patientLoginVerifyCode,
  adminPasswordLogin
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const sendCodeValidation = [
  body('email').isEmail().withMessage('Please provide a valid email')
];

const verifyCodeValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Code must be 6 digits')
];

const completeRegistrationValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Code must be 6 digits'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Public routes - New registration flow
router.post('/send-code', sendCodeValidation, sendVerificationCode);
router.post('/verify-code', verifyCodeValidation, verifyCode);
router.post('/complete-registration', completeRegistrationValidation, completeRegistration);

// Public routes - Patient Login (with verification code)
router.post('/patient-login/send-code', sendCodeValidation, patientLoginSendCode);
router.post('/patient-login/verify-code', verifyCodeValidation, patientLoginVerifyCode);

// Public routes - Admin Login (with password)
router.post('/admin-login', loginValidation, adminPasswordLogin);

// Public routes - Login
router.post('/login', loginValidation, login);

// Protected routes (require authentication)
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);

export default router;
