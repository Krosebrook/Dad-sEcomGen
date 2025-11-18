export type ThemeVariant = 'minimalist' | 'cinematic' | 'futuristic';
export type ColorMode = 'light' | 'dark';
export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';
export type Orientation = 'portrait' | 'landscape';

export type AvatarPersonality = 'professional' | 'friendly' | 'expert';
export type AvatarExpression = 'idle' | 'talking' | 'celebrating' | 'thinking' | 'welcoming';

export type ExportType = 'storyboard' | 'video' | 'components' | 'pdf' | 'assets';
export type ExportFormat = 'pdf' | 'mp4' | 'webm' | 'svg' | 'png' | 'zip';

export type AnimationSpeed = 'slow' | 'normal' | 'fast';
export type AnimationPreset =
  | 'fadeIn'
  | 'fadeOut'
  | 'slideInUp'
  | 'slideInDown'
  | 'slideInLeft'
  | 'slideInRight'
  | 'scaleIn'
  | 'scaleOut'
  | 'bounce'
  | 'pulse'
  | 'rotate'
  | 'shimmer';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ViewportInfo {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  orientation: Orientation;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  pixelRatio: number;
}

export interface AnimationConfig {
  enabled: boolean;
  reducedMotion: boolean;
  speed: AnimationSpeed;
}

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

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}
