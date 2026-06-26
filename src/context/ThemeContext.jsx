/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);
const THEME_STORAGE_KEY = "app-theme";
const THEME_OPTIONS = new Set(["light", "dark", "system"]);

const getInitialThemePreference = () => {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  return THEME_OPTIONS.has(storedTheme) ? storedTheme : "system";
};

const getSystemTheme = () =>
  window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";

export function ThemeProvider({ children }) {
  const [themePreference, setThemePreference] = useState(getInitialThemePreference);
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    () => localStorage.getItem("app-notifications") !== "false"
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mediaQuery) return undefined;

    const handleSystemThemeChange = (event) => {
      setSystemTheme(event.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, []);

  useEffect(() => {
    const resolvedTheme = themePreference === "system" ? systemTheme : themePreference;

    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
    document.documentElement.style.backgroundColor = resolvedTheme === "dark" ? "#0f172a" : "#ffffff";
    localStorage.setItem(THEME_STORAGE_KEY, themePreference);
  }, [systemTheme, themePreference]);

  useEffect(() => {
    localStorage.setItem("app-notifications", String(notificationsEnabled));
  }, [notificationsEnabled]);

  return (
    <ThemeContext.Provider
      value={{
        notificationsEnabled,
        setNotificationsEnabled,
        themePreference,
        setThemePreference,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
