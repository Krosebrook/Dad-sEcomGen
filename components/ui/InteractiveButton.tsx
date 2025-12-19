import React, { useState, useRef } from 'react';
import { useTheme } from '../../contexts/SafeThemeContext';

interface InteractiveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  success?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  ripple?: boolean;
  children: React.ReactNode;
}

export function InteractiveButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  success = false,
  icon,
  iconPosition = 'left',
  ripple = true,
  className = '',
  disabled,
  onClick,
  children,
  ...props
}: InteractiveButtonProps) {
  const { theme, animationConfig } = useTheme();
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (ripple && !animationConfig.reducedMotion && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();

      setRipples((prev) => [...prev, { x, y, id }]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);
    }

    if (onClick && !disabled && !loading) {
      onClick(e);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variantStyles = {
    primary: {
      backgroundColor: theme.colors.primary,
      color: '#ffffff',
      hoverBg: theme.colors.primary,
      border: 'none',
    },
    secondary: {
      backgroundColor: theme.colors.secondary,
      color: '#ffffff',
      hoverBg: theme.colors.secondary,
      border: 'none',
    },
    accent: {
      backgroundColor: theme.colors.accent,
      color: '#ffffff',
      hoverBg: theme.colors.accent,
      border: 'none',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: theme.colors.text,
      hoverBg: theme.colors.surface,
      border: `1px solid ${theme.colors.border}`,
    },
  };

  const style = variantStyles[variant];

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        relative overflow-hidden
        ${sizeClasses[size]}
        rounded-lg font-medium
        transition-all duration-200
        ${!animationConfig.reducedMotion ? 'hover:scale-105 active:scale-95' : ''}
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${className}
      `}
      style={{
        backgroundColor: style.backgroundColor,
        color: style.color,
        border: style.border,
        focusRingColor: theme.colors.primary,
      }}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading && (
          <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
        )}
        {success && !loading && <span>✓</span>}
        {!loading && !success && icon && iconPosition === 'left' && icon}
        {children}
        {!loading && !success && icon && iconPosition === 'right' && icon}
      </span>

      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white opacity-30 animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      <style>{`
        @keyframes ripple {
          to {
            width: 200px;
            height: 200px;
            opacity: 0;
          }
        }
        .animate-ripple {
          animation: ripple 0.6s ease-out;
        }
      `}</style>
    </button>
  );
}
