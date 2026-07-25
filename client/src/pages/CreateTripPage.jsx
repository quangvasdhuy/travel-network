import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripAPI, destinationAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { MapPin, Calendar, DollarSign, Users, FileText, Search, X } from 'lucide-react';

const CreateTripPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchingDestinations, setSearchingDestinations] = useState(false);
  const [destinationQuery, setDestinationQuery] = useState('');
  const [destinationResults, setDestinationResults] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
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

    if (!formData.name.trim()) {
      newErrors.name = 'Trip name is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const tripData = {
        ...formData,
        budget: {
          ...formData.budget,
          estimated: formData.budget.estimated ? parseFloat(formData.budget.estimated) : 0,
        },
      };

      const response = await tripAPI.create(tripData);
      toast.success('Trip created successfully!');
      navigate(`/trips/${response.data.data.trip.id}`);
    } catch (error) {
      console.error('Error creating trip:', error);
      toast.error(error.response?.data?.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Trip</h1>
          <p className="text-gray-600">Plan your next adventure</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Trip Name */}
          <div className="card p-6">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Trip Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`input ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="e.g., Summer Europe Adventure"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="input"
                  placeholder="Describe your trip..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="planning">Planning</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-2">
                    Visibility
                  </label>
                  <select
                    id="visibility"
                    name="visibility"
                    value={formData.visibility}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="public">Public</option>
                    <option value="connections">Connections Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="card p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900">Travel Dates</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
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
                  End Date *
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
              <h2 className="text-xl font-bold text-gray-900">Destinations</h2>
            </div>

            <div className="mb-4">
              <label htmlFor="destination-search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Destinations
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="destination-search"
                  value={destinationQuery}
                  onChange={handleDestinationSearch}
                  className="input pl-10"
                  placeholder="Search for destinations..."
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
                  Selected Destinations ({formData.destinations.length})
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
              <h2 className="text-xl font-bold text-gray-900">Budget</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="budget.currency" className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
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
                  Estimated Budget
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
              disabled={loading}
              className="btn btn-primary flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="small" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Trip</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/trips')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTripPage;
