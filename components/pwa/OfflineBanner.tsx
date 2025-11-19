import React, { useState, useEffect } from 'react';
import { useIsOnline } from '../../hooks';

export function OfflineBanner() {
  const isOnline = useIsOnline();
  const [showOffline, setShowOffline] = useState(false);
  const [justCameOnline, setJustCameOnline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowOffline(true);
      setJustCameOnline(false);
    } else if (showOffline && isOnline) {
      setJustCameOnline(true);
      setShowOffline(false);

      const timeout = setTimeout(() => {
        setJustCameOnline(false);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [isOnline, showOffline]);

  if (!showOffline && !justCameOnline) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ${
        showOffline || justCameOnline ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div
        className={`py-2 px-4 text-center text-sm font-medium ${
          showOffline
            ? 'bg-amber-500 text-white'
            : 'bg-green-500 text-white'
        }`}
      >
        {showOffline ? (
          <div className="flex items-center justify-center gap-2">
            <span>📴</span>
            <span>You're offline - Some features may be limited</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <span>✅</span>
            <span>Back online!</span>
          </div>
        )}
      </div>
    </div>
  );
}
