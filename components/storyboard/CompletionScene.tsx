import React, { useEffect, useState } from 'react';
import { useTheme } from '../../contexts/SafeThemeContext';
import { Avatar } from '../avatar/Avatar';
import { Confetti } from '../animations/Confetti';

interface CompletionSceneProps {
  isActive?: boolean;
  onCallToAction?: () => void;
}

export function CompletionScene({ isActive = false, onCallToAction }: CompletionSceneProps) {
  const { theme, animationConfig } = useTheme();
  const [showConfetti, setShowConfetti] = useState(false);
  const [achievementRevealed, setAchievementRevealed] = useState(false);

  useEffect(() => {
    if (isActive && !animationConfig.reducedMotion) {
      const confettiTimer = setTimeout(() => setShowConfetti(true), 300);
      const achievementTimer = setTimeout(() => setAchievementRevealed(true), 800);
      return () => {
        clearTimeout(confettiTimer);
        clearTimeout(achievementTimer);
      };
    }
  }, [isActive, animationConfig.reducedMotion]);

  const achievements = [
    { icon: '🎯', label: 'Idea Validated', completed: true },
    { icon: '📊', label: 'Market Analyzed', completed: true },
    { icon: '🎨', label: 'Brand Created', completed: true },
    { icon: '🚀', label: 'Launch Ready', completed: true },
  ];

  const nextSteps = [
    { title: 'Finalize Your Product', description: 'Complete product development and testing' },
    { title: 'Build Your Store', description: 'Set up your e-commerce platform' },
    { title: 'Launch Marketing', description: 'Execute your promotional strategy' },
  ];

  if (!isActive) return null;

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-8">
      {showConfetti && !animationConfig.reducedMotion && <Confetti />}

      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <Avatar personality="friendly" expression="celebrating" size="large" showBubble={false} />
        </div>

        <div className="space-y-3">
          <h1
            className="text-4xl md:text-5xl font-bold animate-fade-in-up"
            style={{ color: theme.colors.text }}
          >
            Congratulations!
          </h1>
          <p
            className="text-xl md:text-2xl"
            style={{ color: theme.colors.textSecondary }}
          >
            You've completed your e-commerce business plan
          </p>
        </div>

        <div
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-500"
          style={{
            backgroundColor: `${theme.colors.success}20`,
            transform: achievementRevealed ? 'scale(1)' : 'scale(0)',
          }}
        >
          <span className="text-2xl">🏆</span>
          <span className="font-semibold text-lg" style={{ color: theme.colors.success }}>
            Plan Complete!
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {achievements.map((achievement, index) => (
          <div
            key={achievement.label}
            className="p-4 rounded-xl text-center transition-all duration-500"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderWidth: '1px',
              opacity: achievementRevealed ? 1 : 0,
              transform: achievementRevealed ? 'translateY(0)' : 'translateY(20px)',
              transitionDelay: `${index * 100}ms`,
            }}
          >
            <div className="text-4xl mb-2">{achievement.icon}</div>
            <p className="text-sm font-medium" style={{ color: theme.colors.text }}>
              {achievement.label}
            </p>
            {achievement.completed && (
              <div
                className="mt-2 mx-auto w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: theme.colors.success }}
              >
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        className="p-6 rounded-xl space-y-4"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderWidth: '1px',
        }}
      >
        <h2 className="text-2xl font-bold" style={{ color: theme.colors.text }}>
          What's Next?
        </h2>
        <div className="space-y-3">
          {nextSteps.map((step, index) => (
            <div
              key={step.title}
              className="flex items-start gap-4 p-4 rounded-lg transition-colors hover:bg-opacity-50"
              style={{ backgroundColor: theme.colors.background }}
            >
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold"
                style={{
                  backgroundColor: theme.colors.primary,
                  color: '#ffffff',
                }}
              >
                {index + 1}
              </div>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: theme.colors.text }}>
                  {step.title}
                </h3>
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onCallToAction}
          className="px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 active:scale-95 shadow-lg"
          style={{
            backgroundColor: theme.colors.primary,
            color: '#ffffff',
          }}
        >
          Download Your Plan
        </button>
        <button
          className="px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 active:scale-95"
          style={{
            backgroundColor: 'transparent',
            color: theme.colors.primary,
            borderColor: theme.colors.primary,
            borderWidth: '2px',
          }}
        >
          Start New Project
        </button>
      </div>
    </div>
  );
}
