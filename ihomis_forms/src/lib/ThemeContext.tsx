import { createContext, useContext, useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "ihomis-theme";

// Single source of truth for app-wide light/dark theme. The chosen theme is
// reflected on <html data-theme="..."> so every page and module can react via
// CSS, and persisted to localStorage. With no stored choice we follow the OS.
const ThemeContext = createContext({
  theme: "light",
  isDarkMode: false,
  toggleTheme: () => {},
  setTheme: (_theme) => {},
});

function getSystemPrefersDark() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

function getInitialTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // localStorage may be unavailable (private mode / embedded host); ignore.
  }
  return getSystemPrefersDark() ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);
  // Track whether the user has made an explicit choice; until they do we keep
  // mirroring the OS preference.
  const [hasExplicitChoice, setHasExplicitChoice] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === "light" || stored === "dark";
    } catch {
      return false;
    }
  });

  // Reflect the theme on the document root so global CSS can target it.
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }
  }, [theme]);

  // Follow the OS preference until the user explicitly picks a theme.
  useEffect(() => {
    if (hasExplicitChoice) return;
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setThemeState(e.matches ? "dark" : "light");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [hasExplicitChoice]);

  const setTheme = useCallback((next) => {
    setThemeState(next);
    setHasExplicitChoice(true);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Persisting is best-effort.
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider
      value={{ theme, isDarkMode: theme === "dark", toggleTheme, setTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default ThemeContext;
