import React, { ReactNode, useEffect, useState } from 'react';
import { getCurrentBreakpoint, Breakpoint, getContainerPadding } from '../../lib/responsive';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: Partial<Record<Breakpoint, string>>;
}

export function ResponsiveContainer({
  children,
  className = '',
  maxWidth = {
    mobile: '100%',
    tablet: '768px',
    desktop: '1024px',
    wide: '1440px',
  },
}: ResponsiveContainerProps) {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');

  useEffect(() => {
    const updateBreakpoint = () => setBreakpoint(getCurrentBreakpoint());

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);

    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  const padding = getContainerPadding(breakpoint);
  const width = maxWidth[breakpoint] || maxWidth.desktop || '1024px';

  return (
    <div
      className={`mx-auto ${className}`}
      style={{
        maxWidth: width,
        padding,
        width: '100%',
      }}
    >
      {children}
    </div>
  );
}
