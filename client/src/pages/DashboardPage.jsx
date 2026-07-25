import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { postAPI, discoveryAPI, userAPI, connectionAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import PostCard from '../components/PostCard';
import StatsCard from '../components/StatsCard';
import UserCard from '../components/UserCard';
import PostCreationModal from '../components/PostCreationModal';
import { Heart, MessageCircle, MapPin, Users, TrendingUp, UserPlus, Plus } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const observer = useRef();
  const lastPostRef = useCallback(node => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePosts();
      }
    });
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore]);

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    console.log('[Dashboard] Loading data for user:', user?.id);
    try {
      // Load feed, stats, and suggestions in parallel
      const [feedResponse, statsResponse, suggestionsResponse, activityResponse] = await Promise.all([
        postAPI.getFeed({ limit: 10, page: 1 }),
        userAPI.getUserStats(user.id),
        connectionAPI.getSuggestions().catch(() => ({ data: { data: { suggestions: [] } } })),
        discoveryAPI.getActivity({ limit: 10 }).catch(() => ({ data: { data: { activities: [] } } })),
      ]);

      console.log('[Dashboard] Feed loaded:', feedResponse.data.data.posts?.length, 'posts');
      console.log('[Dashboard] Stats loaded:', statsResponse.data.data);

      const posts = feedResponse.data.data.posts || [];
      setFeed(posts);
      setHasMore(posts.length === 10);
      setPage(1);
      setStats(statsResponse.data.data);
      
      // Handle suggestions response structure
      const suggestionsData = suggestionsResponse.data.data?.suggestions || suggestionsResponse.data.data || [];
      const suggestionsArray = Array.isArray(suggestionsData) ? suggestionsData : [];
      setSuggestions(suggestionsArray.slice(0, 3));
      
      setActivityFeed(activityResponse.data.data.activities || []);
    } catch (error) {
      console.error('[Dashboard] Error loading data:', error);
      console.error('[Dashboard] Error response:', error.response?.data);
    } finally {
      setLoading(false);
      setLoadingSuggestions(false);
    }
  };

  const loadMorePosts = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const response = await postAPI.getFeed({ limit: 10, page: nextPage });
      const newPosts = response.data.data.posts || [];
      
      setFeed(prev => [...prev, ...newPosts]);
      setHasMore(newPosts.length === 10);
      setPage(nextPage);
    } catch (error) {
      console.error('[Dashboard] Error loading more posts:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleFollowToggle = async (userId) => {
    try {
      const suggestion = suggestions.find(s => s.id === userId);
      if (suggestion?.isFollowing) {
        await connectionAPI.unfollow(userId);
      } else {
        await connectionAPI.follow(userId);
      }
      
      // Update suggestions list
      setSuggestions(prev =>
        prev.map(s =>
          s.id === userId ? { ...s, isFollowing: !s.isFollowing } : s
        )
      );

      // Update stats
      if (stats) {
        setStats(prev => ({
          ...prev,
          followingCount: suggestion?.isFollowing
            ? (prev.followingCount || 1) - 1
            : (prev.followingCount || 0) + 1,
        }));
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleDeletePost = (postId) => {
    setFeed(prev => prev.filter(p => p.id !== postId));
    if (stats) {
      setStats(prev => ({
        ...prev,
        postCount: (prev.postCount || 1) - 1,
      }));
    }
  };

  const handlePostCreated = (newPost) => {
    setFeed(prev => [newPost, ...prev]);
    if (stats) {
      setStats(prev => ({
        ...prev,
        postCount: (prev.postCount || 0) + 1,
      }));
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="flex justify-center items-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  return (
    <>
      <PostCreationModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onPostCreated={handlePostCreated}
      />
      
      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content - Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Welcome Header */}
          <div className="card p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.profile?.firstName}!
            </h1>
            <p className="text-gray-600">
              Here's what's happening in your travel network
            </p>
          </div>

          {/* Quick Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to={`/profile/${user.username}`}>
                <StatsCard
                  icon={MessageCircle}
                  label="Posts"
                  value={stats.postCount || 0}
                  color="primary"
                  onClick={() => {}}
                />
              </Link>
              <Link to={`/profile/${user.username}`}>
                <StatsCard
                  icon={Users}
                  label="Followers"
                  value={stats.followerCount || 0}
                  color="green"
                  onClick={() => {}}
                />
              </Link>
              <Link to={`/profile/${user.username}`}>
                <StatsCard
                  icon={UserPlus}
                  label="Following"
                  value={stats.followingCount || 0}
                  color="blue"
                  onClick={() => {}}
                />
              </Link>
              <StatsCard
                icon={Heart}
                label="Total Likes"
                value={stats.totalLikes || 0}
                color="orange"
              />
            </div>
          )}

          {/* Feed */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Your Feed</h2>
              <button
                onClick={() => setShowCreatePost(true)}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create Post</span>
              </button>
            </div>
            
            {feed.length === 0 ? (
              <div className="card p-12 text-center">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Your feed is empty
                </h3>
                <p className="text-gray-600 mb-6">
                  Start following travelers to see their posts here!
                </p>
                <Link to="/explore" className="btn btn-primary">
                  Explore Destinations
                </Link>
              </div>
            ) : (
              <>
                {feed.map((post, index) => (
                  <div
                    key={post.id}
                    ref={index === feed.length - 1 ? lastPostRef : null}
                  >
                    <PostCard
                      post={post}
                      currentUserId={user?.id}
                      onDelete={handleDeletePost}
                    />
                  </div>
                ))}
                
                {loadingMore && (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="default" />
                  </div>
                )}
                
                {!hasMore && feed.length > 0 && (
                  <div className="text-center py-8 text-gray-600">
                    <p>You've reached the end!</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Suggested Connections */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Suggested for you</h3>
              <Link to="/explore" className="text-sm text-primary-600 hover:text-primary-700">
                See all
              </Link>
            </div>
            
            {loadingSuggestions ? (
              <LoadingSpinner size="default" />
            ) : suggestions.length === 0 ? (
              <p className="text-sm text-gray-600 text-center py-4">
                No suggestions available
              </p>
            ) : (
              <div className="space-y-3">
                {suggestions.map((suggestion) => (
                  <UserCard
                    key={suggestion.id}
                    user={suggestion}
                    showFollowButton={true}
                    onFollowToggle={handleFollowToggle}
                    isFollowing={suggestion.isFollowing}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Trending Destinations */}
          <div className="card p-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              <h3 className="font-bold text-gray-900">Trending Destinations</h3>
            </div>
            <Link
              to="/explore"
              className="block text-sm text-primary-600 hover:text-primary-700 text-center py-4"
            >
              Explore trending destinations →
            </Link>
          </div>

          {/* Recent Activity */}
          {activityFeed.length > 0 && (
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {activityFeed.slice(0, 5).map((activity, index) => (
                  <div key={index} className="text-sm">
                    <p className="text-gray-600">
                      <span className="font-medium text-gray-900">
                        {activity.username}
                      </span>{' '}
                      {activity.type === 'follow' && 'started following you'}
                      {activity.type === 'like' && 'liked your post'}
                      {activity.type === 'comment' && 'commented on your post'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.timestamp}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
