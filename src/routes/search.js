/**
 * Search Routes
 * Handles unified search and autocomplete
 */

import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { optionalAuth } from '../middleware/auth.js';
import Joi from 'joi';
import { validate } from '../middleware/validation.js';
import searchService from '../services/searchService.js';

const router = express.Router();

// Validation schemas
const searchSchemas = {
  unified: {
    query: Joi.object({
      q: Joi.string().min(2).required(),
      types: Joi.string().optional(), // Comma-separated: users,destinations,posts
      limit: Joi.number().integer().min(1).max(50).default(10),
      offset: Joi.number().integer().min(0).default(0),
    }),
  },

  autocomplete: {
    query: Joi.object({
      q: Joi.string().min(1).required(),
      type: Joi.string().valid('users', 'destinations', 'tags').default('destinations'),
      limit: Joi.number().integer().min(1).max(10).default(5),
    }),
  },

  advanced: {
    query: Joi.object({
      q: Joi.string().min(2).optional(),
      type: Joi.string().valid('users', 'destinations', 'posts').optional(),
      country: Joi.string().optional(),
      category: Joi.string().optional(),
      tags: Joi.string().optional(), // Comma-separated
      dateFrom: Joi.date().iso().optional(),
      dateTo: Joi.date().iso().optional(),
      sortBy: Joi.string().valid('relevance', 'popularity', 'recent', 'name').default('relevance'),
      limit: Joi.number().integer().min(1).max(100).default(20),
      offset: Joi.number().integer().min(0).default(0),
    }),
  },
};

/**
 * Unified search across all content types
 * 
 * @route GET /api/search
 * @query {string} q - Search query (min 2 characters)
 * @query {string} [types] - Types to search (users,destinations,posts)
 * @query {number} [limit=10] - Results per type
 * @query {number} [offset=0] - Results offset
 * @returns {Object} Search results grouped by type
 */
router.get('/', validate(searchSchemas.unified), asyncHandler(async (req, res) => {
  const { q: query, types, limit, offset } = req.query;

  // Parse types if provided
  const typesArray = types ? types.split(',') : ['users', 'destinations', 'posts'];

  const results = await searchService.unifiedSearch(query, {
    types: typesArray,
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  res.status(200).json({
    success: true,
    data: results,
  });
}));

/**
 * Autocomplete suggestions
 * 
 * @route GET /api/search/autocomplete
 * @query {string} q - Partial query
 * @query {string} [type=destinations] - Type (users, destinations, tags)
 * @query {number} [limit=5] - Results limit
 * @returns {Object} List of suggestions
 */
router.get('/autocomplete', validate(searchSchemas.autocomplete), asyncHandler(async (req, res) => {
  const { q: query, type, limit } = req.query;

  const suggestions = await searchService.autocomplete(query, type, parseInt(limit));

  res.status(200).json({
    success: true,
    data: {
      suggestions,
      query,
      type,
    },
  });
}));

/**
 * Advanced search with filters
 * 
 * @route GET /api/search/advanced
 * @query {string} [q] - Search query
 * @query {string} [type] - Type to search
 * @query {string} [country] - Filter by country
 * @query {string} [category] - Filter by category
 * @query {string} [tags] - Filter by tags (comma-separated)
 * @query {string} [dateFrom] - Date range start
 * @query {string} [dateTo] - Date range end
 * @query {string} [sortBy=relevance] - Sort order
 * @query {number} [limit=20] - Results limit
 * @query {number} [offset=0] - Results offset
 * @returns {Object} Filtered search results
 */
router.get('/advanced', validate(searchSchemas.advanced), asyncHandler(async (req, res) => {
  const filters = {
    query: req.query.q,
    type: req.query.type,
    country: req.query.country,
    category: req.query.category,
    tags: req.query.tags ? req.query.tags.split(',') : undefined,
    dateFrom: req.query.dateFrom,
    dateTo: req.query.dateTo,
    sortBy: req.query.sortBy,
    limit: parseInt(req.query.limit || 20),
    offset: parseInt(req.query.offset || 0),
  };

  const results = await searchService.advancedSearch(filters);

  res.status(200).json({
    success: true,
    data: results,
  });
}));

export default router;
