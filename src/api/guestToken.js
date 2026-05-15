import API from './axiosConfig';
import { resolveEmbedSupersetDomain } from '../utils/embedSupersetDomain';

/** Arrows_back: GET /api/superset-token (see Arrows_back/routes/supersetRoutes.js) */
const SUPERSET_TOKEN_PATH = 'superset-token';

function guestTokenFromEnv() {
  const token = import.meta.env.VITE_SUPERSET_GUEST_TOKEN || '';
  if (!token) {
    return null;
  }
  const hint =
    import.meta.env.VITE_SUPERSET_EMBED_ORIGIN ||
    import.meta.env.VITE_SUPERSET_URL ||
    '';
  return {
    token,
    dashboardUuid: import.meta.env.VITE_SUPERSET_EMBED_ID || '',
    supersetDomain: resolveEmbedSupersetDomain(String(hint).replace(/\/+$/, '')),
    raw: { source: 'VITE_SUPERSET_GUEST_TOKEN' },
  };
}

export const fetchDashboardGuestToken = async () => {
  try {
    const proxyResponse = await API.get(SUPERSET_TOKEN_PATH, {
      skipAuth: true,
      skipAuthRedirect: true,
    });
    const data = proxyResponse?.data;

    if (!data) {
      throw new Error('Guest token response was empty');
    }

    const token = data.token || data.guest_token || '';

    return {
      token,
      dashboardUuid: data.dashboardUuid || data.dashboard_uuid || '',
      supersetDomain: data.supersetDomain || data.superset_domain || '',
      raw: data,
    };
  } catch (proxyError) {
    const fromEnv = guestTokenFromEnv();
    if (fromEnv?.token) {
      console.warn(
        '[superset] Using VITE_SUPERSET_GUEST_TOKEN because GET /api/superset-token failed. Prefer fixing Arrows_back + VITE_API_URL proxy; static guest JWTs expire.',
      );
      return fromEnv;
    }

    const errorMessage =
      proxyError?.response?.data?.error ||
      proxyError?.response?.data?.message ||
      proxyError?.message ||
      'Failed to fetch guest token from Arrows_back (GET /api/superset-token). Is the embed backend running?';
    throw new Error(errorMessage);
  }
};
