/**
 * Authentication Middleware
 * Validates JWT tokens and protects routes
 */

import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import dbConnection from '../config/database.js';
import { User } from '../models/User.js';

/**
 * Verify JWT token and attach user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Chưa cung cấp token xác thực',
          statusCode: 401,
        },
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Phiên đăng nhập đã hết hạn',
            statusCode: 401,
            code: 'TOKEN_EXPIRED',
          },
        });
      }
      throw error;
    }

    // Get user from database
    const usersBucket = dbConnection.getBucket('users');
    const collection = usersBucket.defaultCollection;

    try {
      const result = await collection.get(User.getKey(decoded.userId));
      const user = result.content;

      // Check if user is active
      if (user.status !== 'active') {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Tài khoản chưa được kích hoạt',
            statusCode: 403,
          },
        });
      }

      // Attach user to request (exclude sensitive data)
      req.user = {
        id: user.id,
        email: user.email,
        username: user.username,
        profile: user.profile,
        status: user.status,
      };

      next();
    } catch (error) {
      if (error.name === 'DocumentNotFoundError') {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Không tìm thấy người dùng',
            statusCode: 401,
          },
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: {
        message: 'Token không hợp lệ',
        statusCode: 401,
      },
    });
  }
};

/**
 * Optional authentication - attaches user if token is valid, but doesn't require it
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user
      req.user = null;
      return next();
    }

    // Try to authenticate, but don't fail if token is invalid
    await authenticate(req, res, (error) => {
      if (error) {
        req.user = null;
      }
      next();
    });
  } catch (error) {
    // Authentication failed, but that's okay for optional auth
    req.user = null;
    next();
  }
};

/**
 * Check if user owns the resource
 * Use after authenticate middleware
 */
export const requireOwnership = (getUserIdFromParams) => {
  return (req, res, next) => {
    const resourceUserId = getUserIdFromParams(req);
    
    if (req.user.id !== resourceUserId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Bạn không có quyền truy cập tài nguyên này',
          statusCode: 403,
        },
      });
    }

    next();
  };
};

export default { authenticate, optionalAuth, requireOwnership };
