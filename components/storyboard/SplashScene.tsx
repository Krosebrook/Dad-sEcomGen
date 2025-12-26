import React, { useEffect, useState } from 'react';
import { useTheme } from '../../contexts/SafeThemeContext';
import { globalAnimationEngine } from '../../lib/animations';

interface SplashSceneProps {
  onComplete?: () => void;
  duration?: number;
  withSound?: boolean;
}

export function SplashScene({ onComplete, duration = 3000, withSound = true }: SplashSceneProps) {
  const { theme, animationConfig, variant: themeVariant } = useTheme();
  const [stage, setStage] = useState<'logo' | 'morph' | 'particles' | 'complete'>('logo');

  useEffect(() => {
    if (animationConfig.reducedMotion) {
      if (onComplete) onComplete();
      return;
    }

    const logoTimer = setTimeout(() => setStage('morph'), 800);
    const morphTimer = setTimeout(() => setStage('particles'), 1400);
    const particlesTimer = setTimeout(() => setStage('complete'), 2200);
    const completeTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, duration);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(morphTimer);
      clearTimeout(particlesTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete, animationConfig.reducedMotion]);

  if (animationConfig.reducedMotion) {
    return null;
  }

  const isCinematic = themeVariant === 'cinematic';
  const isFuturistic = themeVariant === 'futuristic';

  return (
    <div
      id="splash-scene"
      className="fixed inset-0 z-[10000] flex items-center justify-center overflow-hidden"
      style={{
        backgroundColor: theme.colors.background,
        transition: 'opacity 0.5s ease-out',
        opacity: stage === 'complete' ? 0 : 1,
        pointerEvents: stage === 'complete' ? 'none' : 'auto',
      }}
    >
      {isFuturistic && stage !== 'complete' && (
        <div className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px animate-pulse"
              style={{
                backgroundColor: theme.colors.primary,
                width: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {isCinematic && stage === 'particles' && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full animate-float"
              style={{
                backgroundColor: theme.colors.primary,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1}s`,
                opacity: 0.6,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative">
        <div
          className={`
            text-6xl md:text-8xl font-bold text-center
            transition-all duration-1000
            ${stage === 'logo' ? 'scale-100 opacity-100' : ''}
            ${stage === 'morph' ? 'scale-150 opacity-50 rotate-12' : ''}
            ${stage === 'particles' ? 'scale-125 opacity-100 rotate-0' : ''}
            ${stage === 'complete' ? 'scale-200 opacity-0' : ''}
          `}
          style={{
            color: theme.colors.primary,
            filter: isFuturistic ? 'drop-shadow(0 0 20px currentColor)' : 'none',
          }}
        >
          🚀
        </div>

        {stage === 'morph' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex gap-4 animate-pulse">
              <span className="text-4xl animate-bounce" style={{ animationDelay: '0ms' }}>💡</span>
              <span className="text-4xl animate-bounce" style={{ animationDelay: '100ms' }}>📊</span>
              <span className="text-4xl animate-bounce" style={{ animationDelay: '200ms' }}>🎯</span>
            </div>
          </div>
        )}

        {stage === 'particles' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="text-5xl animate-spin"
              style={{ animationDuration: '3s' }}
            >
              ✨
            </div>
          </div>
        )}

        <div
          className={`
            mt-6 text-center text-2xl md:text-3xl font-semibold
            transition-all duration-700
            ${stage === 'logo' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
          `}
          style={{
            color: theme.colors.text,
            textShadow: isFuturistic ? `0 0 10px ${theme.colors.primary}` : 'none',
          }}
        >
          Dad's E-commerce Plan Generator
        </div>

        <div
          className={`
            mt-4 text-center text-sm md:text-base
            transition-all duration-700 delay-300
            ${stage === 'particles' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
          style={{ color: theme.colors.textSecondary }}
        >
          AI-Powered • Production-Ready • Multi-Platform
        </div>
      </div>
    </div>
  );
}
