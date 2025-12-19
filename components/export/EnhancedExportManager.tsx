import React, { useState, useEffect } from 'react';
import { ExportService, ExportOptions, ExportHistory, ExportTemplate } from '../../services/exportService';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';

interface EnhancedExportManagerProps {
  elementIds: string[];
  baseFilename: string;
  ventureId?: string;
  onExportComplete?: () => void;
}

export function EnhancedExportManager({
  elementIds,
  baseFilename,
  ventureId,
  onExportComplete,
}: EnhancedExportManagerProps) {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [exportHistory, setExportHistory] = useState<ExportHistory[]>([]);
  const [templates, setTemplates] = useState<ExportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ExportTemplate | null>(null);

  const [options, setOptions] = useState<ExportOptions>({
    type: 'pdf',
    format: 'pdf',
    includeAnnotations: true,
    includeMetadata: true,
    quality: 0.95,
    scale: 2,
    paperSize: 'a4',
    orientation: 'portrait',
  });

  useEffect(() => {
    if (user && showHistory) {
      loadExportHistory();
    }
  }, [user, showHistory]);

  useEffect(() => {
    if (user && showTemplates) {
      loadTemplates();
    }
  }, [user, showTemplates]);

  const loadExportHistory = async () => {
    if (!user) return;
    const history = await ExportService.getExportHistory(user.id);
    setExportHistory(history);
  };

  const loadTemplates = async () => {
    if (!user) return;
    const temps = await ExportService.getTemplates(user.id, options.type);
    setTemplates(temps);
  };

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    setProgress(0);

    try {
      const canvases = await ExportService.captureMultipleElements(elementIds, options);
      setProgress(30);

      if (options.format === 'pdf') {
        const pdfBlob = await ExportService.exportToPDF(canvases, baseFilename, options);
        setProgress(80);

        ExportService.downloadBlob(pdfBlob, `${baseFilename}.pdf`);

        if (user) {
          await ExportService.trackExport(
            user.id,
            options.type,
            options.format,
            pdfBlob.size,
            elementIds.length,
            { options },
            ventureId
          );
        }
      } else if (options.format === 'png') {
        const imageBlobs = await ExportService.exportAsImages(canvases, baseFilename, options);
        setProgress(60);

        if (imageBlobs.length === 1) {
          ExportService.downloadBlob(imageBlobs[0], `${baseFilename}.png`);
        } else {
          const files = imageBlobs.map((blob, i) => ({
            name: `${baseFilename}-${i + 1}.png`,
            blob,
          }));

          await ExportService.createZipBundle(files, `${baseFilename}.zip`);
        }

        if (user) {
          const totalSize = imageBlobs.reduce((sum, blob) => sum + blob.size, 0);
          await ExportService.trackExport(
            user.id,
            options.type,
            options.format,
            totalSize,
            imageBlobs.length,
            { options },
            ventureId
          );
        }

        setProgress(90);
      } else if (options.format === 'zip') {
        const imageBlobs = await ExportService.exportAsImages(canvases, baseFilename, options);
        const pdfBlob = await ExportService.exportToPDF(canvases, baseFilename, options);

        const files = [
          { name: `${baseFilename}.pdf`, blob: pdfBlob },
          ...imageBlobs.map((blob, i) => ({
            name: `${baseFilename}-scene-${i + 1}.png`,
            blob,
          })),
        ];

        await ExportService.createZipBundle(files, `${baseFilename}-complete.zip`);

        if (user) {
          const totalSize = files.reduce((sum, f) => sum + f.blob.size, 0);
          await ExportService.trackExport(
            user.id,
            'full_package',
            'zip',
            totalSize,
            files.length,
            { options },
            ventureId
          );
        }

        setProgress(90);
      }

      setProgress(100);
      onExportComplete?.();

      setTimeout(() => {
        setIsExporting(false);
        setProgress(0);
      }, 1000);
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
      setProgress(0);
    }
  };

  const handleSaveTemplate = async () => {
    if (!user) return;

    const name = prompt('Enter template name:');
    if (!name) return;

    const description = prompt('Enter template description (optional):');

    await ExportService.saveTemplate(
      user.id,
      name,
      options.type,
      options,
      description || undefined,
      false
    );

    loadTemplates();
  };

  const handleLoadTemplate = (template: ExportTemplate) => {
    setOptions(template.settings as ExportOptions);
    setSelectedTemplate(template);
  };

  const handleDeleteHistory = async (exportId: string) => {
    await ExportService.deleteExportHistory(exportId);
    loadExportHistory();
  };

  const handleDeleteTemplate = async (templateId: string) => {
    await ExportService.deleteTemplate(templateId);
    loadTemplates();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-200">
            Export Manager
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                  Export Type
                </label>
                <select
                  value={options.type}
                  onChange={(e) =>
                    setOptions({ ...options, type: e.target.value as ExportOptions['type'] })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200"
                >
                  <option value="pdf">PDF Document</option>
                  <option value="storyboard">Storyboard</option>
                  <option value="components">Components Only</option>
                  <option value="full_package">Complete Package (ZIP)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                  Format
                </label>
                <select
                  value={options.format}
                  onChange={(e) =>
                    setOptions({ ...options, format: e.target.value as ExportOptions['format'] })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200"
                >
                  <option value="pdf">PDF</option>
                  <option value="png">PNG Images</option>
                  <option value="zip">ZIP Bundle</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                  Paper Size
                </label>
                <select
                  value={options.paperSize}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      paperSize: e.target.value as ExportOptions['paperSize'],
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200"
                  disabled={options.format !== 'pdf'}
                >
                  <option value="a4">A4</option>
                  <option value="letter">Letter</option>
                  <option value="legal">Legal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                  Orientation
                </label>
                <select
                  value={options.orientation}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      orientation: e.target.value as ExportOptions['orientation'],
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200"
                  disabled={options.format !== 'pdf'}
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeAnnotations}
                  onChange={(e) =>
                    setOptions({ ...options, includeAnnotations: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Include Annotations
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeMetadata}
                  onChange={(e) =>
                    setOptions({ ...options, includeMetadata: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Include Metadata
                </span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                Quality: {Math.round((options.quality || 0.95) * 100)}%
              </label>
              <input
                type="range"
                min="0.5"
                max="1"
                step="0.05"
                value={options.quality}
                onChange={(e) =>
                  setOptions({ ...options, quality: parseFloat(e.target.value) })
                }
                className="w-full"
              />
            </div>

            {isExporting && (
              <div className="space-y-2">
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-center text-slate-600 dark:text-slate-400">
                  Exporting... {Math.round(progress)}%
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="flex-1 min-w-[150px]"
              >
                {isExporting ? 'Exporting...' : 'Export Now'}
              </Button>

              {user && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleSaveTemplate}
                    disabled={isExporting}
                  >
                    Save Template
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setShowTemplates(!showTemplates)}
                    disabled={isExporting}
                  >
                    {showTemplates ? 'Hide' : 'Show'} Templates
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setShowHistory(!showHistory)}
                    disabled={isExporting}
                  >
                    {showHistory ? 'Hide' : 'Show'} History
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {showTemplates && templates.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">
              Export Templates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 border border-slate-300 dark:border-slate-600 rounded-lg"
                >
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                    {template.name}
                  </h4>
                  {template.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {template.description}
                    </p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLoadTemplate(template)}
                    >
                      Load
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {showHistory && exportHistory.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">
              Export History
            </h3>
            <div className="space-y-3">
              {exportHistory.map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between p-3 border border-slate-300 dark:border-slate-600 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">
                      {exp.export_type} ({exp.export_format})
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {new Date(exp.created_at).toLocaleDateString()} •{' '}
                      {ExportService.formatFileSize(exp.file_size)} • {exp.asset_count} assets
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteHistory(exp.id)}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
