export interface AnimationConfig {
  enabled: boolean;
  reducedMotion: boolean;
  speed: 'slow' | 'normal' | 'fast';
}

export const animationPresets = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
  },
  slideInUp: {
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  slideInDown: {
    from: { opacity: 0, transform: 'translateY(-20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  slideInLeft: {
    from: { opacity: 0, transform: 'translateX(-20px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
  },
  slideInRight: {
    from: { opacity: 0, transform: 'translateX(20px)' },
    to: { opacity: 1, transform: 'translateX(0)' },
  },
  scaleIn: {
    from: { opacity: 0, transform: 'scale(0.95)' },
    to: { opacity: 1, transform: 'scale(1)' },
  },
  scaleOut: {
    from: { opacity: 1, transform: 'scale(1)' },
    to: { opacity: 0, transform: 'scale(0.95)' },
  },
  bounce: {
    from: { transform: 'translateY(0)' },
    to: { transform: 'translateY(-10px)' },
  },
  pulse: {
    from: { transform: 'scale(1)' },
    to: { transform: 'scale(1.05)' },
  },
  rotate: {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
  shimmer: {
    from: { backgroundPosition: '-200% center' },
    to: { backgroundPosition: '200% center' },
  },
};

export const transitionPresets = {
  smooth: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  fast: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
  slow: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

export function getAnimationDuration(
  speed: AnimationConfig['speed'],
  reducedMotion: boolean
): number {
  if (reducedMotion) return 0;

  const durations = {
    fast: 150,
    normal: 300,
    slow: 600,
  };

  return durations[speed];
}

export function shouldAnimate(config: AnimationConfig): boolean {
  return config.enabled && !config.reducedMotion;
}

export function getTransitionClass(
  type: 'smooth' | 'fast' | 'slow' | 'bounce',
  reducedMotion: boolean
): string {
  if (reducedMotion) return '';
  return `transition-${type}`;
}

export function createStaggerAnimation(
  elements: number,
  baseDelay: number = 50
): string[] {
  return Array.from({ length: elements }, (_, i) => `${i * baseDelay}ms`);
}

export function detectReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export class AnimationEngine {
  private config: AnimationConfig;
  private observers: IntersectionObserver[] = [];

  constructor(config?: Partial<AnimationConfig>) {
    this.config = {
      enabled: true,
      reducedMotion: detectReducedMotion(),
      speed: 'normal',
      ...config,
    };

    if (typeof window !== 'undefined') {
      window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
        this.config.reducedMotion = e.matches;
      });
    }
  }

  getConfig(): AnimationConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<AnimationConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  animate(
    element: HTMLElement,
    preset: keyof typeof animationPresets,
    options?: {
      duration?: number;
      delay?: number;
      easing?: string;
      fill?: FillMode;
      iterations?: number;
    }
  ): Animation | null {
    if (!shouldAnimate(this.config)) {
      Object.assign(element.style, animationPresets[preset].to);
      return null;
    }

    const duration = options?.duration ?? getAnimationDuration(this.config.speed, this.config.reducedMotion);

    return element.animate([animationPresets[preset].from, animationPresets[preset].to], {
      duration,
      delay: options?.delay ?? 0,
      easing: options?.easing ?? 'cubic-bezier(0.4, 0, 0.2, 1)',
      fill: options?.fill ?? 'forwards',
      iterations: options?.iterations ?? 1,
    });
  }

  observeEntrance(
    selector: string,
    animationType: keyof typeof animationPresets,
    options?: { threshold?: number; rootMargin?: string }
  ): void {
    if (!shouldAnimate(this.config)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.animate(entry.target as HTMLElement, animationType);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: options?.threshold ?? 0.1,
        rootMargin: options?.rootMargin ?? '0px',
      }
    );

    document.querySelectorAll(selector).forEach((el) => observer.observe(el));
    this.observers.push(observer);
  }

  cleanup(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}

export const globalAnimationEngine = new AnimationEngine();
