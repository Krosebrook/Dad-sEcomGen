import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Label } from '../ui/Label';
import { AppData } from '../../types';
import { exportService } from '../../services/exportService';

interface EnhancedExportPanelProps {
  ventureName: string;
  data: AppData;
}

export function EnhancedExportPanel({ ventureName, data }: EnhancedExportPanelProps) {
  const [exporting, setExporting] = useState(false);
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set([
    'smartGoals',
    'productPlan',
    'brandKit',
    'analysis',
    'swotAnalysis',
    'customerPersona',
    'marketingPlan',
    'financials',
  ]));
  const [exportFormat, setExportFormat] = useState<'pdf' | 'json' | 'zip'>('pdf');

  const sections = [
    { id: 'smartGoals', label: 'SMART Goals', enabled: !!data.smartGoals },
    { id: 'productPlan', label: 'Product Plan', enabled: !!data.plan },
    { id: 'brandKit', label: 'Brand Kit', enabled: !!data.brandKit },
    { id: 'analysis', label: 'Competitive Analysis', enabled: !!data.analysis },
    { id: 'swotAnalysis', label: 'SWOT Analysis', enabled: !!data.swotAnalysis },
    { id: 'customerPersona', label: 'Customer Persona', enabled: !!data.customerPersona },
    { id: 'marketingPlan', label: 'Marketing Plan', enabled: !!data.marketingPlan },
    { id: 'financials', label: 'Financial Projections', enabled: !!data.financials },
    { id: 'seoStrategy', label: 'SEO Strategy', enabled: !!data.seoStrategy },
    { id: 'socialMediaCalendar', label: 'Social Media Calendar', enabled: !!data.socialMediaCalendar },
  ];

  const toggleSection = (sectionId: string) => {
    const newSet = new Set(selectedSections);
    if (newSet.has(sectionId)) {
      newSet.delete(sectionId);
    } else {
      newSet.add(sectionId);
    }
    setSelectedSections(newSet);
  };

  const handleExport = async () => {
    try {
      setExporting(true);

      const filteredData = { ...data };
      sections.forEach(section => {
        if (!selectedSections.has(section.id)) {
          (filteredData as any)[section.id] = null;
        }
      });

      switch (exportFormat) {
        case 'pdf':
          await exportService.exportToPDF(ventureName, filteredData);
          break;
        case 'json':
          await exportService.exportToJSON(ventureName, filteredData);
          break;
        case 'zip':
          await exportService.exportAllAsZip(ventureName, filteredData);
          break;
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Venture</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Label className="mb-3 block">Export Format</Label>
            <div className="grid grid-cols-3 gap-3">
              {(['pdf', 'json', 'zip'] as const).map((format) => (
                <button
                  key={format}
                  onClick={() => setExportFormat(format)}
                  className={`p-3 border-2 rounded-lg text-center transition-colors ${
                    exportFormat === format
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm uppercase">{format}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {format === 'pdf' && 'Business Plan Document'}
                    {format === 'json' && 'Raw Data'}
                    {format === 'zip' && 'All Formats'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-3 block">Sections to Include</Label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sections.map((section) => (
                <label
                  key={section.id}
                  className={`flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    !section.enabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedSections.has(section.id)}
                    onChange={() => toggleSection(section.id)}
                    disabled={!section.enabled}
                    className="rounded border-gray-300"
                  />
                  <span className="flex-1 text-sm">{section.label}</span>
                  {!section.enabled && (
                    <span className="text-xs text-gray-400">Not available</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleExport}
              disabled={exporting || selectedSections.size === 0}
              className="flex-1"
            >
              {exporting ? 'Exporting...' : `Export as ${exportFormat.toUpperCase()}`}
            </Button>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p>• PDF: Professional business plan document</p>
            <p>• JSON: Raw data for importing into other tools</p>
            <p>• ZIP: Complete package with all formats and assets</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
