/**
 * Trip Routes
 * Handles trip planning and management
 */

import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import Joi from 'joi';
import tripService from '../services/tripService.js';

const router = express.Router();

// Validation schemas for trips
const tripSchemas = {
  create: {
    body: Joi.object({
      title: Joi.string().min(3).max(100).required(),
      description: Joi.string().max(2000).optional(),
      destinations: Joi.array().items(
        Joi.object({
          destinationId: Joi.string().required(),
          name: Joi.string().required(),
          country: Joi.string().optional(),
          arrivalDate: Joi.date().iso().optional(),
          departureDate: Joi.date().iso().optional(),
        })
      ).min(1).required(),
      startDate: Joi.date().iso().required(),
      endDate: Joi.date().iso().required(),
      status: Joi.string().valid('planning', 'active', 'completed', 'cancelled').default('planning'),
      visibility: Joi.string().valid('public', 'connections', 'private').default('public'),
      itinerary: Joi.array().items(
        Joi.object({
          day: Joi.number().integer().min(1).required(),
          date: Joi.date().iso().required(),
          activities: Joi.array().items(Joi.object()).optional(),
          notes: Joi.string().max(500).optional(),
        })
      ).optional(),
      budget: Joi.object({
        total: Joi.number().min(0).optional(),
        currency: Joi.string().length(3).uppercase().default('USD'),
        breakdown: Joi.object().optional(),
      }).optional(),
      participants: Joi.array().optional(),
      tags: Joi.array().items(Joi.string()).optional(),
    }),
  },

  update: {
    body: Joi.object({
      title: Joi.string().min(3).max(100).optional(),
      description: Joi.string().max(2000).optional(),
      destinations: Joi.array().items(Joi.object()).optional(),
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().optional(),
      status: Joi.string().valid('planning', 'active', 'completed', 'cancelled').optional(),
      visibility: Joi.string().valid('public', 'connections', 'private').optional(),
      itinerary: Joi.array().optional(),
      budget: Joi.object().optional(),
      participants: Joi.array().optional(),
      tags: Joi.array().items(Joi.string()).optional(),
    }).min(1),
  },

  updateStatus: {
    body: Joi.object({
      status: Joi.string().valid('planning', 'active', 'completed', 'cancelled').required(),
    }),
  },

  listQuery: {
    query: Joi.object({
      status: Joi.string().valid('planning', 'active', 'completed', 'cancelled').optional(),
      limit: Joi.number().integer().min(1).max(100).default(20),
      offset: Joi.number().integer().min(0).default(0),
    }),
  },
};

/**
 * Create new trip
 * 
 * @route POST /api/trips
 * @auth Required
 * @body {Object} Trip data
 * @returns {Object} Created trip
 */
router.post('/', authenticate, validate(tripSchemas.create), asyncHandler(async (req, res) => {
  const tripData = req.body;

  const trip = await tripService.createTrip(req.user.id, tripData);

  res.status(201).json({
    success: true,
    data: { trip },
    message: 'Trip created successfully',
  });
}));

/**
 * Get current user's trips
 * 
 * @route GET /api/trips/my-trips
 * @auth Required
 * @query {string} [status] - Filter by status
 * @query {number} [limit=20] - Results limit
 * @query {number} [offset=0] - Results offset
 * @returns {Object} List of user's trips
 */
router.get('/my-trips', authenticate, validate(tripSchemas.listQuery), asyncHandler(async (req, res) => {
  const { status, limit, offset } = req.query;

  const trips = await tripService.getUserTrips(req.user.id, {
    status,
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  res.status(200).json({
    success: true,
    data: {
      trips,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: trips.length,
      },
      filters: { status },
    },
  });
}));

/**
 * Get upcoming trips (public discovery)
 * 
 * @route GET /api/trips/upcoming
 * @auth Optional
 * @query {number} [limit=50] - Results limit
 * @returns {Object} List of upcoming trips
 */
router.get('/upcoming', asyncHandler(async (req, res) => {
  const { limit = 50 } = req.query;

  const trips = await tripService.getUpcomingTrips({
    limit: parseInt(limit),
  });

  res.status(200).json({
    success: true,
    data: { trips },
  });
}));

/**
 * Get trip by ID
 * 
 * @route GET /api/trips/:id
 * @auth Optional (required for private trips)
 * @param {string} id - Trip ID
 * @returns {Object} Trip details
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Get requesting user ID if authenticated
  const requestingUserId = req.user?.id || null;

  const trip = await tripService.getTripById(id, requestingUserId);

  res.status(200).json({
    success: true,
    data: { trip },
  });
}));

/**
 * Update trip
 * 
 * @route PATCH /api/trips/:id
 * @auth Required (must be trip owner)
 * @param {string} id - Trip ID
 * @body {Object} Fields to update
 * @returns {Object} Updated trip
 */
router.patch('/:id', authenticate, validate(tripSchemas.update), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const trip = await tripService.updateTrip(id, req.user.id, updates);

  res.status(200).json({
    success: true,
    data: { trip },
    message: 'Trip updated successfully',
  });
}));

/**
 * Delete trip
 * 
 * @route DELETE /api/trips/:id
 * @auth Required (must be trip owner)
 * @param {string} id - Trip ID
 * @returns {Object} Success message
 */
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;

  await tripService.deleteTrip(id, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Trip deleted successfully',
  });
}));

/**
 * Update trip status
 * 
 * @route PATCH /api/trips/:id/status
 * @auth Required (must be trip owner)
 * @param {string} id - Trip ID
 * @body {string} status - New status
 * @returns {Object} Updated trip
 */
router.patch('/:id/status', authenticate, validate(tripSchemas.updateStatus), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const trip = await tripService.updateTripStatus(id, req.user.id, status);

  res.status(200).json({
    success: true,
    data: { trip },
    message: `Trip status updated to ${status}`,
  });
}));

/**
 * Get trips by user ID
 * 
 * @route GET /api/trips/user/:userId
 * @auth Optional
 * @param {string} userId - User ID
 * @query {number} [limit=20] - Results limit
 * @query {number} [offset=0] - Results offset
 * @returns {Object} List of user's public trips
 */
router.get('/user/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { limit = 20, offset = 0 } = req.query;

  const trips = await tripService.getUserTrips(userId, {
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  // Filter to only show public trips (or connections if social features are implemented)
  const publicTrips = trips.filter(trip => trip.visibility === 'public');

  res.status(200).json({
    success: true,
    data: {
      trips: publicTrips,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: publicTrips.length,
      },
    },
  });
}));

/**
 * Get trips by destination
 * 
 * @route GET /api/trips/destination/:destinationId
 * @auth Optional
 * @param {string} destinationId - Destination ID
 * @query {number} [limit=20] - Results limit
 * @query {number} [offset=0] - Results offset
 * @returns {Object} List of trips to destination
 */
router.get('/destination/:destinationId', asyncHandler(async (req, res) => {
  const { destinationId } = req.params;
  const { limit = 20, offset = 0 } = req.query;

  const trips = await tripService.getTripsByDestination(destinationId, {
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  res.status(200).json({
    success: true,
    data: {
      trips,
      destinationId,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: trips.length,
      },
    },
  });
}));

export default router;
