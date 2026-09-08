import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setAuthToken } from '../services/api';
import {
  getToken,
  setToken,
  getStoredUser,
  setStoredUser,
  clearAuthStorage,
} from '../utils/authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getToken());
  const [user, setUser] = useState(() => getStoredUser());
  // If we already have a cached token, allow the app to render immediately with cached user
  const [isLoading, setIsLoading] = useState(() => {
    const savedToken = getToken();
    const savedUser = getStoredUser();
    return Boolean(savedToken && !savedUser);
  });
  const [authError, setAuthError] = useState(null);

  // Keep HTTP client auth header in sync with current token
  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  // Restore and verify session on initial startup / page refresh
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      const savedToken = getToken();
      const cachedUser = getStoredUser();

      if (!savedToken) {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      // Ensure API client has the token immediately
      setAuthToken(savedToken);

      // Immediately restore cached user to state if not already set
      if (cachedUser && isMounted) {
        setUser(cachedUser);
      }

      try {
        const res = await api.auth.getMe();
        const responseData = res?.data || res;
        const fetchedUser = responseData?.user || (responseData?.email ? responseData : null);

        if (isMounted && fetchedUser) {
          const mergedUser = {
            ...(cachedUser || {}),
            ...fetchedUser,
            id: fetchedUser.id || fetchedUser.userId || cachedUser?.id || null,
            name: fetchedUser.name ?? cachedUser?.name ?? '',
            email: fetchedUser.email ?? cachedUser?.email ?? '',
          };
          setUser(mergedUser);
          setStoredUser(mergedUser);
          setTokenState(savedToken);
        }
      } catch (err) {
        // Only invalidate session if server explicitly rejects credentials (401 / 403)
        if (err.status === 401 || err.status === 403) {
          if (isMounted) {
            clearAuthStorage();
            setUser(null);
            setTokenState(null);
          }
        } else {
          // Network errors or temporary server downtime: retain cached user & token
          console.warn('Backend unavailable during session restoration; retaining cached user:', err.message);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    restoreSession();

    // Listen for 401 unauthorized events from API client
    const handleUnauthorized = () => {
      if (isMounted) {
        setUser(null);
        setTokenState(null);
        clearAuthStorage();
      }
    };

    window.addEventListener('taskly:auth-unauthorized', handleUnauthorized);
    return () => {
      isMounted = false;
      window.removeEventListener('taskly:auth-unauthorized', handleUnauthorized);
    };
  }, []);

  // Register new user
  const register = useCallback(async ({ name, email, password, timezone }) => {
    setAuthError(null);
    try {
      const res = await api.auth.register({ name, email, password, timezone });
      const responseData = res?.data || res || {};
      const jwtToken = responseData.token || responseData.jwtToken || res.token;
      const rawUser = responseData.user || res.user || (responseData.id || responseData.email ? responseData : null);

      const userData = {
        id: rawUser?.id || rawUser?.userId || rawUser?._id || null,
        name: rawUser?.name || name.trim(),
        email: rawUser?.email || email.trim(),
        avatarUrl: rawUser?.avatarUrl || rawUser?.avatar_url || null,
        timezone: rawUser?.timezone || timezone || 'UTC',
      };

      if (jwtToken) {
        setToken(jwtToken);
        setAuthToken(jwtToken);
        setStoredUser(userData);
        setTokenState(jwtToken);
        setUser(userData);
      }

      return { success: true, user: userData, token: jwtToken };
    } catch (error) {
      const message = error.data?.message || error.message || 'Registration failed';
      setAuthError(message);
      throw error;
    }
  }, []);

  // Login existing user
  const login = useCallback(async ({ email, password }) => {
    setAuthError(null);
    try {
      const res = await api.auth.login({ email, password });
      const responseData = res?.data || res || {};
      const jwtToken = responseData.token || responseData.jwtToken || res.token;
      const rawUser = responseData.user || res.user || (responseData.id || responseData.email ? responseData : null);

      if (!jwtToken) {
        throw new Error('Authentication failed: No token returned by server.');
      }

      // Ensure user details contain name, email, and id without password
      const fallbackName = email.includes('@') ? email.split('@')[0] : 'User';
      const userData = {
        id: rawUser?.id || rawUser?.userId || rawUser?._id || null,
        name: rawUser?.name?.trim() || fallbackName,
        email: rawUser?.email?.trim() || email.trim(),
        avatarUrl: rawUser?.avatarUrl || rawUser?.avatar_url || null,
        timezone: rawUser?.timezone || 'UTC',
      };

      // 1. Store in localStorage immediately (userId, name, email, token)
      setToken(jwtToken);
      setStoredUser(userData);
      setAuthToken(jwtToken);

      // 2. Update React state immediately
      setTokenState(jwtToken);
      setUser(userData);

      return { success: true, user: userData, token: jwtToken };
    } catch (error) {
      const message = error.data?.message || error.message || 'Invalid email or password';
      setAuthError(message);
      throw error;
    }
  }, []);

  // Logout current user
  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch {
      // Stateless logout: proceed with client cleanup even if network fails
    } finally {
      clearAuthStorage();
      setUser(null);
      setTokenState(null);
      setAuthError(null);
      setAuthToken(null);
    }
  }, []);

  // Refresh current user data from server
  const refreshUser = useCallback(async () => {
    try {
      const res = await api.auth.getMe();
      const responseData = res?.data || res;
      const fetchedUser = responseData?.user;
      if (fetchedUser) {
        const updated = {
          id: fetchedUser.id || fetchedUser.userId,
          name: fetchedUser.name || '',
          email: fetchedUser.email || '',
          avatarUrl: fetchedUser.avatarUrl || fetchedUser.avatar_url || null,
          timezone: fetchedUser.timezone || 'UTC',
        };
        setUser(updated);
        setStoredUser(updated);
      }
    } catch (e) {
      console.warn('Failed to refresh user profile:', e);
    }
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    authError,
    setAuthError,
    register,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
