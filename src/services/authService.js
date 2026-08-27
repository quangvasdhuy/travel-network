/**
 * Authentication Service
 * Handles user authentication logic
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import config from '../config/index.js';
import dbConnection from '../config/database.js';
import { User } from '../models/User.js';
import { UserQueries } from '../utils/queryHelpers.js';

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Created user and tokens
 */
export async function registerUser(userData) {
  const { email, username, password, firstName, lastName } = userData;

  // Validate input
  if (!email || !username || !password) {
    throw {
      statusCode: 400,
      message: 'Email, tên đăng nhập và mật khẩu là bắt buộc',
    };
  }

  if (password.length < 8) {
    throw {
      statusCode: 400,
      message: 'Mật khẩu phải có ít nhất 8 ký tự',
    };
  }

  // Check if email already exists
  const existingEmail = await UserQueries.findByEmail(email);
  if (existingEmail) {
    throw {
      statusCode: 409,
      message: 'Email này đã được đăng ký',
    };
  }

  // Check if username already exists
  const existingUsername = await UserQueries.findByUsername(username);
  if (existingUsername) {
    throw {
      statusCode: 409,
      message: 'Tên đăng nhập đã tồn tại',
    };
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create user document
  const user = User.create({
    email,
    username,
    passwordHash,
    firstName,
    lastName,
  });

  // Validate user data
  const validation = User.validate(user);
  if (!validation.valid) {
    throw {
      statusCode: 400,
      message: 'Dữ liệu người dùng không hợp lệ',
      details: validation.errors,
    };
  }

  // Save to database
  const usersBucket = dbConnection.getBucket('users');
  const collection = usersBucket.defaultCollection;

  try {
    await collection.insert(User.getKey(user.id), user);
  } catch (error) {
    console.error('Error creating user:', error);
    throw {
      statusCode: 500,
      message: 'Tạo người dùng thất bại',
    };
  }

  // Generate tokens
  const tokens = generateTokens(user.id);

  // Return user without sensitive data
  const publicUser = User.toPublicProfile(user);

  return {
    user: publicUser,
    tokens,
  };
}

/**
 * Login user
 * @param {Object} credentials - Login credentials (email/username and password)
 * @returns {Promise<Object>} User and tokens
 */
export async function loginUser(credentials) {
  const { emailOrUsername, password } = credentials;

  if (!emailOrUsername || !password) {
    throw {
      statusCode: 400,
      message: 'Email/tên đăng nhập và mật khẩu là bắt buộc',
    };
  }

  // Find user by email or username
  let userDoc = await UserQueries.findByEmail(emailOrUsername);
  
  if (!userDoc) {
    userDoc = await UserQueries.findByUsername(emailOrUsername);
  }

  if (!userDoc) {
    throw {
      statusCode: 401,
      message: 'Email/tên đăng nhập hoặc mật khẩu không đúng',
    };
  }

  const user = userDoc.u || userDoc;

  // Check if user is active
  if (user.status !== 'active') {
    throw {
      statusCode: 403,
      message: 'Tài khoản chưa được kích hoạt',
    };
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  
  if (!isPasswordValid) {
    throw {
      statusCode: 401,
      message: 'Email/tên đăng nhập hoặc mật khẩu không đúng',
    };
  }

  // Update last login time
  const usersBucket = dbConnection.getBucket('users');
  const collection = usersBucket.defaultCollection;

  try {
    await collection.mutateIn(User.getKey(user.id), [
      {
        opcode: 'dict_upsert',
        path: 'lastLoginAt',
        value: new Date().toISOString(),
      },
    ]);
  } catch (error) {
    console.error('Error updating last login:', error);
    // Don't fail login if this fails
  }

  // Generate tokens
  const tokens = generateTokens(user.id);

  // Return user without sensitive data
  const publicUser = User.toPublicProfile(user);

  return {
    user: publicUser,
    tokens,
  };
}

/**
 * Refresh access token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} New tokens
 */
export async function refreshAccessToken(refreshToken) {
  if (!refreshToken) {
    throw {
      statusCode: 400,
      message: 'Thiếu refresh token',
    };
  }

  // Verify refresh token
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, config.jwt.secret);
  } catch (error) {
    throw {
      statusCode: 401,
      message: 'Refresh token không hợp lệ hoặc đã hết hạn',
    };
  }

  if (decoded.type !== 'refresh') {
    throw {
      statusCode: 401,
      message: 'Loại token không hợp lệ',
    };
  }

  // Verify user still exists and is active
  const usersBucket = dbConnection.getBucket('users');
  const collection = usersBucket.defaultCollection;

  try {
    const result = await collection.get(User.getKey(decoded.userId));
    const user = result.content;

    if (user.status !== 'active') {
      throw {
        statusCode: 403,
        message: 'Tài khoản chưa được kích hoạt',
      };
    }

    // Generate new tokens
    const tokens = generateTokens(user.id);

    return { tokens };
  } catch (error) {
    if (error.name === 'DocumentNotFoundError') {
      throw {
        statusCode: 401,
        message: 'Không tìm thấy người dùng',
      };
    }
    throw error;
  }
}

/**
 * Generate access and refresh tokens
 * @param {string} userId - User ID
 * @returns {Object} Tokens
 */
function generateTokens(userId) {
  const accessToken = jwt.sign(
    {
      userId,
      type: 'access',
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.expiresIn,
    }
  );

  const refreshToken = jwt.sign(
    {
      userId,
      type: 'refresh',
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.refreshExpiresIn,
    }
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: config.jwt.expiresIn,
  };
}

/**
 * Verify email with token
 * @param {string} token - Verification token
 * @returns {Promise<void>}
 */
export async function verifyEmail(token) {
  if (!token) {
    throw {
      statusCode: 400,
      message: 'Thiếu mã xác thực',
    };
  }

  // Find user with this verification token
  const bucketName = process.env.BUCKET_USERS || 'travel_users';
  const statement = `
    SELECT META().id, u.*
    FROM ${bucketName} u
    WHERE u.type = 'user'
      AND u.verification.verificationToken = $token
      AND u.verification.verificationTokenExpiry > $now
    LIMIT 1
  `;

  const cluster = dbConnection.getCluster();
  const result = await cluster.query(statement, {
    parameters: {
      token,
      now: new Date().toISOString(),
    },
  });

  if (result.rows.length === 0) {
    throw {
      statusCode: 400,
      message: 'Mã xác thực không hợp lệ hoặc đã hết hạn',
    };
  }

  const userDoc = result.rows[0];
  const user = userDoc.u;

  // Update user verification status
  const usersBucket = dbConnection.getBucket('users');
  const collection = usersBucket.defaultCollection;

  await collection.mutateIn(User.getKey(user.id), [
    {
      opcode: 'dict_upsert',
      path: 'verification.emailVerified',
      value: true,
    },
    {
      opcode: 'dict_upsert',
      path: 'verification.verificationToken',
      value: null,
    },
    {
      opcode: 'dict_upsert',
      path: 'verification.verificationTokenExpiry',
      value: null,
    },
  ]);
}

export default {
  registerUser,
  loginUser,
  refreshAccessToken,
  verifyEmail,
};
