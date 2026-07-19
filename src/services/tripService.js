/**
 * Trip Service
 * Handles trip planning operations
 */

import dbConnection from '../config/database.js';
import { Trip } from '../models/Trip.js';
import { TripQueries } from '../utils/queryHelpers.js';

/**
 * Create a new trip
 * @param {string} userId - User ID
 * @param {Object} tripData - Trip data
 * @returns {Promise<Object>} Created trip
 */
export async function createTrip(userId, tripData) {
  // Add userId to trip data
  const tripWithUser = {
    ...tripData,
    userId,
  };

  // Validate trip data
  const validation = Trip.validate(tripWithUser);
  if (!validation.valid) {
    throw {
      statusCode: 400,
      message: 'Invalid trip data',
      details: validation.errors,
    };
  }

  // Create trip document
  const trip = Trip.create(tripWithUser);

  // Save to database
  const tripsBucket = dbConnection.getBucket('trips');
  const collection = tripsBucket.defaultCollection;

  try {
    await collection.insert(Trip.getKey(trip.id), trip);

    // Update user trip count
    await updateUserTripCount(userId, 1);

    // Update destination trip counts
    if (trip.destinations && trip.destinations.length > 0) {
      for (const dest of trip.destinations) {
        if (dest.destinationId) {
          await updateDestinationTripCount(dest.destinationId, 1);
        }
      }
    }

    return trip;
  } catch (error) {
    console.error('Error creating trip:', error);
    throw {
      statusCode: 500,
      message: 'Failed to create trip',
    };
  }
}

/**
 * Get trip by ID
 * @param {string} tripId - Trip ID
 * @param {string} requestingUserId - User requesting the trip (for privacy check)
 * @returns {Promise<Object>} Trip
 */
export async function getTripById(tripId, requestingUserId = null) {
  const tripsBucket = dbConnection.getBucket('trips');
  const collection = tripsBucket.defaultCollection;

  try {
    const result = await collection.get(Trip.getKey(tripId));
    const trip = result.content;

    // Check visibility permissions
    if (trip.visibility === 'private' && trip.userId !== requestingUserId) {
      throw {
        statusCode: 403,
        message: 'You do not have permission to view this trip',
      };
    }

    // TODO: Check 'connections' visibility when social features are implemented

    return trip;
  } catch (error) {
    if (error.statusCode) throw error;
    if (error.name === 'DocumentNotFoundError') {
      throw {
        statusCode: 404,
        message: 'Trip not found',
      };
    }
    throw error;
  }
}

/**
 * Get user's trips
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} List of trips
 */
export async function getUserTrips(userId, options = {}) {
  const { limit = 20, offset = 0, status } = options;

  const trips = await TripQueries.getByUserId(userId, limit, offset);

  // Filter by status if provided
  if (status) {
    return trips.filter((tripDoc) => {
      const trip = tripDoc.t || tripDoc;
      return trip.status === status;
    }).map(tripDoc => tripDoc.t || tripDoc);
  }

  return trips.map((tripDoc) => tripDoc.t || tripDoc);
}

/**
 * Get trips by destination
 * @param {string} destinationId - Destination ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} List of trips
 */
export async function getTripsByDestination(destinationId, options = {}) {
  const { limit = 20, offset = 0 } = options;

  const trips = await TripQueries.getByDestination(destinationId, limit, offset);

  // Filter out private trips (only show public and connections)
  return trips.filter((tripDoc) => {
    const trip = tripDoc.t || tripDoc;
    return trip.visibility === 'public';
  }).map(tripDoc => tripDoc.t || tripDoc);
}

/**
 * Update trip
 * @param {string} tripId - Trip ID
 * @param {string} userId - User ID (for authorization)
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated trip
 */
export async function updateTrip(tripId, userId, updates) {
  const tripsBucket = dbConnection.getBucket('trips');
  const collection = tripsBucket.defaultCollection;

  // Get existing trip to verify ownership
  let existingTrip;
  try {
    const result = await collection.get(Trip.getKey(tripId));
    existingTrip = result.content;
  } catch (error) {
    if (error.name === 'DocumentNotFoundError') {
      throw {
        statusCode: 404,
        message: 'Trip not found',
      };
    }
    throw error;
  }

  // Verify ownership
  if (existingTrip.userId !== userId) {
    throw {
      statusCode: 403,
      message: 'You do not have permission to update this trip',
    };
  }

  // Define allowed fields to update
  const allowedUpdates = [
    'title',
    'description',
    'destinations',
    'startDate',
    'endDate',
    'status',
    'visibility',
    'itinerary',
    'budget',
    'participants',
    'tags',
  ];

  // Build mutation operations
  const mutations = [];

  for (const [field, value] of Object.entries(updates)) {
    if (allowedUpdates.includes(field)) {
      // Special validation for dates
      if (field === 'startDate' || field === 'endDate') {
        const startDate = field === 'startDate' ? value : updates.startDate || existingTrip.startDate;
        const endDate = field === 'endDate' ? value : updates.endDate || existingTrip.endDate;
        
        if (new Date(startDate) > new Date(endDate)) {
          throw {
            statusCode: 400,
            message: 'Start date must be before end date',
          };
        }
      }

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
      message: 'No valid fields to update',
    };
  }

  // Add updated timestamp
  mutations.push({
    opcode: 'dict_upsert',
    path: 'updatedAt',
    value: new Date().toISOString(),
  });

  try {
    await collection.mutateIn(Trip.getKey(tripId), mutations);

    // Get updated trip
    const result = await collection.get(Trip.getKey(tripId));
    return result.content;
  } catch (error) {
    throw error;
  }
}

/**
 * Delete trip
 * @param {string} tripId - Trip ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<void>}
 */
export async function deleteTrip(tripId, userId) {
  const tripsBucket = dbConnection.getBucket('trips');
  const collection = tripsBucket.defaultCollection;

  // Get existing trip to verify ownership and get destinations
  let existingTrip;
  try {
    const result = await collection.get(Trip.getKey(tripId));
    existingTrip = result.content;
  } catch (error) {
    if (error.name === 'DocumentNotFoundError') {
      throw {
        statusCode: 404,
        message: 'Trip not found',
      };
    }
    throw error;
  }

  // Verify ownership
  if (existingTrip.userId !== userId) {
    throw {
      statusCode: 403,
      message: 'You do not have permission to delete this trip',
    };
  }

  try {
    await collection.remove(Trip.getKey(tripId));

    // Update user trip count
    await updateUserTripCount(userId, -1);

    // Update destination trip counts
    if (existingTrip.destinations && existingTrip.destinations.length > 0) {
      for (const dest of existingTrip.destinations) {
        if (dest.destinationId) {
          await updateDestinationTripCount(dest.destinationId, -1);
        }
      }
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Update trip status
 * @param {string} tripId - Trip ID
 * @param {string} userId - User ID (for authorization)
 * @param {string} newStatus - New status (planning, active, completed, cancelled)
 * @returns {Promise<Object>} Updated trip
 */
export async function updateTripStatus(tripId, userId, newStatus) {
  const validStatuses = ['planning', 'active', 'completed', 'cancelled'];
  
  if (!validStatuses.includes(newStatus)) {
    throw {
      statusCode: 400,
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
    };
  }

  return await updateTrip(tripId, userId, { status: newStatus });
}

/**
 * Get upcoming trips (for discovery/recommendations)
 * @param {Object} options - Query options
 * @returns {Promise<Array>} List of upcoming trips
 */
export async function getUpcomingTrips(options = {}) {
  const { limit = 50 } = options;

  const now = new Date().toISOString();
  const threeMonthsLater = new Date();
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

  const trips = await TripQueries.getUpcomingTrips(now, threeMonthsLater.toISOString(), limit);

  return trips.map((tripDoc) => tripDoc.t || tripDoc);
}

/**
 * Update user trip count
 * @private
 */
async function updateUserTripCount(userId, delta) {
  try {
    const usersBucket = dbConnection.getBucket('users');
    const collection = usersBucket.defaultCollection;

    await collection.mutateIn(`user::${userId}`, [
      {
        opcode: 'counter',
        path: 'stats.tripCount',
        delta: delta,
      },
    ]);
  } catch (error) {
    console.error('Failed to update user trip count:', error);
    // Don't fail the main operation
  }
}

/**
 * Update destination trip count
 * @private
 */
async function updateDestinationTripCount(destinationId, delta) {
  try {
    const tripsBucket = dbConnection.getBucket('trips');
    const collection = tripsBucket.defaultCollection;

    await collection.mutateIn(destinationId, [
      {
        opcode: 'counter',
        path: 'stats.tripCount',
        delta: delta,
      },
    ]);
  } catch (error) {
    console.error('Failed to update destination trip count:', error);
    // Don't fail the main operation
  }
}

export default {
  createTrip,
  getTripById,
  getUserTrips,
  getTripsByDestination,
  updateTrip,
  deleteTrip,
  updateTripStatus,
  getUpcomingTrips,
};
