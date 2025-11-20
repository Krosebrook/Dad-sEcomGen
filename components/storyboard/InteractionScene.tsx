import React, { useState } from 'react';
import { useTheme } from '../../contexts/SafeThemeContext';

interface InteractionSceneProps {
  isActive?: boolean;
}

export function InteractionScene({ isActive = false }: InteractionSceneProps) {
  const { theme, animationConfig } = useTheme();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dropZone, setDropZone] = useState<'todo' | 'progress' | 'done'>('todo');

  const filters = [
    { id: 'all', label: 'All Tasks', count: 15 },
    { id: 'active', label: 'Active', count: 8 },
    { id: 'completed', label: 'Completed', count: 7 },
  ];

  const tasks = [
    { id: 1, title: 'Define target audience', priority: 'high', status: 'todo' },
    { id: 2, title: 'Create brand guidelines', priority: 'medium', status: 'progress' },
    { id: 3, title: 'Set up social media', priority: 'low', status: 'done' },
  ];

  const handleDragStart = (id: number) => {
    if (!animationConfig.reducedMotion) {
      setDraggedItem(id);
    }
  };

  const handleDrop = (zone: 'todo' | 'progress' | 'done') => {
    setDropZone(zone);
    setDraggedItem(null);
  };

  if (!isActive) return null;

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold" style={{ color: theme.colors.text }}>
          Interactive Workflow
        </h1>

        <div className="flex gap-3 flex-wrap">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                backgroundColor:
                  activeFilter === filter.id ? theme.colors.primary : theme.colors.surface,
                color: activeFilter === filter.id ? '#ffffff' : theme.colors.text,
                borderColor: theme.colors.border,
                borderWidth: '1px',
              }}
            >
              {filter.label}
              <span
                className="ml-2 px-2 py-0.5 rounded-full text-xs"
                style={{
                  backgroundColor:
                    activeFilter === filter.id ? '#ffffff20' : theme.colors.border,
                }}
              >
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['todo', 'progress', 'done'].map((status) => (
          <div
            key={status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(status as any)}
            className="p-4 rounded-xl transition-all duration-300"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor:
                dropZone === status && draggedItem !== null
                  ? theme.colors.primary
                  : theme.colors.border,
              borderWidth: '2px',
              borderStyle: 'dashed',
              minHeight: '300px',
            }}
          >
            <h3
              className="text-lg font-semibold mb-4 capitalize"
              style={{ color: theme.colors.text }}
            >
              {status === 'progress' ? 'In Progress' : status}
            </h3>
            <div className="space-y-3">
              {tasks
                .filter((task) => task.status === status)
                .map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    className="p-4 rounded-lg shadow-sm cursor-move transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                    style={{
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.border,
                      borderWidth: '1px',
                      opacity: draggedItem === task.id ? 0.5 : 1,
                    }}
                  >
                    <p
                      className="font-medium mb-2"
                      style={{ color: theme.colors.text }}
                    >
                      {task.title}
                    </p>
                    <span
                      className="text-xs px-2 py-1 rounded-full font-medium"
                      style={{
                        backgroundColor:
                          task.priority === 'high'
                            ? `${theme.colors.error}20`
                            : task.priority === 'medium'
                            ? `${theme.colors.accent}20`
                            : `${theme.colors.success}20`,
                        color:
                          task.priority === 'high'
                            ? theme.colors.error
                            : task.priority === 'medium'
                            ? theme.colors.accent
                            : theme.colors.success,
                      }}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 p-6 rounded-xl" style={{ backgroundColor: theme.colors.surface }}>
        <span style={{ color: theme.colors.textSecondary }}>Drag tasks between columns to update their status</span>
      </div>
    </div>
  );
}
