import React from 'react';

interface HeaderProps {
    onShowVentures: () => void;
    hasVentures: boolean;
}

const Header: React.FC<HeaderProps> = ({ onShowVentures, hasVentures }) => {
  return (
    <header className="bg-white dark:bg-slate-900/75 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          <span role="img" aria-label="toolbox emoji" className="mr-2">🧰</span>
          Dad's E-commerce Plan Generator
        </h1>
        {hasVentures && (
          <button 
            onClick={onShowVentures}
            className="relative inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 px-3 py-1.5"
          >
            My Ventures
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
            </span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
