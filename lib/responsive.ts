export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';

export interface ResponsiveBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  wide: number;
}

export const breakpoints: ResponsiveBreakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
};

export const mediaQueries = {
  mobile: `(min-width: ${breakpoints.mobile}px)`,
  tablet: `(min-width: ${breakpoints.tablet}px)`,
  desktop: `(min-width: ${breakpoints.desktop}px)`,
  wide: `(min-width: ${breakpoints.wide}px)`,
  touchDevice: '(hover: none) and (pointer: coarse)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
};

export function getCurrentBreakpoint(): Breakpoint {
  if (typeof window === 'undefined') return 'desktop';

  const width = window.innerWidth;

  if (width >= breakpoints.wide) return 'wide';
  if (width >= breakpoints.desktop) return 'desktop';
  if (width >= breakpoints.tablet) return 'tablet';
  return 'mobile';
}

export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(mediaQueries.touchDevice).matches;
}

export function getResponsiveValue<T>(
  values: Partial<Record<Breakpoint, T>>,
  currentBreakpoint: Breakpoint
): T | undefined {
  const order: Breakpoint[] = ['wide', 'desktop', 'tablet', 'mobile'];
  const currentIndex = order.indexOf(currentBreakpoint);

  for (let i = currentIndex; i < order.length; i++) {
    const value = values[order[i]];
    if (value !== undefined) return value;
  }

  return undefined;
}

export interface ResponsiveLayoutConfig {
  columns: {
    mobile: number;
    tablet: number;
    desktop: number;
    wide: number;
  };
  gap: {
    mobile: string;
    tablet: string;
    desktop: string;
    wide: string;
  };
  padding: {
    mobile: string;
    tablet: string;
    desktop: string;
    wide: string;
  };
}

export const defaultLayoutConfig: ResponsiveLayoutConfig = {
  columns: {
    mobile: 1,
    tablet: 2,
    desktop: 3,
    wide: 4,
  },
  gap: {
    mobile: '1rem',
    tablet: '1.5rem',
    desktop: '2rem',
    wide: '2.5rem',
  },
  padding: {
    mobile: '1rem',
    tablet: '1.5rem',
    desktop: '2rem',
    wide: '3rem',
  },
};

export function getGridColumns(breakpoint: Breakpoint, config = defaultLayoutConfig): number {
  return config.columns[breakpoint];
}

export function getGridGap(breakpoint: Breakpoint, config = defaultLayoutConfig): string {
  return config.gap[breakpoint];
}

export function getContainerPadding(breakpoint: Breakpoint, config = defaultLayoutConfig): string {
  return config.padding[breakpoint];
}

export function createResponsiveStyles(config: ResponsiveLayoutConfig): string {
  return `
    @media ${mediaQueries.mobile} {
      .responsive-grid {
        grid-template-columns: repeat(${config.columns.mobile}, 1fr);
        gap: ${config.gap.mobile};
        padding: ${config.padding.mobile};
      }
    }

    @media ${mediaQueries.tablet} {
      .responsive-grid {
        grid-template-columns: repeat(${config.columns.tablet}, 1fr);
        gap: ${config.gap.tablet};
        padding: ${config.padding.tablet};
      }
    }

    @media ${mediaQueries.desktop} {
      .responsive-grid {
        grid-template-columns: repeat(${config.columns.desktop}, 1fr);
        gap: ${config.gap.desktop};
        padding: ${config.padding.desktop};
      }
    }

    @media ${mediaQueries.wide} {
      .responsive-grid {
        grid-template-columns: repeat(${config.columns.wide}, 1fr);
        gap: ${config.gap.wide};
        padding: ${config.padding.wide};
      }
    }
  `;
}
