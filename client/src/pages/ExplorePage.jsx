import { useState, useEffect } from 'react';
import { destinationAPI, postAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { MapPin, TrendingUp, Heart, MessageCircle } from 'lucide-react';

const ExplorePage = () => {
  const [loading, setLoading] = useState(true);
  const [exploreData, setExploreData] = useState({
    trendingDestinations: [],
    popularPosts: [],
  });

  useEffect(() => {
    loadExploreData();
  }, []);

  const loadExploreData = async () => {
    try {
      const [destinationsRes, postsRes] = await Promise.all([
        destinationAPI.getAll({ limit: 6 }), // Get all destinations instead of search
        postAPI.getFeed({ limit: 6 }) // Get recent posts
      ]);

      setExploreData({
        trendingDestinations: destinationsRes.data.data?.destinations || destinationsRes.data.data || [],
        popularPosts: postsRes.data.data?.posts || []
      });
    } catch (error) {
      console.error('Error loading explore data:', error);
      // Set empty data on error instead of crashing
      setExploreData({
        trendingDestinations: [],
        popularPosts: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-8">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Explore</h1>

        {/* Trending Destinations */}
        <section className="mb-12">
          <div className="flex items-center space-x-2 mb-6">
            <TrendingUp className="w-6 h-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">Trending Destinations</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exploreData.trendingDestinations.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No trending destinations yet</p>
              </div>
            ) : (
              exploreData.trendingDestinations.map((dest) => (
                <div key={dest.id} className="card overflow-hidden hover:shadow-lg transition-shadow">
                  {dest.images?.[0] && (
                    <img
                      src={dest.images[0]}
                      alt={dest.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {dest.name}
                    </h3>
                    <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{dest.country}</span>
                    </div>
                    {dest.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {dest.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{dest.stats?.tripCount || 0} trips</span>
                      <span>{dest.stats?.postCount || 0} posts</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Popular Posts */}
        <section>
          <div className="flex items-center space-x-2 mb-6">
            <Heart className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl font-bold text-gray-900">Popular Posts</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {exploreData.popularPosts.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No posts yet</p>
              </div>
            ) : (
              exploreData.popularPosts.map((post) => (
                <div key={post.id} className="card p-6">
                  {/* Author */}
                  <div className="flex items-center space-x-3 mb-4">
                    {post.authorPhoto ? (
                      <img
                        src={post.authorPhoto}
                        alt={post.authorUsername}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-semibold">
                          {post.authorUsername?.[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">
                        {post.authorUsername}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-gray-900 mb-4 line-clamp-3">
                    {post.content?.text}
                  </p>

                  {/* Location */}
                  {post.location?.name && (
                    <div className="flex items-center space-x-1 text-sm text-gray-600 mb-4">
                      <MapPin className="w-4 h-4" />
                      <span>{post.location.name}</span>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center space-x-6 text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">{post.stats?.likeCount || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">{post.stats?.commentCount || 0}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ExplorePage;
