import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { postAPI, discoveryAPI, connectionAPI, userAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import PostCard from '../components/PostCard';
import UserCard from '../components/UserCard';
import PostCreationModal from '../components/PostCreationModal';
import { MapPin, Users, UserPlus, Plus, TrendingUp, Heart, MessageCircle } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [editingPost, setEditingPost] = useState(null);  // For edit modal
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [feedMode, setFeedMode] = useState('following'); // 'following' hoặc 'popular'
  const [popularPage, setPopularPage] = useState(1);
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
      // Load feed, suggestions, and user stats in parallel
      const [feedResponse, suggestionsResponse, userProfileResponse] = await Promise.all([
        postAPI.getFeed({ limit: 10, offset: 0 }).catch(() => ({ data: { data: { posts: [] } } })),
        connectionAPI.getSuggestions().catch(() => ({ data: { data: { suggestions: [] } } })),
        // Get current user's profile for stats
        user?.username ? userAPI.getProfile(user.username).catch(() => null) : null,
      ]);

      const followingPosts = feedResponse.data.data.posts || [];
      console.log('[Dashboard] Following feed loaded:', followingPosts.length, 'posts');

      // Nếu không có posts từ following, load popular ngay
      if (followingPosts.length === 0) {
        console.log('[Dashboard] No following posts, loading popular posts immediately');
        setFeedMode('popular');
        const popularResponse = await postAPI.getPopular({ limit: 10, offset: 0 });
        const popularPosts = popularResponse.data.data.posts || [];
        
        // Deduplicate posts by ID
        const uniquePosts = Array.from(
          new Map(popularPosts.map(post => [post.id, post])).values()
        );
        
        setFeed(uniquePosts);
        setPopularPage(1);
        setHasMore(popularPosts.length === 10);
      } else {
        // Có posts từ following - deduplicate
        const uniquePosts = Array.from(
          new Map(followingPosts.map(post => [post.id, post])).values()
        );
        
        setFeed(uniquePosts);
        setFeedMode('following');
        setPage(1);
        setHasMore(followingPosts.length === 10);
      }
      
      // Handle suggestions response structure
      const suggestionsData = suggestionsResponse.data.data?.suggestions || suggestionsResponse.data.data || [];
      const suggestionsArray = Array.isArray(suggestionsData) ? suggestionsData : [];
      setSuggestions(suggestionsArray.slice(0, 3));
      
      // Set user stats
      if (userProfileResponse?.data?.data?.user) {
        const profile = userProfileResponse.data.data.user;
        console.log('[Dashboard] User profile response:', profile);
        console.log('[Dashboard] Stats from profile:', profile.stats);
        setUserStats({
          trips: profile.stats?.tripCount || 0,
          posts: profile.stats?.postCount || 0,
          followers: profile.stats?.followerCount || 0,
          following: profile.stats?.followingCount || 0,
        });
      } else {
        console.log('[Dashboard] No user profile response:', userProfileResponse);
      }
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

    console.log('[Dashboard] Loading more posts, page:', page, 'mode:', feedMode);
    setLoadingMore(true);
    try {
      if (feedMode === 'following') {
        // Tiếp tục load feed từ người follow
        const nextPage = page + 1;
        const limit = 10;
        const offset = (nextPage - 1) * limit;  // Convert page to offset
        
        console.log('[Dashboard] Fetching page:', nextPage, 'offset:', offset);
        const response = await postAPI.getFeed({ limit, offset });
        const newPosts = response.data.data.posts || [];
        
        console.log('[Dashboard] Received', newPosts.length, 'posts from API');
        
        if (newPosts.length > 0) {
          // Deduplicate before appending
          let uniqueCount = 0;
          setFeed(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const uniqueNewPosts = newPosts.filter(p => !existingIds.has(p.id));
            uniqueCount = uniqueNewPosts.length;
            console.log('[Dashboard] After dedup:', uniqueCount, 'unique posts');
            return [...prev, ...uniqueNewPosts];
          });
          
          setPage(nextPage);
          
          // Only continue if we got unique posts AND API returned full page
          if (uniqueCount === 0) {
            console.log('[Dashboard] All posts were duplicates, stopping pagination');
            setHasMore(false);
          } else {
            setHasMore(newPosts.length === 10);
          }
        } else {
          // Hết posts từ following, chuyển sang popular
          console.log('[Dashboard] No more following posts, switching to popular');
          setFeedMode('popular');
          setPopularPage(1);
          // Load batch đầu tiên của popular posts
          await loadPopularPosts(1);
        }
      } else {
        // Đang ở mode popular, tiếp tục load popular posts
        await loadPopularPosts(popularPage + 1);
      }
    } catch (error) {
      console.error('[Dashboard] Error loading more posts:', error);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  const loadPopularPosts = async (pageNum) => {
    try {
      const limit = 10;
      const offset = (pageNum - 1) * limit;  // Convert page to offset
      
      console.log('[Dashboard] Loading popular posts, page:', pageNum, 'offset:', offset);
      // Gọi API lấy popular posts (public posts sorted by like + comment)
      const response = await postAPI.getPopular({ limit, offset });
      const newPosts = response.data.data.posts || [];
      
      console.log('[Dashboard] Received', newPosts.length, 'popular posts');
      
      if (newPosts.length > 0) {
        let uniqueCount = 0;
        setFeed(prev => {
          // Deduplicate: chỉ thêm posts chưa có trong feed
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNewPosts = newPosts.filter(p => !existingIds.has(p.id));
          uniqueCount = uniqueNewPosts.length;
          console.log('[Dashboard] After dedup:', uniqueCount, 'unique popular posts');
          return [...prev, ...uniqueNewPosts];
        });
        
        setPopularPage(pageNum);
        
        // Stop if all were duplicates OR API returned less than full page
        if (uniqueCount === 0 || newPosts.length < 10) {
          console.log('[Dashboard] Stopping popular posts pagination');
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      } else {
        console.log('[Dashboard] No more popular posts available');
        setHasMore(false);
      }
    } catch (error) {
      console.error('[Dashboard] Error loading popular posts:', error);
      setHasMore(false);
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
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleDeletePost = (postId) => {
    setFeed(prev => prev.filter(p => p.id !== postId));
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
  };

  const handleUpdatePost = (updatedPost) => {
    // Update post in feed
    setFeed(prev => prev.map(p => 
      p.id === updatedPost.id ? updatedPost : p
    ));
    setEditingPost(null);
  };

  const handlePostCreated = (newPost) => {
    setFeed(prev => [newPost, ...prev]);
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

      {editingPost && (
        <PostCreationModal
          isOpen={true}
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onPostCreated={handleUpdatePost}
          isEditing={true}
        />
      )}
      
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
            
            {feed.length === 0 && !loading ? (
              <div className="card p-12 text-center">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No posts available
                </h3>
                <p className="text-gray-600 mb-6">
                  Be the first to share your travel story!
                </p>
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="btn btn-primary"
                >
                  Create Your First Post
                </button>
              </div>
            ) : (
              <>
                {feed
                  .filter((post, index, self) => {
                    // Extra safety: filter duplicates in render
                    return self.findIndex(p => p.id === post.id) === index;
                  })
                  .map((post, index) => {
                    // Ensure post has valid ID
                    if (!post || !post.id) {
                      console.warn('[Dashboard] Post missing ID:', post);
                      return null;
                    }
                    
                    return (
                      <div
                        key={post.id}
                        ref={index === feed.length - 1 ? lastPostRef : null}
                      >
                        <PostCard
                          post={post}
                          currentUserId={user?.id}
                          onDelete={handleDeletePost}
                          onEdit={handleEditPost}
                        />
                      </div>
                    );
                  })}
                
                {loadingMore && (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="default" />
                  </div>
                )}
                
                {!hasMore && feed.length > 0 && (
                  <div className="text-center py-8 text-gray-600">
                    <p>You've caught up with everything! 🎉</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Stats */}
          <div className="card p-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              <h3 className="font-bold text-gray-900">Your Stats</h3>
            </div>
            
            {userStats ? (
              <div className="grid grid-cols-2 gap-4">
                <Link 
                  to="/trips"
                  className="text-center p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all"
                >
                  <div className="text-2xl font-bold text-blue-700">{userStats.trips}</div>
                  <div className="text-xs text-blue-600 mt-1">Trips</div>
                </Link>
                
                <Link
                  to={`/profile/${user?.username}`}
                  className="text-center p-3 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all"
                >
                  <div className="text-2xl font-bold text-purple-700">{userStats.posts}</div>
                  <div className="text-xs text-purple-600 mt-1">Posts</div>
                </Link>
                
                <Link
                  to={`/profile/${user?.username}`}
                  className="text-center p-3 rounded-lg bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all"
                >
                  <div className="text-2xl font-bold text-green-700">{userStats.followers}</div>
                  <div className="text-xs text-green-600 mt-1">Followers</div>
                </Link>
                
                <Link
                  to={`/profile/${user?.username}`}
                  className="text-center p-3 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 transition-all"
                >
                  <div className="text-2xl font-bold text-orange-700">{userStats.following}</div>
                  <div className="text-xs text-orange-600 mt-1">Following</div>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="text-center p-3 rounded-lg bg-gray-100 animate-pulse">
                    <div className="h-8 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-12 mx-auto"></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Suggested Connections */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Suggested for you</h3>
              <Link to="/search" className="text-sm text-primary-600 hover:text-primary-700">
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
        </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
