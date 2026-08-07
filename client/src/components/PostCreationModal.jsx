import { useState, useEffect } from 'react';
import { postAPI, destinationAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { X, Image as ImageIcon, MapPin, Search, Upload } from 'lucide-react';

const PostCreationModal = ({ isOpen, onClose, onPostCreated, post, isEditing = false }) => {
  const [loading, setLoading] = useState(false);
  const [searchingDestinations, setSearchingDestinations] = useState(false);
  const [destinationQuery, setDestinationQuery] = useState('');
  const [destinationResults, setDestinationResults] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [formData, setFormData] = useState({
    content: '',
    media: [],
    destinationId: null,
    visibility: 'public',
  });
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [errors, setErrors] = useState({});

  // Load post data when editing
  useEffect(() => {
    if (isEditing && post) {
      setFormData({
        content: post.content?.text || '',
        media: post.content?.media || [],
        destinationId: post.destinationId || null,
        visibility: post.visibility || 'public',
      });
      
      // Set existing media previews
      if (post.content?.media && post.content.media.length > 0) {
        setMediaPreviews(post.content.media.map(m => m.url));
      }
      
      // Set destination if exists (need full object with id for updates)
      if (post.destinationId && post.destinationName) {
        setSelectedDestination({
          id: post.destinationId,
          name: post.destinationName,
          country: post.destinationCountry,
        });
      }
    }
  }, [isEditing, post]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
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
      console.log('[PostModal] Searching destinations for:', query);
      const response = await destinationAPI.search(query);
      console.log('[PostModal] Search response:', response.data);
      const destinations = response.data.data?.destinations || response.data.data || [];
      console.log('[PostModal] Found destinations:', destinations.length);
      setDestinationResults(destinations);
    } catch (error) {
      console.error('[PostModal] Error searching destinations:', error);
      console.error('[PostModal] Error response:', error.response?.data);
      setDestinationResults([]);
    } finally {
      setSearchingDestinations(false);
    }
  };

  const handleDestinationSearch = (e) => {
    const query = e.target.value;
    setDestinationQuery(query);
    searchDestinations(query);
  };

  const selectDestination = (destination) => {
    const destinationId = `destination::${destination.countryCode}::${destination.slug}`;
    setSelectedDestination(destination);
    setFormData(prev => ({ ...prev, destinationId }));
    setDestinationQuery('');
    setDestinationResults([]);
  };

  const removeDestination = () => {
    setSelectedDestination(null);
    setFormData(prev => ({ ...prev, destinationId: null }));
  };

  const handleMediaSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file count (max 5)
    if (mediaFiles.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    // Validate file size (max 50MB total)
    const totalSize = [...mediaFiles, ...files].reduce((sum, file) => sum + file.size, 0);
    if (totalSize > 50 * 1024 * 1024) {
      toast.error('Total file size must be less than 50MB');
      return;
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      toast.error('Only JPG, PNG, GIF, and WebP images are allowed');
      return;
    }

    // Create previews
    const newPreviews = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === files.length) {
          setMediaPreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setMediaFiles(prev => [...prev, ...files]);
  };

  const removeMedia = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.content.trim()) {
      newErrors.content = 'Post content is required';
    }

    if (formData.content.length > 5000) {
      newErrors.content = 'Content must be less than 5000 characters';
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
      if (isEditing) {
        // Update existing post
        const updateData = {
          text: formData.content,
          visibility: formData.visibility,
        };
        
        if (formData.destinationId) {
          updateData.destinationId = formData.destinationId;
        }

        const response = await postAPI.update(post.id, updateData);
        toast.success('Post updated successfully!');
        
        if (onPostCreated) {
          onPostCreated(response.data.data.post);
        }
      } else {
        // Create new post
        const submitData = new FormData();
        submitData.append('text', formData.content);
        submitData.append('visibility', formData.visibility);
        
        if (formData.destinationId) {
          submitData.append('destinationId', formData.destinationId);
        }

        // Append media files
        mediaFiles.forEach((file) => {
          submitData.append('media', file);
        });

        const response = await postAPI.create(submitData);
        toast.success('Post created successfully!');
        
        if (onPostCreated) {
          onPostCreated(response.data.data.post);
        }
      }
      
      // Reset form
      setFormData({
        content: '',
        media: [],
        destinationId: null,
        visibility: 'public',
      });
      setMediaFiles([]);
      setMediaPreviews([]);
      setSelectedDestination(null);
      
      onClose();
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} post:`, error);
      toast.error(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} post`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    
    if (formData.content || mediaFiles.length > 0) {
      if (!window.confirm('Discard this post?')) {
        return;
      }
    }
    
    // Reset form
    setFormData({
      content: '',
      media: [],
      destinationId: null,
      visibility: 'public',
    });
    setMediaFiles([]);
    setMediaPreviews([]);
    setSelectedDestination(null);
    setErrors({});
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Post' : 'Create Post'}
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              What's on your mind? *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={6}
              className={`input resize-none ${errors.content ? 'border-red-500' : ''}`}
              placeholder="Share your travel experience, tips, or thoughts..."
              disabled={loading}
            />
            <div className="flex items-center justify-between mt-1">
              {errors.content ? (
                <p className="text-sm text-red-600">{errors.content}</p>
              ) : (
                <span className="text-sm text-gray-500">
                  {formData.content.length}/5000 characters
                </span>
              )}
            </div>
          </div>

          {/* Media Upload */}
          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos (up to 5, max 50MB total)
              </label>
            
            {mediaPreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {mediaPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      disabled={loading}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                      aria-label="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {mediaFiles.length < 5 && (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-primary-600">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF, WebP (max 50MB total)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  multiple
                  onChange={handleMediaSelect}
                  disabled={loading}
                />
              </label>
            )}
          </div>
          )}

          {/* Destination Search */}
          <div>
            <label htmlFor="destination-search" className="block text-sm font-medium text-gray-700 mb-2">
              Add Location
            </label>
            
            {selectedDestination ? (
              <div className="flex items-center justify-between p-3 bg-primary-50 border border-primary-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900">{selectedDestination.name}</p>
                    <p className="text-sm text-gray-600">{selectedDestination.country}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeDestination}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700 disabled:opacity-50"
                  aria-label="Remove location"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="destination-search"
                    value={destinationQuery}
                    onChange={handleDestinationSearch}
                    className="input pl-10"
                    placeholder="Search for a destination..."
                    disabled={loading}
                  />
                </div>

                {destinationResults.length > 0 && (
                  <div className="mt-2 border border-gray-200 rounded-lg bg-white shadow-lg max-h-48 overflow-y-auto">
                    {destinationResults.map((dest) => (
                      <button
                        key={dest.id}
                        type="button"
                        onClick={() => selectDestination(dest)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0"
                      >
                        <p className="font-medium text-gray-900">{dest.name}</p>
                        <p className="text-sm text-gray-600">{dest.country}</p>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Visibility */}
          <div>
            <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-2">
              Who can see this?
            </label>
            <select
              id="visibility"
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
              className="input"
              disabled={loading}
            >
              <option value="public">Public</option>
              <option value="connections">Connections Only</option>
              <option value="private">Private</option>
            </select>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center space-x-4 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-1 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="small" />
                  <span>{isEditing ? 'Updating...' : 'Posting...'}</span>
                </>
              ) : (
                <span>{isEditing ? 'Update' : 'Post'}</span>
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
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

export default PostCreationModal;
