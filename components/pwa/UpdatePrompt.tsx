import React, { useState, useEffect } from 'react';
import { InteractiveButton } from '../ui/InteractiveButton';

export function UpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setShowUpdate(true);
      });

      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;

          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                setShowUpdate(true);
              }
            });
          }
        });
      });
    }
  }, []);

  const handleUpdate = () => {
    setUpdating(true);

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SKIP_WAITING',
      });

      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9998] max-w-md w-full mx-4">
      <div className="bg-blue-600 text-white rounded-lg shadow-2xl p-4 animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 text-2xl">🔄</div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold mb-1">Update Available</h3>
            <p className="text-sm text-blue-100 mb-3">
              A new version is ready. Update now for the latest features and improvements.
            </p>

            <div className="flex items-center gap-2">
              <InteractiveButton
                variant="accent"
                size="sm"
                onClick={handleUpdate}
                loading={updating}
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                {updating ? 'Updating...' : 'Update Now'}
              </InteractiveButton>

              <button
                onClick={handleDismiss}
                className="px-3 py-2 text-sm font-medium text-blue-100 hover:text-white transition-colors"
              >
                Later
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-blue-200 hover:text-white transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
