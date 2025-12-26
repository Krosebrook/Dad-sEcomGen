import React, { useState, useEffect } from 'react';

interface RateLimitBannerProps {
  retryAfterMs?: number;
  onDismiss?: () => void;
  className?: string;
}

export function RateLimitBanner({ retryAfterMs, onDismiss, className = '' }: RateLimitBannerProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(
    retryAfterMs ? Math.ceil(retryAfterMs / 1000) : 0
  );

  useEffect(() => {
    if (!retryAfterMs || retryAfterMs <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(interval);
          onDismiss?.();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [retryAfterMs, onDismiss]);

  if (!retryAfterMs || secondsRemaining <= 0) {
    return null;
  }

  return (
    <div
      className={`rounded-lg border border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800 p-4 ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <svg
          className="h-5 w-5 flex-shrink-0 text-orange-600 dark:text-orange-400 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-orange-800 dark:text-orange-300">
            Rate Limit Reached
          </h3>
          <p className="mt-1 text-sm text-orange-700 dark:text-orange-400">
            You've made too many requests. Please wait {secondsRemaining} second
            {secondsRemaining !== 1 ? 's' : ''} before trying again.
          </p>

          <div className="mt-2">
            <div className="w-full bg-orange-200 dark:bg-orange-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-orange-600 dark:bg-orange-400 h-full transition-all duration-1000 ease-linear"
                style={{
                  width: `${retryAfterMs ? (secondsRemaining / (retryAfterMs / 1000)) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="flex-shrink-0 rounded-md text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
            aria-label="Dismiss"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

interface RateLimitIndicatorProps {
  remainingRequests: number;
  maxRequests: number;
  className?: string;
}

export function RateLimitIndicator({
  remainingRequests,
  maxRequests,
  className = '',
}: RateLimitIndicatorProps) {
  const percentage = (remainingRequests / maxRequests) * 100;
  const isLow = percentage <= 30;
  const isVeryLow = percentage <= 10;

  const getColor = () => {
    if (isVeryLow) return 'text-red-600 dark:text-red-400';
    if (isLow) return 'text-orange-600 dark:text-orange-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getBarColor = () => {
    if (isVeryLow) return 'bg-red-600 dark:bg-red-400';
    if (isLow) return 'bg-orange-600 dark:bg-orange-400';
    return 'bg-green-600 dark:bg-green-400';
  };

  return (
    <div className={`text-xs ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-slate-600 dark:text-slate-400">API Requests</span>
        <span className={`font-medium ${getColor()}`}>
          {remainingRequests}/{maxRequests}
        </span>
      </div>
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getBarColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
