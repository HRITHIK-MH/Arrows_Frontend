import API, { createServiceApi } from './axiosConfig';

const identityApi = createServiceApi('identity');

const normalizeAuthPayload = (payload) => {
  const data = payload && typeof payload === 'object' && payload.data && typeof payload.data === 'object'
    ? payload.data
    : payload;

  return data && typeof data === 'object' ? data : {};
};

// 🔑 Login with email/password
export const loginWithPassword = async ({ email, password }) => {
  const response = await identityApi.post('/login', { email, password }, {
    skipAuth: true,
    skipAuthRedirect: true,
  });
  const data = normalizeAuthPayload(response?.data || {});

  // ✅ Store JWT token if present
  if (data.access_token) {
    localStorage.setItem('authToken', data.access_token);
  } else if (data.token) {
    localStorage.setItem('authToken', data.token);
  }

  return data;
};

// 🔑 Fetch SSO authorize URL
export const fetchSsoAuthorizeUrl = async (loginHint) => {
  const response = await identityApi.get('/sso/authorize-url', {
    params: loginHint ? { login_hint: String(loginHint).trim() } : {},
    skipAuth: true,
    skipAuthRedirect: true,
  });
  return String(response?.data?.authorizationUrl || '').trim();
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
  if (data.access_token) {
    localStorage.setItem('authToken', data.access_token);
  } else if (data.token) {
    localStorage.setItem('authToken', data.token);
  }

  return data;
};
