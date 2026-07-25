/**
 * Destination Routes
 * Handles destination browsing and management
 */

import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import Joi from 'joi';
import destinationService from '../services/destinationService.js';

const router = express.Router();

// Validation schemas for destinations
const destinationSchemas = {
  create: {
    body: Joi.object({
      name: Joi.string().min(2).max(100).required(),
      country: Joi.string().min(2).max(100).required(),
      countryCode: Joi.string().length(2).uppercase().required(),
      region: Joi.string().max(100).optional(),
      coordinates: Joi.object({
        lat: Joi.number().min(-90).max(90).required(),
        lon: Joi.number().min(-180).max(180).required(),
      }).required(),
      description: Joi.string().max(5000).optional(),
      summary: Joi.string().max(500).optional(),
      images: Joi.array().items(
        Joi.object({
          url: Joi.string().uri().required(),
          caption: Joi.string().max(200).optional(),
          credit: Joi.string().max(100).optional(),
        })
      ).optional(),
      categories: Joi.array().items(Joi.string()).optional(),
      tags: Joi.array().items(Joi.string()).optional(),
      climate: Joi.object({
        type: Joi.string().optional(),
        bestMonths: Joi.array().items(Joi.number().min(1).max(12)).optional(),
      }).optional(),
      travelInfo: Joi.object({
        currency: Joi.string().max(10).optional(),
        languages: Joi.array().items(Joi.string()).optional(),
        timezone: Joi.string().optional(),
        visaRequired: Joi.boolean().optional(),
      }).optional(),
    }),
  },

  update: {
    body: Joi.object({
      name: Joi.string().min(2).max(100).optional(),
      description: Joi.string().max(5000).optional(),
      summary: Joi.string().max(500).optional(),
      images: Joi.array().optional(),
      categories: Joi.array().items(Joi.string()).optional(),
      tags: Joi.array().items(Joi.string()).optional(),
      climate: Joi.object().optional(),
      travelInfo: Joi.object().optional(),
    }).min(1),
  },

  listQuery: {
    query: Joi.object({
      country: Joi.string().optional(),
      category: Joi.string().optional(),
      tag: Joi.string().optional(),
      limit: Joi.number().integer().min(1).max(100).default(50),
      offset: Joi.number().integer().min(0).default(0),
      sortBy: Joi.string().valid('name', 'popularity', 'rating').default('name'),
      order: Joi.string().valid('asc', 'desc').default('asc'),
    }),
  },

  searchQuery: {
    query: Joi.object({
      q: Joi.string().allow('').default(''),
      limit: Joi.number().integer().min(1).max(100).default(20),
    }),
  },
};

/**
 * Get all destinations with optional filters
 * 
 * @route GET /api/destinations
 * @query {string} [country] - Filter by country
 * @query {string} [category] - Filter by category
 * @query {string} [tag] - Filter by tag
 * @query {number} [limit=50] - Results limit
 * @query {number} [offset=0] - Results offset
 * @query {string} [sortBy=name] - Sort by (name, popularity, rating)
 * @query {string} [order=asc] - Sort order (asc, desc)
 * @returns {Object} List of destinations
 */
router.get('/', validate(destinationSchemas.listQuery), asyncHandler(async (req, res) => {
  const filters = req.query;

  const destinations = await destinationService.getAllDestinations(filters);

  res.status(200).json({
    success: true,
    data: {
      destinations,
      pagination: {
        limit: parseInt(filters.limit),
        offset: parseInt(filters.offset),
        count: destinations.length,
      },
      filters: {
        country: filters.country,
        category: filters.category,
        tag: filters.tag,
      },
    },
  });
}));

/**
 * Get popular destinations
 * 
 * @route GET /api/destinations/popular
 * @query {number} [limit=20] - Number of destinations
 * @returns {Object} List of popular destinations
 */
router.get('/popular', asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;

  const destinations = await destinationService.getPopularDestinations(parseInt(limit));

  res.status(200).json({
    success: true,
    data: { destinations },
  });
}));

/**
 * Search destinations
 * 
 * @route GET /api/destinations/search
 * @query {string} q - Search query (min 2 characters)
 * @query {number} [limit=20] - Results limit
 * @returns {Object} List of matching destinations
 */
router.get('/search', validate(destinationSchemas.searchQuery), asyncHandler(async (req, res) => {
  const { q: query, limit = 20 } = req.query;

  const destinations = await destinationService.searchDestinations(query, {
    limit: parseInt(limit),
  });

  res.status(200).json({
    success: true,
    data: {
      destinations,
      query,
      count: destinations.length,
    },
  });
}));

/**
 * Create new destination (admin only for now)
 * 
 * @route POST /api/destinations
 * @auth Required
 * @body {Object} Destination data
 * @returns {Object} Created destination
 */
router.post('/', authenticate, validate(destinationSchemas.create), asyncHandler(async (req, res) => {
  // TODO: Add admin role check in production
  const destinationData = req.body;

  const destination = await destinationService.createDestination(destinationData);

  res.status(201).json({
    success: true,
    data: { destination },
    message: 'Destination created successfully',
  });
}));

/**
 * Get destination by country code and slug
 * 
 * @route GET /api/destinations/:countryCode/:slug
 * @param {string} countryCode - Country code (e.g., FR, US)
 * @param {string} slug - Destination slug (e.g., paris, new-york)
 * @returns {Object} Destination details
 */
router.get('/:countryCode/:slug', asyncHandler(async (req, res) => {
  const { countryCode, slug } = req.params;

  const destination = await destinationService.getDestinationBySlug(
    countryCode.toUpperCase(),
    slug.toLowerCase()
  );

  // Increment view count
  try {
    const key = `destination::${countryCode.toUpperCase()}::${slug.toLowerCase()}`;
    await destinationService.updateDestinationStats(key, { viewCount: 1 });
  } catch (error) {
    // Don't fail the request if view count update fails
    console.error('Failed to update view count:', error);
  }

  res.status(200).json({
    success: true,
    data: { destination },
  });
}));

/**
 * Update destination
 * 
 * @route PATCH /api/destinations/:countryCode/:slug
 * @auth Required
 * @param {string} countryCode - Country code
 * @param {string} slug - Destination slug
 * @body {Object} Fields to update
 * @returns {Object} Updated destination
 */
router.patch('/:countryCode/:slug', authenticate, validate(destinationSchemas.update), asyncHandler(async (req, res) => {
  // TODO: Add admin role check in production
  const { countryCode, slug } = req.params;
  const updates = req.body;

  const destination = await destinationService.updateDestination(
    countryCode.toUpperCase(),
    slug.toLowerCase(),
    updates
  );

  res.status(200).json({
    success: true,
    data: { destination },
    message: 'Destination updated successfully',
  });
}));

/**
 * Delete destination
 * 
 * @route DELETE /api/destinations/:countryCode/:slug
 * @auth Required
 * @param {string} countryCode - Country code
 * @param {string} slug - Destination slug
 * @returns {Object} Success message
 */
router.delete('/:countryCode/:slug', authenticate, asyncHandler(async (req, res) => {
  // TODO: Add admin role check in production
  const { countryCode, slug } = req.params;

  await destinationService.deleteDestination(
    countryCode.toUpperCase(),
    slug.toLowerCase()
  );

  res.status(200).json({
    success: true,
    message: 'Destination deleted successfully',
  });
}));

/**
 * Get destinations by country
 * 
 * @route GET /api/destinations/country/:country
 * @param {string} country - Country name
 * @query {number} [limit=50] - Results limit
 * @query {number} [offset=0] - Results offset
 * @returns {Object} List of destinations in country
 */
router.get('/country/:country', asyncHandler(async (req, res) => {
  const { country } = req.params;
  const { limit = 50, offset = 0 } = req.query;

  const destinations = await destinationService.getDestinationsByCountry(country, {
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  res.status(200).json({
    success: true,
    data: {
      destinations,
      country,
      count: destinations.length,
    },
  });
}));

/**
 * Get destinations by category
 * 
 * @route GET /api/destinations/category/:category
 * @param {string} category - Category (beach, city, mountains, cultural, etc.)
 * @query {number} [limit=50] - Results limit
 * @query {number} [offset=0] - Results offset
 * @returns {Object} List of destinations in category
 */
router.get('/category/:category', asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { limit = 50, offset = 0 } = req.query;

  const destinations = await destinationService.getDestinationsByCategory(category, {
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  res.status(200).json({
    success: true,
    data: {
      destinations,
      category,
      count: destinations.length,
    },
  });
}));

export default router;
