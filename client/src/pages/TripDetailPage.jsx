import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { tripAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { MapPin, Calendar, Users, DollarSign, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

const TripDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrip();
  }, [id]);

  const loadTrip = async () => {
    try {
      const response = await tripAPI.getById(id);
      setTrip(response.data.data.trip);
    } catch (error) {
      console.error('Error loading trip:', error);
      toast.error('Failed to load trip');
      navigate('/trips');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this trip?')) return;

    try {
      await tripAPI.delete(id);
      toast.success('Trip deleted successfully');
      navigate('/trips');
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast.error('Failed to delete trip');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'upcoming':
        return 'bg-green-100 text-green-800';
      case 'ongoing':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  if (!trip) {
    return null;
  }

  const isOwner = trip.userId === user?.id;

  return (
    <div className="container-custom py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          to="/trips"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Trips</span>
        </Link>

        {/* Header */}
        <div className="card p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{trip.title}</h1>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trip.status)}`}>
                {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
              </span>
            </div>

            {isOwner && (
              <div className="flex items-center space-x-2">
                <Link
                  to={`/trips/${trip.id}/edit`}
                  className="btn btn-secondary flex items-center space-x-2"
                >
                  <Edit className="w-5 h-5" />
                  <span>Edit</span>
                </Link>
                <button
                  onClick={handleDelete}
                  className="btn bg-red-50 text-red-600 hover:bg-red-100 flex items-center space-x-2"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>

          {trip.description && (
            <p className="text-gray-700 whitespace-pre-wrap">{trip.description}</p>
          )}
        </div>

        {/* Trip Details */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Dates */}
          <div className="card p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-bold text-gray-900">Travel Dates</h2>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-600">Start:</span>
                <p className="font-medium text-gray-900">
                  {format(new Date(trip.startDate), 'MMMM d, yyyy')}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">End:</span>
                <p className="font-medium text-gray-900">
                  {format(new Date(trip.endDate), 'MMMM d, yyyy')}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Duration:</span>
                <p className="font-medium text-gray-900">
                  {Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
            </div>
          </div>

          {/* Budget */}
          {trip.budget && (
            <div className="card p-6">
              <div className="flex items-center space-x-2 mb-4">
                <DollarSign className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-bold text-gray-900">Budget</h2>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">Estimated:</span>
                  <p className="text-2xl font-bold text-gray-900">
                    {trip.budget.currency} {trip.budget.estimated?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Destinations */}
        {trip.destinations && trip.destinations.length > 0 && (
          <div className="card p-6 mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-bold text-gray-900">Destinations</h2>
            </div>
            <div className="space-y-2">
              {trip.destinations.map((destId, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-900">{destId}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Travelers */}
        {trip.travelers && trip.travelers.length > 0 && (
          <div className="card p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-bold text-gray-900">Travelers</h2>
            </div>
            <p className="text-gray-700">
              {trip.travelers.length} {trip.travelers.length === 1 ? 'person' : 'people'} traveling
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripDetailPage;
