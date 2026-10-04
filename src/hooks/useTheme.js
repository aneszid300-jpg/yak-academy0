import { useCallback, useEffect, useSyncExternalStore } from "react";

const THEME_KEY = "yak-theme";

function readTheme() {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

// One theme value shared by every component that uses the hook (the sidebar
// toggle and the Settings page must never disagree).
let current = readTheme();
const listeners = new Set();
function setTheme(next) {
  current = next;
  listeners.forEach((listener) => listener());
}
function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
const getSnapshot = () => current;

// Theme lives on <html data-theme>, exactly like the legacy pages.
// The initial value is applied by the inline script in index.html.
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(current === "dark" ? "light" : "dark");
  }, []);

  return { theme, isDark: theme === "dark", toggleTheme, setTheme };
}
