/**
 * Image utility functions
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Get full URL for profile photo
 * Supports both Cloudinary URLs (https://res.cloudinary.com/...)
 * and legacy local paths (/uploads/...)
 * @param {string} photoPath - Photo URL or relative path from backend
 * @returns {string|null} Full URL to photo
 */
export const getProfilePhotoUrl = (photoPath) => {
  if (!photoPath) return null;

  // Already a full URL (Cloudinary or any external URL)
  if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
    return photoPath;
  }

  // Legacy local path: prepend API server URL
  if (photoPath.startsWith('/')) {
    return `${API_URL}${photoPath}`;
  }

  return `${API_URL}/${photoPath}`;
};

/**
 * Get full URL for trip/destination/post image
 * @param {string} imagePath - Image URL or relative path from backend
 * @returns {string|null} Full URL to image
 */
export const getImageUrl = (imagePath) => {
  return getProfilePhotoUrl(imagePath);
};
