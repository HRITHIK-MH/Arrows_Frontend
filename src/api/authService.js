import API, { createServiceApi } from './axiosConfig';

const identityApi = createServiceApi('');

const normalizeAuthPayload = (payload) => {
  const data = payload && typeof payload === 'object' && payload.data && typeof payload.data === 'object'
    ? payload.data
    : payload;

  return data && typeof data === 'object' ? data : {};
};

const extractAuthorizationUrl = (payload) => {
  const normalizedPayload = payload && typeof payload === 'object' && payload.data && typeof payload.data === 'object'
    ? payload.data
    : payload;

  if (typeof normalizedPayload === 'string') {
    return normalizedPayload.trim();
  }

  if (normalizedPayload && typeof normalizedPayload === 'object') {
    const url = normalizedPayload.authorizationUrl
      || normalizedPayload.authorization_url
      || normalizedPayload.url
      || normalizedPayload.redirectUrl;
    return String(url || '').trim();
  }

  return '';
};

const storeAuthToken = (payload = {}) => {
  const token = String(
    payload?.access_token || payload?.token || payload?.accessToken || payload?.jwt || ''
  ).trim();

  if (token) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('token', token);
  }

  return token;
};

// 🔑 Login with email/password
export const loginWithPassword = async ({ email, password }) => {
  const response = await identityApi.post('/login', { email, password }, {
    skipAuth: true,
    skipAuthRedirect: true,
  });
  const data = normalizeAuthPayload(response?.data || {});

  // ✅ Store JWT token if present
  storeAuthToken(data);

  return data;
};

// 🔑 Fetch SSO authorize URL
export const fetchSsoAuthorizeUrl = async (loginHint) => {
  const response = await identityApi.get('/sso/authorize-url', {
    params: loginHint ? { login_hint: String(loginHint).trim() } : {},
    skipAuth: true,
    skipAuthRedirect: true,
  });
  return extractAuthorizationUrl(response?.data || response || {});
};

// 🔑 Exchange SSO callback for token
export const exchangeSsoCallback = async ({ code, state }) => {
  const response = await identityApi.get('/sso/callback', {
    params: { code, state },
    skipAuth: true,
    skipAuthRedirect: true,
  });
  const data = normalizeAuthPayload(response?.data || {});

  // ✅ Store JWT token if present
  storeAuthToken(data);

  return data;
};
