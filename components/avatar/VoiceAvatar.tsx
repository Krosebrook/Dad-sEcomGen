import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/SafeThemeContext';
import { AvatarPersonality } from './Avatar';

interface VoiceAvatarProps {
  personality?: AvatarPersonality;
  message: string;
  autoPlay?: boolean;
  onComplete?: () => void;
  size?: 'small' | 'medium' | 'large';
  showWaveform?: boolean;
}

interface VoiceProfile {
  pitch: number;
  speed: number;
  volume: number;
  timbre: 'smooth' | 'energetic' | 'professional';
}

const voiceProfiles: Record<AvatarPersonality, VoiceProfile> = {
  professional: { pitch: 1.0, speed: 1.0, volume: 0.8, timbre: 'professional' },
  friendly: { pitch: 1.2, speed: 1.1, volume: 0.9, timbre: 'energetic' },
  expert: { pitch: 0.9, speed: 0.95, volume: 0.85, timbre: 'smooth' },
};

const avatarVisuals = {
  professional: {
    emoji: '👨‍💼',
    color: '#2563eb',
    name: 'Alex',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  friendly: {
    emoji: '🙂',
    color: '#10b981',
    name: 'Sam',
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  expert: {
    emoji: '👩‍🎓',
    color: '#8b5cf6',
    name: 'Taylor',
    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
};

const sizeClasses = {
  small: { avatar: 'w-16 h-16 text-3xl', container: 'w-64' },
  medium: { avatar: 'w-24 h-24 text-5xl', container: 'w-96' },
  large: { avatar: 'w-32 h-32 text-7xl', container: 'w-[28rem]' },
};

export function VoiceAvatar({
  personality = 'friendly',
  message,
  autoPlay = false,
  onComplete,
  size = 'medium',
  showWaveform = true,
}: VoiceAvatarProps) {
  const { theme, animationConfig } = useTheme();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentWord, setCurrentWord] = useState(0);
  const [lipSyncPhase, setLipSyncPhase] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const speechTimeoutRef = useRef<NodeJS.Timeout>();
  const waveformIntervalRef = useRef<NodeJS.Timeout>();

  const voiceProfile = voiceProfiles[personality];
  const visual = avatarVisuals[personality];
  const sizeClass = sizeClasses[size];
  const words = message.split(' ');

  const simulateVoice = () => {
    if (isSpeaking) return;

    setIsSpeaking(true);
    setCurrentWord(0);

    const totalDuration = (words.length * 400) / voiceProfile.speed;
    const wordDelay = totalDuration / words.length;

    words.forEach((_, index) => {
      speechTimeoutRef.current = setTimeout(() => {
        setCurrentWord(index);
      }, index * wordDelay);
    });

    speechTimeoutRef.current = setTimeout(() => {
      setIsSpeaking(false);
      setCurrentWord(0);
      onComplete?.();
    }, totalDuration);
  };

  useEffect(() => {
    if (isSpeaking) {
      const interval = setInterval(() => {
        setLipSyncPhase((prev) => (prev + 1) % 3);
      }, 150 / voiceProfile.speed);

      return () => clearInterval(interval);
    } else {
      setLipSyncPhase(0);
    }
  }, [isSpeaking, voiceProfile.speed]);

  useEffect(() => {
    if (isSpeaking && showWaveform) {
      const interval = setInterval(() => {
        const newWaveform = Array.from({ length: 20 }, () =>
          Math.random() * voiceProfile.volume * 100
        );
        setWaveformData(newWaveform);
      }, 50);

      waveformIntervalRef.current = interval;
      return () => clearInterval(interval);
    } else {
      setWaveformData([]);
    }
  }, [isSpeaking, voiceProfile.volume, showWaveform]);

  useEffect(() => {
    if (autoPlay && !isSpeaking) {
      const timeout = setTimeout(simulateVoice, 500);
      return () => clearTimeout(timeout);
    }
  }, [autoPlay]);

  useEffect(() => {
    return () => {
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
      if (waveformIntervalRef.current) {
        clearInterval(waveformIntervalRef.current);
      }
    };
  }, []);

  const mouthOpenness = isSpeaking ? (lipSyncPhase === 1 ? 0.6 : 0.3) : 0;

  return (
    <div className={`flex flex-col items-center gap-6 ${sizeClass.container}`}>
      <div className="relative">
        <div
          className={`
            ${sizeClass.avatar}
            rounded-full
            flex items-center justify-center
            shadow-2xl
            transition-all duration-300
            ${isSpeaking && !animationConfig.reducedMotion ? 'animate-pulse scale-110' : 'scale-100'}
          `}
          style={{
            background: visual.background,
            borderColor: visual.color,
            borderWidth: '4px',
            boxShadow: isSpeaking
              ? `0 0 40px ${visual.color}80, 0 0 80px ${visual.color}40`
              : `0 10px 40px ${visual.color}40`,
          }}
        >
          <span className="select-none relative z-10">{visual.emoji}</span>

          {isSpeaking && (
            <div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 transition-all duration-100 rounded-full"
              style={{
                width: `${30 + mouthOpenness * 40}%`,
                height: `${4 + mouthOpenness * 12}px`,
                backgroundColor: visual.color,
                opacity: 0.8,
              }}
            />
          )}
        </div>

        {isSpeaking && (
          <>
            <div
              className="absolute inset-0 rounded-full animate-ping"
              style={{
                backgroundColor: visual.color,
                opacity: 0.2,
              }}
            />
            <div className="absolute -top-3 -right-3 animate-bounce">
              <span className="text-3xl">🔊</span>
            </div>
          </>
        )}

        <div
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold"
          style={{
            backgroundColor: visual.color,
            color: '#ffffff',
          }}
        >
          {visual.name}
        </div>
      </div>

      {showWaveform && waveformData.length > 0 && (
        <div className="flex items-end justify-center gap-1 h-16 w-full">
          {waveformData.map((height, index) => (
            <div
              key={index}
              className="flex-1 rounded-t-lg transition-all duration-100"
              style={{
                height: `${height}%`,
                backgroundColor: visual.color,
                opacity: 0.6 + (height / 100) * 0.4,
              }}
            />
          ))}
        </div>
      )}

      <div
        className="w-full p-6 rounded-xl shadow-lg"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: visual.color,
          borderWidth: '2px',
        }}
      >
        <div className="space-y-4">
          <div
            className="text-base leading-relaxed"
            style={{ color: theme.colors.text }}
          >
            {words.map((word, index) => (
              <span
                key={index}
                className="transition-all duration-200"
                style={{
                  color: index === currentWord && isSpeaking ? visual.color : theme.colors.text,
                  fontWeight: index === currentWord && isSpeaking ? 'bold' : 'normal',
                  fontSize: index === currentWord && isSpeaking ? '1.1em' : '1em',
                }}
              >
                {word}{' '}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: theme.colors.border }}>
            <div className="flex gap-2 text-xs" style={{ color: theme.colors.textSecondary }}>
              <span>Pitch: {voiceProfile.pitch}×</span>
              <span>Speed: {voiceProfile.speed}×</span>
              <span>Timbre: {voiceProfile.timbre}</span>
            </div>

            <button
              onClick={simulateVoice}
              disabled={isSpeaking}
              className="px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: visual.color,
                color: '#ffffff',
              }}
            >
              {isSpeaking ? 'Speaking...' : '▶ Play Voice'}
            </button>
          </div>
        </div>
      </div>

      <div
        className="w-full p-4 rounded-lg text-xs"
        style={{
          backgroundColor: theme.colors.background,
          color: theme.colors.textSecondary,
        }}
      >
        <div className="flex items-start gap-2">
          <span>💡</span>
          <div>
            <strong>Voice Simulation:</strong> This avatar uses simulated speech with synchronized
            lip movements, pitch modulation, and real-time waveform visualization.
          </div>
        </div>
      </div>
    </div>
  );
}
