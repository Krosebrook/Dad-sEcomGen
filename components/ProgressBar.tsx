import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  steps: string[];
}

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
    </svg>
);

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, steps }) => {
  return (
    <div className="w-full max-w-3xl mb-12">
      <div className="flex items-start">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isActive = currentStep === stepNumber;

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center w-24">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300
                    ${isCompleted ? 'bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900' : ''}
                    ${isActive ? 'bg-white border-2 border-slate-900 text-slate-900 dark:bg-slate-800 dark:border-slate-50 dark:text-slate-50 scale-110' : ''}
                    ${!isCompleted && !isActive ? 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400' : ''}
                  `}
                >
                  {isCompleted ? <CheckIcon /> : stepNumber}
                </div>
                <div className={`mt-2 text-sm text-center font-semibold transition-colors duration-300 ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                    {step}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mt-5
                    ${isCompleted ? 'bg-slate-900 dark:bg-slate-50' : 'bg-slate-200 dark:bg-slate-700'}
                `}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;
