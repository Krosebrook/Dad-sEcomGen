import React, { useState, useEffect } from 'react';
import { presenceService, type PresenceData } from '../../services/presenceService';

interface PresenceIndicatorProps {
  ventureId: string;
  className?: string;
}

export function PresenceIndicator({ ventureId, className = '' }: PresenceIndicatorProps) {
  const [presence, setPresence] = useState<PresenceData[]>([]);

  useEffect(() => {
    loadPresence();
    const stopHeartbeat = presenceService.startHeartbeat(ventureId);

    const subscription = presenceService.subscribeToPresence(ventureId, () => {
      loadPresence();
    });

    return () => {
      stopHeartbeat();
      presenceService.removePresence(ventureId);
      subscription?.unsubscribe();
    };
  }, [ventureId]);

  const loadPresence = async () => {
    const data = await presenceService.getPresence(ventureId);
    setPresence(data);
  };

  if (presence.length === 0) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex -space-x-2">
        {presence.slice(0, 3).map((user) => (
          <div
            key={user.id}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-xs font-medium"
            title={user.profiles?.full_name || user.profiles?.email}
          >
            {(user.profiles?.full_name || user.profiles?.email || 'U')[0].toUpperCase()}
          </div>
        ))}
      </div>
      {presence.length > 3 && (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          +{presence.length - 3} more
        </span>
      )}
    </div>
  );
}
