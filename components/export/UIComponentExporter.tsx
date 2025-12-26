import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { useTheme } from '../../contexts/SafeThemeContext';

interface UIComponentExporterProps {
  onExportComplete?: () => void;
}

interface ComponentDefinition {
  id: string;
  name: string;
  category: 'buttons' | 'cards' | 'inputs' | 'navigation' | 'feedback' | 'layout';
  description: string;
}

export function UIComponentExporter({ onExportComplete }: UIComponentExporterProps) {
  const { theme } = useTheme();
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);

  const components: ComponentDefinition[] = [
    { id: 'primary-button', name: 'Primary Button', category: 'buttons', description: 'Main action button' },
    { id: 'secondary-button', name: 'Secondary Button', category: 'buttons', description: 'Alternative action' },
    { id: 'icon-button', name: 'Icon Button', category: 'buttons', description: 'Compact icon action' },
    { id: 'text-button', name: 'Text Button', category: 'buttons', description: 'Minimal text action' },
    { id: 'info-card', name: 'Info Card', category: 'cards', description: 'Information display card' },
    { id: 'stat-card', name: 'Stat Card', category: 'cards', description: 'Metric display card' },
    { id: 'action-card', name: 'Action Card', category: 'cards', description: 'Interactive card' },
    { id: 'text-input', name: 'Text Input', category: 'inputs', description: 'Standard text field' },
    { id: 'textarea', name: 'Text Area', category: 'inputs', description: 'Multi-line input' },
    { id: 'select', name: 'Select Dropdown', category: 'inputs', description: 'Selection menu' },
    { id: 'checkbox', name: 'Checkbox', category: 'inputs', description: 'Toggle option' },
    { id: 'radio', name: 'Radio Button', category: 'inputs', description: 'Single choice' },
    { id: 'navbar', name: 'Navigation Bar', category: 'navigation', description: 'Top navigation' },
    { id: 'sidebar', name: 'Sidebar', category: 'navigation', description: 'Side navigation' },
    { id: 'breadcrumb', name: 'Breadcrumb', category: 'navigation', description: 'Location trail' },
    { id: 'toast', name: 'Toast Notification', category: 'feedback', description: 'Temporary message' },
    { id: 'modal', name: 'Modal Dialog', category: 'feedback', description: 'Overlay content' },
    { id: 'progress-bar', name: 'Progress Bar', category: 'feedback', description: 'Task progress' },
    { id: 'container', name: 'Container', category: 'layout', description: 'Content wrapper' },
    { id: 'grid', name: 'Grid Layout', category: 'layout', description: 'Column system' },
  ];

  const toggleComponent = (id: string) => {
    setSelectedComponents(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const toggleCategory = (category: string) => {
    const categoryComponents = components.filter(c => c.category === category).map(c => c.id);
    const allSelected = categoryComponents.every(id => selectedComponents.includes(id));

    if (allSelected) {
      setSelectedComponents(prev => prev.filter(id => !categoryComponents.includes(id)));
    } else {
      setSelectedComponents(prev => [...new Set([...prev, ...categoryComponents])]);
    }
  };

  const selectAll = () => {
    setSelectedComponents(components.map(c => c.id));
  };

  const deselectAll = () => {
    setSelectedComponents([]);
  };

  const createComponentPreview = (component: ComponentDefinition): HTMLElement => {
    const container = document.createElement('div');
    container.style.padding = '48px';
    container.style.backgroundColor = theme.colors.background;
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.minWidth = '400px';
    container.style.minHeight = '200px';

    let element: HTMLElement;

    switch (component.category) {
      case 'buttons':
        element = document.createElement('button');
        element.textContent = component.name;
        element.style.padding = '12px 24px';
        element.style.borderRadius = '8px';
        element.style.fontWeight = '600';
        element.style.fontSize = '16px';
        element.style.border = 'none';
        element.style.cursor = 'pointer';

        if (component.id.includes('primary')) {
          element.style.backgroundColor = theme.colors.primary;
          element.style.color = '#ffffff';
        } else if (component.id.includes('secondary')) {
          element.style.backgroundColor = 'transparent';
          element.style.color = theme.colors.primary;
          element.style.border = `2px solid ${theme.colors.primary}`;
        } else if (component.id.includes('text')) {
          element.style.backgroundColor = 'transparent';
          element.style.color = theme.colors.primary;
          element.style.textDecoration = 'underline';
        } else {
          element.textContent = '⚡';
          element.style.backgroundColor = theme.colors.primary;
          element.style.color = '#ffffff';
          element.style.width = '48px';
          element.style.height = '48px';
          element.style.padding = '0';
          element.style.fontSize = '24px';
        }
        break;

      case 'cards':
        element = document.createElement('div');
        element.style.padding = '24px';
        element.style.borderRadius = '16px';
        element.style.backgroundColor = theme.colors.surface;
        element.style.border = `1px solid ${theme.colors.border}`;
        element.style.minWidth = '280px';
        element.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';

        const cardTitle = document.createElement('h3');
        cardTitle.textContent = component.name;
        cardTitle.style.fontSize = '18px';
        cardTitle.style.fontWeight = '700';
        cardTitle.style.color = theme.colors.text;
        cardTitle.style.marginBottom = '8px';

        const cardDesc = document.createElement('p');
        cardDesc.textContent = component.description;
        cardDesc.style.fontSize = '14px';
        cardDesc.style.color = theme.colors.textSecondary;

        element.appendChild(cardTitle);
        element.appendChild(cardDesc);
        break;

      case 'inputs':
        element = document.createElement(component.id.includes('textarea') ? 'textarea' : 'input');
        element.style.padding = '12px 16px';
        element.style.borderRadius = '8px';
        element.style.border = `2px solid ${theme.colors.border}`;
        element.style.backgroundColor = theme.colors.background;
        element.style.color = theme.colors.text;
        element.style.fontSize = '16px';
        element.style.minWidth = '280px';

        if (component.id.includes('textarea')) {
          (element as HTMLTextAreaElement).rows = 4;
          (element as HTMLTextAreaElement).placeholder = 'Enter text...';
        } else if (component.id.includes('checkbox') || component.id.includes('radio')) {
          element.style.width = '24px';
          element.style.height = '24px';
          element.style.minWidth = 'auto';
          (element as HTMLInputElement).type = component.id.includes('checkbox') ? 'checkbox' : 'radio';
        } else {
          (element as HTMLInputElement).placeholder = component.name;
        }
        break;

      case 'navigation':
        element = document.createElement('nav');
        element.style.padding = '16px 24px';
        element.style.backgroundColor = theme.colors.surface;
        element.style.borderRadius = '12px';
        element.style.display = 'flex';
        element.style.gap = '24px';
        element.style.alignItems = 'center';

        ['Home', 'Products', 'About', 'Contact'].forEach(item => {
          const link = document.createElement('a');
          link.textContent = item;
          link.style.color = theme.colors.text;
          link.style.textDecoration = 'none';
          link.style.fontWeight = '500';
          element.appendChild(link);
        });
        break;

      case 'feedback':
        element = document.createElement('div');
        element.style.padding = '16px 24px';
        element.style.borderRadius = '12px';
        element.style.backgroundColor = theme.colors.surface;
        element.style.border = `2px solid ${theme.colors.primary}`;
        element.style.color = theme.colors.text;
        element.textContent = component.description;
        element.style.fontWeight = '500';
        break;

      case 'layout':
        element = document.createElement('div');
        element.style.width = '320px';
        element.style.height = '200px';
        element.style.backgroundColor = theme.colors.surface;
        element.style.border = `2px dashed ${theme.colors.border}`;
        element.style.borderRadius = '12px';
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.color = theme.colors.textSecondary;
        element.textContent = component.name;
        element.style.fontSize = '18px';
        element.style.fontWeight = '600';
        break;

      default:
        element = document.createElement('div');
        element.textContent = component.name;
    }

    container.appendChild(element);
    return container;
  };

  const exportComponents = async () => {
    if (selectedComponents.length === 0) {
      alert('Please select at least one component to export');
      return;
    }

    setIsExporting(true);
    setProgress(0);

    try {
      const zip = new JSZip();
      const selectedDefs = components.filter(c => selectedComponents.includes(c.id));

      const categories = ['buttons', 'cards', 'inputs', 'navigation', 'feedback', 'layout'] as const;
      categories.forEach(cat => {
        zip.folder(cat);
      });

      for (let i = 0; i < selectedDefs.length; i++) {
        const component = selectedDefs[i];
        const preview = createComponentPreview(component);
        document.body.appendChild(preview);

        await new Promise(resolve => setTimeout(resolve, 100));

        const scales = [{ suffix: '@3x', scale: 3 }, { suffix: '@2x', scale: 2 }, { suffix: '', scale: 1 }];

        for (const { suffix, scale } of scales) {
          const canvas = await html2canvas(preview, {
            scale,
            useCORS: true,
            logging: false,
            backgroundColor: null,
          });

          const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob((blob) => resolve(blob), 'image/png');
          });

          if (blob) {
            zip.file(`${component.category}/${component.id}${suffix}.png`, blob);
          }
        }

        document.body.removeChild(preview);
        setProgress(((i + 1) / selectedDefs.length) * 90);
      }

      const readme = `# UI Component Library

Exported: ${new Date().toLocaleDateString()}
Components: ${selectedDefs.length}

## Categories

${categories.map(cat => {
  const catComponents = selectedDefs.filter(c => c.category === cat);
  if (catComponents.length === 0) return '';
  return `
### ${cat.charAt(0).toUpperCase() + cat.slice(1)}

${catComponents.map(c => `- **${c.name}**: ${c.description}`).join('\n')}
`;
}).filter(Boolean).join('\n')}

## File Naming

- \`component-name.png\` - 1x resolution
- \`component-name@2x.png\` - 2x resolution (Retina)
- \`component-name@3x.png\` - 3x resolution (Super Retina)

## Usage

Import components into your design tool (Figma, Sketch, Adobe XD) or use directly in development documentation.

---
Generated by Dad's E-commerce Plan Generator
`;

      zip.file('README.md', readme);

      setProgress(95);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `ui-components-${Date.now()}.zip`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

      setProgress(100);
      onExportComplete?.();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setTimeout(() => {
        setIsExporting(false);
        setProgress(0);
      }, 1500);
    }
  };

  const groupedComponents = components.reduce((acc, component) => {
    if (!acc[component.category]) {
      acc[component.category] = [];
    }
    acc[component.category].push(component);
    return acc;
  }, {} as Record<string, ComponentDefinition[]>);

  return (
    <div
      className="p-6 rounded-xl space-y-6"
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: '1px',
      }}
    >
      <div>
        <h3 className="text-xl font-bold mb-2" style={{ color: theme.colors.text }}>
          UI Component Library Exporter
        </h3>
        <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
          Export individual UI components as high-resolution PNGs (@1x, @2x, @3x)
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={selectAll}
          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
          style={{
            backgroundColor: theme.colors.primary,
            color: '#ffffff',
          }}
        >
          Select All
        </button>
        <button
          onClick={deselectAll}
          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
          style={{
            backgroundColor: theme.colors.background,
            color: theme.colors.text,
            borderColor: theme.colors.border,
            borderWidth: '1px',
          }}
        >
          Deselect All
        </button>
        <span className="px-3 py-1.5 text-sm" style={{ color: theme.colors.textSecondary }}>
          {selectedComponents.length} / {components.length} selected
        </span>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedComponents).map(([category, items]) => {
          const allSelected = items.every(c => selectedComponents.includes(c.id));
          return (
            <div
              key={category}
              className="p-4 rounded-lg space-y-3"
              style={{
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
                borderWidth: '1px',
              }}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold uppercase tracking-wide" style={{ color: theme.colors.text }}>
                  {category}
                </h4>
                <button
                  onClick={() => toggleCategory(category)}
                  className="text-xs px-3 py-1 rounded-lg font-medium transition-all"
                  style={{
                    backgroundColor: allSelected ? theme.colors.primary : 'transparent',
                    color: allSelected ? '#ffffff' : theme.colors.text,
                    borderColor: theme.colors.border,
                    borderWidth: '1px',
                  }}
                >
                  {allSelected ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {items.map((component) => (
                  <label
                    key={component.id}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:scale-[1.01]"
                    style={{
                      backgroundColor: selectedComponents.includes(component.id)
                        ? `${theme.colors.primary}15`
                        : 'transparent',
                      borderColor: selectedComponents.includes(component.id)
                        ? theme.colors.primary
                        : theme.colors.border,
                      borderWidth: '1px',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedComponents.includes(component.id)}
                      onChange={() => toggleComponent(component.id)}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: theme.colors.primary }}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium" style={{ color: theme.colors.text }}>
                        {component.name}
                      </div>
                      <div className="text-xs" style={{ color: theme.colors.textSecondary }}>
                        {component.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {isExporting && (
        <div className="space-y-2">
          <div
            className="h-3 rounded-full overflow-hidden"
            style={{ backgroundColor: theme.colors.border }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                backgroundColor: theme.colors.primary,
                width: `${progress}%`,
              }}
            />
          </div>
          <p className="text-sm text-center" style={{ color: theme.colors.textSecondary }}>
            Exporting components... {Math.round(progress)}%
          </p>
        </div>
      )}

      <button
        onClick={exportComponents}
        disabled={isExporting || selectedComponents.length === 0}
        className="w-full px-6 py-4 rounded-lg font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: theme.colors.primary,
          color: '#ffffff',
        }}
      >
        {isExporting ? 'Exporting...' : `Export ${selectedComponents.length} Components`}
      </button>
    </div>
  );
}
