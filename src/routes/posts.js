/**
 * Post Routes
 * Handles content posting and interactions
 */

import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import Joi from 'joi';
import postService from '../services/postService.js';
import destinationService from '../services/destinationService.js';
import { uploadPostMedia } from '../config/cloudinary.js';

const router = express.Router();

// Validation schemas
const postSchemas = {
  create: {
    body: Joi.object({
      postType: Joi.string().valid('text', 'photo', 'video', 'checkin', 'review').default('text'),
      text: Joi.string().max(5000).optional(),
      tripId: Joi.string().uuid().optional(),
      destinationId: Joi.string().optional(),
      location: Joi.object({
        name: Joi.string().optional(),
        country: Joi.string().optional(),
        coordinates: Joi.object({
          lat: Joi.number().min(-90).max(90),
          lon: Joi.number().min(-180).max(180),
        }).optional(),
      }).optional(),
      tags: Joi.array().items(Joi.string()).optional(),
      visibility: Joi.string().valid('public', 'connections', 'private').default('public'),
    }),
  },

  update: {
    body: Joi.object({
      text: Joi.string().max(5000).optional(),
      tags: Joi.array().items(Joi.string()).optional(),
      visibility: Joi.string().valid('public', 'connections', 'private').optional(),
      location: Joi.object().optional(),
    }).min(1),
  },

  addComment: {
    body: Joi.object({
      text: Joi.string().min(1).max(1000).required(),
    }),
  },
};

/**
 * Create new post
 * 
 * @route POST /api/posts
 * @auth Required
 * @body {Object} Post data
 * @returns {Object} Created post
 */
router.post('/', authenticate, uploadPostMedia.array('media', 5), asyncHandler(async (req, res) => {
  const postData = {
    postType: req.body.postType || 'text',
    content: {
      text: req.body.text || '',
      media: [],
    },
    tripId: req.body.tripId,
    destinationId: req.body.destinationId || null,
    destinationName: null,
    destinationCountry: null,
    location: req.body.location ? JSON.parse(req.body.location) : null,
    tags: req.body.tags ? JSON.parse(req.body.tags) : [],
    visibility: req.body.visibility || 'public',
  };

  // Resolve destination name nếu có destinationId
  if (postData.destinationId) {
    try {
      const destination = await destinationService.getDestinationById(postData.destinationId);
      if (destination) {
        postData.destinationName = destination.name;
        postData.destinationCountry = destination.country;
      }
    } catch (err) {
      // Không fail nếu không tìm được destination
      console.error('Failed to resolve destination:', err.message);
    }
  }

  // Cloudinary trả về full URL trong file.path
  if (req.files && req.files.length > 0) {
    postData.content.media = req.files.map((file) => ({
      type: file.mimetype.startsWith('video') ? 'video' : 'image',
      url: file.path,
      caption: '',
    }));
  }

  const post = await postService.createPost(
    req.user.id,
    req.user.username,
    req.user.profile?.profilePhoto || null,
    postData
  );

  res.status(201).json({
    success: true,
    data: { post },
    message: 'Post created successfully',
  });
}));

/**
 * Get popular posts (public, sorted by engagement)
 * 
 * @route GET /api/posts/popular
 * @auth Optional
 * @query {number} [limit=20] - Results limit
 * @query {number} [page=1] - Page number
 * @returns {Object} List of popular posts
 */
router.get('/popular', optionalAuth, asyncHandler(async (req, res) => {
  const { limit = 20, page = 1 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const posts = await postService.getPopularPosts({
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  res.status(200).json({
    success: true,
    data: {
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        count: posts.length,
      },
    },
  });
}));

/**
 * Get feed for current user
 * 
 * @route GET /api/posts/feed
 * @auth Required
 * @query {number} [limit=20] - Results limit
 * @query {number} [offset=0] - Results offset
 * @returns {Object} Personalized feed
 */
router.get('/feed', authenticate, asyncHandler(async (req, res) => {
  const { limit = 20, offset = 0 } = req.query;

  const posts = await postService.getFeedForUser(req.user.id, {
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  res.status(200).json({
    success: true,
    data: {
      posts,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: posts.length,
      },
    },
  });
}));

/**
 * Get posts by author
 * 
 * @route GET /api/posts/user/:userId
 * @auth Optional
 * @param {string} userId - Author user ID
 * @query {number} [limit=20] - Results limit
 * @query {number} [offset=0] - Results offset
 * @returns {Object} List of posts
 */
router.get('/user/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { limit = 20, offset = 0 } = req.query;

  const posts = await postService.getPostsByAuthor(userId, {
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  res.status(200).json({
    success: true,
    data: {
      posts,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: posts.length,
      },
    },
  });
}));

/**
 * Get posts by destination
 * 
 * @route GET /api/posts/destination/:destinationId
 * @auth Optional
 * @param {string} destinationId - Destination ID
 * @query {number} [limit=20] - Results limit
 * @query {number} [offset=0] - Results offset
 * @returns {Object} List of posts
 */
router.get('/destination/:destinationId', asyncHandler(async (req, res) => {
  const { destinationId } = req.params;
  const { limit = 20, offset = 0 } = req.query;

  const posts = await postService.getPostsByDestination(destinationId, {
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  res.status(200).json({
    success: true,
    data: {
      posts,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: posts.length,
      },
    },
  });
}));

/**
 * Get post by ID
 * 
 * @route GET /api/posts/:id
 * @auth Optional
 * @param {string} id - Post ID
 * @returns {Object} Post details
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const requestingUserId = req.user?.id || null;

  const post = await postService.getPostById(id, requestingUserId);

  res.status(200).json({
    success: true,
    data: { post },
  });
}));

/**
 * Update post
 * 
 * @route PATCH /api/posts/:id
 * @auth Required (must be post author)
 * @param {string} id - Post ID
 * @body {Object} Fields to update
 * @returns {Object} Updated post
 */
router.patch('/:id', authenticate, validate(postSchemas.update), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const post = await postService.updatePost(id, req.user.id, updates);

  res.status(200).json({
    success: true,
    data: { post },
    message: 'Post updated successfully',
  });
}));

/**
 * Delete post
 * 
 * @route DELETE /api/posts/:id
 * @auth Required (must be post author)
 * @param {string} id - Post ID
 * @returns {Object} Success message
 */
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;

  await postService.deletePost(id, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Post deleted successfully',
  });
}));

/**
 * Like a post
 * 
 * @route POST /api/posts/:id/like
 * @auth Required
 * @param {string} id - Post ID
 * @returns {Object} Updated post
 */
router.post('/:id/like', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await postService.likePost(id, req.user.id);

  res.status(200).json({
    success: true,
    data: { post },
    message: 'Post liked successfully',
  });
}));

/**
 * Unlike a post
 * 
 * @route DELETE /api/posts/:id/like
 * @auth Required
 * @param {string} id - Post ID
 * @returns {Object} Updated post
 */
router.delete('/:id/like', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await postService.unlikePost(id, req.user.id);

  res.status(200).json({
    success: true,
    data: { post },
    message: 'Post unliked successfully',
  });
}));

/**
 * Add comment to post
 * 
 * @route POST /api/posts/:id/comments
 * @auth Required
 * @param {string} id - Post ID
 * @body {string} text - Comment text
 * @returns {Object} Updated post with new comment
 */
router.post('/:id/comments', authenticate, validate(postSchemas.addComment), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  const post = await postService.addComment(
    id,
    req.user.id,
    req.user.username,
    req.user.profile?.profilePhoto || null,
    text
  );

  res.status(201).json({
    success: true,
    data: { post },
    message: 'Comment added successfully',
  });
}));

/**
 * Get comments for a post
 * 
 * @route GET /api/posts/:id/comments
 * @auth Optional
 * @param {string} id - Post ID
 * @returns {Object} List of comments
 */
router.get('/:id/comments', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const comments = await postService.getComments(id);

  res.status(200).json({
    success: true,
    data: {
      comments,
      count: comments.length,
    },
  });
}));

/**
 * Delete comment from post
 * 
 * @route DELETE /api/posts/:id/comments/:commentId
 * @auth Required (must be comment author or post author)
 * @param {string} id - Post ID
 * @param {string} commentId - Comment ID
 * @returns {Object} Updated post
 */
router.delete('/:id/comments/:commentId', authenticate, asyncHandler(async (req, res) => {
  const { id, commentId } = req.params;

  const post = await postService.deleteComment(id, commentId, req.user.id);

  res.status(200).json({
    success: true,
    data: { post },
    message: 'Comment deleted successfully',
  });
}));

export default router;
