/**
 * Destination Service
 * Handles destination operations
 */

import dbConnection from '../config/database.js';
import { Destination } from '../models/Destination.js';
import { DestinationQueries } from '../utils/queryHelpers.js';

/**
 * Create a new destination
 * @param {Object} destinationData - Destination data
 * @returns {Promise<Object>} Created destination
 */
export async function createDestination(destinationData) {
  // Validate destination data
  const validation = Destination.validate(destinationData);
  if (!validation.valid) {
    throw {
      statusCode: 400,
      message: 'Dữ liệu điểm đến không hợp lệ',
      details: validation.errors,
    };
  }

  // Create destination document
  const destination = Destination.create(destinationData);

  // Save to database
  const tripsBucket = dbConnection.getBucket('trips');
  const collection = tripsBucket.defaultCollection;

  const key = Destination.getKey(destination.countryCode, destination.slug);

  try {
    // Check if destination already exists
    try {
      await collection.get(key);
      throw {
        statusCode: 409,
        message: 'Điểm đến với mã quốc gia và tên này đã tồn tại',
      };
    } catch (error) {
      if (error.name !== 'DocumentNotFoundError') {
        throw error;
      }
      // Destination doesn't exist, proceed with creation
    }

    await collection.insert(key, destination);
    return destination;
  } catch (error) {
    if (error.statusCode) throw error;
    console.error('Error creating destination:', error);
    throw {
      statusCode: 500,
      message: 'Tạo điểm đến thất bại',
    };
  }
}

/**
 * Get destination by ID
 * @param {string} destinationId - Destination ID
 * @returns {Promise<Object>} Destination
 */
export async function getDestinationById(destinationId) {
  const tripsBucket = dbConnection.getBucket('trips');
  const collection = tripsBucket.defaultCollection;

  try {
    const result = await collection.get(destinationId);
    return result.content;
  } catch (error) {
    if (error.name === 'DocumentNotFoundError') {
      throw {
        statusCode: 404,
        message: 'Không tìm thấy điểm đến',
      };
    }
    throw error;
  }
}

/**
 * Get destination by country code and slug
 * @param {string} countryCode - Country code
 * @param {string} slug - Destination slug
 * @returns {Promise<Object>} Destination
 */
export async function getDestinationBySlug(countryCode, slug) {
  const destination = await DestinationQueries.findBySlug(countryCode, slug);

  if (!destination) {
    throw {
      statusCode: 404,
      message: 'Không tìm thấy điểm đến',
    };
  }

  return destination.d || destination;
}

/**
 * Get all destinations with optional filters
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} List of destinations
 */
export async function getAllDestinations(filters = {}) {
  const {
    country,
    category,
    tag,
    limit = 50,
    offset = 0,
    sortBy = 'name',
    order = 'asc',
  } = filters;

  const tripsBucket = dbConnection.getBucket('trips');
  const bucketName = tripsBucket.bucket.name;

  // Build query
  let whereConditions = ['d.type = "destination"'];
  const parameters = { limit: parseInt(limit), offset: parseInt(offset) };

  if (country) {
    whereConditions.push('LOWER(d.country) = $country');
    parameters.country = country.toLowerCase();
  }

  if (category) {
    whereConditions.push('$category IN d.categories');
    parameters.category = category;
  }

  if (tag) {
    whereConditions.push('$tag IN d.tags');
    parameters.tag = tag;
  }

  const whereClause = whereConditions.join(' AND ');

  // Determine sort field
  const sortField = sortBy === 'popularity' ? 'd.stats.tripCount' : `d.${sortBy}`;
  const orderDirection = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const statement = `
    SELECT META(d).id, d.*
    FROM ${bucketName} d
    WHERE ${whereClause}
    ORDER BY ${sortField} ${orderDirection}
    LIMIT $limit OFFSET $offset
  `;

  try {
    const cluster = dbConnection.getCluster();
    const result = await cluster.query(statement, { parameters });
    return result.rows.map(row => row.d || row);
  } catch (error) {
    console.error('Error fetching destinations:', error);
    throw {
      statusCode: 500,
      message: 'Không tải được danh sách điểm đến',
    };
  }
}

/**
 * Search destinations
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Array>} List of matching destinations
 */
export async function searchDestinations(query, options = {}) {
  const { limit = 20 } = options;

  const destinations = await DestinationQueries.search(query, limit);

  return destinations.map((destDoc) => destDoc.d || destDoc);
}

/**
 * Get popular destinations
 * @param {number} limit - Number of destinations to return
 * @returns {Promise<Array>} List of popular destinations
 */
export async function getPopularDestinations(limit = 20) {
  const destinations = await DestinationQueries.getPopular(limit);

  return destinations.map((destDoc) => destDoc.d || destDoc);
}

/**
 * Update destination
 * @param {string} countryCode - Country code
 * @param {string} slug - Destination slug
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated destination
 */
export async function updateDestination(countryCode, slug, updates) {
  const tripsBucket = dbConnection.getBucket('trips');
  const collection = tripsBucket.defaultCollection;

  const key = Destination.getKey(countryCode, slug);

  // Define allowed fields to update
  const allowedUpdates = [
    'name',
    'description',
    'summary',
    'images',
    'categories',
    'tags',
    'climate',
    'travelInfo',
  ];

  // Build mutation operations
  const mutations = [];

  for (const [field, value] of Object.entries(updates)) {
    if (allowedUpdates.includes(field)) {
      mutations.push({
        opcode: 'dict_upsert',
        path: field,
        value: value,
      });
    }
  }

  if (mutations.length === 0) {
    throw {
      statusCode: 400,
      message: 'Không có trường hợp lệ nào để cập nhật',
    };
  }

  // Add updated timestamp
  mutations.push({
    opcode: 'dict_upsert',
    path: 'updatedAt',
    value: new Date().toISOString(),
  });

  try {
    await collection.mutateIn(key, mutations);

    // Get updated destination
    const result = await collection.get(key);
    return result.content;
  } catch (error) {
    if (error.name === 'DocumentNotFoundError') {
      throw {
        statusCode: 404,
        message: 'Không tìm thấy điểm đến',
      };
    }
    throw error;
  }
}

/**
 * Delete destination
 * @param {string} countryCode - Country code
 * @param {string} slug - Destination slug
 * @returns {Promise<void>}
 */
export async function deleteDestination(countryCode, slug) {
  const tripsBucket = dbConnection.getBucket('trips');
  const collection = tripsBucket.defaultCollection;

  const key = Destination.getKey(countryCode, slug);

  try {
    await collection.remove(key);
  } catch (error) {
    if (error.name === 'DocumentNotFoundError') {
      throw {
        statusCode: 404,
        message: 'Không tìm thấy điểm đến',
      };
    }
    throw error;
  }
}

/**
 * Update destination statistics
 * @param {string} destinationId - Destination ID
 * @param {Object} statsUpdate - Statistics to update
 * @returns {Promise<Object>} Updated destination
 */
export async function updateDestinationStats(destinationId, statsUpdate) {
  const tripsBucket = dbConnection.getBucket('trips');
  const collection = tripsBucket.defaultCollection;

  const mutations = [];

  if (statsUpdate.tripCount !== undefined) {
    mutations.push({
      opcode: 'counter',
      path: 'stats.tripCount',
      delta: statsUpdate.tripCount,
    });
  }

  if (statsUpdate.postCount !== undefined) {
    mutations.push({
      opcode: 'counter',
      path: 'stats.postCount',
      delta: statsUpdate.postCount,
    });
  }

  if (statsUpdate.viewCount !== undefined) {
    mutations.push({
      opcode: 'counter',
      path: 'stats.viewCount',
      delta: statsUpdate.viewCount,
    });
  }

  mutations.push({
    opcode: 'dict_upsert',
    path: 'updatedAt',
    value: new Date().toISOString(),
  });

  try {
    await collection.mutateIn(destinationId, mutations);

    // Get updated destination
    const result = await collection.get(destinationId);
    return result.content;
  } catch (error) {
    if (error.name === 'DocumentNotFoundError') {
      throw {
        statusCode: 404,
        message: 'Không tìm thấy điểm đến',
      };
    }
    throw error;
  }
}

/**
 * Get destinations by country
 * @param {string} country - Country name
 * @param {Object} options - Pagination options
 * @returns {Promise<Array>} List of destinations
 */
export async function getDestinationsByCountry(country, options = {}) {
  return await getAllDestinations({ ...options, country });
}

/**
 * Get destinations by category
 * @param {string} category - Category (beach, city, mountains, etc.)
 * @param {Object} options - Pagination options
 * @returns {Promise<Array>} List of destinations
 */
export async function getDestinationsByCategory(category, options = {}) {
  return await getAllDestinations({ ...options, category });
}

export default {
  createDestination,
  getDestinationById,
  getDestinationBySlug,
  getAllDestinations,
  searchDestinations,
  getPopularDestinations,
  updateDestination,
  deleteDestination,
  updateDestinationStats,
  getDestinationsByCountry,
  getDestinationsByCategory,
};
