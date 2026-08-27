import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    
    console.log('[AuthContext] Checking auth, token:', token ? 'exists' : 'missing');
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.me();
      console.log('[AuthContext] Auth check response:', response.data);
      setUser(response.data.data.user);
      setIsAuthenticated(true);
      console.log('[AuthContext] Auth successful, user:', response.data.data.user.username);
    } catch (error) {
      console.error('[AuthContext] Auth check failed:', error);
      console.error('[AuthContext] Error response:', error.response?.data);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    try {
      const response = await authAPI.register(data);
      // Backend returns: { data: { user, tokens: { accessToken, refreshToken } } }
      const { user: newUser, tokens } = response.data.data;
      const { accessToken, refreshToken } = tokens;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      setUser(newUser);
      setIsAuthenticated(true);
      
      toast.success('Tạo tài khoản thành công!');
      return { success: true };
    } catch (error) {
      const errorData = error.response?.data?.error;
      let message = error.response?.data?.message || 'Đăng ký thất bại';
      
      // Handle validation errors with details
      if (errorData?.details && Array.isArray(errorData.details)) {
        // Combine all field errors into one message
        const fieldErrors = errorData.details.map(detail => detail.message).join('. ');
        message = fieldErrors;
      } else if (errorData?.message) {
        message = errorData.message;
      }
      
      toast.error(message);
      return { success: false, error: message, details: errorData?.details };
    }
  };

  const login = async (credentials) => {
    try {
      console.log('[AuthContext] Logging in with credentials:', { emailOrUsername: credentials.emailOrUsername });
      const response = await authAPI.login(credentials);
      console.log('[AuthContext] Login response:', response.data);
      
      // Backend returns: { data: { user, tokens: { accessToken, refreshToken } } }
      const { user: loggedInUser, tokens } = response.data.data;
      const { accessToken, refreshToken } = tokens;
      
      console.log('[AuthContext] Extracted tokens:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken
      });
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      setUser(loggedInUser);
      setIsAuthenticated(true);
      
      console.log('[AuthContext] Login successful, user:', loggedInUser.username, 'authenticated:', true);
      toast.success(`Chào mừng trở lại, ${loggedInUser.username}!`);
      return { success: true };
    } catch (error) {
      console.error('[AuthContext] Login failed:', error);
      console.error('[AuthContext] Error response:', error.response?.data);
      const message = error.response?.data?.message || 'Đăng nhập thất bại';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Đã đăng xuất');
    }
  };

  const updateUser = (userData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...userData,
    }));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
    updateUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
