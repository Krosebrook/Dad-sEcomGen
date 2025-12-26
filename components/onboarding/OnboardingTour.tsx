import React, { useState, useEffect } from 'react';
import { onboardingService, ONBOARDING_STEPS, OnboardingStep } from '../../services/onboardingService';
import { useAuth } from '../../contexts/AuthContext';

interface OnboardingTourProps {
  onComplete?: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [progress, setProgress] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadProgress();
    }
  }, [user]);

  useEffect(() => {
    if (isVisible && ONBOARDING_STEPS[currentStep]?.target) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
      };
    }
  }, [isVisible, currentStep]);

  const loadProgress = async () => {
    if (!user) return;
    try {
      const data = await onboardingService.getProgress(user.id);
      setProgress(data);

      const completedCount = data.filter(p => p.completed).length;
      if (completedCount === 0) {
        setIsVisible(true);
      }
    } catch (error) {
      console.error('Failed to load onboarding progress:', error);
    }
  };

  const updatePosition = () => {
    const step = ONBOARDING_STEPS[currentStep];
    if (!step.target) {
      setPosition({ top: window.innerHeight / 2 - 100, left: window.innerWidth / 2 - 200 });
      return;
    }

    const target = document.querySelector(step.target);
    if (target) {
      const rect = target.getBoundingClientRect();
      const tooltipWidth = 400;
      const tooltipHeight = 200;

      let top = rect.top;
      let left = rect.left;

      switch (step.position) {
        case 'bottom':
          top = rect.bottom + 10;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case 'top':
          top = rect.top - tooltipHeight - 10;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.left - tooltipWidth - 10;
          break;
        case 'right':
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.right + 10;
          break;
      }

      top = Math.max(10, Math.min(top, window.innerHeight - tooltipHeight - 10));
      left = Math.max(10, Math.min(left, window.innerWidth - tooltipWidth - 10));

      setPosition({ top, left });
    }
  };

  const handleNext = async () => {
    if (!user) return;

    const step = ONBOARDING_STEPS[currentStep];
    await onboardingService.completeStep(user.id, step.id);

    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsVisible(false);
      onComplete?.();
    }
  };

  const handleSkip = async () => {
    if (!user) return;

    const step = ONBOARDING_STEPS[currentStep];
    await onboardingService.skipStep(user.id, step.id);

    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsVisible(false);
    }
  };

  const handleClose = async () => {
    if (!user) return;
    const step = ONBOARDING_STEPS[currentStep];
    await onboardingService.skipStep(user.id, step.id);
    setIsVisible(false);
  };

  if (!isVisible || !user) return null;

  const step = ONBOARDING_STEPS[currentStep];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm" onClick={handleClose} />

      <div
        className="fixed z-50 bg-white rounded-lg shadow-2xl p-6 w-96 transform transition-all duration-300"
        style={{ top: position.top, left: position.left }}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="text-sm text-gray-500 mb-1">
              Step {currentStep + 1} of {ONBOARDING_STEPS.length}
            </div>
            <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close tour"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-gray-600 mb-6">{step.description}</p>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
          />
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
          >
            Skip Tour
          </button>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {currentStep === ONBOARDING_STEPS.length - 1 ? 'Finish' : step.action || 'Next'}
            </button>
          </div>
        </div>
      </div>

      {step.target && (
        <style>{`
          ${step.target} {
            position: relative;
            z-index: 45;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5);
            border-radius: 8px;
          }
        `}</style>
      )}
    </>
  );
};
