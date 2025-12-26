import React, { useState, useEffect } from 'react';
import { versionControlService, type VentureVersion } from '../../services/versionControlService';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { format } from 'date-fns';
import { AppData } from '../../types';

interface VersionHistoryProps {
  ventureId: string;
  currentData: AppData;
  onRestore: (version: VentureVersion) => void;
}

export function VersionHistory({ ventureId, currentData, onRestore }: VersionHistoryProps) {
  const [versions, setVersions] = useState<VentureVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<VentureVersion | null>(null);

  useEffect(() => {
    loadVersions();
  }, [ventureId]);

  const loadVersions = async () => {
    try {
      const data = await versionControlService.getVersions(ventureId);
      setVersions(data);
    } catch (err) {
      console.error('Error loading versions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVersion = async () => {
    const label = prompt('Enter a label for this version (optional):');

    try {
      setCreating(true);
      await versionControlService.createVersion(ventureId, currentData, label || undefined);
      await loadVersions();
    } catch (err) {
      console.error('Error creating version:', err);
      alert('Failed to create version');
    } finally {
      setCreating(false);
    }
  };

  const handleViewDiff = (version: VentureVersion) => {
    setSelectedVersion(version);
  };

  const getDiffSummary = (version: VentureVersion) => {
    if (!currentData) return 'No changes';
    const diffs = versionControlService.compareVersions(version.snapshot, currentData);
    return `${diffs.length} change${diffs.length !== 1 ? 's' : ''}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Version History</CardTitle>
          <Button onClick={handleCreateVersion} disabled={creating} size="sm">
            {creating ? 'Saving...' : 'Create Checkpoint'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading versions...</div>
        ) : versions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No saved versions yet. Create your first checkpoint!
          </div>
        ) : (
          <div className="space-y-3">
            {versions.map((version) => (
              <div
                key={version.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Version {version.version_number}
                      </span>
                      {version.label && (
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                          {version.label}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <div>By {version.profiles?.full_name || version.profiles?.email || 'Unknown'}</div>
                      <div>{format(new Date(version.created_at), 'MMM d, yyyy h:mm a')}</div>
                      <div className="mt-1 text-xs">{getDiffSummary(version)}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDiff(version)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Restore this version? Current changes will be saved as a new version.')) {
                          onRestore(version);
                        }
                      }}
                      className="text-sm text-green-600 dark:text-green-400 hover:underline"
                    >
                      Restore
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedVersion && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Version {selectedVersion.version_number} Changes</h3>
                <button onClick={() => setSelectedVersion(null)} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-2">
                {versionControlService.compareVersions(selectedVersion.snapshot, currentData).map((diff, i) => (
                  <div key={i} className="p-2 bg-gray-50 dark:bg-gray-900 rounded text-sm">
                    <div className="font-medium">{versionControlService.formatDiff(diff)}</div>
                    <div className="text-xs text-gray-500 mt-1">{diff.path}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
