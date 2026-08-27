import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const TripCard = ({ trip, onDelete, isOwner = false }) => {
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

  const getStatusLabel = (status) => {
    const labels = {
      planning: 'Đang lên kế hoạch',
      upcoming: 'Sắp diễn ra',
      ongoing: 'Đang diễn ra',
      completed: 'Đã hoàn thành',
      active: 'Đang diễn ra',
      cancelled: 'Đã hủy',
    };
    return labels[status] || status;
  };

  return (
    <div className="card p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Link
            to={`/trips/${trip.id}`}
            className="text-xl font-bold text-gray-900 hover:text-primary-600 transition-colors"
          >
            {trip.title}
          </Link>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(trip.status)}`}>
            {getStatusLabel(trip.status)}
          </span>
        </div>
        
        {isOwner && (
          <div className="flex items-center space-x-2">
            <Link
              to={`/trips/${trip.id}/edit`}
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Sửa chuyến đi"
            >
              <Edit className="w-5 h-5" />
            </Link>
            <button
              onClick={() => onDelete && onDelete(trip.id)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="Xóa chuyến đi"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {trip.description && (
        <p className="text-gray-600 mb-4 line-clamp-2">{trip.description}</p>
      )}

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>
            {format(new Date(trip.startDate), 'dd/MM/yyyy')} - {format(new Date(trip.endDate), 'dd/MM/yyyy')}
          </span>
        </div>

        {trip.destinations && trip.destinations.length > 0 && (
          <div className="flex items-start text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-1">
              {trip.destinations.length} điểm đến
            </span>
          </div>
        )}

        {trip.travelers && trip.travelers.length > 0 && (
          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>
              {trip.travelers.length} người tham gia
            </span>
          </div>
        )}
      </div>

      {trip.budget && (
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Ngân sách:</span>
            <span className="font-semibold text-gray-900">
              {trip.budget.currency} {trip.budget.estimated?.toLocaleString() || 'Chưa đặt'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripCard;
