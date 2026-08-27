/**
 * Post Service
 * Handles user-generated content posts
 */

import dbConnection from '../config/database.js';
import { Post } from '../models/Post.js';
import { PostQueries } from '../utils/queryHelpers.js';
import destinationService from './destinationService.js';
import couchbase from 'couchbase';

/**
 * Create a new post
 * @param {string} userId - User ID
 * @param {string} username - Username (for denormalization)
 * @param {string} userPhoto - User photo URL
 * @param {Object} postData - Post data
 * @returns {Promise<Object>} Created post
 */
export async function createPost(userId, username, userPhoto, postData) {
  // Add author info to post data
  const postWithAuthor = {
    ...postData,
    authorId: userId,
    authorUsername: username,
    authorPhoto: userPhoto,
  };

  // Validate post data
  const validation = Post.validate(postWithAuthor);
  if (!validation.valid) {
    throw {
      statusCode: 400,
      message: 'Dữ liệu bài viết không hợp lệ',
      details: validation.errors,
    };
  }

  // Create post document
  const post = Post.create(postWithAuthor);

  // Save to database
  const contentBucket = dbConnection.getBucket('content');
  const collection = contentBucket.defaultCollection;

  try {
    await collection.insert(Post.getKey(post.id), post);

    // Update user post count
    await updateUserPostCount(userId, 1);

    // Update destination post count if associated with destination
    if (post.destinationId) {
      await updateDestinationPostCount(post.destinationId, 1);
    }

    return post;
  } catch (error) {
    console.error('Error creating post:', error);
    throw {
      statusCode: 500,
      message: 'Đăng bài thất bại',
    };
  }
}

/**
 * Get post by ID
 * @param {string} postId - Post ID
 * @param {string} requestingUserId - User requesting the post
 * @returns {Promise<Object>} Post
 */
export async function getPostById(postId, requestingUserId = null) {
  const contentBucket = dbConnection.getBucket('content');
  const collection = contentBucket.defaultCollection;

  try {
    const result = await collection.get(Post.getKey(postId));
    const post = result.content;

    // Check visibility
    if (post.visibility === 'private' && post.authorId !== requestingUserId) {
      throw {
        statusCode: 403,
        message: 'Bạn không có quyền xem bài viết này',
      };
    }

    // Increment view count
    try {
      post.stats.viewCount = (post.stats.viewCount || 0) + 1;
      await collection.upsert(Post.getKey(postId), post);
    } catch (error) {
      console.error('Failed to update view count:', error);
    }

    return post;
  } catch (error) {
    if (error.statusCode) throw error;
    if (error.name === 'DocumentNotFoundError') {
      throw {
        statusCode: 404,
        message: 'Không tìm thấy bài viết',
      };
    }
    throw error;
  }
}

/**
 * Get posts by author
 * @param {string} authorId - Author user ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} List of posts
 */
export async function getPostsByAuthor(authorId, options = {}) {
  const { limit = 20, offset = 0 } = options;

  const posts = await PostQueries.getByAuthor(authorId, limit, offset);

  return posts.map((postDoc) => postDoc.p || postDoc);
}

/**
 * Get posts by destination
 * @param {string} destinationId - Destination ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} List of posts
 */
export async function getPostsByDestination(destinationId, options = {}) {
  const { limit = 20, offset = 0 } = options;

  const posts = await PostQueries.getByDestination(destinationId, limit, offset);

  return posts.map((postDoc) => postDoc.p || postDoc);
}

/**
 * Get feed for user (posts from people they follow)
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} List of posts
 */
export async function getFeedForUser(userId, options = {}) {
  const { limit = 20, offset = 0 } = options;

  const posts = await PostQueries.getFeedForUser(userId, limit, offset);

  return posts.map((postDoc) => postDoc.p || postDoc);
}

/**
 * Update post
 * @param {string} postId - Post ID
 * @param {string} userId - User ID (for authorization)
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated post
 */
export async function updatePost(postId, userId, updates) {
  const contentBucket = dbConnection.getBucket('content');
  const collection = contentBucket.defaultCollection;

  // Get existing post to verify ownership
  let existingPost;
  try {
    const result = await collection.get(Post.getKey(postId));
    existingPost = result.content;
  } catch (error) {
    if (error.name === 'DocumentNotFoundError') {
      throw {
        statusCode: 404,
        message: 'Không tìm thấy bài viết',
      };
    }
    throw error;
  }

  // Verify ownership
  if (existingPost.authorId !== userId) {
    throw {
      statusCode: 403,
      message: 'Bạn không có quyền sửa bài viết này',
    };
  }

  // Build mutation operations using MutateInSpec
  const mutations = [];

  // Handle text update (update content.text)
  if (updates.text !== undefined) {
    mutations.push(couchbase.MutateInSpec.upsert('content.text', updates.text));
  }

  // Handle content object (legacy support)
  if (updates.content !== undefined) {
    mutations.push(couchbase.MutateInSpec.upsert('content', updates.content));
  }

  // Handle tags
  if (updates.tags !== undefined) {
    mutations.push(couchbase.MutateInSpec.upsert('tags', updates.tags));
  }

  // Handle visibility
  if (updates.visibility !== undefined) {
    mutations.push(couchbase.MutateInSpec.upsert('visibility', updates.visibility));
  }

  // Handle location
  if (updates.location !== undefined) {
    mutations.push(couchbase.MutateInSpec.upsert('location', updates.location));
  }

  // Handle destinationId
  if (updates.destinationId !== undefined) {
    mutations.push(couchbase.MutateInSpec.upsert('destinationId', updates.destinationId));

    // Resolve destination name if provided
    if (updates.destinationId) {
      try {
        const destination = await destinationService.getDestinationById(updates.destinationId);
        if (destination) {
          mutations.push(couchbase.MutateInSpec.upsert('destinationName', destination.name));
          mutations.push(couchbase.MutateInSpec.upsert('destinationCountry', destination.country));
        }
      } catch (err) {
        console.error('Failed to resolve destination:', err.message);
      }
    } else {
      // Clear destination fields if null
      mutations.push(couchbase.MutateInSpec.upsert('destinationName', null));
      mutations.push(couchbase.MutateInSpec.upsert('destinationCountry', null));
    }
  }

  if (mutations.length === 0) {
    throw {
      statusCode: 400,
      message: 'Không có trường hợp lệ nào để cập nhật',
    };
  }

  // Add updated timestamp
  mutations.push(couchbase.MutateInSpec.upsert('updatedAt', new Date().toISOString()));

  console.log('[updatePost] Post ID:', postId);
  console.log('[updatePost] Updates received:', JSON.stringify(updates, null, 2));
  console.log('[updatePost] Mutations to apply:', JSON.stringify(mutations, null, 2));

  try {
    await collection.mutateIn(Post.getKey(postId), mutations);

    // Get updated post
    const result = await collection.get(Post.getKey(postId));
    return result.content;
  } catch (error) {
    console.error('Error updating post:', error);
    console.error('Mutations attempted:', JSON.stringify(mutations, null, 2));
    throw error;
  }
}

/**
 * Delete post
 * @param {string} postId - Post ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<void>}
 */
export async function deletePost(postId, userId) {
  const contentBucket = dbConnection.getBucket('content');
  const collection = contentBucket.defaultCollection;

  // Get existing post to verify ownership
  let existingPost;
  try {
    const result = await collection.get(Post.getKey(postId));
    existingPost = result.content;
  } catch (error) {
    if (error.name === 'DocumentNotFoundError') {
      throw {
        statusCode: 404,
        message: 'Không tìm thấy bài viết',
      };
    }
    throw error;
  }

  // Verify ownership
  if (existingPost.authorId !== userId) {
    throw {
      statusCode: 403,
      message: 'Bạn không có quyền xóa bài viết này',
    };
  }

  try {
    await collection.remove(Post.getKey(postId));

    // Update user post count
    await updateUserPostCount(userId, -1);

    // Update destination post count if associated
    if (existingPost.destinationId) {
      await updateDestinationPostCount(existingPost.destinationId, -1);
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Like a post
 * @param {string} postId - Post ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated post
 */
export async function likePost(postId, userId) {
  const contentBucket = dbConnection.getBucket('content');
  const collection = contentBucket.defaultCollection;

  try {
    const result = await collection.get(Post.getKey(postId));
    const post = result.content;

    // Khởi tạo interactions nếu chưa có (cho posts cũ)
    if (!post.interactions) {
      post.interactions = {
        likes: [],
        comments: [],
      };
    }

    if (post.interactions.likes.includes(userId)) {
      throw {
        statusCode: 409,
        message: 'Bạn đã thích bài viết này rồi',
      };
    }

    // Modify in memory rồi upsert toàn bộ document
    post.interactions.likes.push(userId);
    post.stats = post.stats || {};
    post.stats.likeCount = post.interactions.likes.length;
    post.updatedAt = new Date().toISOString();

    await collection.upsert(Post.getKey(postId), post);
    return post;
  } catch (error) {
    if (error.statusCode) throw error;
    if (error.name === 'DocumentNotFoundError') {
      throw { statusCode: 404, message: 'Không tìm thấy bài viết' };
    }
    throw error;
  }
}

/**
 * Unlike a post
 * @param {string} postId - Post ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Updated post
 */
export async function unlikePost(postId, userId) {
  const contentBucket = dbConnection.getBucket('content');
  const collection = contentBucket.defaultCollection;

  try {
    const result = await collection.get(Post.getKey(postId));
    const post = result.content;

    // Khởi tạo interactions nếu chưa có
    if (!post.interactions) {
      post.interactions = {
        likes: [],
        comments: [],
      };
    }

    const likeIndex = post.interactions.likes.indexOf(userId);
    if (likeIndex === -1) {
      throw {
        statusCode: 409,
        message: 'Bạn chưa thích bài viết này',
      };
    }

    // Modify in memory rồi upsert toàn bộ document
    post.interactions.likes.splice(likeIndex, 1);
    post.stats = post.stats || {};
    post.stats.likeCount = post.interactions.likes.length;
    post.updatedAt = new Date().toISOString();

    await collection.upsert(Post.getKey(postId), post);
    return post;
  } catch (error) {
    if (error.statusCode) throw error;
    if (error.name === 'DocumentNotFoundError') {
      throw { statusCode: 404, message: 'Không tìm thấy bài viết' };
    }
    throw error;
  }
}

/**
 * Add comment to post
 * @param {string} postId - Post ID
 * @param {string} userId - User ID
 * @param {string} username - Username
 * @param {string} userPhoto - User photo
 * @param {string} text - Comment text
 * @returns {Promise<Object>} Updated post with new comment
 */
export async function addComment(postId, userId, username, userPhoto, text) {
  const contentBucket = dbConnection.getBucket('content');
  const collection = contentBucket.defaultCollection;

  try {
    // Get current post
    const result = await collection.get(Post.getKey(postId));
    const post = result.content;

    // Create comment object
    const comment = Post.addComment(post, {
      userId,
      username,
      userPhoto,
      text,
    });

    // Update post
    await collection.upsert(Post.getKey(postId), post);

    return post;
  } catch (error) {
    if (error.name === 'DocumentNotFoundError') {
      throw {
        statusCode: 404,
        message: 'Không tìm thấy bài viết',
      };
    }
    throw error;
  }
}

/**
 * Get comments for a post
 * @param {string} postId - Post ID
 * @returns {Promise<Array>} List of comments
 */
export async function getComments(postId) {
  const contentBucket = dbConnection.getBucket('content');
  const collection = contentBucket.defaultCollection;

  try {
    const result = await collection.get(Post.getKey(postId));
    const post = result.content;

    return post.interactions.comments || [];
  } catch (error) {
    if (error.name === 'DocumentNotFoundError') {
      throw {
        statusCode: 404,
        message: 'Không tìm thấy bài viết',
      };
    }
    throw error;
  }
}

/**
 * Delete comment from post
 * @param {string} postId - Post ID
 * @param {string} commentId - Comment ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object>} Updated post
 */
export async function deleteComment(postId, commentId, userId) {
  const contentBucket = dbConnection.getBucket('content');
  const collection = contentBucket.defaultCollection;

  try {
    // Get current post
    const result = await collection.get(Post.getKey(postId));
    const post = result.content;

    // Find comment
    const commentIndex = post.interactions.comments.findIndex((c) => c.id === commentId);
    if (commentIndex === -1) {
      throw {
        statusCode: 404,
        message: 'Không tìm thấy bình luận',
      };
    }

    const comment = post.interactions.comments[commentIndex];

    // Verify ownership (comment author or post author can delete)
    if (comment.userId !== userId && post.authorId !== userId) {
      throw {
        statusCode: 403,
        message: 'Bạn không có quyền xóa bình luận này',
      };
    }

    // Remove comment
    post.interactions.comments.splice(commentIndex, 1);
    post.stats.commentCount = post.interactions.comments.length;
    post.updatedAt = new Date().toISOString();

    await collection.upsert(Post.getKey(postId), post);

    return post;
  } catch (error) {
    if (error.statusCode) throw error;
    if (error.name === 'DocumentNotFoundError') {
      throw {
        statusCode: 404,
        message: 'Không tìm thấy bài viết',
      };
    }
    throw error;
  }
}

/**
 * Update user post count
 * @private
 */
async function updateUserPostCount(userId, delta) {
  try {
    const usersBucket = dbConnection.getBucket('users');
    const collection = usersBucket.defaultCollection;

    await collection.mutateIn(`user::${userId}`, [
      {
        opcode: 'counter',
        path: 'stats.postCount',
        delta: delta,
      },
    ]);
  } catch (error) {
    console.error('Failed to update user post count:', error);
  }
}

/**
 * Update destination post count
 * @private
 */
async function updateDestinationPostCount(destinationId, delta) {
  try {
    const tripsBucket = dbConnection.getBucket('trips');
    const collection = tripsBucket.defaultCollection;

    await collection.mutateIn(destinationId, [
      {
        opcode: 'counter',
        path: 'stats.postCount',
        delta: delta,
      },
    ]);
  } catch (error) {
    console.error('Failed to update destination post count:', error);
  }
}

export default {
  createPost,
  getPostById,
  getPostsByAuthor,
  getPostsByDestination,
  getFeedForUser,
  getPopularPosts,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  getComments,
  deleteComment,
};

/**
 * Get popular posts (public posts sorted by engagement)
 * @param {Object} options - Query options { limit, offset }
 * @returns {Promise<Array>} Popular posts
 */
export async function getPopularPosts(options = {}) {
  const { limit = 20, offset = 0 } = options;

  const posts = await PostQueries.getPopular(limit, offset);

  return posts.map((postDoc) => postDoc.p || postDoc);
}
