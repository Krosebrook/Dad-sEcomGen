import React, { useState, useEffect } from 'react';
import { Avatar, AvatarPersonality, AvatarExpression } from './Avatar';

interface GuideStep {
  expression: AvatarExpression;
  message: string;
  duration?: number;
}

interface AvatarGuideProps {
  steps: GuideStep[];
  personality?: AvatarPersonality;
  autoPlay?: boolean;
  onComplete?: () => void;
  className?: string;
}

export function AvatarGuide({
  steps,
  personality = 'friendly',
  autoPlay = true,
  onComplete,
  className = '',
}: AvatarGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length) {
      if (currentStep >= steps.length && onComplete) {
        onComplete();
      }
      return;
    }

    const step = steps[currentStep];
    const duration = step.duration || 3000;

    const timeout = setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, duration);

    return () => clearTimeout(timeout);
  }, [currentStep, isPlaying, steps, onComplete]);

  const currentGuideStep = steps[currentStep];

  if (!currentGuideStep) {
    return null;
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Avatar
        personality={personality}
        expression={currentGuideStep.expression}
        message={currentGuideStep.message}
        size="large"
        showBubble={true}
      />

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-3 py-1 text-sm rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          aria-label={isPlaying ? 'Pause guide' : 'Play guide'}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>

        {currentStep < steps.length - 1 && (
          <button
            onClick={() => setCurrentStep((prev) => prev + 1)}
            className="px-3 py-1 text-sm rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            aria-label="Next tip"
          >
            Next
          </button>
        )}

        <div className="text-xs text-slate-500 dark:text-slate-400">
          {currentStep + 1} / {steps.length}
        </div>
      </div>
    </div>
  );
}
