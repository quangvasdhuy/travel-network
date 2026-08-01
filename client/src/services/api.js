import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  logout: () => api.post('/api/auth/logout'),
  refresh: (refreshToken) => api.post('/api/auth/refresh', { refreshToken }),
  me: () => api.get('/api/auth/me'),
};

// User API
export const userAPI = {
  getProfile: (username) => api.get(`/api/users/username/${username}`),
  updateProfile: (data) => api.patch('/api/users/me', data),
  uploadPhoto: (formData) => api.post('/api/users/me/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  searchUsers: (query) => api.get('/api/users/search', { params: { q: query } }),
  getUserStats: (userId) => api.get(`/api/users/${userId}/stats`),
};

// Connection API
export const connectionAPI = {
  follow: (userId) => api.post(`/api/connections/follow/${userId}`),
  unfollow: (userId) => api.delete(`/api/connections/follow/${userId}`),
  getFollowers: (userId) => api.get(`/api/connections/followers/${userId}`),
  getFollowing: (userId) => api.get(`/api/connections/following/${userId}`),
  getConnectionStatus: (userId) => api.get(`/api/connections/status/${userId}`),
  getSuggestions: () => api.get('/api/connections/suggestions'),
};

// Destination API
export const destinationAPI = {
  getAll: (params) => api.get('/api/destinations', { params }),
  getById: (id) => api.get(`/api/destinations/${id}`),
  search: (query) => api.get('/api/destinations/search', { params: { q: query } }),
  getPopular: (limit = 10) => api.get('/api/destinations/popular', { params: { limit } }),
  getByCountry: (countryCode) => api.get('/api/destinations/country', { params: { countryCode } }),
};

// Trip API
export const tripAPI = {
  create: (data) => api.post('/api/trips', data),
  getAll: (params) => api.get('/api/trips', { params }),
  getById: (id) => api.get(`/api/trips/${id}`),
  update: (id, data) => api.patch(`/api/trips/${id}`, data),
  delete: (id) => api.delete(`/api/trips/${id}`),
  getMyTrips: () => api.get('/api/trips/my-trips'),
  getUpcoming: () => api.get('/api/trips/upcoming'),
};

// Post API
export const postAPI = {
  create: (formData) => api.post('/api/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getFeed: (params) => api.get('/api/posts/feed', { params }),
  getPopular: (params) => api.get('/api/posts/popular', { params }),
  getByUser: (userId, params) => api.get(`/api/posts/user/${userId}`, { params }),
  getById: (id) => api.get(`/api/posts/${id}`),
  update: (id, data) => api.put(`/api/posts/${id}`, data),
  delete: (id) => api.delete(`/api/posts/${id}`),
  like: (id) => api.post(`/api/posts/${id}/like`),
  unlike: (id) => api.delete(`/api/posts/${id}/like`),
  addComment: (id, data) => api.post(`/api/posts/${id}/comments`, data),
  deleteComment: (postId, commentId) => api.delete(`/api/posts/${postId}/comments/${commentId}`),
};

// Search API
export const searchAPI = {
  unified: (query, params) => api.get('/api/search', { params: { q: query, ...params } }),
  autocomplete: (query, type = 'destinations') => api.get('/api/search/autocomplete', {
    params: { q: query, type },
  }),
  advanced: (filters) => api.get('/api/search/advanced', { params: filters }),
};

// Discovery API
export const discoveryAPI = {
  getTrending: (params) => api.get('/api/discovery/trending/destinations', { params }),
  getPopularPosts: (params) => api.get('/api/discovery/popular/posts', { params }),
  getRecommendedTrips: () => api.get('/api/discovery/recommended/trips'),
  getNearbyTravelers: () => api.get('/api/discovery/nearby-travelers'),
  getPersonalized: () => api.get('/api/discovery/personalized'),
  getActivity: (params) => api.get('/api/discovery/activity', { params }),
  getSimilar: (destinationId) => api.get(`/api/discovery/similar/destinations/${destinationId}`),
  getExplore: () => api.get('/api/discovery/explore'),
};

export { api };
export default api;
