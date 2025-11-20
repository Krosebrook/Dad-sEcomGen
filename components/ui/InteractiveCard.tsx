import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/SafeThemeContext';

interface InteractiveCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  enableHoverLift?: boolean;
  enableTilt?: boolean;
}

export function InteractiveCard({
  children,
  onClick,
  className = '',
  enableHoverLift = true,
  enableTilt = false,
}: InteractiveCardProps) {
  const { theme, animationConfig } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [tiltStyle, setTiltStyle] = useState({ rotateX: 0, rotateY: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableTilt || animationConfig.reducedMotion || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    setTiltStyle({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTiltStyle({ rotateX: 0, rotateY: 0 });
  };

  const getTransform = () => {
    if (animationConfig.reducedMotion) return 'none';

    const transforms = [];

    if (enableHoverLift && isHovered) {
      transforms.push('translateY(-8px) scale(1.02)');
    }

    if (enableTilt && isHovered) {
      transforms.push(`perspective(1000px) rotateX(${tiltStyle.rotateX}deg) rotateY(${tiltStyle.rotateY}deg)`);
    }

    return transforms.length > 0 ? transforms.join(' ') : 'none';
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      className={`rounded-xl transition-all ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: isHovered ? theme.colors.primary : theme.colors.border,
        borderWidth: '2px',
        padding: '1.5rem',
        transform: getTransform(),
        transition: animationConfig.reducedMotion
          ? 'none'
          : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isHovered
          ? '0 20px 40px rgba(0, 0, 0, 0.1)'
          : '0 5px 15px rgba(0, 0, 0, 0.05)',
      }}
    >
      {children}
    </div>
  );
}
