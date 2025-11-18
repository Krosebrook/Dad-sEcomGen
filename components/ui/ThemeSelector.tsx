import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeVariant } from '../../lib/themes';

export function ThemeSelector() {
  const { variant, setVariant, colorMode, toggleColorMode } = useTheme();

  const variants: { value: ThemeVariant; label: string; icon: string }[] = [
    { value: 'minimalist', label: 'Minimalist', icon: '⚪' },
    { value: 'cinematic', label: 'Cinematic', icon: '🎬' },
    { value: 'futuristic', label: 'Futuristic', icon: '🚀' },
  ];

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
        {variants.map((v) => (
          <button
            key={v.value}
            onClick={() => setVariant(v.value)}
            className={`
              px-3 py-2 rounded-md text-sm font-medium transition-all
              ${
                variant === v.value
                  ? 'bg-white dark:bg-slate-700 shadow-md'
                  : 'hover:bg-slate-200 dark:hover:bg-slate-700'
              }
            `}
            title={v.label}
            aria-label={`Switch to ${v.label} theme`}
          >
            <span className="mr-1">{v.icon}</span>
            <span className="hidden sm:inline">{v.label}</span>
          </button>
        ))}
      </div>

      <button
        onClick={toggleColorMode}
        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
      >
        {colorMode === 'light' ? '🌙' : '☀️'}
      </button>
    </div>
  );
}
