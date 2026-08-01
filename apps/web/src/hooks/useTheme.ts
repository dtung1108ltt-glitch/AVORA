import { useEffect } from 'react';
import { useUIStore } from '../store/ui.store';

export function useTheme() {
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);
  const toggleTheme = useUIStore((state) => state.toggleTheme);

  useEffect(() => {
    const el = document.documentElement;
    if (theme === 'dark') {
      el.classList.add('dark');
    } else {
      el.classList.remove('dark');
    }
  }, [theme]);

  return {
    isDark: theme === 'dark',
    theme,
    toggleTheme,
    setTheme,
  };
}
