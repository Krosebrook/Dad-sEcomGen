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
  const [configWarnings, setConfigWarnings] = useState<string[]>([]);

  useEffect(() => {
    console.log('AppWrapper: Initializing...');

    const envValidation = validateEnvironment();

    if (!envValidation.isValid) {
      console.warn('AppWrapper: Environment validation failed', envValidation.errors);
      setConfigWarnings(envValidation.errors);
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

  return (
    <SafeErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <ViewportProvider>
            {configWarnings.length > 0 && (
              <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-3 shadow-lg">
                <div className="max-w-7xl mx-auto flex items-start gap-3">
                  <span className="text-xl">⚠️</span>
                  <div className="flex-1">
                    <p className="font-semibold">Configuration Warning</p>
                    <p className="text-sm opacity-90">
                      Some features may not work properly: {configWarnings.join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            )}
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
