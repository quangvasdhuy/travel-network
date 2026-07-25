import { useState } from 'react';
import { searchAPI } from '../services/api';
import { Search, MapPin } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import UserCard from '../components/UserCard';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await searchAPI.unified(query);
      setResults(response.data.data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Search</h1>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input pl-12 text-lg"
              placeholder="Search for users, destinations, or posts..."
            />
          </div>
        </form>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        )}

        {/* Results */}
        {!loading && results && (
          <div className="space-y-8">
            {/* Users */}
            {results.users.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Users ({results.users.length})
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {results.users.map((user) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      showFollowButton={false}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Destinations */}
            {results.destinations.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Destinations ({results.destinations.length})
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {results.destinations.map((dest) => (
                    <div key={dest.id} className="card overflow-hidden">
                      {dest.images && (
                        <img
                          src={dest.images}
                          alt={dest.name}
                          className="w-full h-32 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 mb-1">{dest.name}</h3>
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{dest.country}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Posts */}
            {results.posts.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Posts ({results.posts.length})
                </h2>
                <div className="space-y-4">
                  {results.posts.map((post) => (
                    <div key={post.id} className="card p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-semibold text-sm">
                            {post.authorUsername?.[0]?.toUpperCase()}
                          </span>
                        </div>
                        <p className="font-semibold text-gray-900">{post.authorUsername}</p>
                      </div>
                      <p className="text-gray-900 line-clamp-2">{post.content?.text}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* No Results */}
            {results.total === 0 && (
              <div className="card p-12 text-center">
                <p className="text-gray-600">No results found for "{results.query}"</p>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && !results && (
          <div className="card p-12 text-center">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">
              Search for users, destinations, or posts
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
