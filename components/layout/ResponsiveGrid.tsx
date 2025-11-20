import React, { ReactNode, useEffect, useState } from 'react';
import { getCurrentBreakpoint, Breakpoint, getGridColumns, getGridGap } from '../../lib/responsive';

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  columns?: Partial<Record<Breakpoint, number>>;
  gap?: Partial<Record<Breakpoint, string>>;
}

export function ResponsiveGrid({
  children,
  className = '',
  columns,
  gap,
}: ResponsiveGridProps) {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');

  useEffect(() => {
    const updateBreakpoint = () => setBreakpoint(getCurrentBreakpoint());

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);

    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  const columnCount = columns?.[breakpoint] || getGridColumns(breakpoint);
  const gridGap = gap?.[breakpoint] || getGridGap(breakpoint);

  return (
    <div
      className={`grid ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
        gap: gridGap,
      }}
    >
      {children}
    </div>
  );
}
