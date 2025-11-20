export type ThemeVariant = 'minimalist' | 'cinematic' | 'futuristic';
export type ColorMode = 'light' | 'dark';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface Theme {
  variant: ThemeVariant;
  mode: ColorMode;
  colors: ThemeColors;
  fonts: {
    heading: string;
    body: string;
  };
  animations: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      default: string;
      smooth: string;
      bounce: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
}

export const themes: Record<ThemeVariant, Record<ColorMode, ThemeColors>> = {
  minimalist: {
    light: {
      primary: '#0066cc',
      secondary: '#64748b',
      accent: '#ea8c00',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#0f172a',
      textSecondary: '#475569',
      border: '#e2e8f0',
      success: '#008751',
      warning: '#ea8c00',
      error: '#c7000b',
      info: '#0066cc',
    },
    dark: {
      primary: '#4d9fff',
      secondary: '#64748b',
      accent: '#ffb84d',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      border: '#334155',
      success: '#00c26f',
      warning: '#ffb84d',
      error: '#ff4757',
      info: '#4d9fff',
    },
  },
  cinematic: {
    light: {
      primary: '#b8860b',
      secondary: '#44403c',
      accent: '#cd7f32',
      background: '#fafaf9',
      surface: '#f5f5f4',
      text: '#1c1917',
      textSecondary: '#57534e',
      border: '#d6d3d1',
      success: '#228b22',
      warning: '#ff8c00',
      error: '#8b0000',
      info: '#4682b4',
    },
    dark: {
      primary: '#daa520',
      secondary: '#57534e',
      accent: '#ff8c00',
      background: '#0c0a09',
      surface: '#1c1917',
      text: '#fafaf9',
      textSecondary: '#d6d3d1',
      border: '#44403c',
      success: '#32cd32',
      warning: '#ffa500',
      error: '#dc143c',
      info: '#87ceeb',
    },
  },
  futuristic: {
    light: {
      primary: '#06b6d4',
      secondary: '#6366f1',
      accent: '#ec4899',
      background: '#ffffff',
      surface: '#f0f9ff',
      text: '#082f49',
      textSecondary: '#0369a1',
      border: '#bae6fd',
      success: '#14b8a6',
      warning: '#f59e0b',
      error: '#f43f5e',
      info: '#06b6d4',
    },
    dark: {
      primary: '#22d3ee',
      secondary: '#818cf8',
      accent: '#f472b6',
      background: '#020617',
      surface: '#0c1222',
      text: '#f0f9ff',
      textSecondary: '#7dd3fc',
      border: '#1e3a8a',
      success: '#2dd4bf',
      warning: '#fbbf24',
      error: '#fb7185',
      info: '#22d3ee',
    },
  },
};

export const baseTheme = {
  fonts: {
    heading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '600ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      smooth: 'cubic-bezier(0.4, 0, 0.6, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    full: '9999px',
  },
};

export function createTheme(variant: ThemeVariant, mode: ColorMode): Theme {
  return {
    variant,
    mode,
    colors: themes[variant][mode],
    ...baseTheme,
  };
}

export function applyThemeToDocument(theme: Theme): void {
  const root = document.documentElement;

  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });

  Object.entries(theme.spacing).forEach(([key, value]) => {
    root.style.setProperty(`--spacing-${key}`, value);
  });

  Object.entries(theme.borderRadius).forEach(([key, value]) => {
    root.style.setProperty(`--radius-${key}`, value);
  });

  root.style.setProperty('--font-heading', theme.fonts.heading);
  root.style.setProperty('--font-body', theme.fonts.body);

  root.style.setProperty('--duration-fast', theme.animations.duration.fast);
  root.style.setProperty('--duration-normal', theme.animations.duration.normal);
  root.style.setProperty('--duration-slow', theme.animations.duration.slow);

  root.style.setProperty('--easing-default', theme.animations.easing.default);
  root.style.setProperty('--easing-smooth', theme.animations.easing.smooth);
  root.style.setProperty('--easing-bounce', theme.animations.easing.bounce);

  root.setAttribute('data-theme-variant', theme.variant);
  root.setAttribute('data-color-mode', theme.mode);
}
