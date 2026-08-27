/**
 * User Document Model
 * Bucket: travel_users
 * Document Key Pattern: user::{uuid}
 */

import { v4 as uuidv4 } from 'uuid';

export class User {
  /**
   * Create a new user document structure
   * @param {Object} data - User data
   * @returns {Object} User document
   */
  static create(data) {
    const now = new Date().toISOString();
    
    return {
      id: data.id || uuidv4(),
      type: 'user',
      email: data.email,
      username: data.username,
      passwordHash: data.passwordHash,
      profile: {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        bio: data.bio || '',
        profilePhoto: data.profilePhoto || null,
        location: {
          city: data.location?.city || '',
          country: data.location?.country || '',
          coordinates: data.location?.coordinates || null, // { lat, lon }
        },
        dateOfBirth: data.dateOfBirth || null,
      },
      interests: data.interests || [], // Array of strings: ['hiking', 'photography', 'food']
      preferences: {
        travelStyle: data.travelStyle || [], // ['adventure', 'luxury', 'budget', 'cultural']
        languages: data.languages || [], // ['en', 'es', 'fr']
        privacySettings: {
          profileVisibility: data.privacySettings?.profileVisibility || 'public', // 'public', 'connections', 'private'
          tripVisibility: data.privacySettings?.tripVisibility || 'public',
          showEmail: data.privacySettings?.showEmail || false,
        },
      },
      stats: {
        tripCount: 0,
        postCount: 0,
        followerCount: 0,
        followingCount: 0,
      },
      verification: {
        emailVerified: false,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
      status: 'active', // 'active', 'suspended', 'deleted'
      createdAt: now,
      updatedAt: now,
      lastLoginAt: null,
    };
  }

  /**
   * Generate document key for user
   * @param {string} userId - User ID
   * @returns {string} Document key
   */
  static getKey(userId) {
    return `user::${userId}`;
  }

  /**
   * Validate user data
   * @param {Object} data - User data to validate
   * @returns {Object} Validation result { valid: boolean, errors: string[] }
   */
  static validate(data) {
    const errors = [];

    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push('Email phải hợp lệ');
    }

    if (!data.username || data.username.length < 3 || data.username.length > 30) {
      errors.push('Tên đăng nhập phải từ 3 đến 30 ký tự');
    }

    if (!data.passwordHash) {
      errors.push('Thiếu mã băm mật khẩu');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if email is valid
   * @param {string} email
   * @returns {boolean}
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Sanitize user data for public view (remove sensitive fields)
   * @param {Object} user - User document
   * @returns {Object} Sanitized user
   */
  static toPublicProfile(user) {
    return {
      id: user.id,
      username: user.username,
      profile: {
        firstName: user.profile?.firstName,
        lastName: user.profile?.lastName,
        bio: user.profile?.bio,
        profilePhoto: user.profile?.profilePhoto,
        location: user.profile?.location,
      },
      interests: user.interests,
      preferences: {
        travelStyle: user.preferences?.travelStyle || [],
      },
      stats: user.stats,
      createdAt: user.createdAt,
    };
  }
}

export default User;
