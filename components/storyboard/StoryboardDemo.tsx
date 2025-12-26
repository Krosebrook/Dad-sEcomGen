import React, { useState } from 'react';
import { useTheme } from '../../contexts/SafeThemeContext';
import { SplashScene } from './SplashScene';
import { OnboardingScene } from './OnboardingScene';
import { DashboardScene } from './DashboardScene';
import { InteractionScene } from './InteractionScene';
import { CompletionScene } from './CompletionScene';
import { ThemeVariant } from '../../lib/themes';
import { EnhancedExportManager } from '../export/EnhancedExportManager';
import { ProductionPackageExporter } from '../export/ProductionPackageExporter';

type Scene = 'splash' | 'onboarding' | 'dashboard' | 'interaction' | 'completion';

interface StoryboardDemoProps {
  autoPlay?: boolean;
  startScene?: Scene;
}

export function StoryboardDemo({ autoPlay = false, startScene = 'splash' }: StoryboardDemoProps) {
  const { theme, setVariant: setThemeVariant, variant: themeVariant } = useTheme();
  const [currentScene, setCurrentScene] = useState<Scene>(startScene);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [showExport, setShowExport] = useState(false);

  const scenes: Scene[] = ['splash', 'onboarding', 'dashboard', 'interaction', 'completion'];

  const handleSceneComplete = () => {
    const currentIndex = scenes.indexOf(currentScene);
    if (currentIndex < scenes.length - 1 && isPlaying) {
      setTimeout(() => {
        setCurrentScene(scenes[currentIndex + 1]);
      }, 500);
    } else {
      setIsPlaying(false);
    }
  };

  const goToScene = (scene: Scene) => {
    setCurrentScene(scene);
    setIsPlaying(false);
  };

  const cycleTheme = () => {
    const variants: ThemeVariant[] = ['minimalist', 'cinematic', 'futuristic'];
    const currentIndex = variants.indexOf(themeVariant);
    const nextIndex = (currentIndex + 1) % variants.length;
    setThemeVariant(variants[nextIndex]);
  };

  const getThemeLabel = () => {
    switch (themeVariant) {
      case 'minimalist':
        return 'Minimalist Flat';
      case 'cinematic':
        return 'Cinematic Realism';
      case 'futuristic':
        return 'Futuristic Neon';
      default:
        return 'Theme';
    }
  };

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: theme.colors.background }}>
      <div
        className="fixed top-4 left-4 right-4 z-[8000] flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg shadow-lg"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderWidth: '1px',
        }}
      >
        <div className="flex gap-2 flex-wrap">
          {scenes.map((scene) => (
            <button
              key={scene}
              onClick={() => goToScene(scene)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize"
              style={{
                backgroundColor:
                  currentScene === scene ? theme.colors.primary : 'transparent',
                color:
                  currentScene === scene ? '#ffffff' : theme.colors.text,
                borderColor: theme.colors.border,
                borderWidth: '1px',
              }}
            >
              {scene}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={cycleTheme}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: theme.colors.accent,
              color: '#ffffff',
            }}
          >
            {getThemeLabel()}
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: theme.colors.primary,
              color: '#ffffff',
            }}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>

          <button
            onClick={() => setShowExport(!showExport)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: theme.colors.secondary,
              color: '#ffffff',
            }}
          >
            {showExport ? 'Hide Export' : 'Show Export'}
          </button>
        </div>
      </div>

      <div className="pt-24 px-4 pb-20">
        {showExport && (
          <div className="mb-6 space-y-6">
            <ProductionPackageExporter
              sceneIds={['splash-scene', 'onboarding-scene', 'dashboard-scene', 'interaction-scene', 'completion-scene']}
              onExportComplete={() => console.log('Production package exported!')}
            />
            <EnhancedExportManager
              elementIds={['splash-scene', 'onboarding-scene', 'dashboard-scene', 'interaction-scene', 'completion-scene']}
              baseFilename="storyboard-demo"
              onExportComplete={() => console.log('Storyboard exported!')}
            />
          </div>
        )}

        <div id={`${currentScene}-scene`}>
          {currentScene === 'splash' && (
            <SplashScene onComplete={handleSceneComplete} />
          )}

          {currentScene === 'onboarding' && (
            <OnboardingScene onComplete={handleSceneComplete} />
          )}

          {currentScene === 'dashboard' && (
            <DashboardScene isActive={currentScene === 'dashboard'} />
          )}

          {currentScene === 'interaction' && (
            <InteractionScene isActive={currentScene === 'interaction'} />
          )}

          {currentScene === 'completion' && (
            <CompletionScene
              isActive={currentScene === 'completion'}
              onCallToAction={() => console.log('Export plan')}
            />
          )}
        </div>
      </div>

      <div
        className="fixed bottom-4 right-4 p-3 rounded-lg text-xs"
        style={{
          backgroundColor: theme.colors.surface,
          color: theme.colors.textSecondary,
          borderColor: theme.colors.border,
          borderWidth: '1px',
        }}
      >
        Scene {scenes.indexOf(currentScene) + 1} of {scenes.length}
      </div>
    </div>
  );
}
