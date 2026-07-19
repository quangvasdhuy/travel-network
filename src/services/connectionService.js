/**
 * Connection Service
 * Handles social connections (follow/unfollow)
 */

import dbConnection from '../config/database.js';
import { Connection } from '../models/Connection.js';
import { ConnectionQueries } from '../utils/queryHelpers.js';

/**
 * Follow a user
 * @param {string} followerId - User who is following
 * @param {string} followingId - User being followed
 * @param {string} followerUsername - Follower's username
 * @param {string} followingUsername - Following user's username
 * @returns {Promise<Object>} Connection document
 */
export async function followUser(followerId, followingId, followerUsername, followingUsername) {
  // Validate
  if (followerId === followingId) {
    throw {
      statusCode: 400,
      message: 'You cannot follow yourself',
    };
  }

  // Check if connection already exists
  const existing = await ConnectionQueries.isFollowing(followerId, followingId);
  if (existing) {
    throw {
      statusCode: 409,
      message: 'You are already following this user',
    };
  }

  // Create connection document
  const connection = Connection.create({
    followerId,
    followerUsername,
    followingId,
    followingUsername,
  });

  // Validate
  const validation = Connection.validate(connection);
  if (!validation.valid) {
    throw {
      statusCode: 400,
      message: 'Invalid connection data',
      details: validation.errors,
    };
  }

  // Save to database
  const socialBucket = dbConnection.getBucket('social');
  const collection = socialBucket.defaultCollection;

  const key = Connection.getKey(followerId, followingId);

  try {
    await collection.insert(key, connection);

    // Update follower and following counts
    await updateFollowerCount(followingId, 1);
    await updateFollowingCount(followerId, 1);

    return connection;
  } catch (error) {
    console.error('Error creating connection:', error);
    throw {
      statusCode: 500,
      message: 'Failed to follow user',
    };
  }
}

/**
 * Unfollow a user
 * @param {string} followerId - User who is unfollowing
 * @param {string} followingId - User being unfollowed
 * @returns {Promise<void>}
 */
export async function unfollowUser(followerId, followingId) {
  const socialBucket = dbConnection.getBucket('social');
  const collection = socialBucket.defaultCollection;

  const key = Connection.getKey(followerId, followingId);

  try {
    await collection.remove(key);

    // Update follower and following counts
    await updateFollowerCount(followingId, -1);
    await updateFollowingCount(followerId, -1);
  } catch (error) {
    if (error.name === 'DocumentNotFoundError') {
      throw {
        statusCode: 404,
        message: 'You are not following this user',
      };
    }
    throw error;
  }
}

/**
 * Get user's followers
 * @param {string} userId - User ID
 * @param {Object} options - Pagination options
 * @returns {Promise<Array>} List of followers
 */
export async function getFollowers(userId, options = {}) {
  const { limit = 20, offset = 0 } = options;

  const followers = await ConnectionQueries.getFollowers(userId, limit, offset);

  return followers.map((conn) => ({
    userId: conn.followerId,
    username: conn.followerUsername,
    followedAt: conn.createdAt,
  }));
}

/**
 * Get users that a user is following
 * @param {string} userId - User ID
 * @param {Object} options - Pagination options
 * @returns {Promise<Array>} List of users being followed
 */
export async function getFollowing(userId, options = {}) {
  const { limit = 20, offset = 0 } = options;

  const following = await ConnectionQueries.getFollowing(userId, limit, offset);

  return following.map((conn) => ({
    userId: conn.followingId,
    username: conn.followingUsername,
    followedAt: conn.createdAt,
  }));
}

/**
 * Check if user A follows user B
 * @param {string} followerId - Follower user ID
 * @param {string} followingId - Following user ID
 * @returns {Promise<boolean>} True if following
 */
export async function isFollowing(followerId, followingId) {
  return await ConnectionQueries.isFollowing(followerId, followingId);
}

/**
 * Get connection status between two users
 * @param {string} userId - Current user ID
 * @param {string} targetUserId - Target user ID
 * @returns {Promise<Object>} Connection status
 */
export async function getConnectionStatus(userId, targetUserId) {
  const [isFollowingTarget, isFollowedByTarget] = await Promise.all([
    ConnectionQueries.isFollowing(userId, targetUserId),
    ConnectionQueries.isFollowing(targetUserId, userId),
  ]);

  return {
    isFollowing: isFollowingTarget,
    isFollowedBy: isFollowedByTarget,
    isMutual: isFollowingTarget && isFollowedByTarget,
  };
}

/**
 * Get suggested connections for a user
 * Based on common destinations and mutual connections
 * @param {string} userId - User ID
 * @param {number} limit - Number of suggestions
 * @returns {Promise<Array>} List of suggested users
 */
export async function getSuggestedConnections(userId, limit = 10) {
  const cluster = dbConnection.getCluster();
  const usersBucket = process.env.BUCKET_USERS || 'travel_users';
  const socialBucket = process.env.BUCKET_SOCIAL || 'travel_social';
  const tripsBucket = process.env.BUCKET_TRIPS || 'travel_trips';

  // Get users who have mutual connections or common destinations
  const statement = `
    SELECT DISTINCT u.id, u.username, u.profile, u.stats,
      (SELECT COUNT(*) FROM ${socialBucket} c 
       WHERE c.followerId = $userId AND c.followingId = u.id) as alreadyFollowing
    FROM ${usersBucket} u
    WHERE u.type = 'user' 
      AND u.status = 'active'
      AND u.id != $userId
      AND (
        -- Users with mutual connections
        u.id IN (
          SELECT RAW c2.followingId 
          FROM ${socialBucket} c1
          JOIN ${socialBucket} c2 ON c1.followingId = c2.followerId
          WHERE c1.followerId = $userId AND c1.status = 'active' AND c2.status = 'active'
        )
        OR
        -- Users with similar interests (array intersection)
        ARRAY_LENGTH(ARRAY_INTERSECT(u.interests, 
          (SELECT RAW u2.interests FROM ${usersBucket} u2 WHERE u2.id = $userId)[0]
        )) > 0
      )
      AND NOT EXISTS (
        SELECT 1 FROM ${socialBucket} c 
        WHERE c.followerId = $userId AND c.followingId = u.id
      )
    ORDER BY u.stats.followerCount DESC
    LIMIT $limit
  `;

  try {
    const result = await cluster.query(statement, {
      parameters: { userId, limit },
    });

    return result.rows.map((row) => ({
      userId: row.id,
      username: row.username,
      profile: row.profile,
      stats: row.stats,
    }));
  } catch (error) {
    console.error('Error getting suggested connections:', error);
    return [];
  }
}

/**
 * Get mutual connections between two users
 * @param {string} userId1 - First user ID
 * @param {string} userId2 - Second user ID
 * @returns {Promise<Array>} List of mutual connections
 */
export async function getMutualConnections(userId1, userId2) {
  const cluster = dbConnection.getCluster();
  const socialBucket = process.env.BUCKET_SOCIAL || 'travel_social';

  const statement = `
    SELECT c1.followingId as userId, c1.followingUsername as username
    FROM ${socialBucket} c1
    WHERE c1.followerId = $userId1
      AND c1.followingId IN (
        SELECT RAW c2.followingId 
        FROM ${socialBucket} c2 
        WHERE c2.followerId = $userId2
      )
    LIMIT 50
  `;

  try {
    const result = await cluster.query(statement, {
      parameters: { userId1, userId2 },
    });

    return result.rows;
  } catch (error) {
    console.error('Error getting mutual connections:', error);
    return [];
  }
}

/**
 * Update user's follower count
 * @private
 */
async function updateFollowerCount(userId, delta) {
  try {
    const usersBucket = dbConnection.getBucket('users');
    const collection = usersBucket.defaultCollection;

    await collection.mutateIn(`user::${userId}`, [
      {
        opcode: 'counter',
        path: 'stats.followerCount',
        delta: delta,
      },
    ]);
  } catch (error) {
    console.error('Failed to update follower count:', error);
    // Don't fail the main operation
  }
}

/**
 * Update user's following count
 * @private
 */
async function updateFollowingCount(userId, delta) {
  try {
    const usersBucket = dbConnection.getBucket('users');
    const collection = usersBucket.defaultCollection;

    await collection.mutateIn(`user::${userId}`, [
      {
        opcode: 'counter',
        path: 'stats.followingCount',
        delta: delta,
      },
    ]);
  } catch (error) {
    console.error('Failed to update following count:', error);
    // Don't fail the main operation
  }
}

export default {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  isFollowing,
  getConnectionStatus,
  getSuggestedConnections,
  getMutualConnections,
};
