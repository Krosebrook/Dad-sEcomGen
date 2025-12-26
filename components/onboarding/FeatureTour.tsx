import React, { useState, useEffect } from 'react';
import { onboardingService, FeatureTour as FeatureTourType } from '../../services/onboardingService';
import { useAuth } from '../../contexts/AuthContext';

interface FeatureTourProps {
  tour: FeatureTourType;
  onComplete?: () => void;
  onDismiss?: () => void;
}

export const FeatureTour: React.FC<FeatureTourProps> = ({ tour, onComplete, onDismiss }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (user) {
      checkIfShouldShow();
    }
  }, [user, tour.featureName]);

  const checkIfShouldShow = async () => {
    if (!user) return;
    try {
      const shouldShow = await onboardingService.shouldShowFeatureTour(user.id, tour.featureName);
      setIsVisible(shouldShow);
    } catch (error) {
      console.error('Failed to check feature tour status:', error);
    }
  };

  const handleNext = () => {
    if (currentStep < tour.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    try {
      await onboardingService.markFeatureTourComplete(user.id, tour.featureName);
      setIsVisible(false);
      onComplete?.();
    } catch (error) {
      console.error('Failed to mark tour complete:', error);
    }
  };

  const handleDismiss = async () => {
    if (!user) return;
    try {
      await onboardingService.dismissFeatureTour(user.id, tour.featureName);
      setIsVisible(false);
      onDismiss?.();
    } catch (error) {
      console.error('Failed to dismiss tour:', error);
    }
  };

  if (!isVisible || !user) return null;

  const step = tour.steps[currentStep];

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-2xl p-6 w-96 border-2 border-blue-500 animate-slide-in-right">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-blue-600">New Feature Tour</span>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Dismiss tour"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="mb-4">
        <h4 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h4>
        <p className="text-gray-600 text-sm">{step.description}</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {tour.steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-2">
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {currentStep === tour.steps.length - 1 ? 'Got it!' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};
