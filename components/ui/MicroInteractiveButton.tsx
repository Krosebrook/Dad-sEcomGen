import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/SafeThemeContext';
import { createRippleEffect } from '../../lib/microInteractions';

interface MicroInteractiveButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
  rippleColor?: string;
  enableRipple?: boolean;
  enableHoverLift?: boolean;
}

export function MicroInteractiveButton({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = '',
  rippleColor,
  enableRipple = true,
  enableHoverLift = true,
}: MicroInteractiveButtonProps) {
  const { theme, animationConfig } = useTheme();
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg',
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.primary,
          color: '#ffffff',
          borderColor: theme.colors.primary,
        };
      case 'secondary':
        return {
          backgroundColor: theme.colors.secondary,
          color: '#ffffff',
          borderColor: theme.colors.secondary,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: theme.colors.primary,
          borderColor: theme.colors.primary,
        };
      default:
        return {
          backgroundColor: theme.colors.primary,
          color: '#ffffff',
          borderColor: theme.colors.primary,
        };
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (enableRipple && !animationConfig.reducedMotion) {
      createRippleEffect(e, rippleColor || 'rgba(255, 255, 255, 0.6)');
    }

    onClick?.(e);
  };

  const variantStyles = getVariantStyles();

  const getTransform = () => {
    if (animationConfig.reducedMotion) return 'none';
    if (isPressed) return 'translateY(0) scale(0.95)';
    if (isHovered && enableHoverLift) return 'translateY(-2px) scale(1.05)';
    return 'translateY(0) scale(1)';
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      disabled={disabled}
      className={`
        ${sizeClasses[size]}
        font-semibold rounded-lg
        border-2
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      style={{
        ...variantStyles,
        transform: getTransform(),
        transition: animationConfig.reducedMotion
          ? 'none'
          : 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow:
          isHovered && !animationConfig.reducedMotion
            ? '0 10px 25px rgba(0, 0, 0, 0.15)'
            : '0 5px 15px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {children}
    </button>
  );
}
