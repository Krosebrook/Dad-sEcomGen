import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export type AvatarPersonality = 'professional' | 'friendly' | 'expert';
export type AvatarExpression = 'idle' | 'talking' | 'celebrating' | 'thinking' | 'welcoming';
export type AvatarStyle = 'realistic' | 'stylized';

interface AvatarProps {
  personality?: AvatarPersonality;
  expression?: AvatarExpression;
  message?: string;
  size?: 'small' | 'medium' | 'large';
  showBubble?: boolean;
  className?: string;
  style?: AvatarStyle;
}

const avatarPersonalities = {
  professional: {
    color: '#2563eb',
    icon: { realistic: '👨‍💼', stylized: '👔' },
    name: 'Alex',
    greeting: 'Hello! I\'m here to guide you through your entrepreneurial journey.',
  },
  friendly: {
    color: '#10b981',
    icon: { realistic: '🙂', stylized: '😊' },
    name: 'Sam',
    greeting: 'Hey there! Ready to build something amazing together?',
  },
  expert: {
    color: '#8b5cf6',
    icon: { realistic: '👩‍🎓', stylized: '🎓' },
    name: 'Taylor',
    greeting: 'Greetings! Let\'s leverage data-driven insights for your venture.',
  },
};

const expressionAnimations = {
  idle: 'animate-pulse',
  talking: 'animate-bounce',
  celebrating: 'animate-spin',
  thinking: 'animate-pulse',
  welcoming: 'animate-bounce',
};

const sizeClasses = {
  small: 'w-12 h-12 text-2xl',
  medium: 'w-16 h-16 text-4xl',
  large: 'w-24 h-24 text-6xl',
};

export function Avatar({
  personality = 'friendly',
  expression = 'idle',
  message,
  size = 'medium',
  showBubble = false,
  className = '',
  style: avatarStyle = 'stylized',
}: AvatarProps) {
  const { animationConfig } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);
  const personalityConfig = avatarPersonalities[personality];

  useEffect(() => {
    if (expression !== 'idle' && animationConfig.enabled && !animationConfig.reducedMotion) {
      setIsAnimating(true);
      const timeout = setTimeout(() => setIsAnimating(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [expression, animationConfig]);

  const displayMessage = message || personalityConfig.greeting;
  const iconDisplay = personalityConfig.icon[avatarStyle];

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <div
        className={`
          ${sizeClasses[size]}
          rounded-full
          flex items-center justify-center
          shadow-lg
          transition-transform duration-300
          ${isAnimating && !animationConfig.reducedMotion ? expressionAnimations[expression] : ''}
          ${!animationConfig.reducedMotion ? 'hover:scale-110' : ''}
        `}
        style={{
          backgroundColor: `${personalityConfig.color}20`,
          borderColor: personalityConfig.color,
          borderWidth: '3px',
        }}
        role="img"
        aria-label={`${personalityConfig.name}, your ${personality} guide`}
      >
        <span className="select-none">{iconDisplay}</span>
      </div>

      {showBubble && displayMessage && (
        <div
          className="absolute left-full ml-4 max-w-xs p-4 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 animate-fade-in-right"
          style={{ minWidth: '200px' }}
        >
          <div
            className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0"
            style={{
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
              borderRight: '8px solid white',
            }}
          />
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
                {personalityConfig.name}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{displayMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
