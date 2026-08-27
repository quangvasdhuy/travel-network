/**
 * Authentication Routes
 * Handles user registration, login, and token refresh
 */

import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import authService from '../services/authService.js';

const router = express.Router();

/**
 * Register a new user
 * 
 * @route POST /api/auth/register
 * @body {string} email - User email
 * @body {string} username - Username (3-30 characters)
 * @body {string} password - Password (min 8 characters)
 * @body {string} [firstName] - First name
 * @body {string} [lastName] - Last name
 * @returns {Object} User object and authentication tokens
 */
router.post('/register', validate(schemas.register), asyncHandler(async (req, res) => {
  const { email, username, password, firstName, lastName } = req.body;

  const result = await authService.registerUser({
    email,
    username,
    password,
    firstName,
    lastName,
  });

  res.status(201).json({
    success: true,
    data: result,
    message: 'Đăng ký thành công',
  });
}));

/**
 * Login user
 * 
 * @route POST /api/auth/login
 * @body {string} emailOrUsername - Email or username
 * @body {string} password - Password
 * @returns {Object} User object and authentication tokens
 */
router.post('/login', validate(schemas.login), asyncHandler(async (req, res) => {
  const { emailOrUsername, password } = req.body;

  const result = await authService.loginUser({
    emailOrUsername,
    password,
  });

  res.status(200).json({
    success: true,
    data: result,
    message: 'Đăng nhập thành công',
  });
}));

/**
 * Refresh access token
 * 
 * @route POST /api/auth/refresh
 * @body {string} refreshToken - Refresh token
 * @returns {Object} New access and refresh tokens
 */
router.post('/refresh', validate(schemas.refreshToken), asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  const result = await authService.refreshAccessToken(refreshToken);

  res.status(200).json({
    success: true,
    data: result,
    message: 'Làm mới token thành công',
  });
}));

/**
 * Get current user
 * 
 * @route GET /api/auth/me
 * @auth Required
 * @returns {Object} Current user information
 */
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
}));

/**
 * Logout user
 * Note: With JWT, logout is handled client-side by removing the token
 * This endpoint is provided for consistency and future session management
 * 
 * @route POST /api/auth/logout
 * @auth Required
 * @returns {Object} Success message
 */
router.post('/logout', authenticate, asyncHandler(async (req, res) => {
  // In a stateless JWT setup, logout is handled client-side
  // This endpoint can be used for logging or future session invalidation
  
  res.status(200).json({
    success: true,
    message: 'Đăng xuất thành công',
  });
}));

/**
 * Verify email
 * 
 * @route POST /api/auth/verify-email
 * @body {string} token - Verification token
 * @returns {Object} Success message
 */
router.post('/verify-email', validate(schemas.verifyEmail), asyncHandler(async (req, res) => {
  const { token } = req.body;

  await authService.verifyEmail(token);

  res.status(200).json({
    success: true,
    message: 'Xác thực email thành công',
  });
}));

/**
 * Test protected route
 * 
 * @route GET /api/auth/test-protected
 * @auth Required
 * @returns {Object} Test message
 */
router.get('/test-protected', authenticate, asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'This is a protected route',
      user: req.user,
    },
  });
}));

export default router;
