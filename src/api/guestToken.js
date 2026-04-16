import API from './axiosConfig';

const SUPERSET_PROXY_PATH = '/api/superset/guest-token';
const SUPERSET_PROXY_PATH_WITH_API_BASE = '/superset/guest-token';

const getSupersetProxyEndpoint = () => {
  const baseURL = (API.defaults.baseURL || '').replace(/\/+$/, '');

  if (baseURL.endsWith('/api')) {
    return SUPERSET_PROXY_PATH_WITH_API_BASE;
  }

  return SUPERSET_PROXY_PATH;
};

export const fetchDashboardGuestToken = async (payload) => {
  const dashboardKey = payload?.dashboardKey || 'default';

  try {
    const proxyResponse = await API.get(getSupersetProxyEndpoint(), {
      params: {
        dashboard: dashboardKey,
      },
    });
    const data = proxyResponse?.data;

    if (!data) {
      throw new Error('Guest token response was empty');
    }

    return {
      token: data.token || data.guest_token || '',
      raw: data,
    };
  } catch (proxyError) {
    const errorMessage =
      proxyError?.response?.data?.error ||
      proxyError?.response?.data?.message ||
      proxyError?.message ||
      'Failed to fetch guest token from backend proxy';
    throw new Error(errorMessage);
  }
};
