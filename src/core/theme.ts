import { useCallback, useEffect, useState } from "react";
import { Classes } from "@blueprintjs/core";

const STORAGE_KEY = "x52.theme";

/**
 * Dark is the platform default (the Palantir context). A stored choice wins;
 * otherwise we follow the OS.
 */
function resolveInitialTheme(): boolean {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "dark") return true;
    if (stored === "light") return false;
  } catch {
    // Storage can throw in private windows — fall through to the OS preference.
  }
  return !window.matchMedia("(prefers-color-scheme: light)").matches;
}

/**
 * Owns the platform colour scheme. The Blueprint dark class goes on
 * <html> rather than an inner div so the page ground (overscroll, the area
 * below short content) matches the app surface instead of flashing white.
 */
export function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState(resolveInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle(Classes.DARK, isDarkMode);
    document.documentElement.style.colorScheme = isDarkMode ? "dark" : "light";
  }, [isDarkMode]);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
      } catch {
        // Persistence is a convenience; ignore storage failures.
      }
      return next;
    });
  }, []);

  return { isDarkMode, toggleTheme };
}
