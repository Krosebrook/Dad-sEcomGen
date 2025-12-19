import React, { useState } from 'react';
import { useTheme } from '../../contexts/SafeThemeContext';

export function AnimationControls() {
  const { animationConfig, updateAnimationConfig } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        aria-label="Animation settings"
        title="Animation settings"
      >
        ✨
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div className="absolute right-0 top-full mt-2 w-64 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50">
            <h3 className="text-sm font-semibold mb-3 text-slate-900 dark:text-slate-100">
              Animation Settings
            </h3>

            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm text-slate-700 dark:text-slate-300">Enable Animations</span>
                <input
                  type="checkbox"
                  checked={animationConfig.enabled}
                  onChange={(e) =>
                    updateAnimationConfig({ enabled: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-slate-300"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm text-slate-700 dark:text-slate-300">Reduced Motion</span>
                <input
                  type="checkbox"
                  checked={animationConfig.reducedMotion}
                  onChange={(e) =>
                    updateAnimationConfig({ reducedMotion: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-slate-300"
                />
              </label>

              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2">
                  Animation Speed
                </label>
                <select
                  value={animationConfig.speed}
                  onChange={(e) =>
                    updateAnimationConfig({
                      speed: e.target.value as 'slow' | 'normal' | 'fast',
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                >
                  <option value="slow">Slow</option>
                  <option value="normal">Normal</option>
                  <option value="fast">Fast</option>
                </select>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
