import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect, useState, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeMode: 'system' as ThemeMode,
      setThemeMode: (mode: ThemeMode) => set({ themeMode: mode }),
    }),
    {
      name: 'wwx-theme',
    }
  )
);

function getSystemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function resolveIsDark(mode: ThemeMode): boolean {
  return mode === 'dark' || (mode === 'system' && getSystemPrefersDark());
}

function applyDarkClass(isDark: boolean) {
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function useThemeInitializer() {
  const themeMode = useThemeStore((s) => s.themeMode);
  const [isDark, setIsDark] = useState(() => resolveIsDark(themeMode));

  const updateTheme = useCallback((mode: ThemeMode) => {
    const dark = resolveIsDark(mode);
    setIsDark(dark);
    applyDarkClass(dark);
  }, []);

  useEffect(() => {
    updateTheme(themeMode);
  }, [themeMode, updateTheme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const currentMode = useThemeStore.getState().themeMode;
      if (currentMode === 'system') {
        updateTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [updateTheme]);

  return { isDark };
}
