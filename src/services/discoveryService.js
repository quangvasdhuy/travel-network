/**
 * Discovery Service
 * Handles content discovery and recommendations
 */

import dbConnection from '../config/database.js';

/**
 * Get trending destinations
 * Based on recent activity (trips, posts, views)
 * @param {Object} options - Options
 * @returns {Promise<Array>} List of trending destinations
 */
export async function getTrendingDestinations(options = {}) {
  const { limit = 10, days = 30 } = options;

  const cluster = dbConnection.getCluster();
  const bucketName = process.env.BUCKET_TRIPS || 'travel_trips';

  // Calculate trending score based on multiple factors
  const statement = `
    SELECT META(d).id, d.*,
      (d.stats.tripCount * 3 + d.stats.postCount * 2 + d.stats.viewCount * 0.1) as trendingScore
    FROM ${bucketName} d
    WHERE d.type = 'destination'
    ORDER BY trendingScore DESC, d.stats.tripCount DESC
    LIMIT $limit
  `;

  try {
    const result = await cluster.query(statement, {
      parameters: { limit },
    });

    return result.rows.map(row => ({
      destination: row.d,
      trendingScore: Math.round(row.trendingScore),
    }));
  } catch (error) {
    console.error('Error getting trending destinations:', error);
    return [];
  }
}

/**
 * Get popular posts
 * Based on likes, comments, and views
 * @param {Object} options - Options
 * @returns {Promise<Array>} List of popular posts
 */
export async function getPopularPosts(options = {}) {
  const { limit = 20, timeframe = '7d' } = options;

  const cluster = dbConnection.getCluster();
  const bucketName = process.env.BUCKET_CONTENT || 'travel_content';

  // Calculate cutoff date based on timeframe
  const cutoffDate = new Date();
  const days = parseInt(timeframe) || 7;
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const statement = `
    SELECT META(p).id, p.*,
      (p.stats.likeCount * 3 + p.stats.commentCount * 5 + p.stats.viewCount * 0.1) as popularityScore
    FROM ${bucketName} p
    WHERE p.type = 'post'
      AND p.visibility = 'public'
      AND p.createdAt >= $cutoffDate
    ORDER BY popularityScore DESC, p.createdAt DESC
    LIMIT $limit
  `;

  try {
    const result = await cluster.query(statement, {
      parameters: {
        cutoffDate: cutoffDate.toISOString(),
        limit,
      },
    });

    return result.rows.map(row => ({
      post: row.p,
      popularityScore: Math.round(row.popularityScore),
    }));
  } catch (error) {
    console.error('Error getting popular posts:', error);
    return [];
  }
}

/**
 * Get recommended trips
 * Based on user's interests and popular trips
 * @param {string} userId - User ID
 * @param {Object} options - Options
 * @returns {Promise<Array>} List of recommended trips
 */
export async function getRecommendedTrips(userId, options = {}) {
  const { limit = 10 } = options;

  const cluster = dbConnection.getCluster();
  const tripsBucket = process.env.BUCKET_TRIPS || 'travel_trips';
  const usersBucket = process.env.BUCKET_USERS || 'travel_users';

  // Get user's interests
  const userStatement = `
    SELECT u.interests, u.preferences.travelStyle
    FROM ${usersBucket} u
    WHERE META(u).id = $userKey
  `;

  try {
    const userResult = await cluster.query(userStatement, {
      parameters: { userKey: `user::${userId}` },
    });

    const userInterests = userResult.rows[0]?.interests || [];
    const userTravelStyle = userResult.rows[0]?.travelStyle || [];

    // Find trips with matching interests and high engagement
    const tripsStatement = `
      SELECT META(t).id, t.*, u.username, u.profile.profilePhoto
      FROM ${tripsBucket} t
      JOIN ${usersBucket} u ON KEYS ('user::' || t.userId)
      WHERE t.type = 'trip'
        AND t.visibility = 'public'
        AND t.status IN ['planning', 'active']
        AND t.userId != $userId
        AND (
          ARRAY_LENGTH(ARRAY_INTERSECT(t.tags, $interests)) > 0
          OR ANY dest IN t.destinations SATISFIES dest.destinationId IS NOT NULL END
        )
      ORDER BY t.stats.likeCount DESC, t.createdAt DESC
      LIMIT $limit
    `;

    const tripsResult = await cluster.query(tripsStatement, {
      parameters: {
        userId,
        interests: userInterests,
        limit,
      },
    });

    return tripsResult.rows.map(row => ({
      trip: row.t,
      author: {
        username: row.username,
        photo: row.profilePhoto,
      },
    }));
  } catch (error) {
    console.error('Error getting recommended trips:', error);
    return [];
  }
}

/**
 * Find nearby travelers
 * Based on location and upcoming trips
 * @param {string} userId - User ID
 * @param {Object} options - Options
 * @returns {Promise<Array>} List of nearby travelers
 */
export async function getNearbyTravelers(userId, options = {}) {
  const { limit = 10 } = options;

  const cluster = dbConnection.getCluster();
  const usersBucket = process.env.BUCKET_USERS || 'travel_users';
  const tripsBucket = process.env.BUCKET_TRIPS || 'travel_trips';

  // Get current user's location
  const userStatement = `
    SELECT u.profile.location
    FROM ${usersBucket} u
    WHERE META(u).id = $userKey
  `;

  try {
    const userResult = await cluster.query(userStatement, {
      parameters: { userKey: `user::${userId}` },
    });

    const userLocation = userResult.rows[0]?.location;
    if (!userLocation || !userLocation.country) {
      return [];
    }

    // Find users in the same location or with trips to user's location
    const statement = `
      SELECT DISTINCT u.id, u.username, u.profile, u.stats
      FROM ${usersBucket} u
      WHERE u.type = 'user'
        AND u.status = 'active'
        AND u.id != $userId
        AND (
          u.profile.location.country = $country
          OR u.profile.location.city = $city
        )
      ORDER BY u.stats.followerCount DESC
      LIMIT $limit
    `;

    const result = await cluster.query(statement, {
      parameters: {
        userId,
        country: userLocation.country,
        city: userLocation.city || '',
        limit,
      },
    });

    return result.rows.map(row => ({
      userId: row.id,
      username: row.username,
      profile: row.profile,
      stats: row.stats,
    }));
  } catch (error) {
    console.error('Error finding nearby travelers:', error);
    return [];
  }
}

/**
 * Get personalized recommendations for user
 * Combines multiple recommendation sources
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Personalized recommendations
 */
export async function getPersonalizedRecommendations(userId) {
  try {
    const [trending, popular, trips, travelers] = await Promise.all([
      getTrendingDestinations({ limit: 5 }),
      getPopularPosts({ limit: 10, timeframe: '7d' }),
      getRecommendedTrips(userId, { limit: 5 }),
      getNearbyTravelers(userId, { limit: 5 }),
    ]);

    return {
      trendingDestinations: trending,
      popularPosts: popular,
      recommendedTrips: trips,
      nearbyTravelers: travelers,
    };
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    return {
      trendingDestinations: [],
      popularPosts: [],
      recommendedTrips: [],
      nearbyTravelers: [],
    };
  }
}

/**
 * Get activity feed (recent activities from network)
 * @param {string} userId - User ID
 * @param {Object} options - Options
 * @returns {Promise<Array>} List of activities
 */
export async function getActivityFeed(userId, options = {}) {
  const { limit = 20, offset = 0 } = options;

  const cluster = dbConnection.getCluster();
  const socialBucket = process.env.BUCKET_SOCIAL || 'travel_social';
  const tripsBucket = process.env.BUCKET_TRIPS || 'travel_trips';
  const contentBucket = process.env.BUCKET_CONTENT || 'travel_content';

  // Get recent trips and posts from followed users
  const statement = `
    SELECT 'trip' as activityType, t.id, t.title as content, t.userId, t.createdAt, t.destinations
    FROM ${tripsBucket} t
    WHERE t.type = 'trip'
      AND t.visibility = 'public'
      AND t.userId IN (
        SELECT RAW c.followingId
        FROM ${socialBucket} c
        WHERE c.followerId = $userId AND c.status = 'active'
      )
      AND t.createdAt > $cutoffDate
    
    UNION ALL
    
    SELECT 'post' as activityType, p.id, p.content.text as content, p.authorId as userId, p.createdAt, NULL as destinations
    FROM ${contentBucket} p
    WHERE p.type = 'post'
      AND p.visibility = 'public'
      AND p.authorId IN (
        SELECT RAW c.followingId
        FROM ${socialBucket} c
        WHERE c.followerId = $userId AND c.status = 'active'
      )
      AND p.createdAt > $cutoffDate
    
    ORDER BY createdAt DESC
    LIMIT $limit OFFSET $offset
  `;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30); // Last 30 days

  try {
    const result = await cluster.query(statement, {
      parameters: {
        userId,
        cutoffDate: cutoffDate.toISOString(),
        limit,
        offset,
      },
    });

    return result.rows;
  } catch (error) {
    console.error('Error getting activity feed:', error);
    return [];
  }
}

/**
 * Get destinations similar to a given destination
 * Based on categories, tags, and location
 * @param {string} destinationId - Destination ID
 * @param {number} limit - Results limit
 * @returns {Promise<Array>} List of similar destinations
 */
export async function getSimilarDestinations(destinationId, limit = 5) {
  const cluster = dbConnection.getCluster();
  const bucketName = process.env.BUCKET_TRIPS || 'travel_trips';

  // Get the source destination
  const sourceStatement = `
    SELECT d.categories, d.tags, d.country
    FROM ${bucketName} d
    WHERE META(d).id = $destinationId
  `;

  try {
    const sourceResult = await cluster.query(sourceStatement, {
      parameters: { destinationId },
    });

    if (sourceResult.rows.length === 0) {
      return [];
    }

    const source = sourceResult.rows[0];

    // Find similar destinations
    const statement = `
      SELECT META(d).id, d.*,
        ARRAY_LENGTH(ARRAY_INTERSECT(d.categories, $categories)) as categoryMatch,
        ARRAY_LENGTH(ARRAY_INTERSECT(d.tags, $tags)) as tagMatch
      FROM ${bucketName} d
      WHERE d.type = 'destination'
        AND META(d).id != $destinationId
        AND (
          ARRAY_LENGTH(ARRAY_INTERSECT(d.categories, $categories)) > 0
          OR ARRAY_LENGTH(ARRAY_INTERSECT(d.tags, $tags)) > 0
          OR d.country = $country
        )
      ORDER BY (categoryMatch * 2 + tagMatch) DESC, d.stats.tripCount DESC
      LIMIT $limit
    `;

    const result = await cluster.query(statement, {
      parameters: {
        destinationId,
        categories: source.categories || [],
        tags: source.tags || [],
        country: source.country,
        limit,
      },
    });

    return result.rows.map(row => row.d);
  } catch (error) {
    console.error('Error getting similar destinations:', error);
    return [];
  }
}

export default {
  getTrendingDestinations,
  getPopularPosts,
  getRecommendedTrips,
  getNearbyTravelers,
  getPersonalizedRecommendations,
  getActivityFeed,
  getSimilarDestinations,
};
