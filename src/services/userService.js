/**
 * User Service
 * Handles user profile operations
 */

import dbConnection from '../config/database.js';
import { User } from '../models/User.js';
import { UserQueries, PostQueries, ConnectionQueries, TripQueries } from '../utils/queryHelpers.js';

/**
 * Get user profile by ID
 * @param {string} userId - User ID
 * @param {boolean} isOwnProfile - Whether requesting user's own profile
 * @returns {Promise<Object>} User profile
 */
export async function getUserProfile(userId, isOwnProfile = false) {
  const usersBucket = dbConnection.getBucket('users');
  const collection = usersBucket.defaultCollection;

  try {
    const result = await collection.get(User.getKey(userId));
    const user = result.content;

    if (user.status !== 'active') {
      throw {
        statusCode: 404,
        message: 'Không tìm thấy người dùng',
      };
    }

    // Đếm stats thực tế từ DB
    try {
      const [actualPostCount, actualFollowerCount, actualFollowingCount, actualTripCount] = await Promise.all([
        PostQueries.countByAuthor(userId),
        ConnectionQueries.countFollowers(userId),
        ConnectionQueries.countFollowing(userId),
        TripQueries.countByUserId(userId),
      ]);

      user.stats = {
        ...user.stats,
        postCount: actualPostCount,
        followerCount: actualFollowerCount,
        followingCount: actualFollowingCount,
        tripCount: actualTripCount,
      };
    } catch (err) {
      console.error('Failed to count user stats:', err.message);
    }

    // Return full profile for own profile, public profile for others
    if (isOwnProfile) {
      // Remove sensitive data but include more details
      const { passwordHash, verification, ...profileData } = user;
      return profileData;
    } else {
      return User.toPublicProfile(user);
    }
  } catch (error) {
    if (error.name === 'DocumentNotFoundError') {
      throw {
        statusCode: 404,
        message: 'Không tìm thấy người dùng',
      };
    }
    throw error;
  }
}

/**
 * Get user profile by username
 * @param {string} username - Username
 * @returns {Promise<Object>} User profile
 */
export async function getUserByUsername(username) {
  const userDoc = await UserQueries.findByUsername(username);
  
  if (!userDoc) {
    throw {
      statusCode: 404,
      message: 'Không tìm thấy người dùng',
    };
  }

  const user = userDoc.u || userDoc;

  if (user.status !== 'active') {
    throw {
      statusCode: 404,
      message: 'Không tìm thấy người dùng',
    };
  }

  const profile = User.toPublicProfile(user);

  // Đếm postCount, followerCount, followingCount, tripCount thực tế từ DB
  try {
    const [actualPostCount, actualFollowerCount, actualFollowingCount, actualTripCount] = await Promise.all([
      PostQueries.countByAuthor(profile.id),
      ConnectionQueries.countFollowers(profile.id),
      ConnectionQueries.countFollowing(profile.id),
      TripQueries.countByUserId(profile.id),
    ]);
    
    profile.stats = {
      ...profile.stats,
      postCount: actualPostCount,
      followerCount: actualFollowerCount,
      followingCount: actualFollowingCount,
      tripCount: actualTripCount,
    };
  } catch (err) {
    console.error('Failed to count user stats:', err.message);
  }

  return profile;
}

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updates - Profile updates
 * @returns {Promise<Object>} Updated user profile
 */
export async function updateUserProfile(userId, updates) {
  const usersBucket = dbConnection.getBucket('users');
  const collection = usersBucket.defaultCollection;

  try {
    // Get current user document
    const result = await collection.get(User.getKey(userId));
    const user = result.content;

    // Define allowed fields to update
    const allowedUpdates = {
      'profile.firstName': (val) => { user.profile.firstName = val; },
      'profile.lastName': (val) => { user.profile.lastName = val; },
      'profile.bio': (val) => { user.profile.bio = val; },
      'profile.location.city': (val) => { 
        if (!user.profile.location) user.profile.location = {};
        user.profile.location.city = val; 
      },
      'profile.location.country': (val) => { 
        if (!user.profile.location) user.profile.location = {};
        user.profile.location.country = val; 
      },
      'profile.dateOfBirth': (val) => { user.profile.dateOfBirth = val; },
      'interests': (val) => { user.interests = val; },
      'preferences.travelStyle': (val) => {
        if (!user.preferences) user.preferences = {};
        user.preferences.travelStyle = val;
      },
      'preferences.languages': (val) => {
        if (!user.preferences) user.preferences = {};
        user.preferences.languages = val;
      },
    };

    // Apply updates
    let hasUpdates = false;
    for (const [key, value] of Object.entries(updates)) {
      if (allowedUpdates[key]) {
        allowedUpdates[key](value);
        hasUpdates = true;
      } else if (key === 'profile' && typeof value === 'object') {
        // Handle nested profile object
        for (const [subKey, subValue] of Object.entries(value)) {
          const fullKey = `profile.${subKey}`;
          if (allowedUpdates[fullKey]) {
            allowedUpdates[fullKey](subValue);
            hasUpdates = true;
          } else if (subKey === 'location' && typeof subValue === 'object') {
            // Handle nested location object
            for (const [locKey, locValue] of Object.entries(subValue)) {
              const locFullKey = `profile.location.${locKey}`;
              if (allowedUpdates[locFullKey]) {
                allowedUpdates[locFullKey](locValue);
                hasUpdates = true;
              }
            }
          }
        }
      }
    }

    if (!hasUpdates) {
      throw {
        statusCode: 400,
        message: 'Không có trường hợp lệ nào để cập nhật',
      };
    }

    // Update timestamp
    user.updatedAt = new Date().toISOString();

    // Save updated document
    await collection.upsert(User.getKey(userId), user);

    // Return profile without sensitive data
    const { passwordHash, verification, ...profileData } = user;
    
    return profileData;
  } catch (error) {
    if (error.name === 'DocumentNotFoundError') {
      throw {
        statusCode: 404,
        message: 'Không tìm thấy người dùng',
      };
    }
    if (error.statusCode) {
      throw error;
    }
    console.error('Error updating user profile:', error);
    throw {
      statusCode: 500,
      message: 'Cập nhật hồ sơ thất bại',
    };
  }
}

/**
 * Update profile photo
 * @param {string} userId - User ID
 * @param {string} photoPath - Path to uploaded photo
 * @returns {Promise<Object>} Updated user profile
 */
export async function updateProfilePhoto(userId, photoPath) {
  const usersBucket = dbConnection.getBucket('users');
  const collection = usersBucket.defaultCollection;

  try {
    // Get current user document
    const result = await collection.get(User.getKey(userId));
    const user = result.content;

    // Update profile photo and timestamp
    user.profile.profilePhoto = photoPath;
    user.updatedAt = new Date().toISOString();

    // Save updated document
    await collection.upsert(User.getKey(userId), user);

    // Return updated profile without sensitive data
    const { passwordHash, verification, ...profileData } = user;
    
    return profileData;
  } catch (error) {
    if (error.name === 'DocumentNotFoundError') {
      throw {
        statusCode: 404,
        message: 'Không tìm thấy người dùng',
      };
    }
    console.error('Error updating profile photo:', error);
    throw {
      statusCode: 500,
      message: 'Cập nhật ảnh đại diện thất bại',
    };
  }
}

/**
 * Search users
 * @param {string} query - Search query
 * @param {Object} options - Search options (limit, offset)
 * @returns {Promise<Array>} List of users
 */
export async function searchUsers(query, options = {}) {
  const { limit = 20, offset = 0 } = options;

  const users = await UserQueries.searchUsers(query, limit, offset);

  return users.map((userDoc) => {
    const user = userDoc.u || userDoc;
    return User.toPublicProfile(user);
  });
}

/**
 * Get user statistics
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User statistics
 */
export async function getUserStats(userId) {
  const usersBucket = dbConnection.getBucket('users');
  const collection = usersBucket.defaultCollection;

  try {
    const result = await collection.get(User.getKey(userId));
    const user = result.content;

    return {
      userId: user.id,
      username: user.username,
      stats: user.stats,
      createdAt: user.createdAt,
    };
  } catch (error) {
    if (error.name === 'DocumentNotFoundError') {
      throw {
        statusCode: 404,
        message: 'Không tìm thấy người dùng',
      };
    }
    throw error;
  }
}

/**
 * Delete user account
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export async function deleteUserAccount(userId) {
  const usersBucket = dbConnection.getBucket('users');
  const collection = usersBucket.defaultCollection;

  try {
    // Soft delete - just mark as deleted
    await collection.mutateIn(User.getKey(userId), [
      {
        opcode: 'dict_upsert',
        path: 'status',
        value: 'deleted',
      },
      {
        opcode: 'dict_upsert',
        path: 'updatedAt',
        value: new Date().toISOString(),
      },
    ]);

    // TODO: In a production system, you'd also want to:
    // - Delete or anonymize user's posts
    // - Remove connections
    // - Handle trips and other related data
  } catch (error) {
    if (error.name === 'DocumentNotFoundError') {
      throw {
        statusCode: 404,
        message: 'Không tìm thấy người dùng',
      };
    }
    throw error;
  }
}

export default {
  getUserProfile,
  getUserByUsername,
  updateUserProfile,
  updateProfilePhoto,
  searchUsers,
  getUserStats,
  deleteUserAccount,
};
