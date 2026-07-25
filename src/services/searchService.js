/**
 * Search Service
 * Handles unified search across users, destinations, and posts
 */

import dbConnection from '../config/database.js';

/**
 * Unified search across all content types
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Object>} Search results grouped by type
 */
export async function unifiedSearch(query, options = {}) {
  const {
    types = ['users', 'destinations', 'posts'],
    limit = 10,
    offset = 0,
  } = options;

  const results = {
    users: [],
    destinations: [],
    posts: [],
    query,
    total: 0,
  };

  // Parse limit to ensure it's a number
  const parsedLimit = parseInt(limit) || 10;

  // Search users
  if (types.includes('users')) {
    results.users = await searchUsers(query, parsedLimit);
  }

  // Search destinations
  if (types.includes('destinations')) {
    results.destinations = await searchDestinations(query, parsedLimit);
  }

  // Search posts
  if (types.includes('posts')) {
    results.posts = await searchPosts(query, parsedLimit);
  }

  results.total = results.users.length + results.destinations.length + results.posts.length;

  return results;
}

/**
 * Search users by username, name, or location
 * @param {string} query - Search query
 * @param {number} limit - Results limit
 * @returns {Promise<Array>} List of users
 */
async function searchUsers(query, limit = 10) {
  const cluster = dbConnection.getCluster();
  const bucketName = process.env.BUCKET_USERS || 'travel_users';

  const statement = `
    SELECT u.id, u.username, u.profile, u.interests, u.stats
    FROM \`${bucketName}\` u
    WHERE u.type = 'user'
      AND u.status = 'active'
      AND (
        LOWER(u.username) LIKE $query
        OR LOWER(u.profile.firstName) LIKE $query
        OR LOWER(u.profile.lastName) LIKE $query
        OR LOWER(u.profile.bio) LIKE $query
        OR LOWER(u.profile.location.city) LIKE $query
        OR LOWER(u.profile.location.country) LIKE $query
      )
    ORDER BY u.stats.followerCount DESC
    LIMIT $limit
  `;

  try {
    const result = await cluster.query(statement, {
      parameters: {
        query: `%${query.toLowerCase()}%`,
        limit,
      },
    });

    return result.rows.map(row => ({
      type: 'user',
      id: row.id,
      username: row.username,
      profile: row.profile,
      stats: row.stats,
    }));
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
}

/**
 * Search destinations by name, country, description, or tags
 * @param {string} query - Search query
 * @param {number} limit - Results limit
 * @returns {Promise<Array>} List of destinations
 */
async function searchDestinations(query, limit = 10) {
  const cluster = dbConnection.getCluster();
  const bucketName = process.env.BUCKET_TRIPS || 'travel_trips';

  const statement = `
    SELECT META(d).id, d.id as destId, d.name, d.country, d.countryCode, 
           d.slug, d.summary, d.categories, d.tags, d.stats, d.images
    FROM \`${bucketName}\` d
    WHERE d.type = 'destination'
      AND (
        LOWER(d.name) LIKE $query
        OR LOWER(d.country) LIKE $query
        OR LOWER(d.description) LIKE $query
        OR LOWER(d.summary) LIKE $query
        OR ANY tag IN d.tags SATISFIES LOWER(tag) LIKE $query END
      )
    ORDER BY d.stats.tripCount DESC, d.stats.viewCount DESC
    LIMIT $limit
  `;

  try {
    const result = await cluster.query(statement, {
      parameters: {
        query: `%${query.toLowerCase()}%`,
        limit,
      },
    });

    return result.rows.map(row => ({
      type: 'destination',
      id: row.id,
      name: row.name,
      country: row.country,
      countryCode: row.countryCode,
      slug: row.slug,
      summary: row.summary,
      categories: row.categories,
      tags: row.tags,
      stats: row.stats,
      images: row.images?.[0] || null,
    }));
  } catch (error) {
    console.error('Error searching destinations:', error);
    return [];
  }
}

/**
 * Search posts by content, tags, or location
 * @param {string} query - Search query
 * @param {number} limit - Results limit
 * @returns {Promise<Array>} List of posts
 */
async function searchPosts(query, limit = 10) {
  const cluster = dbConnection.getCluster();
  const bucketName = process.env.BUCKET_CONTENT || 'travel_content';

  const statement = `
    SELECT META(p).id, p.id as postId, p.authorId, p.authorUsername, p.authorPhoto,
           p.postType, p.content, p.location, p.tags, p.stats, p.createdAt
    FROM \`${bucketName}\` p
    WHERE p.type = 'post'
      AND p.visibility = 'public'
      AND (
        LOWER(p.content.text) LIKE $query
        OR LOWER(p.location.name) LIKE $query
        OR ANY tag IN p.tags SATISFIES LOWER(tag) LIKE $query END
      )
    ORDER BY p.createdAt DESC
    LIMIT $limit
  `;

  try {
    const result = await cluster.query(statement, {
      parameters: {
        query: `%${query.toLowerCase()}%`,
        limit,
      },
    });

    return result.rows.map(row => ({
      type: 'post',
      id: row.id,
      authorId: row.authorId,
      authorUsername: row.authorUsername,
      authorPhoto: row.authorPhoto,
      postType: row.postType,
      content: row.content,
      location: row.location,
      tags: row.tags,
      stats: row.stats,
      createdAt: row.createdAt,
    }));
  } catch (error) {
    console.error('Error searching posts:', error);
    return [];
  }
}

/**
 * Search with autocomplete suggestions
 * @param {string} query - Partial query
 * @param {string} type - Type to search (users, destinations, posts)
 * @param {number} limit - Results limit
 * @returns {Promise<Array>} List of suggestions
 */
export async function autocomplete(query, type = 'destinations', limit = 5) {
  if (query.length < 2) {
    return [];
  }

  const cluster = dbConnection.getCluster();
  let statement;
  let bucketName;

  switch (type) {
    case 'users':
      bucketName = process.env.BUCKET_USERS || 'travel_users';
      statement = `
        SELECT u.username, u.profile.firstName, u.profile.lastName
        FROM ${bucketName} u
        WHERE u.type = 'user'
          AND u.status = 'active'
          AND LOWER(u.username) LIKE $query
        LIMIT $limit
      `;
      break;

    case 'destinations':
      bucketName = process.env.BUCKET_TRIPS || 'travel_trips';
      statement = `
        SELECT d.name, d.country, d.countryCode, d.slug
        FROM ${bucketName} d
        WHERE d.type = 'destination'
          AND LOWER(d.name) LIKE $query
        ORDER BY d.stats.tripCount DESC
        LIMIT $limit
      `;
      break;

    case 'tags':
      bucketName = process.env.BUCKET_CONTENT || 'travel_content';
      statement = `
        SELECT DISTINCT ARRAY_FLATTEN(ARRAY tag FOR tag IN p.tags END, 1) as tags
        FROM ${bucketName} p
        WHERE p.type = 'post'
        LIMIT 100
      `;
      break;

    default:
      return [];
  }

  try {
    const result = await cluster.query(statement, {
      parameters: {
        query: `${query.toLowerCase()}%`,
        limit,
      },
    });

    if (type === 'tags') {
      // Filter and return matching tags
      const allTags = result.rows.flatMap(row => row.tags || []);
      const uniqueTags = [...new Set(allTags)];
      return uniqueTags
        .filter(tag => tag.toLowerCase().startsWith(query.toLowerCase()))
        .slice(0, limit);
    }

    return result.rows;
  } catch (error) {
    console.error('Error in autocomplete:', error);
    return [];
  }
}

/**
 * Advanced search with filters
 * @param {Object} filters - Search filters
 * @returns {Promise<Object>} Filtered results
 */
export async function advancedSearch(filters) {
  const {
    query,
    type,
    country,
    category,
    tags,
    dateFrom,
    dateTo,
    sortBy = 'relevance',
    limit = 20,
    offset = 0,
  } = filters;

  const cluster = dbConnection.getCluster();
  let results = [];

  if (type === 'destinations' || !type) {
    results = await advancedSearchDestinations({
      query,
      country,
      category,
      tags,
      sortBy,
      limit,
      offset,
    });
  } else if (type === 'posts') {
    results = await advancedSearchPosts({
      query,
      tags,
      dateFrom,
      dateTo,
      sortBy,
      limit,
      offset,
    });
  } else if (type === 'users') {
    results = await searchUsers(query, limit);
  }

  return {
    results,
    filters: {
      query,
      type,
      country,
      category,
      tags,
      dateFrom,
      dateTo,
    },
    pagination: {
      limit,
      offset,
      count: results.length,
    },
  };
}

/**
 * Advanced destination search with filters
 * @private
 */
async function advancedSearchDestinations(options) {
  const { query, country, category, tags, sortBy, limit, offset } = options;

  const cluster = dbConnection.getCluster();
  const bucketName = process.env.BUCKET_TRIPS || 'travel_trips';

  const conditions = ['d.type = "destination"'];
  const parameters = { limit, offset };

  if (query) {
    conditions.push('(LOWER(d.name) LIKE $query OR LOWER(d.description) LIKE $query)');
    parameters.query = `%${query.toLowerCase()}%`;
  }

  if (country) {
    conditions.push('LOWER(d.country) = $country');
    parameters.country = country.toLowerCase();
  }

  if (category) {
    conditions.push('$category IN d.categories');
    parameters.category = category;
  }

  if (tags && tags.length > 0) {
    conditions.push('ANY tag IN d.tags SATISFIES tag IN $tags END');
    parameters.tags = tags;
  }

  const whereClause = conditions.join(' AND ');
  
  let orderByClause;
  switch (sortBy) {
    case 'popularity':
      orderByClause = 'd.stats.tripCount DESC, d.stats.viewCount DESC';
      break;
    case 'name':
      orderByClause = 'd.name ASC';
      break;
    default:
      orderByClause = 'd.stats.tripCount DESC';
  }

  const statement = `
    SELECT META(d).id, d.*
    FROM ${bucketName} d
    WHERE ${whereClause}
    ORDER BY ${orderByClause}
    LIMIT $limit OFFSET $offset
  `;

  try {
    const result = await cluster.query(statement, { parameters });
    return result.rows.map(row => row.d || row);
  } catch (error) {
    console.error('Error in advanced destination search:', error);
    return [];
  }
}

/**
 * Advanced post search with filters
 * @private
 */
async function advancedSearchPosts(options) {
  const { query, tags, dateFrom, dateTo, sortBy, limit, offset } = options;

  const cluster = dbConnection.getCluster();
  const bucketName = process.env.BUCKET_CONTENT || 'travel_content';

  const conditions = ['p.type = "post"', 'p.visibility = "public"'];
  const parameters = { limit, offset };

  if (query) {
    conditions.push('LOWER(p.content.text) LIKE $query');
    parameters.query = `%${query.toLowerCase()}%`;
  }

  if (tags && tags.length > 0) {
    conditions.push('ANY tag IN p.tags SATISFIES tag IN $tags END');
    parameters.tags = tags;
  }

  if (dateFrom) {
    conditions.push('p.createdAt >= $dateFrom');
    parameters.dateFrom = dateFrom;
  }

  if (dateTo) {
    conditions.push('p.createdAt <= $dateTo');
    parameters.dateTo = dateTo;
  }

  const whereClause = conditions.join(' AND ');
  
  let orderByClause;
  switch (sortBy) {
    case 'popular':
      orderByClause = 'p.stats.likeCount DESC, p.stats.commentCount DESC';
      break;
    case 'recent':
      orderByClause = 'p.createdAt DESC';
      break;
    default:
      orderByClause = 'p.createdAt DESC';
  }

  const statement = `
    SELECT META(p).id, p.*
    FROM ${bucketName} p
    WHERE ${whereClause}
    ORDER BY ${orderByClause}
    LIMIT $limit OFFSET $offset
  `;

  try {
    const result = await cluster.query(statement, { parameters });
    return result.rows.map(row => row.p || row);
  } catch (error) {
    console.error('Error in advanced post search:', error);
    return [];
  }
}

export default {
  unifiedSearch,
  autocomplete,
  advancedSearch,
};
