import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/SafeThemeContext';

interface DashboardSceneProps {
  isActive?: boolean;
}

export function DashboardScene({ isActive = false }: DashboardSceneProps) {
  const { theme, animationConfig } = useTheme();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    if (isActive && !animationConfig.reducedMotion) {
      const timer = setTimeout(() => setStatsVisible(true), 300);
      return () => clearTimeout(timer);
    }
  }, [isActive, animationConfig.reducedMotion]);

  const cards = [
    { title: 'Product Plan', icon: '📦', value: '85%', status: 'In Progress' },
    { title: 'Market Research', icon: '📊', value: '100%', status: 'Complete' },
    { title: 'Brand Identity', icon: '🎨', value: '60%', status: 'In Progress' },
    { title: 'Launch Strategy', icon: '🚀', value: '25%', status: 'Pending' },
  ];

  const stats = [
    { label: 'Tasks Complete', value: '12/24', color: theme.colors.success },
    { label: 'Days to Launch', value: '45', color: theme.colors.accent },
    { label: 'Budget Used', value: '32%', color: theme.colors.primary },
  ];

  if (!isActive) return null;

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl md:text-4xl font-bold" style={{ color: theme.colors.text }}>
          Your Dashboard
        </h1>
        <div className="flex gap-2">
          {[1, 2, 3].map((dot) => (
            <div
              key={dot}
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: theme.colors.primary,
                opacity: 0.3 + (dot * 0.3),
              }}
            />
          ))}
        </div>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-4 transition-opacity duration-500"
        style={{ opacity: statsVisible ? 1 : 0 }}
      >
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="p-6 rounded-xl shadow-lg transition-transform hover:scale-105"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderWidth: '1px',
              transitionDelay: `${index * 100}ms`,
            }}
          >
            <p className="text-sm font-medium" style={{ color: theme.colors.textSecondary }}>
              {stat.label}
            </p>
            <p className="text-3xl font-bold mt-2" style={{ color: stat.color }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <div
            key={card.title}
            onMouseEnter={() => setHoveredCard(index)}
            onMouseLeave={() => setHoveredCard(null)}
            className="p-6 rounded-xl shadow-lg transition-all duration-300 cursor-pointer"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: hoveredCard === index ? theme.colors.primary : theme.colors.border,
              borderWidth: '2px',
              transform: hoveredCard === index ? 'translateY(-8px)' : 'translateY(0)',
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-4xl">{card.icon}</span>
              <span
                className="text-xs font-semibold px-2 py-1 rounded-full"
                style={{
                  backgroundColor: `${theme.colors.primary}20`,
                  color: theme.colors.primary,
                }}
              >
                {card.status}
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: theme.colors.text }}>
              {card.title}
            </h3>
            <div className="relative h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.colors.border }}>
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                style={{
                  backgroundColor: theme.colors.primary,
                  width: hoveredCard === index ? card.value : '0%',
                }}
              />
            </div>
            <p className="text-sm font-medium mt-2" style={{ color: theme.colors.textSecondary }}>
              {card.value} Complete
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
