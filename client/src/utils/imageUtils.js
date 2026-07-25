/**
 * Image utility functions
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Get full URL for profile photo
 * @param {string} photoPath - Relative photo path from backend
 * @returns {string} Full URL to photo
 */
export const getProfilePhotoUrl = (photoPath) => {
  if (!photoPath) return null;
  
  // If already full URL, return as is
  if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
    return photoPath;
  }
  
  // If starts with /, concatenate with API_URL
  if (photoPath.startsWith('/')) {
    return `${API_URL}${photoPath}`;
  }
  
  // Otherwise, add both / and API_URL
  return `${API_URL}/${photoPath}`;
};

/**
 * Get full URL for trip/destination image
 * @param {string} imagePath - Relative image path from backend
 * @returns {string} Full URL to image
 */
export const getImageUrl = (imagePath) => {
  return getProfilePhotoUrl(imagePath);
};
