/**
 * Trip Document Model
 * Bucket: travel_trips
 * Document Key Pattern: trip::{uuid}
 */

import { v4 as uuidv4 } from 'uuid';

export class Trip {
  /**
   * Create a new trip document structure
   * @param {Object} data - Trip data
   * @returns {Object} Trip document
   */
  static create(data) {
    const now = new Date().toISOString();
    
    return {
      id: data.id || uuidv4(),
      type: 'trip',
      userId: data.userId, // Owner of the trip
      title: data.title,
      description: data.description || '',
      destinations: data.destinations || [], // Array of { destinationId, name, country, arrivalDate, departureDate }
      startDate: data.startDate, // ISO date string
      endDate: data.endDate, // ISO date string
      status: data.status || 'planning', // 'planning', 'active', 'completed', 'cancelled'
      visibility: data.visibility || 'public', // 'public', 'connections', 'private'
      itinerary: data.itinerary || [], // Array of { day, date, activities: [], notes: '' }
      budget: {
        total: data.budget?.total || data.budget?.estimated || null,
        estimated: data.budget?.estimated || data.budget?.total || null,
        currency: data.budget?.currency || 'USD',
        breakdown: data.budget?.breakdown || {}, // { accommodation: 0, transport: 0, food: 0, activities: 0 }
      },
      participants: data.participants || [], // Array of { userId, username, status: 'confirmed'/'pending' }
      tags: data.tags || [], // ['solo', 'family', 'adventure', 'beach']
      stats: {
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        shareCount: 0,
      },
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Generate document key for trip
   * @param {string} tripId - Trip ID
   * @returns {string} Document key
   */
  static getKey(tripId) {
    return `trip::${tripId}`;
  }

  /**
   * Validate trip data
   * @param {Object} data - Trip data to validate
   * @returns {Object} Validation result { valid: boolean, errors: string[] }
   */
  static validate(data) {
    const errors = [];

    if (!data.userId) {
      errors.push('User ID is required');
    }

    if (!data.title || data.title.length < 3 || data.title.length > 100) {
      errors.push('Title must be between 3 and 100 characters');
    }

    if (!data.startDate) {
      errors.push('Start date is required');
    }

    if (!data.endDate) {
      errors.push('End date is required');
    }

    if (data.startDate && data.endDate && new Date(data.startDate) > new Date(data.endDate)) {
      errors.push('Start date must be before end date');
    }

    // Destinations can be optional (allow creating trip without destinations)
    // No longer enforce "At least one destination is required"

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate trip duration in days
   * @param {Object} trip - Trip document
   * @returns {number} Duration in days
   */
  static getDuration(trip) {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Check if trip is upcoming
   * @param {Object} trip - Trip document
   * @returns {boolean}
   */
  static isUpcoming(trip) {
    const now = new Date();
    const startDate = new Date(trip.startDate);
    return startDate > now;
  }

  /**
   * Check if trip is active (in progress)
   * @param {Object} trip - Trip document
   * @returns {boolean}
   */
  static isActive(trip) {
    const now = new Date();
    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    return now >= startDate && now <= endDate;
  }
}

export default Trip;
