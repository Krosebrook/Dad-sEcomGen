import React, { ReactNode } from 'react';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  height?: number;
  actions?: ReactNode;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  children,
  height = 300,
  actions,
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div style={{ height: `${height}px` }} className="w-full">
        {children}
      </div>
    </div>
  );
};
