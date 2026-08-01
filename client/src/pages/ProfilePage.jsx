import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, connectionAPI, postAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import PostCard from '../components/PostCard';
import UserCard from '../components/UserCard';
import toast from 'react-hot-toast';
import { MapPin, Calendar, Users, Settings, Grid, UserCheck, UserPlus } from 'lucide-react';
import { getProfilePhotoUrl } from '../utils/imageUtils';

const ProfilePage = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loadingTab, setLoadingTab] = useState(false);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    loadProfile();
  }, [username]);

  useEffect(() => {
    if (profile) {
      loadTabData();
    }
  }, [activeTab, profile]);

  const loadProfile = async () => {
    try {
      const response = await userAPI.getProfile(username);
      const userData = response.data.data.user || response.data.data;
      setProfile(userData);

      // Check follow status if not own profile
      if (!isOwnProfile && userData.id) {
        const statusResponse = await connectionAPI.getConnectionStatus(userData.id);
        const status = statusResponse.data.data?.status || statusResponse.data.data;
        setIsFollowing(status?.isFollowing ?? false);
      } else {
        setIsFollowing(false);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = async () => {
    if (!profile || !profile.id) {
      console.warn('Profile or profile.id is missing:', profile);
      return;
    }
    
    setLoadingTab(true);
    try {
      if (activeTab === 'posts') {
        const response = await postAPI.getByUser(profile.id, { limit: 20 });
        setPosts(response.data.data.posts || []);
      } else if (activeTab === 'followers') {
        const response = await connectionAPI.getFollowers(profile.id);
        const followersData = response.data.data?.followers || response.data.data || [];
        setFollowers(Array.isArray(followersData) ? followersData : []);
      } else if (activeTab === 'following') {
        const response = await connectionAPI.getFollowing(profile.id);
        const followingData = response.data.data?.following || response.data.data || [];
        setFollowing(Array.isArray(followingData) ? followingData : []);
      }
    } catch (error) {
      console.error('Error loading tab data:', error);
      toast.error('Failed to load data');
      // Set empty arrays on error
      if (activeTab === 'followers') setFollowers([]);
      if (activeTab === 'following') setFollowing([]);
    } finally {
      setLoadingTab(false);
    }
  };

  const handleFollowToggle = async () => {
    const wasFollowing = isFollowing;
    // Optimistic update
    setIsFollowing(!wasFollowing);
    setProfile(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        followerCount: (prev.stats?.followerCount || 0) + (wasFollowing ? -1 : 1),
      },
    }));

    try {
      if (wasFollowing) {
        await connectionAPI.unfollow(profile.id);
        toast.success(`Unfollowed ${profile.username}`);
      } else {
        await connectionAPI.follow(profile.id);
        toast.success(`Following ${profile.username}`);
      }

      // Reload profile để sync đúng count từ backend
      await loadProfile();
    } catch (error) {
      const status = error.response?.status;
      // 409 khi follow = đang follow rồi → sync state về đúng
      // 404 khi unfollow = chưa follow → sync state về đúng
      if (status === 409) {
        setIsFollowing(true);
        await loadProfile(); // Reload để lấy count chính xác
        toast('Already following', { icon: 'ℹ️' });
      } else if (status === 404) {
        setIsFollowing(false);
        await loadProfile(); // Reload để lấy count chính xác
      } else {
        // Rollback optimistic update
        setIsFollowing(wasFollowing);
        setProfile(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            followerCount: (prev.stats?.followerCount || 0) + (wasFollowing ? 1 : -1),
          },
        }));
        toast.error('Failed to update follow status');
      }
    }
  };

  const handleUserFollowToggle = async (userId) => {
    try {
      const user = [...followers, ...following].find(u => u.id === userId);
      const isCurrentlyFollowing = user?.isFollowing;

      if (isCurrentlyFollowing) {
        await connectionAPI.unfollow(userId);
        toast.success('Unfollowed');
      } else {
        await connectionAPI.follow(userId);
        toast.success('Following');
      }

      // Optimistic update trong list hiện tại
      const updateUser = (userList) =>
        userList.map(u =>
          u.id === userId ? { ...u, isFollowing: !isCurrentlyFollowing } : u
        );

      setFollowers(updateUser);
      setFollowing(updateUser);

      // Reload lại tab hiện tại để sync đúng count và state
      loadTabData();
    } catch (error) {
      const status = error.response?.status;
      if (status === 409 || status === 404) {
        // Đã follow hoặc chưa follow — reload để sync
        loadTabData();
      } else {
        toast.error('Failed to update follow status');
      }
    }
  };

  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    setProfile(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        postCount: (prev.stats?.postCount || 1) - 1,
      },
    }));
  };

  if (loading) {
    return (
      <div className="container-custom py-8">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container-custom py-8">
        <div className="card p-8 text-center">
          <p className="text-gray-600">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="card p-8 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Profile Photo */}
            {profile.profile?.profilePhoto ? (
              <img
                src={getProfilePhotoUrl(profile.profile.profilePhoto)}
                alt={profile.username}
                className="w-32 h-32 rounded-full object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-4xl text-primary-600 font-bold">
                  {profile.username?.[0]?.toUpperCase()}
                </span>
              </div>
            )}

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {profile.profile?.firstName} {profile.profile?.lastName}
                </h1>
                {isOwnProfile && (
                  <Link
                    to="/profile/edit"
                    className="btn btn-secondary flex items-center space-x-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </Link>
                )}
                {!isOwnProfile && (
                  <button
                    onClick={handleFollowToggle}
                    className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                )}
              </div>
              <p className="text-gray-600 mb-2">@{profile.username}</p>
              
              {profile.profile?.bio && (
                <p className="text-gray-700 mb-4">{profile.profile.bio}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {profile.profile?.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {profile.profile.location.city}, {profile.profile.location.country}
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <button
              onClick={() => setActiveTab('posts')}
              className={`text-center transition-colors ${
                activeTab === 'posts' ? 'text-primary-600' : 'hover:text-gray-700'
              }`}
            >
              <div className="text-2xl font-bold text-gray-900">
                {profile.stats?.postCount || 0}
              </div>
              <div className="text-sm text-gray-600">Posts</div>
            </button>
            <button
              onClick={() => setActiveTab('followers')}
              className={`text-center transition-colors ${
                activeTab === 'followers' ? 'text-primary-600' : 'hover:text-gray-700'
              }`}
            >
              <div className="text-2xl font-bold text-gray-900">
                {profile.stats?.followerCount || 0}
              </div>
              <div className="text-sm text-gray-600">Followers</div>
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`text-center transition-colors ${
                activeTab === 'following' ? 'text-primary-600' : 'hover:text-gray-700'
              }`}
            >
              <div className="text-2xl font-bold text-gray-900">
                {profile.stats?.followingCount || 0}
              </div>
              <div className="text-sm text-gray-600">Following</div>
            </button>
          </div>

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tabs Navigation */}
        <div className="card mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'posts'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Grid className="w-5 h-5" />
                <span>Posts</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('followers')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'followers'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <UserCheck className="w-5 h-5" />
                <span>Followers</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'following'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <UserPlus className="w-5 h-5" />
                <span>Following</span>
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {loadingTab ? (
          <div className="py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <>
            {/* Posts Tab */}
            {activeTab === 'posts' && (
              <div className="space-y-6">
                {posts.length === 0 ? (
                  <div className="card p-12 text-center">
                    <Grid className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {isOwnProfile
                        ? 'You haven\'t posted anything yet'
                        : `${profile.username} hasn't posted anything yet`}
                    </p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUserId={currentUser?.id}
                      onDelete={handleDeletePost}
                    />
                  ))
                )}
              </div>
            )}

            {/* Followers Tab */}
            {activeTab === 'followers' && (
              <div>
                {followers.length === 0 ? (
                  <div className="card p-12 text-center">
                    <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {isOwnProfile
                        ? 'You don\'t have any followers yet'
                        : `${profile.username} doesn't have any followers yet`}
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {followers.map((follower) => (
                      <UserCard
                        key={follower.id}
                        user={follower}
                        showFollowButton={follower.id !== currentUser?.id}
                        onFollowToggle={handleUserFollowToggle}
                        isFollowing={follower.isFollowing}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Following Tab */}
            {activeTab === 'following' && (
              <div>
                {following.length === 0 ? (
                  <div className="card p-12 text-center">
                    <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {isOwnProfile
                        ? 'You\'re not following anyone yet'
                        : `${profile.username} isn't following anyone yet`}
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {following.map((user) => (
                      <UserCard
                        key={user.id}
                        user={user}
                        showFollowButton={user.id !== currentUser?.id}
                        onFollowToggle={handleUserFollowToggle}
                        isFollowing={user.isFollowing}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
