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
  // Add userId to trip data and map 'name' to 'title' if needed
  const tripWithUser = {
    ...tripData,
    userId,
    title: tripData.title || tripData.name, // Support both 'title' and 'name'
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
/**
 * Get user's trips
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} List of trips
 */
export async function getUserTrips(userId, options = {}) {
  const { limit = 20, offset = 0, status } = options;

  try {
    // Use TripQueries directly - no need for direct collection access
    const trips = await TripQueries.getByUserId(userId, limit, offset);

    // If query returns empty, just return empty array
    if (!trips || trips.length === 0) {
      return [];
    }

    // Extract trip data from query result
    const tripData = trips.map((row) => {
      // Query returns: { id: "meta_id", t: {...tripFields} }
      return row.t || row;
    });

    // Filter by status if provided
    if (status) {
      return tripData.filter((trip) => trip.status === status);
    }

    return tripData;
  } catch (error) {
    console.error('Error in getUserTrips:', error.message);
    console.error('Stack:', error.stack);
    
    // Return empty array instead of throwing to prevent 500 error
    // This allows the frontend to show "no trips" message
    return [];
  }
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

  // Extract trip data and filter to only show public trips
  return trips
    .map((row) => {
      if (row.t) return row.t;
      const { id: metaId, ...trip } = row;
      return trip;
    })
    .filter((trip) => trip.visibility === 'public');
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

  try {
    // Get current trip
    const result = await collection.get(Trip.getKey(tripId));
    const trip = result.content;

    // Check ownership
    if (trip.userId !== userId) {
      throw {
        statusCode: 403,
        message: 'You do not have permission to update this trip',
      };
    }

    // Validate dates if both are being updated
    if (updates.startDate || updates.endDate) {
      const startDate = updates.startDate || trip.startDate;
      const endDate = updates.endDate || trip.endDate;
      
      if (new Date(startDate) > new Date(endDate)) {
        throw {
          statusCode: 400,
          message: 'Start date must be before end date',
        };
      }
    }

    // Update allowed fields
    if (updates.title !== undefined) trip.title = updates.title;
    if (updates.description !== undefined) trip.description = updates.description;
    if (updates.startDate !== undefined) trip.startDate = updates.startDate;
    if (updates.endDate !== undefined) trip.endDate = updates.endDate;
    if (updates.status !== undefined) trip.status = updates.status;
    if (updates.visibility !== undefined) trip.visibility = updates.visibility;
    if (updates.destinations !== undefined) trip.destinations = updates.destinations;
    if (updates.budget !== undefined) {
      trip.budget = {
        ...trip.budget,
        ...updates.budget,
      };
    }
    if (updates.itinerary !== undefined) trip.itinerary = updates.itinerary;
    if (updates.participants !== undefined) trip.participants = updates.participants;
    if (updates.tags !== undefined) trip.tags = updates.tags;

    trip.updatedAt = new Date().toISOString();

    // Save updated trip
    await collection.upsert(Trip.getKey(tripId), trip);

    return trip;
  } catch (error) {
    if (error.statusCode) throw error;
    if (error.name === 'DocumentNotFoundError') {
      throw {
        statusCode: 404,
        message: 'Trip not found',
      };
    }
    console.error('Error updating trip:', error);
    throw {
      statusCode: 500,
      message: 'Failed to update trip',
    };
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

  // Extract trip data
  return trips.map((row) => {
    if (row.t) return row.t;
    const { id: metaId, ...trip } = row;
    return trip;
  });
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
