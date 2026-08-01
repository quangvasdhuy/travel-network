/**
 * Cloudinary Configuration
 * Handles cloud-based image storage
 */

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Storage for profile photos
 * Folder: travelnetwork/profiles
 * Format: jpg (auto-converted)
 * Max size: 5MB
 */
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'travelnetwork/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
  },
});

/**
 * Storage for post media (images & videos)
 * Folder: travelnetwork/posts
 * Max size: 50MB
 */
const postStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video');
    return {
      folder: 'travelnetwork/posts',
      resource_type: isVideo ? 'video' : 'image',
      allowed_formats: isVideo
        ? ['mp4', 'mov', 'avi']
        : ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    };
  },
});

// File filter - chỉ chấp nhận ảnh cho profile
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const mimetype = allowedTypes.test(file.mimetype);
  if (mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// File filter - chấp nhận ảnh và video cho posts
const mediaFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi/;
  const mimetype = allowedTypes.test(file.mimetype);
  if (mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only images and videos are allowed'));
  }
};

// Multer instance cho profile photo (single, 5MB)
export const uploadProfilePhoto = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFileFilter,
});

// Multer instance cho post media (multiple files, 50MB each)
export const uploadPostMedia = multer({
  storage: postStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: mediaFileFilter,
});

/**
 * Xóa ảnh khỏi Cloudinary theo public_id
 * @param {string} publicId - Cloudinary public ID của ảnh
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Failed to delete from Cloudinary:', error.message);
  }
};

export default cloudinary;
