import axios from 'axios';

function isLikelyJwt(token) {
  const value = String(token || '').trim();
  if (!value) {
    return false;
  }

  // Azure access tokens are JWTs with 3 base64url segments.
  return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value);
}

function resolveApiBaseUrl() {
  const configured = String(import.meta.env.VITE_API_URL || '').trim();
  const fallback = '/api';

  if (!configured) {
    return fallback;
  }

  // Guard against placeholder values left in env templates.
  if (/https?:\/\/api\.example\.com\/?$/i.test(configured)) {
    return '/api';
  }

  return configured;
}

// Create axios instance with default config
const API = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
API.interceptors.request.use(
  (config) => {
    const skipAuth = Boolean(config?.skipAuth);
    const rawToken = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (rawToken && !skipAuth) {
      if (isLikelyJwt(rawToken)) {
        config.headers.Authorization = `Bearer ${rawToken}`;
      } else {
        // Avoid poisoning requests with stale/non-JWT values that break backend auth parsing.
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
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
