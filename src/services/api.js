/**
 * Taskly Frontend API Service Foundation
 * Provides centralized HTTP client with environment-based URL,
 * automatic JSON handling, automatic Bearer authentication header injection,
 * and centralized 401 unauthorized handling.
 */

import { getToken, clearAuthStorage } from '../utils/authStorage';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

let authToken = null;

/**
 * Configure or update in-memory authentication token
 */
export const setAuthToken = (token) => {
  authToken = token;
};

export const getAuthToken = () => authToken || getToken();

/**
 * Base HTTP request handler
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  // Automatically attach Bearer token if available
  const token = authToken || getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    if (!response.ok) {
      // Centralized 401 Unauthorized handling
      if (response.status === 401) {
        // Clear invalid token from storage
        clearAuthStorage();
        // Dispatch custom event for AuthContext to react without infinite loop
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('taskly:auth-unauthorized', {
              detail: { path: endpoint, status: 401 },
            })
          );
        }
      }

      const error = new Error(data?.message || `HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.status !== 401) {
      console.warn(`[API Error] ${options.method || 'GET'} ${url}:`, error.message);
    }
    throw error;
  }
}

/**
 * REST API Client Methods
 */
export const api = {
  baseUrl: API_BASE_URL,

  get: (endpoint, params = {}) => {
    let url = endpoint;
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) query.append(key, val);
    });
    const queryString = query.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
    return request(url, { method: 'GET' });
  },

  post: (endpoint, body = {}) => {
    return request(endpoint, { method: 'POST', body });
  },

  put: (endpoint, body = {}) => {
    return request(endpoint, { method: 'PUT', body });
  },

  patch: (endpoint, body = {}) => {
    return request(endpoint, { method: 'PATCH', body });
  },

  delete: (endpoint) => {
    return request(endpoint, { method: 'DELETE' });
  },

  // Authentication API endpoints
  auth: {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
  },

  // Task & Subtask API endpoints (Step 27)
  tasks: {
    getAll: (params = {}) => api.get('/tasks', params),
    getById: (id) => api.get(`/tasks/${id}`),
    create: (data) => api.post('/tasks', data),
    update: (id, data) => api.put(`/tasks/${id}`, data),
    delete: (id) => api.delete(`/tasks/${id}`),
    complete: (id) => api.patch(`/tasks/${id}/complete`),
    updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),

    // Subtasks
    getSubtasks: (taskId) => api.get(`/tasks/${taskId}/subtasks`),
    createSubtask: (taskId, data) => api.post(`/tasks/${taskId}/subtasks`, data),
    updateSubtask: (taskId, subtaskId, data) => api.put(`/tasks/${taskId}/subtasks/${subtaskId}`, data),
    deleteSubtask: (taskId, subtaskId) => api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`),
  },

  // Project API endpoints (Step 28)
  projects: {
    getAll: (params = {}) => api.get('/projects', params),
    getById: (id) => api.get(`/projects/${id}`),
    create: (data) => api.post('/projects', data),
    update: (id, data) => api.put(`/projects/${id}`, data),
    delete: (id) => api.delete(`/projects/${id}`),
    complete: (id) => api.patch(`/projects/${id}/complete`),
    archive: (id) => api.patch(`/projects/${id}/archive`),
    restore: (id) => api.patch(`/projects/${id}/restore`),
  },

  // Goal API endpoints (Step 28)
  goals: {
    getAll: (params = {}) => api.get('/goals', params),
    getById: (id) => api.get(`/goals/${id}`),
    create: (data) => api.post('/goals', data),
    update: (id, data) => api.put(`/goals/${id}`, data),
    delete: (id) => api.delete(`/goals/${id}`),
    complete: (id) => api.patch(`/goals/${id}/complete`),
    archive: (id) => api.patch(`/goals/${id}/archive`),
    restore: (id) => api.patch(`/goals/${id}/restore`),
    updateProgress: (id, progress) => api.patch(`/goals/${id}/progress`, { progress }),
  },

  // Note API endpoints (Step 28)
  notes: {
    getAll: (params = {}) => api.get('/notes', params),
    getById: (id) => api.get(`/notes/${id}`),
    create: (data) => api.post('/notes', data),
    update: (id, data) => api.put(`/notes/${id}`, data),
    delete: (id) => api.delete(`/notes/${id}`),
    pin: (id) => api.patch(`/notes/${id}/pin`),
    unpin: (id) => api.patch(`/notes/${id}/unpin`),
    archive: (id) => api.patch(`/notes/${id}/archive`),
    restore: (id) => api.patch(`/notes/${id}/restore`),
  },

  // Focus API endpoints (Step 29)
  focus: {
    getSessions: (params = {}) => api.get('/focus/sessions', params),
    createSession: (data) => api.post('/focus/sessions', data),
    getStats: () => api.get('/focus/stats'),
    getSettings: () => api.get('/focus/settings'),
    updateSettings: (data) => api.put('/focus/settings', data),
  },

  // Habit API endpoints (Step 29)
  habits: {
    getAll: (params = {}) => api.get('/habits', params),
    getById: (id) => api.get(`/habits/${id}`),
    create: (data) => api.post('/habits', data),
    update: (id, data) => api.put(`/habits/${id}`, data),
    delete: (id) => api.delete(`/habits/${id}`),
    archive: (id) => api.patch(`/habits/${id}/archive`),
    restore: (id) => api.patch(`/habits/${id}/restore`),
    logProgress: (id, data) => api.post(`/habits/${id}/log`, data),
    getLogs: (id, params = {}) => api.get(`/habits/${id}/logs`, params),
    getAllLogs: (params = {}) => api.get('/habits/logs', params),
  },

  // Recurring Task API endpoints (Step 29)
  recurringTasks: {
    getAll: (params = {}) => api.get('/recurring-tasks', params),
    getById: (id) => api.get(`/recurring-tasks/${id}`),
    create: (data) => api.post('/recurring-tasks', data),
    update: (id, data) => api.put(`/recurring-tasks/${id}`, data),
    delete: (id) => api.delete(`/recurring-tasks/${id}`),
    pause: (id) => api.patch(`/recurring-tasks/${id}/pause`),
    resume: (id) => api.patch(`/recurring-tasks/${id}/resume`),
    generate: (targetDate) => api.post('/recurring-tasks/generate', { targetDate }),
  },

  // Reminder API endpoints (Step 29)
  reminders: {
    getAll: (params = {}) => api.get('/reminders', params),
    getById: (id) => api.get(`/reminders/${id}`),
    create: (data) => api.post('/reminders', data),
    update: (id, data) => api.put(`/reminders/${id}`, data),
    delete: (id) => api.delete(`/reminders/${id}`),
    toggle: (id) => api.patch(`/reminders/${id}/toggle`),
    snooze: (id, minutes = 10) => api.patch(`/reminders/${id}/snooze`, { minutes }),
  },

  // Notification API endpoints (Step 29)
  notifications: {
    getAll: (params = {}) => api.get('/notifications', params),
    create: (data) => api.post('/notifications', data),
    markAsRead: (id) => api.patch(`/notifications/${id}/read`),
    markAllAsRead: () => api.patch('/notifications/read-all'),
    delete: (id) => api.delete(`/notifications/${id}`),
    clearAll: () => api.delete('/notifications/clear-all'),
  },

  // Activity API endpoints (Step 29)
  activity: {
    getAll: (params = {}) => api.get('/activity', params),
    create: (data) => api.post('/activity', data),
    clearAll: () => api.delete('/activity'),
  },

  // Inbox API endpoints (Step 29)
  inbox: {
    getAll: (params = {}) => api.get('/inbox', params),
    getById: (id) => api.get(`/inbox/${id}`),
    create: (data) => api.post('/inbox', data),
    update: (id, data) => api.put(`/inbox/${id}`, data),
    delete: (id) => api.delete(`/inbox/${id}`),
    process: (id, data) => api.post(`/inbox/${id}/process`, data),
  },

  // User Settings API endpoints
  settings: {
    get: () => api.get('/settings'),
    update: (data) => api.put('/settings', data),
  },

  // Health check helper
  checkHealth: async () => {
    try {
      return await request('/health', { method: 'GET' });
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to connect to Taskly backend server',
        database: 'disconnected',
        error: error.data || null,
      };
    }
  },
};

export default api;
