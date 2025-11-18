import React, { useEffect, useState } from 'react';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { ViewportProvider } from './contexts/ViewportContext';
import { AuthProvider } from './contexts/AuthContext';
import { SplashScene } from './components/storyboard/SplashScene';
import { AccessibilityPanel } from './components/accessibility/AccessibilityPanel';
import { registerServiceWorker } from './lib/pwa';
import { STORAGE_KEYS } from './lib/constants';
import ErrorBoundary from './components/ErrorBoundary';

export default function AppWrapper() {
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    registerServiceWorker();

    const hasSeenSplash = sessionStorage.getItem(STORAGE_KEYS.SPLASH_SEEN);
    if (hasSeenSplash) {
      setShowSplash(false);
      setAppReady(true);
    }
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem(STORAGE_KEYS.SPLASH_SEEN, 'true');
    setShowSplash(false);
    setTimeout(() => setAppReady(true), 100);
  };

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <ViewportProvider>
            {showSplash && <SplashScene onComplete={handleSplashComplete} />}
            {appReady && (
              <>
                <App />
                <AccessibilityPanel />
              </>
            )}
          </ViewportProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
