import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/SafeThemeContext';
import { Avatar } from '../avatar/Avatar';

interface OnboardingSceneProps {
  onComplete?: () => void;
}

export function OnboardingScene({ onComplete }: OnboardingSceneProps) {
  const { theme, animationConfig } = useTheme();
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const steps = [
    {
      title: 'Welcome to Your Journey',
      description: 'Transform your e-commerce idea into reality with AI-powered insights and guidance.',
      expression: 'welcoming' as const,
    },
    {
      title: 'Personalized Roadmap',
      description: 'Get a custom blueprint tailored to your product, market, and goals.',
      expression: 'talking' as const,
    },
    {
      title: 'Data-Driven Decisions',
      description: 'Make informed choices with competitive analysis and financial projections.',
      expression: 'expert' as const,
    },
    {
      title: "Let's Begin!",
      description: 'Ready to launch your venture? Click below to start building your plan.',
      expression: 'celebrating' as const,
    },
  ];

  const currentStep = steps[step];

  useEffect(() => {
    if (step < steps.length - 1 && !animationConfig.reducedMotion) {
      const timer = setTimeout(() => setStep(step + 1), 3000);
      return () => clearTimeout(timer);
    }
  }, [step, steps.length, animationConfig.reducedMotion]);

  const handleContinue = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setIsVisible(false);
      setTimeout(() => onComplete?.(), 500);
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(() => onComplete?.(), 300);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[9000] flex items-center justify-center p-4"
      style={{
        backgroundColor: `${theme.colors.background}f0`,
        backdropFilter: 'blur(8px)',
        transition: 'opacity 0.5s ease-out',
        opacity: isVisible ? 1 : 0,
      }}
    >
      <div
        className="relative max-w-2xl w-full p-8 md:p-12 rounded-2xl shadow-2xl"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderWidth: '1px',
        }}
      >
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 px-3 py-1 text-sm rounded-lg transition-colors"
          style={{
            color: theme.colors.textSecondary,
            backgroundColor: 'transparent',
          }}
        >
          Skip
        </button>

        <div className="flex flex-col items-center text-center space-y-6">
          <Avatar
            personality={step === 2 ? 'expert' : 'friendly'}
            expression={currentStep.expression}
            size="large"
            showBubble={false}
          />

          <div className="space-y-3">
            <h2
              className="text-3xl md:text-4xl font-bold"
              style={{ color: theme.colors.text }}
            >
              {currentStep.title}
            </h2>
            <p
              className="text-lg md:text-xl"
              style={{ color: theme.colors.textSecondary }}
            >
              {currentStep.description}
            </p>
          </div>

          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: index === step ? '32px' : '8px',
                  backgroundColor:
                    index === step ? theme.colors.primary : theme.colors.border,
                }}
              />
            ))}
          </div>

          <button
            onClick={handleContinue}
            className="px-8 py-3 rounded-lg font-semibold text-lg transition-transform hover:scale-105 active:scale-95"
            style={{
              backgroundColor: theme.colors.primary,
              color: '#ffffff',
            }}
          >
            {step === steps.length - 1 ? "Let's Go!" : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
