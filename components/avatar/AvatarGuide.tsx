import React, { useState, useEffect } from 'react';
import { Avatar, AvatarPersonality, AvatarExpression, AvatarStyle } from './Avatar';

interface GuideStep {
  expression: AvatarExpression;
  message: string;
  duration?: number;
  title?: string;
  action?: { label: string; onClick: () => void };
}

interface AvatarGuideProps {
  steps: GuideStep[];
  personality?: AvatarPersonality;
  autoPlay?: boolean;
  onComplete?: () => void;
  className?: string;
  avatarStyle?: AvatarStyle;
  showProgress?: boolean;
  allowSkip?: boolean;
}

export function AvatarGuide({
  steps,
  personality = 'friendly',
  autoPlay = true,
  onComplete,
  className = '',
  avatarStyle = 'stylized',
  showProgress = true,
  allowSkip = true,
}: AvatarGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length) {
      if (currentStep >= steps.length && onComplete) {
        onComplete();
      }
      return;
    }

    const step = steps[currentStep];
    const duration = step.duration || 3000;
    setTimeLeft(duration / 1000);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 0.1;
        return next > 0 ? next : 0;
      });
    }, 100);

    const timeout = setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, duration);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [currentStep, isPlaying, steps, onComplete]);

  const currentGuideStep = steps[currentStep];

  if (!currentGuideStep) {
    return null;
  }

  const handleSkip = () => {
    setCurrentStep(steps.length);
    onComplete?.();
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex flex-col items-center justify-center gap-6 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-start gap-6 w-full">
          <Avatar
            personality={personality}
            expression={currentGuideStep.expression}
            message={currentGuideStep.message}
            size="large"
            showBubble={false}
            style={avatarStyle}
          />

          <div className="flex-1 space-y-3">
            {currentGuideStep.title && (
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {currentGuideStep.title}
              </h3>
            )}
            <p className="text-base text-slate-600 dark:text-slate-300">
              {currentGuideStep.message}
            </p>

            {currentGuideStep.action && (
              <button
                onClick={currentGuideStep.action.onClick}
                className="mt-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                {currentGuideStep.action.label}
              </button>
            )}
          </div>

          {allowSkip && (
            <button
              onClick={handleSkip}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              Skip
            </button>
          )}
        </div>

        {showProgress && (
          <div className="w-full space-y-2">
            <div className="flex justify-between items-center text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-2 py-1 text-xs rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  aria-label={isPlaying ? 'Pause guide' : 'Play guide'}
                >
                  {isPlaying ? '⏸️' : '▶️'}
                </button>

                {currentStep < steps.length - 1 && (
                  <button
                    onClick={() => setCurrentStep((prev) => prev + 1)}
                    className="px-2 py-1 text-xs rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    aria-label="Next tip"
                  >
                    Next →
                  </button>
                )}

                <span>{currentStep + 1} / {steps.length}</span>
              </div>

              {isPlaying && timeLeft > 0 && (
                <span className="text-xs">
                  Next in {Math.ceil(timeLeft)}s
                </span>
              )}
            </div>

            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
