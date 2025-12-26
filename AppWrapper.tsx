import React, { useEffect, useState } from 'react';
import App from './App';
import { ThemeProvider } from './contexts/SafeThemeContext';
import { ViewportProvider } from './contexts/ViewportContext';
import { AuthProvider } from './contexts/AuthContext';
import { AccessibilityPanel } from './components/accessibility/AccessibilityPanel';
import { InstallPrompt, OfflineBanner, UpdatePrompt } from './components/pwa';
import { registerServiceWorker } from './lib/pwa';
import { validateEnvironment } from './lib/envValidation';
import { SafeErrorBoundary } from './components/SafeErrorBoundary';

export default function AppWrapper() {
  const [initError, setInitError] = useState<Error | null>(null);

  useEffect(() => {
    console.log('AppWrapper: Initializing...');

    const envValidation = validateEnvironment();

    if (!envValidation.isValid) {
      console.error('AppWrapper: Environment validation failed', envValidation.errors);
      setInitError(new Error(`Configuration Error: ${envValidation.errors.join(', ')}`));
      return;
    }

    if (envValidation.warnings.length > 0) {
      console.warn('AppWrapper: Environment warnings', envValidation.warnings);
    }

    try {
      registerServiceWorker();
    } catch (swError) {
      console.warn('AppWrapper: Service worker registration failed (non-critical)', swError);
    }
  }, []);

  if (initError) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Configuration Error
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {initError.message}
            </p>
            <div className="text-left bg-slate-100 dark:bg-slate-900 rounded p-4 mb-6">
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-2 font-semibold">
                To fix this issue:
              </p>
              <ol className="text-sm text-slate-600 dark:text-slate-400 list-decimal list-inside space-y-1">
                <li>Check your .env file exists in the project root</li>
                <li>Ensure VITE_SUPABASE_URL is set correctly</li>
                <li>Ensure VITE_SUPABASE_ANON_KEY is set correctly</li>
                <li>Restart the development server after making changes</li>
              </ol>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SafeErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <ViewportProvider>
            <OfflineBanner />
            <UpdatePrompt />
            <App />
            <AccessibilityPanel />
            <InstallPrompt />
          </ViewportProvider>
        </ThemeProvider>
      </AuthProvider>
    </SafeErrorBoundary>
  );
}
