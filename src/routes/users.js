/**
 * User Routes
 * Handles user profile operations
 */

import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import { uploadProfilePhoto } from '../config/cloudinary.js';
import userService from '../services/userService.js';

const router = express.Router();

/**
 * Get current user's profile
 * 
 * @route GET /api/users/me
 * @auth Required
 * @returns {Object} User profile with full details
 */
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const profile = await userService.getUserProfile(req.user.id, true);

  res.status(200).json({
    success: true,
    data: { user: profile },
  });
}));

/**
 * Update current user's profile
 * 
 * @route PATCH /api/users/me
 * @auth Required
 * @body {Object} Profile updates
 * @returns {Object} Updated user profile
 */
router.patch('/me', authenticate, asyncHandler(async (req, res) => {
  const updates = req.body;

  const updatedProfile = await userService.updateUserProfile(req.user.id, updates);

  res.status(200).json({
    success: true,
    data: { user: updatedProfile },
    message: 'Profile updated successfully',
  });
}));

/**
 * Upload profile photo
 * 
 * @route POST /api/users/me/photo
 * @auth Required
 * @body {File} photo - Image file
 * @returns {Object} Updated user profile
 */
router.post('/me/photo', authenticate, uploadProfilePhoto.single('photo'), asyncHandler(async (req, res) => {
  if (!req.file) {
    throw {
      statusCode: 400,
      message: 'No photo file uploaded',
    };
  }

  // Cloudinary trả về full URL trong req.file.path
  const photoUrl = req.file.path;

  const updatedProfile = await userService.updateProfilePhoto(req.user.id, photoUrl);

  res.status(200).json({
    success: true,
    data: {
      user: updatedProfile,
      photoUrl,
    },
    message: 'Profile photo updated successfully',
  });
}));

/**
 * Delete current user's account
 * 
 * @route DELETE /api/users/me
 * @auth Required
 * @returns {Object} Success message
 */
router.delete('/me', authenticate, asyncHandler(async (req, res) => {
  await userService.deleteUserAccount(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully',
  });
}));

/**
 * Get user profile by username
 * 
 * @route GET /api/users/username/:username
 * @auth Optional
 * @returns {Object} Public user profile
 */
router.get('/username/:username', asyncHandler(async (req, res) => {
  const { username } = req.params;

  const profile = await userService.getUserByUsername(username);

  res.status(200).json({
    success: true,
    data: { user: profile },
  });
}));

/**
 * Search users
 * 
 * @route GET /api/users/search
 * @query {string} q - Search query
 * @query {number} [limit=20] - Results limit
 * @query {number} [offset=0] - Results offset
 * @returns {Object} List of users
 */
router.get('/search', asyncHandler(async (req, res) => {
  const { q: query, limit = 20, offset = 0 } = req.query;

  if (!query || query.trim().length < 2) {
    throw {
      statusCode: 400,
      message: 'Search query must be at least 2 characters',
    };
  }

  const users = await userService.searchUsers(query, {
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: users.length,
      },
    },
  });
}));

/**
 * Get user statistics
 * 
 * @route GET /api/users/:id/stats
 * @auth Optional
 * @returns {Object} User statistics
 */
router.get('/:id/stats', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const stats = await userService.getUserStats(id);

  res.status(200).json({
    success: true,
    data: stats,
  });
}));

/**
 * Get user profile by ID
 * 
 * @route GET /api/users/:id
 * @auth Optional
 * @returns {Object} Public user profile
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const profile = await userService.getUserProfile(id, false);

  res.status(200).json({
    success: true,
    data: { user: profile },
  });
}));

export default router;
