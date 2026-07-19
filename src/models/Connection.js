/**
 * Connection Document Model
 * Bucket: travel_social
 * Document Key Pattern: connection::{followerId}::{followingId}
 */

export class Connection {
  /**
   * Create a new connection document structure
   * @param {Object} data - Connection data
   * @returns {Object} Connection document
   */
  static create(data) {
    const now = new Date().toISOString();
    
    return {
      type: 'connection',
      followerId: data.followerId, // User who is following
      followerUsername: data.followerUsername, // Denormalized
      followingId: data.followingId, // User being followed
      followingUsername: data.followingUsername, // Denormalized
      status: 'active', // 'active', 'blocked'
      createdAt: now,
    };
  }

  /**
   * Generate document key for connection
   * @param {string} followerId - Follower user ID
   * @param {string} followingId - Following user ID
   * @returns {string} Document key
   */
  static getKey(followerId, followingId) {
    return `connection::${followerId}::${followingId}`;
  }

  /**
   * Validate connection data
   * @param {Object} data - Connection data to validate
   * @returns {Object} Validation result { valid: boolean, errors: string[] }
   */
  static validate(data) {
    const errors = [];

    if (!data.followerId) {
      errors.push('Follower ID is required');
    }

    if (!data.followingId) {
      errors.push('Following ID is required');
    }

    if (data.followerId === data.followingId) {
      errors.push('Users cannot follow themselves');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export default Connection;
