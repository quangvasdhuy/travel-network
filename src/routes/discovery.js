/**
 * Discovery Routes
 * Handles content discovery and recommendations
 */

import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import discoveryService from '../services/discoveryService.js';

const router = express.Router();

/**
 * Get trending destinations
 * 
 * @route GET /api/discovery/trending/destinations
 * @auth Optional
 * @query {number} [limit=10] - Results limit
 * @query {number} [days=30] - Timeframe in days
 * @returns {Object} List of trending destinations
 */
router.get('/trending/destinations', asyncHandler(async (req, res) => {
  const { limit = 10, days = 30 } = req.query;

  const trending = await discoveryService.getTrendingDestinations({
    limit: parseInt(limit),
    days: parseInt(days),
  });

  res.status(200).json({
    success: true,
    data: {
      trending,
      timeframe: `${days} days`,
    },
  });
}));

/**
 * Get popular posts
 * 
 * @route GET /api/discovery/popular/posts
 * @auth Optional
 * @query {number} [limit=20] - Results limit
 * @query {string} [timeframe=7d] - Timeframe (7d, 30d)
 * @returns {Object} List of popular posts
 */
router.get('/popular/posts', asyncHandler(async (req, res) => {
  const { limit = 20, timeframe = '7d' } = req.query;

  const popular = await discoveryService.getPopularPosts({
    limit: parseInt(limit),
    timeframe,
  });

  res.status(200).json({
    success: true,
    data: {
      posts: popular,
      timeframe,
    },
  });
}));

/**
 * Get recommended trips for user
 * 
 * @route GET /api/discovery/recommended/trips
 * @auth Required
 * @query {number} [limit=10] - Results limit
 * @returns {Object} List of recommended trips
 */
router.get('/recommended/trips', authenticate, asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const recommended = await discoveryService.getRecommendedTrips(req.user.id, {
    limit: parseInt(limit),
  });

  res.status(200).json({
    success: true,
    data: {
      trips: recommended,
    },
  });
}));

/**
 * Find nearby travelers
 * 
 * @route GET /api/discovery/nearby-travelers
 * @auth Required
 * @query {number} [limit=10] - Results limit
 * @returns {Object} List of nearby travelers
 */
router.get('/nearby-travelers', authenticate, asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const travelers = await discoveryService.getNearbyTravelers(req.user.id, {
    limit: parseInt(limit),
  });

  res.status(200).json({
    success: true,
    data: {
      travelers,
    },
  });
}));

/**
 * Get personalized recommendations
 * 
 * @route GET /api/discovery/personalized
 * @auth Required
 * @returns {Object} Comprehensive personalized recommendations
 */
router.get('/personalized', authenticate, asyncHandler(async (req, res) => {
  const recommendations = await discoveryService.getPersonalizedRecommendations(req.user.id);

  res.status(200).json({
    success: true,
    data: recommendations,
  });
}));

/**
 * Get activity feed
 * 
 * @route GET /api/discovery/activity
 * @auth Required
 * @query {number} [limit=20] - Results limit
 * @query {number} [offset=0] - Results offset
 * @returns {Object} Activity feed from network
 */
router.get('/activity', authenticate, asyncHandler(async (req, res) => {
  const { limit = 20, offset = 0 } = req.query;

  const activities = await discoveryService.getActivityFeed(req.user.id, {
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  res.status(200).json({
    success: true,
    data: {
      activities,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: activities.length,
      },
    },
  });
}));

/**
 * Get similar destinations
 * 
 * @route GET /api/discovery/similar/destinations/:destinationId
 * @auth Optional
 * @param {string} destinationId - Destination ID
 * @query {number} [limit=5] - Results limit
 * @returns {Object} List of similar destinations
 */
router.get('/similar/destinations/:destinationId', asyncHandler(async (req, res) => {
  const { destinationId } = req.params;
  const { limit = 5 } = req.query;

  const similar = await discoveryService.getSimilarDestinations(destinationId, parseInt(limit));

  res.status(200).json({
    success: true,
    data: {
      destinations: similar,
    },
  });
}));

/**
 * Get explore page data
 * Combines trending and popular content for explore page
 * 
 * @route GET /api/discovery/explore
 * @auth Optional
 * @returns {Object} Explore page data
 */
router.get('/explore', asyncHandler(async (req, res) => {
  const [trending, popular] = await Promise.all([
    discoveryService.getTrendingDestinations({ limit: 6 }),
    discoveryService.getPopularPosts({ limit: 12, timeframe: '7d' }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      trendingDestinations: trending,
      popularPosts: popular,
    },
  });
}));

export default router;
