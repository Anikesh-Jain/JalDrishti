/**
 * JalDrishti Phase 14: Frontend API Service Foundation
 *
 * Lightweight, reusable HTTP request client configured via environment variables.
 * Uses native fetch to minimize frontend dependencies.
 * Supports Authorization Bearer token header injection and centralized endpoint methods.
 */

const resolveBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }
  if (import.meta.env.PROD) {
    console.error('[JalDrishti Warning] Neither VITE_API_URL nor VITE_API_BASE_URL is configured in production environment! Falling back to localhost:5000.');
  }
  return 'http://localhost:5000/api';
};

const BASE_URL = resolveBaseUrl();
const TOKEN_KEY = 'jaldrishti_auth_token';

let activeToken = null;

// Initialize activeToken from browser storage if present
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    activeToken = window.localStorage.getItem(TOKEN_KEY);
  }
} catch {
  // Graceful fallback for non-browser or sandbox environments
  activeToken = null;
}

/**
 * Set or clear the active in-memory and persistent auth token
 * @param {string|null} token
 */
export function setAuthToken(token) {
  activeToken = token || null;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (token) {
        window.localStorage.setItem(TOKEN_KEY, token);
      } else {
        window.localStorage.removeItem(TOKEN_KEY);
      }
    }
  } catch {
    // Ignore storage quota or access errors
  }
}

/**
 * Get the current auth token
 * @returns {string|null}
 */
export function getAuthToken() {
  if (activeToken) return activeToken;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      activeToken = window.localStorage.getItem(TOKEN_KEY);
    }
  } catch {
    // Ignore storage errors
  }
  return activeToken;
}

/**
 * Perform an HTTP request to the backend API
 *
 * @param {string} endpoint - API path relative to BASE_URL (e.g. '/auth/login' or '/health')
 * @param {Object} [options] - Fetch request options
 * @returns {Promise<any>} Parsed JSON response
 */
async function request(endpoint, options = {}) {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // If endpoint is a root service check like /health, route to root host without /api prefix
  const isRootEndpoint = options.isRoot || normalizedEndpoint === '/health';
  const rootUrl = BASE_URL.replace(/\/api\/?$/, '');
  const url = isRootEndpoint ? `${rootUrl}${normalizedEndpoint}` : `${BASE_URL}${normalizedEndpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  // Inject Bearer token if not explicitly provided and token exists
  const token = options.token || getAuthToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  } else if (config.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  try {
    const response = await fetch(url, config);

    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage =
        (data && typeof data === 'object' && (data.error || data.message)) ||
        (typeof data === 'string' && data) ||
        `HTTP error ${response.status}`;

      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.status) {
      throw err;
    }
    // Network or connection error (avoid logging secrets or sensitive URL query params)
    const netErr = new Error(`Network error connecting to API: ${err.message}`);
    netErr.status = 0;
    throw netErr;
  }
}

export const api = {
  getBaseUrl: () => BASE_URL,
  getTokenKey: () => TOKEN_KEY,
  setAuthToken,
  getAuthToken,
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),

  // Canonical Phase 4 Backend Authentication Endpoints
  auth: {
    register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
    login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
    demoLogin: (role) => request('/auth/demo-login', { method: 'POST', body: { role } }),
    google: (credential) => request('/auth/google', { method: 'POST', body: { credential } }),
    getMe: (token) => request('/auth/me', { method: 'GET', token }),
    updateProfile: (data) => request('/auth/profile', { method: 'PUT', body: data }),
    updateOnboarding: (status) => request('/auth/onboarding', { method: 'PUT', body: { status } }),
    forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: { email } }),
    resetPassword: (data) => request('/auth/reset-password', { method: 'POST', body: data })
  },


  // Canonical Admin Overview Endpoints (Read-only data aggregation + Phase 20 settings)
  admin: {
    getHealth: () => request('/health', { isRoot: true }),
    getActiveAlerts: () => request('/alerts/active'),
    getRecentAlerts: (limit = 5) => request(`/alerts?limit=${limit}`),
    getThresholds: () => request('/thresholds'),
    getNotificationConfig: () => request('/notifications/config'),
    updateThreshold: (parameter, data) => request(`/thresholds/${encodeURIComponent(parameter)}`, {
      method: 'PUT',
      body: data
    }),
    updateNotificationConfig: (data) => request('/notifications/config', {
      method: 'PUT',
      body: data
    })
  },

  // Canonical Phase 20 Threshold Endpoints (Admin configuration)
  thresholds: {
    getAll: () => request('/thresholds'),
    getByParam: (parameter) => request(`/thresholds/${encodeURIComponent(parameter)}`),
    update: (parameter, data) => request(`/thresholds/${encodeURIComponent(parameter)}`, {
      method: 'PUT',
      body: data
    })
  },

  // Canonical Phase 20 Notification Endpoints (Admin configuration)
  notifications: {
    getConfig: () => request('/notifications/config'),
    updateConfig: (data) => request('/notifications/config', {
      method: 'PUT',
      body: data
    }),
    getAll: (params = {}) => {
      const query = new URLSearchParams();
      if (params.alertId) query.set('alertId', params.alertId);
      if (params.deliveryStatus) query.set('deliveryStatus', params.deliveryStatus);
      if (params.channel) query.set('channel', params.channel);
      if (params.page) query.set('page', params.page);
      if (params.limit) query.set('limit', params.limit);
      const qs = query.toString();
      return request(`/notifications${qs ? `?${qs}` : ''}`);
    }
  },

  // Canonical Citizen Overview Endpoints (Read-only data aggregation)
  citizen: {
    getLatestReading: () => request('/sensor/readings/latest'),
    getActiveAlerts: () => request('/alerts/active'),
    getHistoricalReadings: (params = {}) => {
      const query = new URLSearchParams();
      if (params.from) query.set('from', params.from);
      if (params.to) query.set('to', params.to);
      if (params.limit) query.set('limit', params.limit);
      if (params.nodeId) query.set('nodeId', params.nodeId);
      const qs = query.toString();
      return request(`/sensor/readings/history${qs ? `?${qs}` : ''}`);
    },
    getNodes: () => request('/sensor/nodes')
  },

  // Canonical Phase 18 Alert Endpoints (Read-only)
  alerts: {
    getAll: (params = {}) => {
      const query = new URLSearchParams();
      if (params.nodeId) query.set('nodeId', params.nodeId);
      if (params.parameter) query.set('parameter', params.parameter);
      if (params.status) query.set('status', params.status);
      if (params.page) query.set('page', params.page);
      if (params.limit) query.set('limit', params.limit);
      const qs = query.toString();
      return request(`/alerts${qs ? `?${qs}` : ''}`);
    },
    getActive: (params = {}) => {
      const query = new URLSearchParams();
      if (params.nodeId) query.set('nodeId', params.nodeId);
      if (params.parameter) query.set('parameter', params.parameter);
      const qs = query.toString();
      return request(`/alerts/active${qs ? `?${qs}` : ''}`);
    },
    getHistory: (params = {}) => {
      const query = new URLSearchParams();
      if (params.nodeId) query.set('nodeId', params.nodeId);
      if (params.parameter) query.set('parameter', params.parameter);
      if (params.page) query.set('page', params.page);
      if (params.limit) query.set('limit', params.limit);
      const qs = query.toString();
      return request(`/alerts/history${qs ? `?${qs}` : ''}`);
    },
    getById: (id) => request(`/alerts/${encodeURIComponent(id)}`),
    acknowledge: (id) => request(`/alerts/${encodeURIComponent(id)}/ack`, { method: 'PATCH' })
  },

  // Canonical Phase 19 Sensor Nodes Endpoints
  nodes: {
    getAll: () => request('/sensor/nodes'),
    getLatestReading: () => request('/sensor/readings/latest'),
    create: (data) => request('/sensor/nodes', { method: 'POST', body: data }),
    update: (nodeId, data) => request(`/sensor/nodes/${encodeURIComponent(nodeId)}`, { method: 'PATCH', body: data }),
    delete: (nodeId) => request(`/sensor/nodes/${encodeURIComponent(nodeId)}`, { method: 'DELETE' })
  },

  // Sensor telemetry namespace alias
  sensor: {
    getNodes: () => request('/sensor/nodes'),
    getAll: () => request('/sensor/nodes'),
    getLatestReading: () => request('/sensor/readings/latest'),
    createNode: (data) => request('/sensor/nodes', { method: 'POST', body: data }),
    updateNode: (nodeId, data) => request(`/sensor/nodes/${encodeURIComponent(nodeId)}`, { method: 'PATCH', body: data }),
    deleteNode: (nodeId) => request(`/sensor/nodes/${encodeURIComponent(nodeId)}`, { method: 'DELETE' }),
    getHistory: (params = {}) => {
      const query = new URLSearchParams();
      if (params.from) query.set('from', params.from);
      if (params.to) query.set('to', params.to);
      if (params.limit) query.set('limit', params.limit);
      if (params.nodeId) query.set('nodeId', params.nodeId);
      const qs = query.toString();
      return request(`/sensor/readings/history${qs ? `?${qs}` : ''}`);
    },
    getHistoricalReadings: (params = {}) => {
      const query = new URLSearchParams();
      if (params.from) query.set('from', params.from);
      if (params.to) query.set('to', params.to);
      if (params.limit) query.set('limit', params.limit);
      if (params.nodeId) query.set('nodeId', params.nodeId);
      const qs = query.toString();
      return request(`/sensor/readings/history${qs ? `?${qs}` : ''}`);
    }
  },

  // User Management Endpoints (Admin-only)
  users: {
    getAll: (params = {}) => {
      const query = new URLSearchParams();
      if (params.role) query.set('role', params.role);
      if (params.status) query.set('status', params.status);
      if (params.search) query.set('search', params.search);
      const qs = query.toString();
      return request(`/users${qs ? `?${qs}` : ''}`);
    },
    create: (userData) => request('/users', { method: 'POST', body: userData }),
    update: (id, updates) => request(`/users/${encodeURIComponent(id)}`, { method: 'PATCH', body: updates }),
    delete: (id) => request(`/users/${encodeURIComponent(id)}`, { method: 'DELETE' })
  },

  // Canonical Phase 21 Reporting & Data Export Endpoints
  reports: {
    getReadings: (params = {}) => {
      const query = new URLSearchParams();
      if (params.from) query.set('from', params.from);
      if (params.to) query.set('to', params.to);
      if (params.nodeId) query.set('nodeId', params.nodeId);
      if (params.limit) query.set('limit', params.limit);
      if (params.format) query.set('format', params.format);
      const qs = query.toString();
      return request(`/reports/readings${qs ? `?${qs}` : ''}`);
    },
    getAlerts: (params = {}) => {
      const query = new URLSearchParams();
      if (params.from) query.set('from', params.from);
      if (params.to) query.set('to', params.to);
      if (params.nodeId) query.set('nodeId', params.nodeId);
      if (params.parameter) query.set('parameter', params.parameter);
      if (params.status) query.set('status', params.status);
      if (params.direction) query.set('direction', params.direction);
      if (params.limit) query.set('limit', params.limit);
      if (params.format) query.set('format', params.format);
      const qs = query.toString();
      return request(`/reports/alerts${qs ? `?${qs}` : ''}`);
    }
  },

  // Canonical Phase 23 AI Water Image Screening Endpoints
  imageScreening: {
    getStatus: () => request('/image-checks/status'),
    screen: (formData) => request('/image-checks/screen', {
      method: 'POST',
      body: formData
    }),
    getHistory: (params = {}) => {
      const query = new URLSearchParams();
      if (params.page) query.set('page', params.page);
      if (params.limit) query.set('limit', params.limit);
      if (params.all) query.set('all', 'true');
      const qs = query.toString();
      return request(`/image-checks${qs ? `?${qs}` : ''}`);
    }
  },

  // Canonical Contact Us Inquiries Endpoints
  contact: {
    submit: (data) => request('/contact', { method: 'POST', body: data }),
    getInquiries: (params = {}) => {
      const query = new URLSearchParams();
      if (params.status) query.set('status', params.status);
      if (params.q) query.set('q', params.q);
      if (params.page) query.set('page', params.page);
      if (params.limit) query.set('limit', params.limit);
      const qs = query.toString();
      return request(`/contact${qs ? `?${qs}` : ''}`);
    },
    getInquiry: (id) => request(`/contact/${encodeURIComponent(id)}`),
    updateStatus: (id, data) => request(`/contact/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: data
    }),
    reply: (id, data) => request(`/contact/${encodeURIComponent(id)}/reply`, {
      method: 'POST',
      body: data
    }),
    retryEmail: (id, replyId) => request(`/contact/${encodeURIComponent(id)}/reply/${encodeURIComponent(replyId)}/retry`, {
      method: 'POST'
    })
  },

  // Citizen Ready-Made Hardware Management & Onboarding
  hardware: {
    getMyDevice: (params = {}) => {
      const query = new URLSearchParams();
      if (params.nodeId) query.set('nodeId', params.nodeId);
      const qs = query.toString();
      return request(`/hardware/my-device${qs ? `?${qs}` : ''}`);
    },
    claim: (data) => request('/hardware/claim', { method: 'POST', body: data }),
    unpair: () => request('/hardware/unpair', { method: 'POST' }),
    provisionWifi: (data) => request('/hardware/wifi-provision', { method: 'POST', body: data }),
    getBlynkStatus: (params = {}) => {
      const query = new URLSearchParams();
      if (params.nodeId) query.set('nodeId', params.nodeId);
      const qs = query.toString();
      return request(`/hardware/blynk-status${qs ? `?${qs}` : ''}`);
    },
    getDiagnostics: (params = {}) => {
      const query = new URLSearchParams();
      if (params.nodeId) query.set('nodeId', params.nodeId);
      const qs = query.toString();
      return request(`/hardware/diagnostics${qs ? `?${qs}` : ''}`);
    }
  }
};

export default api;
