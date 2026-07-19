/**
 * Destination Document Model
 * Bucket: travel_trips
 * Document Key Pattern: destination::{countryCode}::{citySlug}
 */

import { v4 as uuidv4 } from 'uuid';

export class Destination {
  /**
   * Create a new destination document structure
   * @param {Object} data - Destination data
   * @returns {Object} Destination document
   */
  static create(data) {
    const now = new Date().toISOString();
    
    return {
      id: data.id || uuidv4(),
      type: 'destination',
      name: data.name, // City/Place name
      slug: data.slug || this.createSlug(data.name),
      country: data.country,
      countryCode: data.countryCode, // ISO 3166-1 alpha-2 (e.g., 'US', 'FR')
      region: data.region || '', // State/Province/Region
      coordinates: {
        lat: data.coordinates?.lat || 0,
        lon: data.coordinates?.lon || 0,
      },
      description: data.description || '',
      summary: data.summary || '', // Short description for search results
      images: data.images || [], // Array of { url, caption, credit }
      categories: data.categories || [], // ['beach', 'city', 'mountains', 'cultural']
      tags: data.tags || [], // ['romantic', 'family-friendly', 'adventure', 'budget']
      climate: {
        type: data.climate?.type || '', // 'tropical', 'temperate', 'arid', etc.
        bestMonths: data.climate?.bestMonths || [], // [6, 7, 8] for June, July, August
      },
      travelInfo: {
        currency: data.travelInfo?.currency || '',
        languages: data.travelInfo?.languages || [],
        timezone: data.travelInfo?.timezone || '',
        visaRequired: data.travelInfo?.visaRequired || false,
      },
      stats: {
        tripCount: 0, // Number of trips including this destination
        postCount: 0, // Number of posts about this destination
        viewCount: 0,
        rating: 0, // Average rating
        ratingCount: 0,
      },
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Generate document key for destination
   * @param {string} countryCode - Country code
   * @param {string} slug - Destination slug
   * @returns {string} Document key
   */
  static getKey(countryCode, slug) {
    return `destination::${countryCode}::${slug}`;
  }

  /**
   * Create slug from destination name
   * @param {string} name - Destination name
   * @returns {string} Slug
   */
  static createSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Validate destination data
   * @param {Object} data - Destination data to validate
   * @returns {Object} Validation result { valid: boolean, errors: string[] }
   */
  static validate(data) {
    const errors = [];

    if (!data.name || data.name.length < 2) {
      errors.push('Destination name is required (minimum 2 characters)');
    }

    if (!data.country) {
      errors.push('Country is required');
    }

    if (!data.countryCode || data.countryCode.length !== 2) {
      errors.push('Valid country code is required (ISO 3166-1 alpha-2)');
    }

    if (!data.coordinates || typeof data.coordinates.lat !== 'number' || typeof data.coordinates.lon !== 'number') {
      errors.push('Valid coordinates (lat, lon) are required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Update destination statistics
   * @param {Object} destination - Destination document
   * @param {Object} updates - Stats to update { tripCount, postCount, viewCount }
   * @returns {Object} Updated destination
   */
  static updateStats(destination, updates) {
    if (updates.tripCount !== undefined) {
      destination.stats.tripCount += updates.tripCount;
    }
    if (updates.postCount !== undefined) {
      destination.stats.postCount += updates.postCount;
    }
    if (updates.viewCount !== undefined) {
      destination.stats.viewCount += updates.viewCount;
    }

    destination.updatedAt = new Date().toISOString();
    return destination;
  }
}

export default Destination;
