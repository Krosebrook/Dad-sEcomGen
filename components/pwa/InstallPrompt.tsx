import React, { useState, useEffect } from 'react';
import { globalPWAInstallManager, InstallPromptEvent } from '../../lib/pwa';
import { InteractiveButton } from '../ui/InteractiveButton';
import { useLocalStorage } from '../../hooks';

export function InstallPrompt() {
  const [canInstall, setCanInstall] = useState(false);
  const [dismissed, setDismissed] = useLocalStorage('pwa-install-dismissed', false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const unsubscribe = globalPWAInstallManager.subscribe((installable) => {
      setCanInstall(installable && !dismissed);
    });

    return () => unsubscribe();
  }, [dismissed]);

  const handleInstall = async () => {
    setInstalling(true);
    const accepted = await globalPWAInstallManager.promptInstall();

    if (accepted) {
      setCanInstall(false);
    } else {
      setInstalling(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setCanInstall(false);
  };

  if (!canInstall) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-slide-up">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 text-4xl">📱</div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Install App
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Install Dad's E-commerce Planner for quick access, offline support, and a native app
              experience.
            </p>

            <div className="flex items-center gap-2">
              <InteractiveButton
                variant="primary"
                size="sm"
                onClick={handleInstall}
                loading={installing}
                icon={<span>⬇️</span>}
                className="flex-1"
              >
                Install
              </InteractiveButton>

              <button
                onClick={handleDismiss}
                className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              >
                Not now
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <span>⚡</span>
              <span>Fast</span>
            </div>
            <div className="flex items-center gap-1">
              <span>📴</span>
              <span>Offline</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🔒</span>
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1">
              <span>💾</span>
              <span>&lt;2MB</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
