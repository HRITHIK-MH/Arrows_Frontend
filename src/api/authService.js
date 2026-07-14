import API, { createServiceApi } from "./axiosConfig";

const identityApi = createServiceApi("");

const normalizeAuthPayload = (payload) => {
  const data =
    payload &&
    typeof payload === "object" &&
    payload.data &&
    typeof payload.data === "object"
      ? payload.data
      : payload;

  return data && typeof data === "object" ? data : {};
};

const storeAuthToken = (payload = {}) => {
  const token = String(
    payload?.access_token ||
      payload?.token ||
      payload?.accessToken ||
      payload?.jwt ||
      "",
  ).trim();

  if (token) {
    localStorage.setItem("token", token);
  }

  return token;
};

// 🔑 Login with email/password
export const loginWithPassword = async ({ email, password }) => {
  const response = await identityApi.post(
    "/login",
    { email, password },
    {
      skipAuth: true,
      skipAuthRedirect: true,
    },
  );
  const data = normalizeAuthPayload(response?.data || {});

  // ✅ Store JWT token if present
  storeAuthToken(data);

  return data;
};

// 🔑 Fetch SSO authorize URL
export const fetchSsoAuthorizeUrl = async (loginHint) => {
  const redirectUri = `${window.location.origin}/sso/callback`;
  console.debug("Starting SSO login with redirect uri:", redirectUri);

  try {
    const response = await identityApi.get("/sso/authorize-url", {
      params: {
        ...(loginHint ? { login_hint: String(loginHint).trim() } : {}),
        redirect_uri: redirectUri,
      },
      skipAuth: true,
      skipAuthRedirect: true,
    });

    const wrappedData = normalizeAuthPayload(response?.data || response || {});
    if (typeof wrappedData === "string") {
      return wrappedData.trim();
    }
    if (wrappedData && typeof wrappedData === "object") {
      return String(wrappedData.authorizationUrl || "").trim();
    }
    return "";
  } catch (error) {
    console.error("Failed to fetch SSO authorize URL:", error);
    throw error;
  }
};
