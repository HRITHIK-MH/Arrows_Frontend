import axios from 'axios';

function normalizeApiBaseUrl(url = '') {
  const trimmed = String(url || '').trim().replace(/\/+$/, '');
  if (!trimmed) {
    return '';
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return /\/api(\/|$)/i.test(trimmed) ? trimmed : `${trimmed}/api`;
  }
  return trimmed.replace(/^\/+/, '').replace(/\/+/g, '/');
}

export const resolveApiBaseUrl = (serviceName = '') => {
  const backendConfigured = String(import.meta.env.VITE_BACKEND_URL || '').trim();
  const fallback = '/api';
  const host = String(window?.location?.hostname || '').toLowerCase();
  const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0';
  const normalizedService = String(serviceName || '').trim().replace(/^\/+/, '');
  const shouldUseRootApi = normalizedService.toLowerCase() === 'clientjob';

  const joinService = (base) => {
    if (!normalizedService || shouldUseRootApi) return base;
    return `${base.replace(/\/+$/, '')}/${normalizedService}`.replace(/\/+/, '/');
  };

  if (isLocalHost) {
    return joinService('/api');
  }

  if (backendConfigured && !/https?:\/\/api\.example\.com\/?$/i.test(backendConfigured)) {
    return joinService(normalizeApiBaseUrl(backendConfigured));
  }

  return joinService(fallback);
};

// Create axios instance with default config
const API = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const normalizeServiceUrl = (serviceName, url = '') => {
  const normalizedService = String(serviceName || '').trim().replace(/^\/+/, '');
  const shouldUseRootApi = normalizedService.toLowerCase() === 'clientjob';
  const prefix = normalizedService && !shouldUseRootApi ? `/${normalizedService}` : '';
  const trimmedUrl = String(url || '').trim();
  if (!trimmedUrl) {
    return prefix;
  }
  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl;
  }
  const path = trimmedUrl.replace(/^\/+/, '');
  return `${prefix}/${path}`.replace(/\/+/g, '/');
};

export const createServiceApi = (serviceName) => {
  const name = serviceName == null ? '' : String(serviceName);
  if (!name) {
    // Don't throw in runtime; allow a root API when no service name provided.
    // This makes consumers more tolerant and avoids initialization crashes.
    console.warn('createServiceApi called without a service name — using root API');
  }

  return {
    get: (url, config) => API.get(normalizeServiceUrl(name, url), config),
    post: (url, data, config) => API.post(normalizeServiceUrl(name, url), data, config),
    put: (url, data, config) => API.put(normalizeServiceUrl(name, url), data, config),
    patch: (url, data, config) => API.patch(normalizeServiceUrl(name, url), data, config),
    delete: (url, config) => API.delete(normalizeServiceUrl(name, url), config),
    request: (config) => API.request({ ...config, url: normalizeServiceUrl(name, config?.url) }),
  };
};

// Request interceptor to add auth token
API.interceptors.request.use(
  (config) => {
    const skipAuth = Boolean(config?.skipAuth);
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (token && !skipAuth) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const skipAuthRedirect = Boolean(error?.config?.skipAuthRedirect);
    if (!error.response) {
      console.error('Network error: backend may be unavailable at API base URL', API.defaults.baseURL);
    } else if (error.response?.status === 401 && !skipAuthRedirect) {
      // Token expired or unauthorized
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      console.error('Access forbidden:', error.message);
    } else if (error.response?.status >= 500) {
      console.error('Server error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default API;
