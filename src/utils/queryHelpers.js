/**
 * Query Helpers
 * Common N1QL query patterns for the application
 */

import dbConnection from '../config/database.js';

/**
 * Execute a N1QL query
 * @param {string} statement - N1QL query statement
 * @param {Object} options - Query options (parameters, timeout, etc.)
 * @returns {Promise<Array>} Query results
 */
export async function executeQuery(statement, options = {}) {
  try {
    const cluster = dbConnection.getCluster();
    const result = await cluster.query(statement, options);
    return result.rows;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

/**
 * User Queries
 */
export const UserQueries = {
  /**
   * Find user by email
   */
  async findByEmail(email) {
    const bucketName = process.env.BUCKET_USERS || 'travel_users';
    const statement = `
      SELECT META().id, u.*
      FROM ${bucketName} u
      WHERE u.type = 'user' AND u.email = $email
      LIMIT 1
    `;
    const result = await executeQuery(statement, { parameters: { email } });
    return result[0] || null;
  },

  /**
   * Find user by username
   */
  async findByUsername(username) {
    const bucketName = process.env.BUCKET_USERS || 'travel_users';
    const statement = `
      SELECT META().id, u.*
      FROM ${bucketName} u
      WHERE u.type = 'user' AND u.username = $username
      LIMIT 1
    `;
    const result = await executeQuery(statement, { parameters: { username } });
    return result[0] || null;
  },

  /**
   * Search users by location or interests
   */
  async searchUsers(query, limit = 20, offset = 0) {
    const bucketName = process.env.BUCKET_USERS || 'travel_users';
    const statement = `
      SELECT META().id, u.id, u.username, u.profile, u.interests, u.stats
      FROM ${bucketName} u
      WHERE u.type = 'user'
        AND (LOWER(u.username) LIKE $query
          OR LOWER(u.profile.firstName) LIKE $query
          OR LOWER(u.profile.lastName) LIKE $query
          OR LOWER(u.profile.location.city) LIKE $query
          OR LOWER(u.profile.location.country) LIKE $query)
      ORDER BY u.stats.followerCount DESC
      LIMIT $limit OFFSET $offset
    `;
    return await executeQuery(statement, {
      parameters: { query: `%${query.toLowerCase()}%`, limit, offset },
    });
  },
};

/**
 * Trip Queries
 */
export const TripQueries = {
  /**
   * Get trips by user ID
   */
  async getByUserId(userId, limit = 20, offset = 0) {
    const bucketName = process.env.BUCKET_TRIPS || 'travel_trips';
    const statement = `
      SELECT META().id, t.*
      FROM ${bucketName} t
      WHERE t.type = 'trip' AND t.userId = $userId
      ORDER BY t.startDate DESC
      LIMIT $limit OFFSET $offset
    `;
    return await executeQuery(statement, { parameters: { userId, limit, offset } });
  },

  /**
   * Find trips by destination
   */
  async getByDestination(destinationId, limit = 20, offset = 0) {
    const bucketName = process.env.BUCKET_TRIPS || 'travel_trips';
    const statement = `
      SELECT META().id, t.*
      FROM ${bucketName} t
      WHERE t.type = 'trip'
        AND ANY d IN t.destinations SATISFIES d.destinationId = $destinationId END
      ORDER BY t.startDate DESC
      LIMIT $limit OFFSET $offset
    `;
    return await executeQuery(statement, {
      parameters: { destinationId, limit, offset },
    });
  },

  /**
   * Find upcoming trips (for recommendations)
   */
  async getUpcomingTrips(startDate, endDate, limit = 50) {
    const bucketName = process.env.BUCKET_TRIPS || 'travel_trips';
    const statement = `
      SELECT META().id, t.*, u.username, u.profile.profilePhoto
      FROM ${bucketName} t
      JOIN ${process.env.BUCKET_USERS || 'travel_users'} u
        ON KEYS ('user::' || t.userId)
      WHERE t.type = 'trip'
        AND t.status = 'planning'
        AND t.visibility = 'public'
        AND t.startDate BETWEEN $startDate AND $endDate
      ORDER BY t.startDate
      LIMIT $limit
    `;
    return await executeQuery(statement, { parameters: { startDate, endDate, limit } });
  },
};

/**
 * Post Queries
 */
export const PostQueries = {
  /**
   * Get posts by author
   */
  async getByAuthor(authorId, limit = 20, offset = 0) {
    const bucketName = process.env.BUCKET_CONTENT || 'travel_content';
    const statement = `
      SELECT META().id, p.*
      FROM ${bucketName} p
      WHERE p.type = 'post' AND p.authorId = $authorId
      ORDER BY p.createdAt DESC
      LIMIT $limit OFFSET $offset
    `;
    return await executeQuery(statement, { parameters: { authorId, limit, offset } });
  },

  /**
   * Get posts by destination
   */
  async getByDestination(destinationId, limit = 20, offset = 0) {
    const bucketName = process.env.BUCKET_CONTENT || 'travel_content';
    const statement = `
      SELECT META().id, p.*
      FROM ${bucketName} p
      WHERE p.type = 'post'
        AND p.destinationId = $destinationId
        AND p.visibility = 'public'
      ORDER BY p.createdAt DESC
      LIMIT $limit OFFSET $offset
    `;
    return await executeQuery(statement, {
      parameters: { destinationId, limit, offset },
    });
  },

  /**
   * Get feed for user (posts from people they follow)
   */
  async getFeedForUser(userId, limit = 20, offset = 0) {
    const bucketName = process.env.BUCKET_CONTENT || 'travel_content';
    const socialBucket = process.env.BUCKET_SOCIAL || 'travel_social';
    const statement = `
      SELECT META(p).id, p.*
      FROM ${bucketName} p
      WHERE p.type = 'post'
        AND p.visibility = 'public'
        AND p.authorId IN (
          SELECT RAW c.followingId
          FROM ${socialBucket} c
          WHERE c.type = 'connection'
            AND c.followerId = $userId
            AND c.status = 'active'
        )
      ORDER BY p.createdAt DESC
      LIMIT $limit OFFSET $offset
    `;
    return await executeQuery(statement, { parameters: { userId, limit, offset } });
  },
};

/**
 * Connection Queries
 */
export const ConnectionQueries = {
  /**
   * Get followers of a user
   */
  async getFollowers(userId, limit = 20, offset = 0) {
    const bucketName = process.env.BUCKET_SOCIAL || 'travel_social';
    const statement = `
      SELECT c.followerId, c.followerUsername, c.createdAt
      FROM ${bucketName} c
      WHERE c.type = 'connection'
        AND c.followingId = $userId
        AND c.status = 'active'
      ORDER BY c.createdAt DESC
      LIMIT $limit OFFSET $offset
    `;
    return await executeQuery(statement, { parameters: { userId, limit, offset } });
  },

  /**
   * Get users that a user is following
   */
  async getFollowing(userId, limit = 20, offset = 0) {
    const bucketName = process.env.BUCKET_SOCIAL || 'travel_social';
    const statement = `
      SELECT c.followingId, c.followingUsername, c.createdAt
      FROM ${bucketName} c
      WHERE c.type = 'connection'
        AND c.followerId = $userId
        AND c.status = 'active'
      ORDER BY c.createdAt DESC
      LIMIT $limit OFFSET $offset
    `;
    return await executeQuery(statement, { parameters: { userId, limit, offset } });
  },

  /**
   * Check if user A follows user B
   */
  async isFollowing(followerId, followingId) {
    const bucketName = process.env.BUCKET_SOCIAL || 'travel_social';
    const statement = `
      SELECT COUNT(*) as count
      FROM ${bucketName} c
      WHERE c.type = 'connection'
        AND c.followerId = $followerId
        AND c.followingId = $followingId
        AND c.status = 'active'
    `;
    const result = await executeQuery(statement, {
      parameters: { followerId, followingId },
    });
    return result[0]?.count > 0;
  },
};

/**
 * Destination Queries
 */
export const DestinationQueries = {
  /**
   * Find destination by country and slug
   */
  async findBySlug(countryCode, slug) {
    const bucketName = process.env.BUCKET_TRIPS || 'travel_trips';
    const statement = `
      SELECT META().id, d.*
      FROM ${bucketName} d
      WHERE d.type = 'destination'
        AND d.countryCode = $countryCode
        AND d.slug = $slug
      LIMIT 1
    `;
    const result = await executeQuery(statement, { parameters: { countryCode, slug } });
    return result[0] || null;
  },

  /**
   * Get popular destinations (by trip count)
   */
  async getPopular(limit = 20) {
    const bucketName = process.env.BUCKET_TRIPS || 'travel_trips';
    const statement = `
      SELECT META().id, d.*
      FROM ${bucketName} d
      WHERE d.type = 'destination'
      ORDER BY d.stats.tripCount DESC, d.stats.rating DESC
      LIMIT $limit
    `;
    return await executeQuery(statement, { parameters: { limit } });
  },

  /**
   * Search destinations by name or country
   */
  async search(query, limit = 20) {
    const bucketName = process.env.BUCKET_TRIPS || 'travel_trips';
    const statement = `
      SELECT META().id, d.id, d.name, d.country, d.countryCode, d.slug, d.summary, d.images, d.stats
      FROM ${bucketName} d
      WHERE d.type = 'destination'
        AND (LOWER(d.name) LIKE $query OR LOWER(d.country) LIKE $query)
      ORDER BY d.stats.tripCount DESC
      LIMIT $limit
    `;
    return await executeQuery(statement, {
      parameters: { query: `%${query.toLowerCase()}%`, limit },
    });
  },
};

export default {
  executeQuery,
  UserQueries,
  TripQueries,
  PostQueries,
  ConnectionQueries,
  DestinationQueries,
};
