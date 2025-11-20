export interface MicroInteraction {
  name: string;
  trigger: 'hover' | 'click' | 'focus' | 'scroll' | 'load';
  animation: string;
  duration: number;
  easing: string;
}

export const microInteractions = {
  buttonHover: {
    scale: 1.05,
    translateY: -2,
    shadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
  },
  buttonPress: {
    scale: 0.95,
    translateY: 0,
  },
  cardHover: {
    scale: 1.02,
    translateY: -8,
    shadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
  },
  inputFocus: {
    borderWidth: 2,
    scale: 1.01,
  },
  iconSpin: {
    rotate: 360,
  },
  ripple: {
    scale: 2,
    opacity: 0,
  },
  shake: {
    keyframes: [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-10px)' },
      { transform: 'translateX(10px)' },
      { transform: 'translateX(-10px)' },
      { transform: 'translateX(10px)' },
      { transform: 'translateX(0)' },
    ],
  },
  heartbeat: {
    keyframes: [
      { transform: 'scale(1)' },
      { transform: 'scale(1.1)' },
      { transform: 'scale(1)' },
      { transform: 'scale(1.15)' },
      { transform: 'scale(1)' },
    ],
  },
};

export function createRippleEffect(
  event: React.MouseEvent<HTMLElement>,
  color = 'rgba(255, 255, 255, 0.6)'
): void {
  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  const ripple = document.createElement('span');
  ripple.style.cssText = `
    position: absolute;
    border-radius: 50%;
    background-color: ${color};
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
    pointer-events: none;
    animation: ripple-effect 0.6s ease-out;
  `;

  button.style.position = 'relative';
  button.style.overflow = 'hidden';
  button.appendChild(ripple);

  setTimeout(() => ripple.remove(), 600);
}

export function addHoverGlow(element: HTMLElement, color: string): void {
  element.style.transition = 'all 0.3s ease';
  element.style.boxShadow = `0 0 20px ${color}`;
}

export function removeHoverGlow(element: HTMLElement): void {
  element.style.boxShadow = 'none';
}

export function animateCounter(
  element: HTMLElement,
  start: number,
  end: number,
  duration: number
): void {
  const range = end - start;
  const startTime = performance.now();

  function update(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const easeOutQuad = (t: number) => t * (2 - t);
    const currentValue = start + range * easeOutQuad(progress);

    element.textContent = Math.round(currentValue).toString();

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

export function createParallaxEffect(
  element: HTMLElement,
  speed: number = 0.5
): () => void {
  function handleScroll() {
    const scrolled = window.scrollY;
    const yPos = -(scrolled * speed);
    element.style.transform = `translateY(${yPos}px)`;
  }

  window.addEventListener('scroll', handleScroll);

  return () => window.removeEventListener('scroll', handleScroll);
}

export function createMagneticEffect(
  element: HTMLElement,
  strength: number = 0.3
): () => void {
  function handleMouseMove(e: MouseEvent) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;

    element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
  }

  function handleMouseLeave() {
    element.style.transform = 'translate(0, 0)';
  }

  element.addEventListener('mousemove', handleMouseMove);
  element.addEventListener('mouseleave', handleMouseLeave);

  return () => {
    element.removeEventListener('mousemove', handleMouseMove);
    element.removeEventListener('mouseleave', handleMouseLeave);
  };
}

export const microInteractionCSS = `
  @keyframes ripple-effect {
    from {
      transform: scale(0);
      opacity: 1;
    }
    to {
      transform: scale(2);
      opacity: 0;
    }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    50% { transform: translateX(10px); }
    75% { transform: translateX(-10px); }
  }

  @keyframes heartbeat {
    0%, 100% { transform: scale(1); }
    25% { transform: scale(1.1); }
    50% { transform: scale(1); }
    75% { transform: scale(1.15); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  @keyframes glow-pulse {
    0%, 100% { box-shadow: 0 0 5px currentColor; }
    50% { box-shadow: 0 0 20px currentColor; }
  }

  .hover-lift {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .hover-lift:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }

  .hover-scale {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .hover-scale:hover {
    transform: scale(1.05);
  }

  .hover-glow {
    transition: box-shadow 0.3s ease;
  }

  .hover-glow:hover {
    animation: glow-pulse 2s infinite;
  }

  .interactive-button {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .interactive-button:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }

  .interactive-button:active {
    transform: translateY(0) scale(0.95);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }

  .interactive-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
  }

  .interactive-card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }

  .focus-ring:focus-visible {
    outline: 3px solid currentColor;
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;
