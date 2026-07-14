const isBrowser = typeof window !== "undefined";

export const AUTH_SESSION_KEY = "arrows:auth-session";

const AUTH_STORAGE_KEYS = Object.freeze([
  "token",
  "user",
  "userEmail",
  "userName",
  "userRole",
  "userPersona",
]);

export const startAuthSession = () => {
  if (!isBrowser) return;
  window.sessionStorage.setItem(AUTH_SESSION_KEY, "true");
};

/**
 * Clears the current auth session flag from sessionStorage
 * and removes all auth-related keys from localStorage.
 */
export const clearAuthSession = () => {
  if (!isBrowser) return;
  window.sessionStorage.removeItem(AUTH_SESSION_KEY);
  AUTH_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
};

/**
 * Checks whether the user has a valid auth session.
 * NOTE: As a side effect, clears the session if a token exists
 * but the session flag is missing (stale session cleanup).
 */
export const hasAuthSession = () => {
  if (!isBrowser) return false;

  const hasToken = Boolean(window.localStorage.getItem("token"));
  const hasCurrentSession =
    window.sessionStorage.getItem(AUTH_SESSION_KEY) === "true";

  if (hasToken && !hasCurrentSession) {
    clearAuthSession();
    return false;
  }

  return hasToken && hasCurrentSession;
};
