interface EnvConfig {
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
  geminiApiKey: string | null;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  config: EnvConfig;
}

export function validateEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const config: EnvConfig = {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || null,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || null,
    geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || null,
  };

  if (!config.supabaseUrl) {
    errors.push('VITE_SUPABASE_URL is not configured');
  } else if (!config.supabaseUrl.startsWith('https://')) {
    errors.push('VITE_SUPABASE_URL must be a valid HTTPS URL');
  }

  if (!config.supabaseAnonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is not configured');
  } else if (config.supabaseAnonKey.length < 20) {
    errors.push('VITE_SUPABASE_ANON_KEY appears to be invalid');
  }

  if (!config.geminiApiKey) {
    warnings.push('VITE_GEMINI_API_KEY is not configured. AI features will not work.');
  } else if (config.geminiApiKey === 'your-gemini-api-key-here') {
    warnings.push('VITE_GEMINI_API_KEY is using the placeholder value. Please set your actual API key.');
  }

  const isValid = errors.length === 0;

  if (!import.meta.env.PROD) {
    console.group('Environment Validation');
    console.log('Supabase URL:', config.supabaseUrl ? '✓ Configured' : '✗ Missing');
    console.log('Supabase Key:', config.supabaseAnonKey ? '✓ Configured' : '✗ Missing');
    console.log('Gemini API Key:', config.geminiApiKey && config.geminiApiKey !== 'your-gemini-api-key-here' ? '✓ Configured' : '⚠ Missing or placeholder');
    if (errors.length > 0) {
      console.error('Errors:', errors);
    }
    if (warnings.length > 0) {
      console.warn('Warnings:', warnings);
    }
    console.groupEnd();
  }

  return { isValid, errors, warnings, config };
}

export function getEnvConfig(): EnvConfig {
  return {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || null,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || null,
    geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || null,
  };
}

export function hasValidGeminiKey(): boolean {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  return !!(key && key !== 'your-gemini-api-key-here' && key.length > 10);
}

export function hasValidSupabase(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return !!(url && key && url.startsWith('https://') && key.length > 20);
}
