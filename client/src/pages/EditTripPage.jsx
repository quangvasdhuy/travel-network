import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripAPI, destinationAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { MapPin, Calendar, DollarSign, Search, X, Save, ArrowLeft } from 'lucide-react';

const EditTripPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchingDestinations, setSearchingDestinations] = useState(false);
  const [destinationQuery, setDestinationQuery] = useState('');
  const [destinationResults, setDestinationResults] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    destinations: [],
    budget: {
      currency: 'USD',
      estimated: '',
    },
    status: 'planning',
    visibility: 'public',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadTrip();
  }, [id]);

  const loadTrip = async () => {
    try {
      const response = await tripAPI.getById(id);
      const trip = response.data.data.trip;
      
      setFormData({
        title: trip.title || '',
        description: trip.description || '',
        startDate: trip.startDate ? trip.startDate.split('T')[0] : '',
        endDate: trip.endDate ? trip.endDate.split('T')[0] : '',
        destinations: trip.destinations || [],
        budget: {
          currency: trip.budget?.currency || 'USD',
          estimated: trip.budget?.estimated || '',
        },
        status: trip.status || 'planning',
        visibility: trip.visibility || 'public',
      });
    } catch (error) {
      console.error('Error loading trip:', error);
      toast.error('Không tải được chuyến đi');
      navigate('/trips');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const searchDestinations = async (query) => {
    if (query.length < 2) {
      setDestinationResults([]);
      return;
    }

    setSearchingDestinations(true);
    try {
      const response = await destinationAPI.search(query);
      setDestinationResults(response.data.data.destinations || []);
    } catch (error) {
      console.error('Error searching destinations:', error);
    } finally {
      setSearchingDestinations(false);
    }
  };

  const handleDestinationSearch = (e) => {
    const query = e.target.value;
    setDestinationQuery(query);
    searchDestinations(query);
  };

  const addDestination = (destination) => {
    const destinationId = `destination::${destination.countryCode}::${destination.slug}`;
    if (!formData.destinations.includes(destinationId)) {
      setFormData(prev => ({
        ...prev,
        destinations: [...prev.destinations, destinationId],
      }));
    }
    setDestinationQuery('');
    setDestinationResults([]);
  };

  const removeDestination = (destinationId) => {
    setFormData(prev => ({
      ...prev,
      destinations: prev.destinations.filter(d => d !== destinationId),
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Vui lòng nhập tên chuyến đi';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Vui lòng chọn ngày bắt đầu';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Vui lòng chọn ngày kết thúc';
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSaving(true);

    try {
      const tripData = {
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        destinations: formData.destinations,
        budget: {
          currency: formData.budget.currency,
          estimated: formData.budget.estimated ? parseFloat(formData.budget.estimated) : 0,
        },
        status: formData.status,
        visibility: formData.visibility,
      };

      await tripAPI.update(id, tripData);
      toast.success('Cập nhật chuyến đi thành công!');
      navigate(`/trips/${id}`);
    } catch (error) {
      console.error('Error updating trip:', error);
      toast.error(error.response?.data?.message || 'Cập nhật chuyến đi thất bại');
    } finally {
      setSaving(false);
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
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate(`/trips/${id}`)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại chuyến đi</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chỉnh sửa chuyến đi</h1>
          <p className="text-gray-600">Cập nhật kế hoạch chuyến đi của bạn</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin cơ bản</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Tên chuyến đi *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`input ${errors.title ? 'border-red-500' : ''}`}
                  placeholder="VD: Hành trình châu Âu mùa hè"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="input"
                  placeholder="Mô tả về chuyến đi của bạn..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="planning">Đang lên kế hoạch</option>
                    <option value="upcoming">Sắp diễn ra</option>
                    <option value="ongoing">Đang diễn ra</option>
                    <option value="completed">Đã hoàn thành</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-2">
                    Quyền xem
                  </label>
                  <select
                    id="visibility"
                    name="visibility"
                    value={formData.visibility}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="public">Công khai</option>
                    <option value="connections">Chỉ người kết nối</option>
                    <option value="private">Riêng tư</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="card p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900">Thời gian</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày bắt đầu *
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`input ${errors.startDate ? 'border-red-500' : ''}`}
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                )}
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày kết thúc *
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`input ${errors.endDate ? 'border-red-500' : ''}`}
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                )}
              </div>
            </div>
          </div>

          {/* Destinations */}
          <div className="card p-6">
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900">Điểm đến</h2>
            </div>

            <div className="mb-4">
              <label htmlFor="destination-search" className="block text-sm font-medium text-gray-700 mb-2">
                Tìm điểm đến
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="destination-search"
                  value={destinationQuery}
                  onChange={handleDestinationSearch}
                  className="input pl-10"
                  placeholder="Nhập tên điểm đến..."
                />
              </div>

              {/* Search Results */}
              {destinationResults.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-lg bg-white shadow-lg max-h-60 overflow-y-auto">
                  {destinationResults.map((dest) => (
                    <button
                      key={dest.id}
                      type="button"
                      onClick={() => addDestination(dest)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0"
                    >
                      <p className="font-medium text-gray-900">{dest.name}</p>
                      <p className="text-sm text-gray-600">{dest.country}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Destinations */}
            {formData.destinations.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Điểm đến đã chọn ({formData.destinations.length})
                </p>
                <div className="space-y-2">
                  {formData.destinations.map((destId) => (
                    <div
                      key={destId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-sm text-gray-900">{destId}</span>
                      <button
                        type="button"
                        onClick={() => removeDestination(destId)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Budget */}
          <div className="card p-6">
            <div className="flex items-center space-x-2 mb-4">
              <DollarSign className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900">Ngân sách</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="budget.currency" className="block text-sm font-medium text-gray-700 mb-2">
                  Đơn vị tiền tệ
                </label>
                <select
                  id="budget.currency"
                  name="budget.currency"
                  value={formData.budget.currency}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="VND">VND (₫)</option>
                </select>
              </div>

              <div>
                <label htmlFor="budget.estimated" className="block text-sm font-medium text-gray-700 mb-2">
                  Ngân sách dự kiến
                </label>
                <input
                  type="number"
                  id="budget.estimated"
                  name="budget.estimated"
                  value={formData.budget.estimated}
                  onChange={handleChange}
                  className="input"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center space-x-4">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <LoadingSpinner size="small" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Lưu thay đổi</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/trips/${id}`)}
              className="btn btn-secondary"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTripPage;
