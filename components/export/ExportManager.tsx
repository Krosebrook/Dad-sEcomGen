import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { InteractiveButton } from '../ui/InteractiveButton';

export type ExportType = 'storyboard' | 'video' | 'components' | 'pdf' | 'assets';
export type ExportFormat = 'pdf' | 'mp4' | 'webm' | 'svg' | 'png' | 'zip';

interface ExportManagerProps {
  ventureId: string;
  ventureName: string;
}

interface ExportOption {
  type: ExportType;
  format: ExportFormat[];
  label: string;
  description: string;
  icon: string;
}

const exportOptions: ExportOption[] = [
  {
    type: 'storyboard',
    format: ['pdf'],
    label: 'Storyboard',
    description: 'Annotated workflow frames with descriptions',
    icon: '📋',
  },
  {
    type: 'video',
    format: ['mp4', 'webm'],
    label: 'Video Walkthrough',
    description: 'Cinematic demo in 16:9 and 9:16 formats',
    icon: '🎥',
  },
  {
    type: 'components',
    format: ['svg', 'png', 'zip'],
    label: 'UI Components',
    description: 'Individual component assets',
    icon: '🎨',
  },
  {
    type: 'pdf',
    format: ['pdf'],
    label: 'Business Plan PDF',
    description: 'Complete venture documentation',
    icon: '📄',
  },
  {
    type: 'assets',
    format: ['zip'],
    label: 'All Assets',
    description: 'Complete production package',
    icon: '📦',
  },
];

export function ExportManager({ ventureId, ventureName }: ExportManagerProps) {
  const { user } = useAuth();
  const [exporting, setExporting] = useState<Record<string, boolean>>({});
  const [selectedFormats, setSelectedFormats] = useState<Record<string, ExportFormat>>({});

  const handleExport = async (type: ExportType, format: ExportFormat) => {
    if (!user) return;

    const key = `${type}-${format}`;
    setExporting((prev) => ({ ...prev, [key]: true }));

    try {
      await supabase.from('export_history').insert({
        user_id: user.id,
        venture_id: ventureId,
        export_type: type,
        export_format: format,
        status: 'pending',
        metadata: {
          venture_name: ventureName,
          timestamp: new Date().toISOString(),
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      alert(`Export started: ${type} (${format})\nYou'll receive a notification when ready.`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting((prev) => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {exportOptions.map((option) => {
        const defaultFormat = option.format[0];
        const selectedFormat = selectedFormats[option.type] || defaultFormat;
        const key = `${option.type}-${selectedFormat}`;

        return (
          <div
            key={option.type}
            className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-3 mb-3">
              <span className="text-3xl">{option.icon}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  {option.label}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {option.description}
                </p>
              </div>
            </div>

            {option.format.length > 1 && (
              <div className="mb-3">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Format
                </label>
                <select
                  value={selectedFormat}
                  onChange={(e) =>
                    setSelectedFormats((prev) => ({
                      ...prev,
                      [option.type]: e.target.value as ExportFormat,
                    }))
                  }
                  className="w-full px-2 py-1 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                >
                  {option.format.map((fmt) => (
                    <option key={fmt} value={fmt}>
                      {fmt.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <InteractiveButton
              size="sm"
              variant="primary"
              loading={exporting[key]}
              onClick={() => handleExport(option.type, selectedFormat)}
              className="w-full"
            >
              Export
            </InteractiveButton>
          </div>
        );
      })}
    </div>
  );
}
