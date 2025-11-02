import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { apiClient } from '../config/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
  experienceLevel?: string;
  preferredRole?: string;
  phone?: string;
}

export const useAuth = () => {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.login(credentials);
      
      if (response.success) {
        dispatch({ type: 'SET_USER', payload: response.data.user });
        return response.data.user;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.register(userData);
      
      if (response.success) {
        return response;
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    
    try {
      await apiClient.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      dispatch({ type: 'LOGOUT' });
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      await apiClient.refreshToken();
      return true;
    } catch (err) {
      console.error('Token refresh failed:', err);
      dispatch({ type: 'LOGOUT' });
      return false;
    }
  };

  const forgotPassword = async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.forgotPassword(email);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset email';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.resetPassword(token, password);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password reset failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh token before expiry
  useEffect(() => {
    if (state.isAuthenticated) {
      const interval = setInterval(() => {
        refreshToken();
      }, 6 * 60 * 60 * 1000); // Refresh every 6 hours

      return () => clearInterval(interval);
    }
  }, [state.isAuthenticated]);

  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    refreshToken,
    forgotPassword,
    resetPassword,
    clearError: () => setError(null)
  };
};