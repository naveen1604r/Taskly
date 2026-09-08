/**
 * Centralized Authentication Storage Utility
 * Manages JWT access token and user metadata in localStorage.
 * Stores required keys: userId, name, email, token, as well as composite user object.
 * Strictly guarantees passwords are NEVER stored.
 */

export const AUTH_TOKEN_KEY = 'taskly_auth_token';
export const AUTH_USER_KEY = 'taskly_auth_user';

export const getToken = () => {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem('token') || null;
  } catch {
    return null;
  }
};

export const setToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem('token', token);
    } else {
      removeToken();
    }
  } catch (error) {
    console.warn('Failed to set auth token:', error);
  }
};

export const removeToken = () => {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem('token');
  } catch (error) {
    console.warn('Failed to remove auth token:', error);
  }
};

export const getStoredUser = () => {
  try {
    // 1. Try composite user object
    const raw = localStorage.getItem(AUTH_USER_KEY) || localStorage.getItem('user');
    let parsed = null;
    if (raw) {
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = null;
      }
    }

    // 2. Read individual required keys
    const userId = localStorage.getItem('userId');
    const name = localStorage.getItem('name');
    const email = localStorage.getItem('email');

    if (parsed && typeof parsed === 'object') {
      return {
        id: parsed.id || parsed.userId || userId || null,
        name: parsed.name ?? name ?? '',
        email: parsed.email ?? email ?? '',
        avatarUrl: parsed.avatarUrl || parsed.avatar_url || null,
        timezone: parsed.timezone || 'UTC',
      };
    }

    if (userId || name || email) {
      return {
        id: userId || null,
        name: name || '',
        email: email || '',
        avatarUrl: null,
        timezone: 'UTC',
      };
    }

    return null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  try {
    if (user) {
      // Strictly exclude password or hash fields
      const { password, passwordHash, password_hash, ...safeData } = user;

      const sanitized = {
        id: safeData.id || safeData.userId || null,
        name: safeData.name || '',
        email: safeData.email || '',
        avatarUrl: safeData.avatarUrl || safeData.avatar_url || null,
        timezone: safeData.timezone || 'UTC',
      };

      // Store in composite JSON keys
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(sanitized));
      localStorage.setItem('user', JSON.stringify(sanitized));

      // Store individual required keys for seamless interoperability
      if (sanitized.id) localStorage.setItem('userId', String(sanitized.id));
      if (sanitized.name) localStorage.setItem('name', sanitized.name);
      if (sanitized.email) localStorage.setItem('email', sanitized.email);
    } else {
      removeStoredUser();
    }
  } catch (error) {
    console.warn('Failed to set stored user:', error);
  }
};

export const removeStoredUser = () => {
  try {
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
  } catch (error) {
    console.warn('Failed to remove stored user:', error);
  }
};

export const clearAuthStorage = () => {
  removeToken();
  removeStoredUser();
  try {
    const keysToRemove = [
      'taskly_tasks',
      'taskly_projects',
      'taskly_goals',
      'taskly_notes',
      'taskly_habits',
      'taskly_habit_logs',
      'taskly_habit_order',
      'taskly_focus_sessions',
      'taskly_focus_active_session',
      'taskly_recurring_tasks',
      'taskly_notifications',
      'taskly_reminders',
      'taskly_activities',
      'taskly_inbox',
      'taskly_task_templates',
      'taskly_settings',
    ];
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch (e) {
    console.warn('Failed to clear entity cache on logout:', e);
  }
};

export default {
  getToken,
  setToken,
  removeToken,
  getStoredUser,
  setStoredUser,
  removeStoredUser,
  clearAuthStorage,
};
