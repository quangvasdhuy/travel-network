import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { tripAPI } from '../services/api';
import TripCard from '../components/TripCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Plus, MapPin } from 'lucide-react';

const statusLabels = {
  all: 'Tất cả',
  planning: 'Đang lên kế hoạch',
  upcoming: 'Sắp diễn ra',
  ongoing: 'Đang diễn ra',
  completed: 'Đã hoàn thành',
  active: 'Đang diễn ra',
  cancelled: 'Đã hủy',
};

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
      toast.error('Không tải được danh sách chuyến đi');
      setTrips([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm('Bạn có chắc muốn xóa chuyến đi này?')) return;

    try {
      await tripAPI.delete(tripId);
      setTrips(prev => prev.filter(t => t.id !== tripId));
      toast.success('Đã xóa chuyến đi');
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast.error('Xóa chuyến đi thất bại');
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Chuyến đi của tôi</h1>
            <p className="text-gray-600">Lên kế hoạch và quản lý các chuyến đi của bạn</p>
          </div>
          <Link
            to="/trips/create"
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Tạo chuyến đi</span>
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
              {statusLabels[status]}
            </button>
          ))}
        </div>

        {/* Trips Grid */}
        {trips.length === 0 ? (
          <div className="card p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'Chưa có chuyến đi nào' : `Không có chuyến đi ${statusLabels[filter].toLowerCase()}`}
            </h3>
            <p className="text-gray-600 mb-6">
              Hãy bắt đầu lên kế hoạch cho chuyến đi tiếp theo!
            </p>
            <Link to="/trips/create" className="btn btn-primary inline-flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Tạo chuyến đi đầu tiên</span>
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
