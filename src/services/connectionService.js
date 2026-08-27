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
  if (followerId === followingId) {
    throw {
      statusCode: 400,
      message: 'Bạn không thể tự theo dõi chính mình',
    };
  }

  const socialBucket = dbConnection.getBucket('social');
  const collection = socialBucket.defaultCollection;
  const key = Connection.getKey(followerId, followingId);

  // Kiểm tra đã follow chưa bằng key lookup (nhanh hơn N1QL, không cần index)
  try {
    await collection.get(key);
    // Document tồn tại → đã follow rồi
    throw {
      statusCode: 409,
      message: 'Bạn đã theo dõi người dùng này rồi',
    };
  } catch (error) {
    if (error.statusCode === 409) throw error;
    // DocumentNotFoundError → chưa follow, tiếp tục
    if (error.name !== 'DocumentNotFoundError') {
      console.error('Error checking existing connection:', error.name, error.message);
    }
  }

  const connection = Connection.create({
    followerId,
    followerUsername,
    followingId,
    followingUsername,
  });

  const validation = Connection.validate(connection);
  if (!validation.valid) {
    throw {
      statusCode: 400,
      message: 'Dữ liệu kết nối không hợp lệ',
      details: validation.errors,
    };
  }

  try {
    await collection.insert(key, connection);

    await updateFollowerCount(followingId, 1);
    await updateFollowingCount(followerId, 1);

    return connection;
  } catch (error) {
    console.error('Error creating connection:', error.name, error.message);

    if (error.name === 'DocumentExistsError') {
      throw {
        statusCode: 409,
        message: 'Bạn đã theo dõi người dùng này rồi',
      };
    }

    throw {
      statusCode: 500,
      message: 'Theo dõi người dùng thất bại',
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

    await updateFollowerCount(followingId, -1);
    await updateFollowingCount(followerId, -1);
  } catch (error) {
    if (error.name === 'DocumentNotFoundError') {
      throw {
        statusCode: 404,
        message: 'Bạn chưa theo dõi người dùng này',
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
/**
 * Get user's followers
 * @param {string} userId - User ID
 * @param {Object} options - Pagination options
 * @returns {Promise<Array>} List of followers
 */
export async function getFollowers(userId, options = {}) {
  const { limit = 20, offset = 0, currentUserId = null } = options;

  const connections = await ConnectionQueries.getFollowers(userId, limit, offset);

  if (connections.length === 0) return [];

  // Enrich với user profile từ users bucket
  const usersBucket = dbConnection.getBucket('users');
  const collection = usersBucket.defaultCollection;
  const socialBucket = dbConnection.getBucket('social');
  const socialCollection = socialBucket.defaultCollection;

  const enriched = await Promise.all(
    connections.map(async (conn) => {
      try {
        const result = await collection.get(`user::${conn.followerId}`);
        const user = result.content;

        // Check if currentUser is following this follower
        let isFollowing = false;
        if (currentUserId && currentUserId !== conn.followerId) {
          try {
            await socialCollection.get(Connection.getKey(currentUserId, conn.followerId));
            isFollowing = true;
          } catch {
            isFollowing = false;
          }
        }

        return {
          id: user.id,
          userId: user.id,
          username: user.username,
          profile: user.profile,
          stats: user.stats,
          interests: user.interests,
          followedAt: conn.createdAt,
          isFollowing,
        };
      } catch {
        // Fallback nếu user không tìm được
        return {
          id: conn.followerId,
          userId: conn.followerId,
          username: conn.followerUsername,
          profile: null,
          stats: null,
          followedAt: conn.createdAt,
          isFollowing: false,
        };
      }
    })
  );

  return enriched;
}

/**
 * Get users that a user is following
 * @param {string} userId - User ID
 * @param {Object} options - Pagination options
 * @returns {Promise<Array>} List of users being followed
 */
export async function getFollowing(userId, options = {}) {
  const { limit = 20, offset = 0, currentUserId = null } = options;

  const connections = await ConnectionQueries.getFollowing(userId, limit, offset);

  if (connections.length === 0) return [];

  // Enrich với user profile từ users bucket
  const usersBucket = dbConnection.getBucket('users');
  const collection = usersBucket.defaultCollection;
  const socialBucket = dbConnection.getBucket('social');
  const socialCollection = socialBucket.defaultCollection;

  const enriched = await Promise.all(
    connections.map(async (conn) => {
      try {
        const result = await collection.get(`user::${conn.followingId}`);
        const user = result.content;

        // Check if currentUser is following this person
        let isFollowing = false;
        if (currentUserId && currentUserId !== conn.followingId) {
          try {
            await socialCollection.get(Connection.getKey(currentUserId, conn.followingId));
            isFollowing = true;
          } catch {
            isFollowing = false;
          }
        }

        return {
          id: user.id,
          userId: user.id,
          username: user.username,
          profile: user.profile,
          stats: user.stats,
          interests: user.interests,
          followedAt: conn.createdAt,
          isFollowing,
        };
      } catch {
        return {
          id: conn.followingId,
          userId: conn.followingId,
          username: conn.followingUsername,
          profile: null,
          stats: null,
          followedAt: conn.createdAt,
          isFollowing: false,
        };
      }
    })
  );

  return enriched;
}

/**
 * Check if user A follows user B
 * @param {string} followerId - Follower user ID
 * @param {string} followingId - Following user ID
 * @returns {Promise<boolean>} True if following
 */
export async function isFollowing(followerId, followingId) {
  // Dùng key lookup thay vì N1QL để tránh phụ thuộc vào index
  try {
    const socialBucket = dbConnection.getBucket('social');
    const collection = socialBucket.defaultCollection;
    await collection.get(Connection.getKey(followerId, followingId));
    return true;
  } catch (error) {
    if (error.name === 'DocumentNotFoundError') return false;
    // Fallback về N1QL nếu key lookup lỗi vì lý do khác
    return await ConnectionQueries.isFollowing(followerId, followingId).catch(() => false);
  }
}

export async function getConnectionStatus(userId, targetUserId) {
  const socialBucket = dbConnection.getBucket('social');
  const collection = socialBucket.defaultCollection;

  const [isFollowingTarget, isFollowedByTarget] = await Promise.all([
    collection.get(Connection.getKey(userId, targetUserId))
      .then(() => true).catch(() => false),
    collection.get(Connection.getKey(targetUserId, userId))
      .then(() => true).catch(() => false),
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

  // Đơn giản: gợi ý users active, không phải mình, chưa follow, sort by followerCount
  const statement = `
    SELECT u.id, u.username, u.profile, u.stats
    FROM \`${usersBucket}\` u
    WHERE u.type = 'user' 
      AND u.status = 'active'
      AND u.id != $userId
      AND u.id NOT IN (
        SELECT RAW c.followingId 
        FROM \`${socialBucket}\` c 
        WHERE c.type = 'connection' AND c.followerId = $userId AND c.status = 'active'
      )
    ORDER BY IFMISSINGORNULL(u.stats.followerCount, 0) DESC
    LIMIT $limit
  `;

  try {
    const result = await cluster.query(statement, {
      parameters: { userId, limit },
    });

    return result.rows.map((row) => ({
      id: row.id,
      userId: row.id,
      username: row.username,
      profile: row.profile,
      stats: row.stats,
      isFollowing: false,
    }));
  } catch (error) {
    console.error('Error getting suggested connections:', error);
    console.error('Error details:', error.message);
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
    const result = await collection.get(`user::${userId}`);
    const user = result.content;
    user.stats.followerCount = Math.max(0, (user.stats.followerCount || 0) + delta);
    user.updatedAt = new Date().toISOString();
    await collection.upsert(`user::${userId}`, user);
  } catch (error) {
    console.error('Failed to update follower count:', error.message);
  }
}

async function updateFollowingCount(userId, delta) {
  try {
    const usersBucket = dbConnection.getBucket('users');
    const collection = usersBucket.defaultCollection;
    const result = await collection.get(`user::${userId}`);
    const user = result.content;
    user.stats.followingCount = Math.max(0, (user.stats.followingCount || 0) + delta);
    user.updatedAt = new Date().toISOString();
    await collection.upsert(`user::${userId}`, user);
  } catch (error) {
    console.error('Failed to update following count:', error.message);
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
