import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeVariant, ColorMode, Theme, createTheme, applyThemeToDocument } from '../lib/themes';
import { AnimationConfig, globalAnimationEngine } from '../lib/animations';

interface ThemeContextValue {
  theme: Theme;
  variant: ThemeVariant;
  colorMode: ColorMode;
  animationConfig: AnimationConfig;
  isReady: boolean;
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

function safeGetLocalStorage(key: string, defaultValue: string): string {
  try {
    return localStorage.getItem(key) || defaultValue;
  } catch {
    return defaultValue;
  }
}

function safeSetLocalStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`Could not save ${key} to localStorage:`, error);
  }
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const [variant, setVariantState] = useState<ThemeVariant>(() => {
    const stored = safeGetLocalStorage(STORAGE_KEYS.VARIANT, 'minimalist');
    return (stored as ThemeVariant) || 'minimalist';
  });

  const [colorMode, setColorModeState] = useState<ColorMode>(() => {
    const stored = safeGetLocalStorage(STORAGE_KEYS.COLOR_MODE, '');
    if (stored) return stored as ColorMode;

    try {
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      console.warn('Could not detect color scheme preference');
    }
    return 'light';
  });

  const [animationConfig, setAnimationConfigState] = useState<AnimationConfig>(() => {
    try {
      const stored = safeGetLocalStorage(STORAGE_KEYS.ANIMATION_CONFIG, '');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      console.warn('Invalid animation config in storage');
    }
    return globalAnimationEngine.getConfig();
  });

  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return createTheme(variant, colorMode);
    } catch {
      return createTheme('minimalist', 'light');
    }
  });

  useEffect(() => {
    try {
      const newTheme = createTheme(variant, colorMode);
      setTheme(newTheme);
      applyThemeToDocument(newTheme);
      if (!isReady) {
        setIsReady(true);
      }
    } catch (error) {
      console.error('Error applying theme:', error);
      if (!isReady) {
        setIsReady(true);
      }
    }
  }, [variant, colorMode, isReady]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const stored = safeGetLocalStorage(STORAGE_KEYS.COLOR_MODE, '');
      if (!stored) {
        setColorModeState(e.matches ? 'dark' : 'light');
      }
    };

    try {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } catch {
      return undefined;
    }
  }, []);

  const setVariant = (newVariant: ThemeVariant) => {
    setVariantState(newVariant);
    safeSetLocalStorage(STORAGE_KEYS.VARIANT, newVariant);
  };

  const setColorMode = (newMode: ColorMode) => {
    setColorModeState(newMode);
    safeSetLocalStorage(STORAGE_KEYS.COLOR_MODE, newMode);

    try {
      if (newMode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.warn('Could not update document classes:', error);
    }
  };

  const toggleColorMode = () => {
    setColorMode(colorMode === 'light' ? 'dark' : 'light');
  };

  const updateAnimationConfig = (updates: Partial<AnimationConfig>) => {
    const newConfig = { ...animationConfig, ...updates };
    setAnimationConfigState(newConfig);
    try {
      globalAnimationEngine.updateConfig(newConfig);
      safeSetLocalStorage(STORAGE_KEYS.ANIMATION_CONFIG, JSON.stringify(newConfig));
    } catch (error) {
      console.warn('Could not save animation config:', error);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        variant,
        colorMode,
        animationConfig,
        isReady,
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
