import React, { useEffect } from 'react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  position?: 'bottom' | 'right';
  children: React.ReactNode;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  title,
  position = 'bottom',
  children
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const positionClasses = {
    bottom: 'bottom-0 left-0 right-0 rounded-t-xl max-h-[85vh] animate-slide-up',
    right: 'top-0 right-0 bottom-0 w-80 max-w-full animate-slide-in-right'
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      <div
        className={`fixed bg-white z-50 overflow-y-auto safe-area-inset ${positionClasses[position]}`}
      >
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close drawer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-4">
          {children}
        </div>
      </div>
    </>
  );
};
