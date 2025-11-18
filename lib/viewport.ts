export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';
export type Orientation = 'portrait' | 'landscape';

export interface ViewportInfo {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  orientation: Orientation;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  pixelRatio: number;
}

export const breakpoints = {
  mobile: 640,
  tablet: 1024,
  desktop: 1280,
  wide: 1536,
};

export function getBreakpoint(width: number): Breakpoint {
  if (width < breakpoints.mobile) return 'mobile';
  if (width < breakpoints.tablet) return 'tablet';
  if (width < breakpoints.desktop) return 'desktop';
  return 'wide';
}

export function getOrientation(width: number, height: number): Orientation {
  return width > height ? 'landscape' : 'portrait';
}

export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
}

export function getPixelRatio(): number {
  if (typeof window === 'undefined') return 1;
  return window.devicePixelRatio || 1;
}

export function getViewportInfo(): ViewportInfo {
  const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const height = typeof window !== 'undefined' ? window.innerHeight : 768;
  const breakpoint = getBreakpoint(width);

  return {
    width,
    height,
    breakpoint,
    orientation: getOrientation(width, height),
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop' || breakpoint === 'wide',
    isTouchDevice: isTouchDevice(),
    pixelRatio: getPixelRatio(),
  };
}

export class ViewportObserver {
  private listeners: Set<(info: ViewportInfo) => void> = new Set();
  private currentInfo: ViewportInfo;
  private resizeTimeout: number | null = null;

  constructor() {
    this.currentInfo = getViewportInfo();

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.handleResize);
      window.addEventListener('orientationchange', this.handleOrientationChange);
    }
  }

  private handleResize = (): void => {
    if (this.resizeTimeout) {
      window.clearTimeout(this.resizeTimeout);
    }

    this.resizeTimeout = window.setTimeout(() => {
      const newInfo = getViewportInfo();
      if (this.hasChanged(newInfo)) {
        this.currentInfo = newInfo;
        this.notify();
      }
    }, 150);
  };

  private handleOrientationChange = (): void => {
    setTimeout(() => {
      const newInfo = getViewportInfo();
      this.currentInfo = newInfo;
      this.notify();
    }, 100);
  };

  private hasChanged(newInfo: ViewportInfo): boolean {
    return (
      newInfo.breakpoint !== this.currentInfo.breakpoint ||
      newInfo.orientation !== this.currentInfo.orientation
    );
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener(this.currentInfo));
  }

  subscribe(callback: (info: ViewportInfo) => void): () => void {
    this.listeners.add(callback);
    callback(this.currentInfo);

    return () => {
      this.listeners.delete(callback);
    };
  }

  getInfo(): ViewportInfo {
    return { ...this.currentInfo };
  }

  cleanup(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.handleResize);
      window.removeEventListener('orientationchange', this.handleOrientationChange);
    }
    if (this.resizeTimeout) {
      window.clearTimeout(this.resizeTimeout);
    }
    this.listeners.clear();
  }
}

export const globalViewportObserver = new ViewportObserver();
