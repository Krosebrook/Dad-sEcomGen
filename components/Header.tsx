
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-slate-900/75 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
      <div className="container mx-auto px-4 h-16 flex items-center">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          <span role="img" aria-label="toolbox emoji" className="mr-2">🧰</span>
          Dad's E-commerce Plan Generator
        </h1>
      </div>
    </header>
  );
};

export default Header;
