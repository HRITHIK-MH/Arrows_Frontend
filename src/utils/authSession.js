export const AUTH_SESSION_KEY = "arrows:auth-session";

const AUTH_STORAGE_KEYS = [
  "authToken",
  "token",
  "user",
  "userEmail",
  "userName",
  "userRole",
  "userPersona",
];

export const startAuthSession = () => {
  window.sessionStorage.setItem(AUTH_SESSION_KEY, "true");
};

export const clearAuthSession = () => {
  window.sessionStorage.removeItem(AUTH_SESSION_KEY);
  AUTH_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
};

export const hasAuthSession = () => {
  const hasToken = Boolean(
    window.localStorage.getItem("authToken") ||
      window.localStorage.getItem("token"),
  );
  const hasCurrentSession =
    window.sessionStorage.getItem(AUTH_SESSION_KEY) === "true";

  if (hasToken && !hasCurrentSession) {
    clearAuthSession();
    return false;
  }

  return hasToken && hasCurrentSession;
};
