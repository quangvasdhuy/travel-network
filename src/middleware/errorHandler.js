import config from '../config/index.js';

/**
 * Global Error Handler Middleware
 * Catches all errors and returns appropriate responses
 */
export const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: config.server.isDevelopment ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Default error status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Lỗi hệ thống';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  } else if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Không có quyền truy cập';
  } else if (err.name === 'DocumentNotFoundError') {
    statusCode = 404;
    message = 'Không tìm thấy tài nguyên';
  } else if (err.name === 'DocumentExistsError') {
    statusCode = 409;
    message = 'Tài nguyên đã tồn tại';
  }

  // Build error response
  const errorResponse = {
    success: false,
    error: {
      message,
      statusCode,
    },
  };

  // Include stack trace in development
  if (config.server.isDevelopment) {
    errorResponse.error.stack = err.stack;
    errorResponse.error.details = err.details;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found Handler
 * Handles requests to non-existent routes
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Không tìm thấy đường dẫn',
      statusCode: 404,
      path: req.originalUrl,
    },
  });
};

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors automatically
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
