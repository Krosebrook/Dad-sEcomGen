export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  gemini: {
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  },
  app: {
    name: "Dad's E-commerce Plan Generator",
    version: '1.0.0',
    environment: import.meta.env.MODE,
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
  },
  features: {
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableErrorReporting: import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true',
    maxFileSize: 5 * 1024 * 1024,
    maxVentures: 50,
  },
  api: {
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
} as const;

export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.supabase.url) {
    errors.push('VITE_SUPABASE_URL is not configured');
  }

  if (!config.supabase.anonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is not configured');
  }

  if (!config.gemini.apiKey || config.gemini.apiKey === 'your-gemini-api-key-here') {
    if (config.app.isProduction) {
      errors.push('VITE_GEMINI_API_KEY must be configured for production');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
