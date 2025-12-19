import React, { useEffect, useRef, ReactNode } from 'react';
import { useTheme } from '../../contexts/SafeThemeContext';
import { globalAnimationEngine } from '../../lib/animations';

interface AnimatedPageProps {
  children: ReactNode;
  animation?: 'fadeIn' | 'slideInUp' | 'slideInDown' | 'slideInLeft' | 'slideInRight' | 'scaleIn';
  delay?: number;
  stagger?: boolean;
  className?: string;
}

export function AnimatedPage({
  children,
  animation = 'fadeIn',
  delay = 0,
  stagger = false,
  className = '',
}: AnimatedPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { animationConfig } = useTheme();

  useEffect(() => {
    if (!containerRef.current) return;

    if (stagger) {
      const elements = containerRef.current.querySelectorAll('[data-animate]');
      elements.forEach((el, index) => {
        setTimeout(() => {
          globalAnimationEngine.animate(el as HTMLElement, animation, {
            delay: index * 50,
          });
        }, delay);
      });
    } else {
      globalAnimationEngine.animate(containerRef.current, animation, { delay });
    }
  }, [animation, delay, stagger, animationConfig]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
