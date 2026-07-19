/**
 * Input Validation Middleware
 * Validates request data using Joi schemas
 */

import Joi from 'joi';

/**
 * Validate request data against a Joi schema
 * @param {Object} schema - Joi schema object with body, params, query keys
 * @returns {Function} Express middleware
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const validationOptions = {
      abortEarly: false, // Return all errors
      allowUnknown: true, // Allow unknown keys in the object
      stripUnknown: true, // Remove unknown keys
    };

    const toValidate = {};
    
    if (schema.body) {
      toValidate.body = req.body;
    }
    if (schema.params) {
      toValidate.params = req.params;
    }
    if (schema.query) {
      toValidate.query = req.query;
    }

    const fullSchema = Joi.object(toValidate);
    const { error, value } = fullSchema.validate(toValidate, validationOptions);

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          statusCode: 400,
          details: errors,
        },
      });
    }

    // Replace request data with validated/sanitized data
    if (value.body) req.body = value.body;
    if (value.params) req.params = value.params;
    if (value.query) req.query = value.query;

    next();
  };
};

/**
 * Common validation schemas
 */
export const schemas = {
  // Registration validation
  register: {
    body: Joi.object({
      email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
      username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required()
        .messages({
          'string.alphanum': 'Username must contain only letters and numbers',
          'string.min': 'Username must be at least 3 characters long',
          'string.max': 'Username cannot exceed 30 characters',
          'any.required': 'Username is required',
        }),
      password: Joi.string()
        .min(8)
        .max(100)
        .required()
        .messages({
          'string.min': 'Password must be at least 8 characters long',
          'string.max': 'Password cannot exceed 100 characters',
          'any.required': 'Password is required',
        }),
      firstName: Joi.string().min(1).max(50).optional(),
      lastName: Joi.string().min(1).max(50).optional(),
    }),
  },

  // Login validation
  login: {
    body: Joi.object({
      emailOrUsername: Joi.string().required().messages({
        'any.required': 'Email or username is required',
      }),
      password: Joi.string().required().messages({
        'any.required': 'Password is required',
      }),
    }),
  },

  // Refresh token validation
  refreshToken: {
    body: Joi.object({
      refreshToken: Joi.string().required().messages({
        'any.required': 'Refresh token is required',
      }),
    }),
  },

  // Email verification
  verifyEmail: {
    body: Joi.object({
      token: Joi.string().required().messages({
        'any.required': 'Verification token is required',
      }),
    }),
  },

  // UUID parameter validation
  uuidParam: {
    params: Joi.object({
      id: Joi.string()
        .uuid()
        .required()
        .messages({
          'string.uuid': 'Invalid ID format',
          'any.required': 'ID is required',
        }),
    }),
  },

  // Pagination validation
  pagination: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
      sortBy: Joi.string().optional(),
      order: Joi.string().valid('asc', 'desc').default('desc'),
    }),
  },
};

export default { validate, schemas };
