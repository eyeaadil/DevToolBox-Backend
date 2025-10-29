import express from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
  getCurrentUser,
  updateProfile,
  changePassword,
} from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validator.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../validators/auth.validator.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Public routes
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', validate(refreshTokenSchema), refreshToken);

// Protected routes
router.post('/logout', protect, logout);
router.post('/logout-all', protect, logoutAll);
router.get('/me', protect, getCurrentUser);
router.put('/profile', protect, validate(updateProfileSchema), updateProfile);
router.put(
  '/change-password',
  protect,
  validate(changePasswordSchema),
  changePassword
);

export default router;
