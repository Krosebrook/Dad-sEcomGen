import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import Papa from 'papaparse';
import { SavedVenture } from '../../types';
import { ventureService } from '../../services';

interface BulkOperationsPanelProps {
  ventures: SavedVenture[];
  onRefresh: () => void;
}

export function BulkOperationsPanel({ ventures, onRefresh }: BulkOperationsPanelProps) {
  const [selectedVentures, setSelectedVentures] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleSelectAll = () => {
    if (selectedVentures.size === ventures.length) {
      setSelectedVentures(new Set());
    } else {
      setSelectedVentures(new Set(ventures.map(v => v.id)));
    }
  };

  const toggleVenture = (id: string) => {
    const newSet = new Set(selectedVentures);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedVentures(newSet);
  };

  const handleBulkExport = async () => {
    try {
      setExporting(true);
      const selectedData = ventures
        .filter(v => selectedVentures.has(v.id))
        .map(v => ({
          name: v.name,
          product_idea: v.data.productIdea,
          brand_voice: v.data.brandVoice,
          last_modified: v.lastModified,
          has_financials: !!v.data.financials,
          has_marketing_plan: !!v.data.marketingPlan,
        }));

      const csv = Papa.unparse(selectedData);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ventures_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export ventures');
    } finally {
      setExporting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedVentures.size} ventures? This cannot be undone.`)) {
      return;
    }

    try {
      for (const ventureId of selectedVentures) {
        await ventureService.deleteVenture(ventureId);
      }
      setSelectedVentures(new Set());
      onRefresh();
    } catch (err) {
      console.error('Bulk delete failed:', err);
      alert('Failed to delete some ventures');
    }
  };

  const handleBulkArchive = async () => {
    try {
      for (const ventureId of selectedVentures) {
        await ventureService.archiveVenture(ventureId);
      }
      setSelectedVentures(new Set());
      onRefresh();
    } catch (err) {
      console.error('Bulk archive failed:', err);
      alert('Failed to archive some ventures');
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          console.log('Imported data:', results.data);
          alert(`Successfully parsed ${results.data.length} rows. Import functionality to be implemented.`);
        } catch (err) {
          console.error('Import failed:', err);
          alert('Failed to import ventures');
        } finally {
          setImporting(false);
        }
      },
      error: (error) => {
        console.error('Parse error:', error);
        alert('Failed to parse CSV file');
        setImporting(false);
      },
    });
  };

  const downloadTemplate = () => {
    const template = [
      {
        name: 'Example Venture',
        product_idea: 'Eco-friendly water bottles',
        brand_voice: 'Professional',
      },
    ];

    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'venture_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Operations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Import Ventures</h3>
            <div className="flex gap-2">
              <input
                type="file"
                accept=".csv"
                onChange={handleImport}
                disabled={importing}
                className="text-sm"
                id="csv-import"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={downloadTemplate}
              >
                Download Template
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Upload a CSV file with ventures. Download the template for the correct format.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Bulk Actions</h3>
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedVentures.size === ventures.length && ventures.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">
                  Select All ({selectedVentures.size} of {ventures.length} selected)
                </span>
              </label>
            </div>

            <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg mb-4">
              {ventures.map((venture) => (
                <label
                  key={venture.id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={selectedVentures.has(venture.id)}
                    onChange={() => toggleVenture(venture.id)}
                    className="rounded border-gray-300"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900 dark:text-white">
                      {venture.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {venture.data.productIdea}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleBulkExport}
                disabled={selectedVentures.size === 0 || exporting}
                size="sm"
              >
                {exporting ? 'Exporting...' : `Export ${selectedVentures.size} CSV`}
              </Button>
              <Button
                onClick={handleBulkArchive}
                disabled={selectedVentures.size === 0}
                variant="secondary"
                size="sm"
              >
                Archive {selectedVentures.size}
              </Button>
              <Button
                onClick={handleBulkDelete}
                disabled={selectedVentures.size === 0}
                variant="secondary"
                size="sm"
                className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
              >
                Delete {selectedVentures.size}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
