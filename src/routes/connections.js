/**
 * Connection Routes
 * Handles social connections (follow/unfollow)
 */

import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import connectionService from '../services/connectionService.js';
import userService from '../services/userService.js';

const router = express.Router();

/**
 * Follow a user
 * 
 * @route POST /api/connections/follow/:userId
 * @auth Required
 * @param {string} userId - User ID to follow
 * @returns {Object} Connection created
 */
router.post('/follow/:userId', authenticate, asyncHandler(async (req, res) => {
  const { userId: followingId } = req.params;

  // Get usernames for denormalization
  const [follower, following] = await Promise.all([
    userService.getUserProfile(req.user.id, false),
    userService.getUserProfile(followingId, false),
  ]);

  const connection = await connectionService.followUser(
    req.user.id,
    followingId,
    req.user.username,
    following.username
  );

  res.status(201).json({
    success: true,
    data: { connection },
    message: `You are now following ${following.username}`,
  });
}));

/**
 * Unfollow a user
 * 
 * @route DELETE /api/connections/follow/:userId
 * @auth Required
 * @param {string} userId - User ID to unfollow
 * @returns {Object} Success message
 */
router.delete('/follow/:userId', authenticate, asyncHandler(async (req, res) => {
  const { userId: followingId } = req.params;

  await connectionService.unfollowUser(req.user.id, followingId);

  res.status(200).json({
    success: true,
    message: 'Successfully unfollowed user',
  });
}));

/**
 * Get user's followers
 * 
 * @route GET /api/connections/followers/:userId
 * @auth Optional
 * @param {string} userId - User ID
 * @query {number} [limit=20] - Results limit
 * @query {number} [offset=0] - Results offset
 * @returns {Object} List of followers
 */
router.get('/followers/:userId', optionalAuth, asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { limit = 20, offset = 0 } = req.query;

  const followers = await connectionService.getFollowers(userId, {
    limit: parseInt(limit),
    offset: parseInt(offset),
    currentUserId: req.user?.id || null,
  });

  res.status(200).json({
    success: true,
    data: {
      followers,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: followers.length,
      },
    },
  });
}));

/**
 * Get users that a user is following
 * 
 * @route GET /api/connections/following/:userId
 * @auth Optional
 * @param {string} userId - User ID
 * @query {number} [limit=20] - Results limit
 * @query {number} [offset=0] - Results offset
 * @returns {Object} List of users being followed
 */
router.get('/following/:userId', optionalAuth, asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { limit = 20, offset = 0 } = req.query;

  const following = await connectionService.getFollowing(userId, {
    limit: parseInt(limit),
    offset: parseInt(offset),
    currentUserId: req.user?.id || null,
  });

  res.status(200).json({
    success: true,
    data: {
      following,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: following.length,
      },
    },
  });
}));

/**
 * Get connection status with another user
 * 
 * @route GET /api/connections/status/:userId
 * @auth Required
 * @param {string} userId - Target user ID
 * @returns {Object} Connection status
 */
router.get('/status/:userId', authenticate, asyncHandler(async (req, res) => {
  const { userId: targetUserId } = req.params;

  const status = await connectionService.getConnectionStatus(req.user.id, targetUserId);

  res.status(200).json({
    success: true,
    data: { status },
  });
}));

/**
 * Get suggested connections
 * 
 * @route GET /api/connections/suggestions
 * @auth Required
 * @query {number} [limit=10] - Number of suggestions
 * @returns {Object} List of suggested users
 */
router.get('/suggestions', authenticate, asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const suggestions = await connectionService.getSuggestedConnections(
    req.user.id,
    parseInt(limit)
  );

  res.status(200).json({
    success: true,
    data: { suggestions },
  });
}));

/**
 * Get mutual connections with another user
 * 
 * @route GET /api/connections/mutual/:userId
 * @auth Required
 * @param {string} userId - Other user ID
 * @returns {Object} List of mutual connections
 */
router.get('/mutual/:userId', authenticate, asyncHandler(async (req, res) => {
  const { userId: otherUserId } = req.params;

  const mutualConnections = await connectionService.getMutualConnections(
    req.user.id,
    otherUserId
  );

  res.status(200).json({
    success: true,
    data: {
      mutualConnections,
      count: mutualConnections.length,
    },
  });
}));

/**
 * Get current user's followers
 * 
 * @route GET /api/connections/my-followers
 * @auth Required
 * @query {number} [limit=20] - Results limit
 * @query {number} [offset=0] - Results offset
 * @returns {Object} List of current user's followers
 */
router.get('/my-followers', authenticate, asyncHandler(async (req, res) => {
  const { limit = 20, offset = 0 } = req.query;

  const followers = await connectionService.getFollowers(req.user.id, {
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  res.status(200).json({
    success: true,
    data: {
      followers,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: followers.length,
      },
    },
  });
}));

/**
 * Get users current user is following
 * 
 * @route GET /api/connections/my-following
 * @auth Required
 * @query {number} [limit=20] - Results limit
 * @query {number} [offset=0] - Results offset
 * @returns {Object} List of users current user is following
 */
router.get('/my-following', authenticate, asyncHandler(async (req, res) => {
  const { limit = 20, offset = 0 } = req.query;

  const following = await connectionService.getFollowing(req.user.id, {
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  res.status(200).json({
    success: true,
    data: {
      following,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: following.length,
      },
    },
  });
}));

export default router;
