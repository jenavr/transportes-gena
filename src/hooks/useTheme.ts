import { useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'teg-theme';

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored === 'dark' || stored === 'light') return stored;
  return 'dark';
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggle = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return { theme, setTheme, toggle };
};
