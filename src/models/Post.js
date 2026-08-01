/**
 * Post Document Model
 * Bucket: travel_content
 * Document Key Pattern: post::{uuid}
 */

import { v4 as uuidv4 } from 'uuid';

export class Post {
  /**
   * Create a new post document structure
   * @param {Object} data - Post data
   * @returns {Object} Post document
   */
  static create(data) {
    const now = new Date().toISOString();
    
    return {
      id: data.id || uuidv4(),
      type: 'post',
      authorId: data.authorId,
      authorUsername: data.authorUsername, // Denormalized for quick access
      authorPhoto: data.authorPhoto || null, // Denormalized
      postType: data.postType || 'text', // 'text', 'photo', 'video', 'checkin', 'review'
      content: {
        text: data.content?.text || '',
        media: data.content?.media || [], // Array of { type: 'image'/'video', url, caption }
      },
      tripId: data.tripId || null, // Associated trip (optional)
      destinationId: data.destinationId || null, // Associated destination (optional)
      destinationName: data.destinationName || null, // Denormalized destination name
      destinationCountry: data.destinationCountry || null, // Denormalized destination country
      location: data.location || null, // { name, country, coordinates: { lat, lon } }
      tags: data.tags || [], // ['travel', 'food', 'adventure']
      mentions: data.mentions || [], // Array of { userId, username }
      visibility: data.visibility || 'public', // 'public', 'connections', 'private'
      stats: {
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        shareCount: 0,
      },
      interactions: {
        likes: [], // Array of userIds (for quick lookup)
        comments: [], // Array of comment objects
      },
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Generate document key for post
   * @param {string} postId - Post ID
   * @returns {string} Document key
   */
  static getKey(postId) {
    return `post::${postId}`;
  }

  /**
   * Validate post data
   * @param {Object} data - Post data to validate
   * @returns {Object} Validation result { valid: boolean, errors: string[] }
   */
  static validate(data) {
    const errors = [];

    if (!data.authorId) {
      errors.push('Author ID is required');
    }

    if (!data.content?.text && (!data.content?.media || data.content.media.length === 0)) {
      errors.push('Post must have text content or media');
    }

    if (data.content?.text && data.content.text.length > 5000) {
      errors.push('Post text cannot exceed 5000 characters');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Add a comment to the post
   * @param {Object} post - Post document
   * @param {Object} comment - Comment data
   * @returns {Object} Updated post
   */
  static addComment(post, comment) {
    // Khởi tạo interactions nếu chưa có (cho posts cũ)
    if (!post.interactions) {
      post.interactions = {
        likes: [],
        comments: [],
      };
    }
    if (!post.stats) {
      post.stats = {
        likeCount: 0,
        commentCount: 0,
        viewCount: 0,
      };
    }

    const commentObj = {
      id: uuidv4(),
      userId: comment.userId,
      username: comment.username,
      userPhoto: comment.userPhoto || null,
      text: comment.text,
      createdAt: new Date().toISOString(),
    };

    post.interactions.comments.push(commentObj);
    post.stats.commentCount = post.interactions.comments.length;
    post.updatedAt = new Date().toISOString();

    return post;
  }

  /**
   * Toggle like on the post
   * @param {Object} post - Post document
   * @param {string} userId - User ID
   * @returns {Object} Updated post
   */
  static toggleLike(post, userId) {
    const likeIndex = post.interactions.likes.indexOf(userId);
    
    if (likeIndex > -1) {
      // Unlike
      post.interactions.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.interactions.likes.push(userId);
    }

    post.stats.likeCount = post.interactions.likes.length;
    post.updatedAt = new Date().toISOString();

    return post;
  }
}

export default Post;
