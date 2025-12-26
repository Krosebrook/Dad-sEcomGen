import React, { useState, useEffect } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';

interface MobileNavigationProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  steps: { id: string; label: string; icon: string }[];
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  currentStep,
  onStepChange,
  steps
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isOpen, setIsOpen] = useState(false);

  if (!isMobile) return null;

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-inset-bottom">
        <div className="flex justify-around items-center h-16">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => onStepChange(index)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                currentStep === index
                  ? 'text-blue-600'
                  : 'text-gray-500'
              }`}
              aria-label={step.label}
            >
              <span className="text-2xl mb-1">{step.icon}</span>
              <span className="text-xs font-medium">{step.label}</span>
              {currentStep === index && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600" />
              )}
            </button>
          ))}
        </div>
      </nav>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-50 hover:bg-blue-700 transition-colors"
        aria-label="Open menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl z-50 max-h-96 overflow-y-auto safe-area-inset-bottom animate-slide-up">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Menu</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="space-y-2">
                <a href="#" className="block py-3 px-4 text-gray-700 hover:bg-gray-100 rounded-lg">
                  Dashboard
                </a>
                <a href="#" className="block py-3 px-4 text-gray-700 hover:bg-gray-100 rounded-lg">
                  My Ventures
                </a>
                <a href="#" className="block py-3 px-4 text-gray-700 hover:bg-gray-100 rounded-lg">
                  Templates
                </a>
                <a href="#" className="block py-3 px-4 text-gray-700 hover:bg-gray-100 rounded-lg">
                  Settings
                </a>
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  );
};
