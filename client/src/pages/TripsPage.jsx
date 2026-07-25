import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { tripAPI } from '../services/api';
import TripCard from '../components/TripCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Plus, MapPin } from 'lucide-react';

const TripsPage = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadTrips();
  }, [filter]);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const response = await tripAPI.getMyTrips();
      let tripsData = response.data.data.trips || [];

      // Filter trips based on selected filter
      if (filter !== 'all') {
        tripsData = tripsData.filter(trip => trip.status === filter);
      }

      setTrips(tripsData);
    } catch (error) {
      console.error('Error loading trips:', error);
      toast.error('Failed to load trips');
      setTrips([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) return;

    try {
      await tripAPI.delete(tripId);
      setTrips(prev => prev.filter(t => t.id !== tripId));
      toast.success('Trip deleted successfully');
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast.error('Failed to delete trip');
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
    <div className="container-custom py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Trips</h1>
            <p className="text-gray-600">Plan and manage your travel adventures</p>
          </div>
          <Link
            to="/trips/create"
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create Trip</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2">
          {['all', 'planning', 'upcoming', 'ongoing', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Trips Grid */}
        {trips.length === 0 ? (
          <div className="card p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'No trips yet' : `No ${filter} trips`}
            </h3>
            <p className="text-gray-600 mb-6">
              Start planning your next adventure!
            </p>
            <Link to="/trips/create" className="btn btn-primary inline-flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Create Your First Trip</span>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onDelete={handleDeleteTrip}
                isOwner={trip.userId === user?.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TripsPage;
