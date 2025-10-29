import jwt from 'jsonwebtoken';
import { AppError, asyncHandler } from './errorHandler.js';
import config from '../config/env.js';
import { getRedisClient } from '../config/redis.js';
import logger from '../config/logger.js';

// Protect routes - verify JWT token
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return next(new AppError('Not authorized to access this route', 401));
  }

  try {
    // Check if token is blacklisted (in Redis)
    const redisClient = getRedisClient();
    if (redisClient) {
      const isBlacklisted = await redisClient.get(`blacklist:${token}`);
      if (isBlacklisted) {
        return next(new AppError('Token is no longer valid', 401));
      }
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Add user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    return next(new AppError('Not authorized to access this route', 401));
  }
});

// Optional auth - doesn't fail if no token
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.user = {
        id: decoded.id,
        email: decoded.email,
      };
    } catch (error) {
      // Token invalid, but we continue without user
      logger.debug('Optional auth: Invalid token provided');
    }
  }

  next();
});

// Generate JWT token
export const generateToken = (userId, email) => {
  return jwt.sign({ id: userId, email }, config.jwt.secret, {
    expiresIn: config.jwt.expire,
  });
};

// Generate refresh token
export const generateRefreshToken = (userId, email) => {
  return jwt.sign({ id: userId, email }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpire,
  });
};

// Verify refresh token
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret);
  } catch (error) {
    throw new AppError('Invalid refresh token', 401);
  }
};
