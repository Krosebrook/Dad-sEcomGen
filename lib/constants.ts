export const APP_CONFIG = {
  name: "Dad's E-commerce Plan Generator",
  version: '2.0.0-mvp',
  description: 'AI-powered e-commerce business plan generator',
} as const;

export const STORAGE_KEYS = {
  THEME_VARIANT: 'app-theme-variant',
  COLOR_MODE: 'app-color-mode',
  ANIMATION_CONFIG: 'app-animation-config',
  SPLASH_SEEN: 'splash-seen',
  VENTURES: 'dad-ecommerce-ventures',
  THEME: 'theme',
} as const;

export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 600,
  SPLASH: 3000,
} as const;

export const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 1024,
  DESKTOP: 1280,
  WIDE: 1536,
} as const;

export const DEBOUNCE_DELAYS = {
  RESIZE: 150,
  SEARCH: 300,
  AUTOSAVE: 30000,
} as const;

export const API_LIMITS = {
  GEMINI_RATE_LIMIT: 10,
  GEMINI_RATE_WINDOW: 60000,
  AUTH_RATE_LIMIT: 5,
  AUTH_RATE_WINDOW: 300000,
  MAX_RETRIES: 3,
  REQUEST_TIMEOUT: 30000,
} as const;

export const EXPORT_TYPES = {
  STORYBOARD: 'storyboard',
  VIDEO: 'video',
  COMPONENTS: 'components',
  PDF: 'pdf',
  ASSETS: 'assets',
} as const;

export const EXPORT_FORMATS = {
  PDF: 'pdf',
  MP4: 'mp4',
  WEBM: 'webm',
  SVG: 'svg',
  PNG: 'png',
  ZIP: 'zip',
} as const;

export const AVATAR_PERSONALITIES = {
  PROFESSIONAL: 'professional',
  FRIENDLY: 'friendly',
  EXPERT: 'expert',
} as const;

export const AVATAR_EXPRESSIONS = {
  IDLE: 'idle',
  TALKING: 'talking',
  CELEBRATING: 'celebrating',
  THINKING: 'thinking',
  WELCOMING: 'welcoming',
} as const;

export const THEME_VARIANTS = {
  MINIMALIST: 'minimalist',
  CINEMATIC: 'cinematic',
  FUTURISTIC: 'futuristic',
} as const;

export const COLOR_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

export const VENTURE_STEPS = {
  IDEA: 1,
  BLUEPRINT: 2,
  MARKET: 3,
  LAUNCHPAD: 4,
} as const;

export const BRAND_VOICE_OPTIONS = [
  'Witty & Humorous Dad',
  'Professional & Corporate',
  'Casual & Friendly',
  'Bold & Edgy',
  'Sophisticated & Elegant',
] as const;

export const CACHE_CONFIG = {
  SERVICE_WORKER_NAME: 'ecommerce-planner-v1',
  STATIC_CACHE_DURATION: 31536000,
  API_CACHE_DURATION: 3600,
} as const;

export const ROUTES = {
  HOME: '/',
  VENTURES: '/?action=ventures',
  NEW_VENTURE: '/?action=new',
} as const;

export const ERROR_MESSAGES = {
  NO_PRODUCT_IDEA: 'Please enter a product idea.',
  API_KEY_MISSING: 'Gemini API key is not configured. Please add your Google Gemini API key to continue.',
  AUTHENTICATION_FAILED: 'Authentication failed. Please try again.',
  SAVE_FAILED: 'Failed to save. Please try again.',
  LOAD_FAILED: 'Failed to load. Please try again.',
  EXPORT_FAILED: 'Export failed. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
} as const;
