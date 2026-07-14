/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);
const THEME_STORAGE_KEY = "app-theme";
const LIGHT_THEME = "light";

export function ThemeProvider({ children }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    () => localStorage.getItem("app-notifications") !== "false"
  );

  useEffect(() => {
    document.documentElement.dataset.theme = LIGHT_THEME;
    document.documentElement.classList.remove("dark");
    document.documentElement.style.backgroundColor = "#ffffff";
    localStorage.setItem(THEME_STORAGE_KEY, LIGHT_THEME);
  }, []);

  useEffect(() => {
    localStorage.setItem("app-notifications", String(notificationsEnabled));
  }, [notificationsEnabled]);

  return (
    <ThemeContext.Provider
      value={{
        notificationsEnabled,
        setNotificationsEnabled,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
