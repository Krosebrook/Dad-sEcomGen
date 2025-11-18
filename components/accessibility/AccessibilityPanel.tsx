import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export function AccessibilityPanel() {
  const { animationConfig, updateAnimationConfig, colorMode } = useTheme();
  const [textScale, setTextScale] = useState(1);
  const [highContrast, setHighContrast] = useState(false);
  const [focusVisible, setFocusVisible] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = `${textScale * 16}px`;

    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (focusVisible) {
      root.classList.add('focus-visible-enabled');
    } else {
      root.classList.remove('focus-visible-enabled');
    }
  }, [textScale, highContrast, focusVisible]);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-colors"
        aria-label="Accessibility settings"
        title="Accessibility settings"
      >
        ♿
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div className="fixed bottom-20 right-4 w-80 max-h-[80vh] overflow-y-auto bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 z-[70] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Accessibility
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                aria-label="Close accessibility panel"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Text Scale: {Math.round(textScale * 100)}%
                </label>
                <input
                  type="range"
                  min="0.75"
                  max="1.5"
                  step="0.05"
                  value={textScale}
                  onChange={(e) => setTextScale(parseFloat(e.target.value))}
                  className="w-full"
                  aria-label="Text scale"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>75%</span>
                  <span>100%</span>
                  <span>150%</span>
                </div>
              </div>

              <label className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  High Contrast
                </span>
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => setHighContrast(e.target.checked)}
                  className="w-5 h-5 rounded"
                />
              </label>

              <label className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Visible Focus Indicators
                </span>
                <input
                  type="checkbox"
                  checked={focusVisible}
                  onChange={(e) => setFocusVisible(e.target.checked)}
                  className="w-5 h-5 rounded"
                />
              </label>

              <label className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Reduced Motion
                </span>
                <input
                  type="checkbox"
                  checked={animationConfig.reducedMotion}
                  onChange={(e) =>
                    updateAnimationConfig({ reducedMotion: e.target.checked })
                  }
                  className="w-5 h-5 rounded"
                />
              </label>

              <label className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Disable Animations
                </span>
                <input
                  type="checkbox"
                  checked={!animationConfig.enabled}
                  onChange={(e) =>
                    updateAnimationConfig({ enabled: !e.target.checked })
                  }
                  className="w-5 h-5 rounded"
                />
              </label>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Keyboard shortcuts: Press <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs">?</kbd> for help
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        .high-contrast {
          --color-text: #000000;
          --color-background: #ffffff;
          --color-border: #000000;
        }

        .dark.high-contrast {
          --color-text: #ffffff;
          --color-background: #000000;
          --color-border: #ffffff;
        }

        .focus-visible-enabled *:focus {
          outline: 3px solid #3b82f6;
          outline-offset: 2px;
        }

        kbd {
          font-family: monospace;
          font-size: 0.875em;
        }
      `}</style>
    </>
  );
}
