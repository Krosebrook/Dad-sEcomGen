import React, { useEffect, useState } from 'react';
import App from './App';
import { ThemeProvider } from './contexts/SafeThemeContext';
import { ViewportProvider } from './contexts/ViewportContext';
import { AuthProvider } from './contexts/AuthContext';
import { SplashScene } from './components/storyboard/SplashScene';
import { AccessibilityPanel } from './components/accessibility/AccessibilityPanel';
import { InstallPrompt, OfflineBanner, UpdatePrompt } from './components/pwa';
import { registerServiceWorker } from './lib/pwa';
import { STORAGE_KEYS } from './lib/constants';
import { validateEnvironment } from './lib/envValidation';
import { SafeErrorBoundary } from './components/SafeErrorBoundary';

export default function AppWrapper() {
  const [showSplash, setShowSplash] = useState(() => {
    const isDev = import.meta.env.DEV;
    if (isDev) return false;

    try {
      return !sessionStorage.getItem(STORAGE_KEYS.SPLASH_SEEN);
    } catch {
      return false;
    }
  });

  const [appReady, setAppReady] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);
  const [envWarnings, setEnvWarnings] = useState<string[]>([]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('AppWrapper: Starting initialization...');

        const envValidation = validateEnvironment();

        if (!envValidation.isValid) {
          console.error('AppWrapper: Environment validation failed', envValidation.errors);
          setInitError(new Error(`Configuration Error: ${envValidation.errors.join(', ')}`));
          setAppReady(true);
          return;
        }

        if (envValidation.warnings.length > 0) {
          console.warn('AppWrapper: Environment warnings', envValidation.warnings);
          setEnvWarnings(envValidation.warnings);
        }

        try {
          registerServiceWorker();
          console.log('AppWrapper: Service worker registered');
        } catch (swError) {
          console.warn('AppWrapper: Service worker registration failed (non-critical)', swError);
        }

        if (!showSplash) {
          console.log('AppWrapper: Splash skipped, app ready');
          setAppReady(true);
        } else {
          console.log('AppWrapper: Showing splash screen');
        }

      } catch (error) {
        console.error('AppWrapper: Fatal initialization error:', error);
        setInitError(error as Error);
        setAppReady(true);
      }
    };

    initializeApp();
  }, [showSplash]);

  const handleSplashComplete = () => {
    try {
      console.log('AppWrapper: Splash complete, loading app...');
      try {
        sessionStorage.setItem(STORAGE_KEYS.SPLASH_SEEN, 'true');
      } catch (storageError) {
        console.warn('AppWrapper: Could not save splash state', storageError);
      }
      setShowSplash(false);
      setTimeout(() => setAppReady(true), 100);
    } catch (error) {
      console.error('AppWrapper: Error completing splash:', error);
      setShowSplash(false);
      setAppReady(true);
    }
  };

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
            {showSplash && <SplashScene onComplete={handleSplashComplete} />}
            {appReady && (
              <>
                <OfflineBanner />
                <UpdatePrompt />
                <App />
                <AccessibilityPanel />
                <InstallPrompt />
              </>
            )}
          </ViewportProvider>
        </ThemeProvider>
      </AuthProvider>
    </SafeErrorBoundary>
  );
}
