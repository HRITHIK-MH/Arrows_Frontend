import axios from 'axios';

const SERVICE_ENV_MAP = {
  identity: 'VITE_IDENTITY_SERVICE_URL',
  tenant: 'VITE_TENANT_SERVICE_URL',
  clientJob: 'VITE_CLIENT_JOB_SERVICE_URL',
  candidate: 'VITE_CANDIDATE_SERVICE_URL',
  applicationPipeline: 'VITE_APP_PIPELINE_SERVICE_URL',
  interview: 'VITE_INTERVIEW_SERVICE_URL',
  masterData: 'VITE_MASTER_DATA_SERVICE_URL',
  notification: 'VITE_NOTIFICATION_SERVICE_URL',
  headcount: 'VITE_HEADCOUNT_SERVICE_URL',
};

const DEFAULT_API_PATH = '/api';

function normalizeUrl(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}

function buildApiBaseUrl(base) {
  if (!base) return '';
  const url = normalizeUrl(base);
  if (!url) return '';
  if (/\/api$/i.test(url)) {
    return url;
  }
  return `${url}/api`;
}

function getEnvUrl(key) {
  return normalizeUrl(import.meta.env[key] || '');
}

function getServiceUrl(serviceName) {
  if (!serviceName) return '';
  const envKey = SERVICE_ENV_MAP[serviceName];
  return envKey ? getEnvUrl(envKey) : '';
}

export function resolveApiBaseUrl(serviceName) {
  const serviceUrl = getServiceUrl(serviceName);
  if (serviceUrl) {
    return buildApiBaseUrl(serviceUrl);
  }

  const backendUrl = getEnvUrl('VITE_BACKEND_URL');
  const configuredApiUrl = getEnvUrl('VITE_API_URL');
  const host = String(window?.location?.hostname || '').toLowerCase();
  const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0';

  if (isLocalHost) {
    return DEFAULT_API_PATH;
  }

  if (backendUrl) {
    return buildApiBaseUrl(backendUrl);
  }

  if (configuredApiUrl) {
    return buildApiBaseUrl(configuredApiUrl);
  }

  return DEFAULT_API_PATH;
}

function makeApiInstance(baseURL) {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use(
    (config) => {
      const skipAuth = Boolean(config?.skipAuth);
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (token && !skipAuth) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (config?.service) {
        config.baseURL = resolveApiBaseUrl(config.service);
      }

      return config;
    },
    (error) => Promise.reject(error),
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const skipAuthRedirect = Boolean(error?.config?.skipAuthRedirect);
      if (!error.response) {
        console.error('Network error: backend may be unavailable at API base URL', instance.defaults.baseURL);
      } else if (error.response?.status === 401 && !skipAuthRedirect) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (error.response?.status === 403) {
        console.error('Access forbidden:', error.message);
      } else if (error.response?.status >= 500) {
        console.error('Server error:', error.message);
      }
      return Promise.reject(error);
    },
  );

  return instance;
}

const API = makeApiInstance(resolveApiBaseUrl());
export const createServiceApi = (serviceName) => makeApiInstance(resolveApiBaseUrl(serviceName));
export default API;
