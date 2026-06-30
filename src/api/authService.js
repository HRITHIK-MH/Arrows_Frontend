import API, { createServiceApi } from './axiosConfig';

const identityApi = createServiceApi('');

const normalizeAuthPayload = (payload) => {
  const data = payload && typeof payload === 'object' && payload.data && typeof payload.data === 'object'
    ? payload.data
    : payload;

  return data && typeof data === 'object' ? data : {};
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
  const redirectUri = `${window.location.origin}/login/sso-callback`;
  const response = await identityApi.get('/sso/authorize-url', {
    params: {
      ...(loginHint ? { login_hint: String(loginHint).trim() } : {}),
      redirect_uri: redirectUri,
    },
    skipAuth: true,
    skipAuthRedirect: true,
  });
  // Extract from wrapped response format: response.data.data.authorizationUrl
  const wrappedData = normalizeAuthPayload(response?.data || response || {});
  if (typeof wrappedData === 'string') {
    return wrappedData.trim();
  }
  if (wrappedData && typeof wrappedData === 'object') {
    return String(wrappedData.authorizationUrl || '').trim();
  }
  return '';
};

// 🔑 Exchange SSO callback for token
export const exchangeSsoCallback = async ({ code, state }) => {
  const redirectUri = `${window.location.origin}/login/sso-callback`;

  try {
    const response = await identityApi.get('/sso/callback', {
      params: { code, state, redirect_uri: redirectUri },
      skipAuth: true,
      skipAuthRedirect: true,
    });

    const data = normalizeAuthPayload(response?.data || {});

    // ✅ Store JWT token if present
    const token = storeAuthToken(data);

    // ✅ Store additional user info
    if (data?.email) localStorage.setItem('userEmail', data.email);
    if (data?.name) localStorage.setItem('userName', data.name);
    if (data?.userId) localStorage.setItem('userId', data.userId);
    if (data?.tokenType) localStorage.setItem('tokenType', data.tokenType);

    console.log('SSO callback data stored:', { token, ...data });

    return data;
  } catch (error) {
    console.error('Failed to exchange SSO callback:', error);
    throw error;
  }
};
