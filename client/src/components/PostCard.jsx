import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, MapPin, MoreVertical, Trash2, Send, Edit2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { postAPI } from '../services/api';
import { getProfilePhotoUrl, getImageUrl } from '../utils/imageUtils';
import toast from 'react-hot-toast';

const PostCard = ({ post, onDelete, onEdit, onLikeToggle, currentUserId }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isLiked, setIsLiked] = useState(
    post.interactions?.likes?.includes(currentUserId) ?? false
  );
  const [likeCount, setLikeCount] = useState(post.stats?.likeCount || 0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.interactions?.comments || []);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const isOwnPost = post.authorId === currentUserId;

  const handleLike = async () => {
    try {
      if (isLiked) {
        await postAPI.unlike(post.id);
        setIsLiked(false);
        setLikeCount(prev => prev - 1);
      } else {
        await postAPI.like(post.id);
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
      if (onLikeToggle) onLikeToggle(post.id, !isLiked);
    } catch (error) {
      toast.error('Failed to update like');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    setIsDeleting(true);
    try {
      await postAPI.delete(post.id);
      toast.success('Post deleted');
      if (onDelete) onDelete(post.id);
    } catch (error) {
      toast.error('Failed to delete post');
      setIsDeleting(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      // Backend đọc field "text", trả về updated post (data.post)
      const response = await postAPI.addComment(post.id, { text: commentText });
      const updatedPost = response.data.data.post;
      // Lấy comment mới nhất từ interactions.comments của post được trả về
      const newComments = updatedPost?.interactions?.comments || [];
      setComments(newComments);
      setCommentText('');
      toast.success('Comment added');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error(error.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      await postAPI.deleteComment(post.id, commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  return (
    <div className="card p-6 relative">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <Link to={`/profile/${post.authorUsername}`} className="flex items-center space-x-3">
          {post.authorPhoto ? (
            <img
              src={getProfilePhotoUrl(post.authorPhoto)}
              alt={post.authorUsername}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-600 font-semibold">
                {post.authorUsername?.[0]?.toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900 hover:text-primary-600">
              {post.authorUsername}
            </p>
            <p className="text-sm text-gray-600">
              {post.createdAt && formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </Link>

        {/* Menu */}
        {isOwnPost && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    if (onEdit) onEdit(post);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-t-lg"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit Post</span>
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full flex items-center space-x-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-b-lg"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeleting ? 'Deleting...' : 'Delete Post'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-900 whitespace-pre-wrap">
          {post.content?.text}
        </p>
      </div>

      {/* Destination */}
      {post.destinationName && (
        <div className="flex items-center space-x-1 text-sm text-primary-600 mb-3">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium">
            {post.destinationName}
            {post.destinationCountry && `, ${post.destinationCountry}`}
          </span>
        </div>
      )}

      {/* Location (free-text) */}
      {!post.destinationName && post.location?.name && (
        <div className="flex items-center space-x-1 text-sm text-gray-600 mb-4">
          <MapPin className="w-4 h-4" />
          <span>{post.location.name}</span>
        </div>
      )}

      {/* Media */}
      {post.content?.media && post.content.media.length > 0 && (
        <div className={`mb-4 grid gap-2 ${
          post.content.media.length === 1 ? 'grid-cols-1' :
          post.content.media.length === 2 ? 'grid-cols-2' :
          post.content.media.length === 3 ? 'grid-cols-3' :
          'grid-cols-2'
        }`}>
          {post.content.media.slice(0, 4).map((media, index) => (
            <div
              key={index}
              className={`relative ${
                post.content.media.length === 3 && index === 0 ? 'col-span-2' : ''
              }`}
            >
              <img
                src={getImageUrl(media.url)}
                alt=""
                className="w-full h-64 object-cover rounded-lg"
              />
              {post.content.media.length > 4 && index === 3 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    +{post.content.media.length - 4}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center space-x-6 text-gray-600 pt-4 border-t">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-2 transition-colors ${
            isLiked ? 'text-red-600' : 'hover:text-red-600'
          }`}
          aria-label={isLiked ? 'Unlike' : 'Like'}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          <span className="text-sm">{likeCount}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 hover:text-primary-600 transition-colors"
          aria-label="Comments"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm">{comments.length || post.stats?.commentCount || 0}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t space-y-4">
          {/* Comment List */}
          {comments.length > 0 && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link
                        to={`/profile/${comment.username}`}
                        className="font-medium text-gray-900 hover:text-primary-600 text-sm"
                      >
                        {comment.username}
                      </Link>
                      <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {comment.createdAt && formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    
                    {comment.userId === currentUserId && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors ml-2"
                        aria-label="Delete comment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="flex items-end space-x-2">
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                rows={2}
                className="input resize-none"
                disabled={submittingComment}
              />
            </div>
            <button
              type="submit"
              disabled={!commentText.trim() || submittingComment}
              className="btn btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send comment"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;
