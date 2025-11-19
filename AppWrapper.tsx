import React, { useEffect, useState } from 'react';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { ViewportProvider } from './contexts/ViewportContext';
import { AuthProvider } from './contexts/AuthContext';
import { SplashScene } from './components/storyboard/SplashScene';
import { AccessibilityPanel } from './components/accessibility/AccessibilityPanel';
import { InstallPrompt, OfflineBanner, UpdatePrompt } from './components/pwa';
import { registerServiceWorker } from './lib/pwa';
import { STORAGE_KEYS } from './lib/constants';
import ErrorBoundary from './components/ErrorBoundary';

export default function AppWrapper() {
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      console.log('AppWrapper: Initializing...');
      registerServiceWorker();

      const hasSeenSplash = sessionStorage.getItem(STORAGE_KEYS.SPLASH_SEEN);
      if (hasSeenSplash) {
        console.log('AppWrapper: Skipping splash (already seen)');
        setShowSplash(false);
        setAppReady(true);
      } else {
        console.log('AppWrapper: Showing splash');
      }
    } catch (error) {
      console.error('AppWrapper: Initialization error:', error);
      setInitError(error as Error);
    }
  }, []);

  const handleSplashComplete = () => {
    try {
      console.log('AppWrapper: Splash complete, loading app...');
      sessionStorage.setItem(STORAGE_KEYS.SPLASH_SEEN, 'true');
      setShowSplash(false);
      setTimeout(() => setAppReady(true), 100);
    } catch (error) {
      console.error('AppWrapper: Error completing splash:', error);
      setInitError(error as Error);
    }
  };

  if (initError) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Initialization Error
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {initError.message}
            </p>
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
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
