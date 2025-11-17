import React from 'react';

interface LoadingSkeletonProps {
  type?: 'card' | 'text' | 'circle' | 'button';
  lines?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = 'text',
  lines = 3,
  className = ''
}) => {
  const baseClasses = 'animate-pulse bg-slate-200 dark:bg-slate-700 rounded';

  if (type === 'card') {
    return (
      <div className={`${baseClasses} p-6 space-y-4 ${className}`}>
        <div className="h-6 bg-slate-300 dark:bg-slate-600 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (type === 'circle') {
    return (
      <div className={`${baseClasses} rounded-full ${className}`}></div>
    );
  }

  if (type === 'button') {
    return (
      <div className={`${baseClasses} h-10 w-32 ${className}`}></div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`${baseClasses} h-4 ${
            i === lines - 1 ? 'w-4/6' : 'w-full'
          }`}
        ></div>
      ))}
    </div>
  );
};

interface CardSkeletonProps {
  count?: number;
  className?: string;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ count = 1, className = '' }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-white dark:bg-slate-800 rounded-lg p-6 shadow-md space-y-4 animate-pulse ${className}`}
        >
          <div className="flex items-center justify-between">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/6"></div>
          </div>
          <div className="flex gap-2 pt-4">
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
          </div>
        </div>
      ))}
    </>
  );
};

export const TableSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded"></div>
      ))}
    </div>
  );
};
