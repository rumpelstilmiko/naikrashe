import { useEffect, useState } from 'react';

const THEME_KEY = 'library_theme';

export function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return { theme, toggle: () => setTheme((value) => (value === 'light' ? 'dark' : 'light')) };
}
