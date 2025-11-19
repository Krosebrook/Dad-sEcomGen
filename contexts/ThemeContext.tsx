import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeVariant, ColorMode, Theme, createTheme, applyThemeToDocument } from '../lib/themes';
import { AnimationConfig, globalAnimationEngine } from '../lib/animations';

interface ThemeContextValue {
  theme: Theme;
  variant: ThemeVariant;
  colorMode: ColorMode;
  animationConfig: AnimationConfig;
  setVariant: (variant: ThemeVariant) => void;
  setColorMode: (mode: ColorMode) => void;
  toggleColorMode: () => void;
  updateAnimationConfig: (config: Partial<AnimationConfig>) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEYS = {
  VARIANT: 'app-theme-variant',
  COLOR_MODE: 'app-color-mode',
  ANIMATION_CONFIG: 'app-animation-config',
};

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  console.log('ThemeProvider: Initializing...');
  const [variant, setVariantState] = useState<ThemeVariant>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.VARIANT);
    return (stored as ThemeVariant) || 'minimalist';
  });

  const [colorMode, setColorModeState] = useState<ColorMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.COLOR_MODE);
    if (stored) return stored as ColorMode;

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const [animationConfig, setAnimationConfigState] = useState<AnimationConfig>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.ANIMATION_CONFIG);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return globalAnimationEngine.getConfig();
      }
    }
    return globalAnimationEngine.getConfig();
  });

  const [theme, setTheme] = useState<Theme>(() => createTheme(variant, colorMode));

  useEffect(() => {
    console.log('ThemeProvider: Applying theme variant:', variant, 'mode:', colorMode);
    const newTheme = createTheme(variant, colorMode);
    setTheme(newTheme);
    applyThemeToDocument(newTheme);
  }, [variant, colorMode]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem(STORAGE_KEYS.COLOR_MODE);
      if (!stored) {
        setColorModeState(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const setVariant = (newVariant: ThemeVariant) => {
    setVariantState(newVariant);
    localStorage.setItem(STORAGE_KEYS.VARIANT, newVariant);
  };

  const setColorMode = (newMode: ColorMode) => {
    setColorModeState(newMode);
    localStorage.setItem(STORAGE_KEYS.COLOR_MODE, newMode);

    if (newMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleColorMode = () => {
    setColorMode(colorMode === 'light' ? 'dark' : 'light');
  };

  const updateAnimationConfig = (updates: Partial<AnimationConfig>) => {
    const newConfig = { ...animationConfig, ...updates };
    setAnimationConfigState(newConfig);
    globalAnimationEngine.updateConfig(newConfig);
    localStorage.setItem(STORAGE_KEYS.ANIMATION_CONFIG, JSON.stringify(newConfig));
  };

  console.log('ThemeProvider: Rendering with theme:', variant, colorMode);
  return (
    <ThemeContext.Provider
      value={{
        theme,
        variant,
        colorMode,
        animationConfig,
        setVariant,
        setColorMode,
        toggleColorMode,
        updateAnimationConfig,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
