import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';
type Language = 'en' | 'vi';

interface UIState {
  theme: Theme;
  language: Language;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  toggleTheme: () => void;
}

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: getInitialTheme(),
      language: 'en',
      setTheme: (theme) => set(() => ({ theme })),
      setLanguage: (language) => set(() => ({ language })),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
    }),
    {
      name: 'avora-ui',
      partialize: (state) => ({ theme: state.theme, language: state.language }),
    }
  )
);
