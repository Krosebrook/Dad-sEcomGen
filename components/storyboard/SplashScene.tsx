import React, { useEffect, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { globalAnimationEngine } from '../../lib/animations';

interface SplashSceneProps {
  onComplete?: () => void;
  duration?: number;
}

export function SplashScene({ onComplete, duration = 3000 }: SplashSceneProps) {
  const { theme, animationConfig } = useTheme();
  const [stage, setStage] = useState<'logo' | 'morph' | 'complete'>('logo');

  useEffect(() => {
    if (animationConfig.reducedMotion) {
      if (onComplete) onComplete();
      return;
    }

    const logoTimer = setTimeout(() => setStage('morph'), 800);
    const morphTimer = setTimeout(() => setStage('complete'), 1800);
    const completeTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, duration);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(morphTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete, animationConfig.reducedMotion]);

  if (animationConfig.reducedMotion) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center"
      style={{
        backgroundColor: theme.colors.background,
        transition: 'opacity 0.5s ease-out',
        opacity: stage === 'complete' ? 0 : 1,
        pointerEvents: stage === 'complete' ? 'none' : 'auto',
      }}
    >
      <div className="relative">
        <div
          className={`
            text-6xl md:text-8xl font-bold text-center
            transition-all duration-1000
            ${stage === 'logo' ? 'scale-100 opacity-100' : ''}
            ${stage === 'morph' ? 'scale-150 opacity-50 rotate-12' : ''}
            ${stage === 'complete' ? 'scale-200 opacity-0' : ''}
          `}
          style={{ color: theme.colors.primary }}
        >
          🚀
        </div>

        {stage === 'morph' && (
          <div className="absolute inset-0 flex items-center justify-center animate-pulse">
            <div className="flex gap-4">
              <span className="text-4xl">💡</span>
              <span className="text-4xl">📊</span>
              <span className="text-4xl">🎯</span>
            </div>
          </div>
        )}

        <div
          className={`
            mt-6 text-center text-2xl md:text-3xl font-semibold
            transition-all duration-700
            ${stage === 'logo' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
          `}
          style={{ color: theme.colors.text }}
        >
          Dad's E-commerce Plan Generator
        </div>
      </div>
    </div>
  );
}
