import { asyncHandler, AppError } from '../middlewares/errorHandler.js';
import { User } from '../models/index.js';
import { successResponse } from '../utils/response.js';
import {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../middlewares/auth.js';
import { getRedisClient } from '../config/redis.js';
import logger from '../config/logger.js';

// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    throw new AppError('User with this email already exists', 400);
  }

  // Create new user
  const user = await User.create({
    email,
    password,
    name,
  });

  // Generate tokens
  const accessToken = generateToken(user._id, user.email);
  const refreshToken = generateRefreshToken(user._id, user.email);

  // Store refresh token
  await user.addRefreshToken(refreshToken);

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  successResponse(
    res,
    {
      user: user.getPublicProfile(),
      accessToken,
      refreshToken,
    },
    'User registered successfully',
    201
  );
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user with password field
  const user = await User.findByEmail(email).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate tokens
  const accessToken = generateToken(user._id, user.email);
  const refreshToken = generateRefreshToken(user._id, user.email);

  // Store refresh token
  await user.addRefreshToken(refreshToken);

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  successResponse(res, {
    user: user.getPublicProfile(),
    accessToken,
    refreshToken,
  }, 'Login successful');
});

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh
// @access  Public
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400);
  }

  // Verify refresh token
  const decoded = verifyRefreshToken(refreshToken);

  // Find user
  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Check if refresh token exists in user's tokens
  const tokenExists = user.refreshTokens.some((rt) => rt.token === refreshToken);
  if (!tokenExists) {
    throw new AppError('Invalid refresh token', 401);
  }

  // Generate new access token
  const accessToken = generateToken(user._id, user.email);

  successResponse(res, { accessToken }, 'Token refreshed successfully');
});

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const userId = req.user.id;

  // Find user
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Remove refresh token
  if (refreshToken) {
    await user.removeRefreshToken(refreshToken);
  }

  // Blacklist access token (if Redis is available)
  const accessToken = req.headers.authorization?.split(' ')[1];
  if (accessToken) {
    const redisClient = getRedisClient();
    if (redisClient) {
      try {
        await redisClient.setEx(`blacklist:${accessToken}`, 900, 'true'); // 15 min
      } catch (error) {
        logger.error(`Failed to blacklist token: ${error.message}`);
      }
    }
  }

  successResponse(res, { message: 'Logged out successfully' }, 'Logged out successfully');
});

// @desc    Logout from all devices
// @route   POST /api/v1/auth/logout-all
// @access  Private
export const logoutAll = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Find user
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Clear all refresh tokens
  user.refreshTokens = [];
  await user.save();

  // Blacklist current access token
  const accessToken = req.headers.authorization?.split(' ')[1];
  if (accessToken) {
    const redisClient = getRedisClient();
    if (redisClient) {
      try {
        await redisClient.setEx(`blacklist:${accessToken}`, 900, 'true');
      } catch (error) {
        logger.error(`Failed to blacklist token: ${error.message}`);
      }
    }
  }

  successResponse(res, { message: 'Logged out from all devices' }, 'Logged out from all devices');
});

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
export const getCurrentUser = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  successResponse(res, { user: user.getPublicProfile() }, 'User retrieved successfully');
});

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const updates = req.body;

  // Only allow certain fields to be updated
  const allowedUpdates = ['name', 'avatar'];
  const filteredUpdates = {};

  Object.keys(updates).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      filteredUpdates[key] = updates[key];
    }
  });

  const user = await User.findByIdAndUpdate(userId, filteredUpdates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  successResponse(res, { user: user.getPublicProfile() }, 'Profile updated successfully');
});

// @desc    Change password
// @route   PUT /api/v1/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  // Find user with password
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Verify current password
  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    throw new AppError('Current password is incorrect', 401);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Clear all refresh tokens (logout from all devices for security)
  user.refreshTokens = [];
  await user.save();

  successResponse(res, { message: 'Password changed successfully. Please login again.' }, 'Password changed successfully');
});
