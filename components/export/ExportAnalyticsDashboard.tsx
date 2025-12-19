import React, { useState, useEffect } from 'react';
import { ExportService } from '../../services/exportService';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent } from '../ui/Card';

export function ExportAnalyticsDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<{
    totalExports: number;
    exportsByType: Record<string, number>;
    exportsByFormat: Record<string, number>;
    totalSize: number;
    recentExports: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [user]);

  const loadAnalytics = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const data = await ExportService.getExportAnalytics(user.id);
    setAnalytics(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return null;
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      pdf: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      storyboard: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      components: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      full_package: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      assets: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-200">
            Export Analytics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
              <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                Total Exports
              </div>
              <div className="text-4xl font-bold text-blue-900 dark:text-blue-100">
                {analytics.totalExports}
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
              <div className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">
                Total Size
              </div>
              <div className="text-4xl font-bold text-purple-900 dark:text-purple-100">
                {ExportService.formatFileSize(analytics.totalSize)}
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
              <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                Avg. Size
              </div>
              <div className="text-4xl font-bold text-green-900 dark:text-green-100">
                {analytics.totalExports > 0
                  ? ExportService.formatFileSize(
                      Math.round(analytics.totalSize / analytics.totalExports)
                    )
                  : '0 Bytes'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">
                Exports by Type
              </h3>
              <div className="space-y-3">
                {Object.entries(analytics.exportsByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(
                          type
                        )}`}
                      >
                        {type}
                      </span>
                    </div>
                    <span className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">
                Exports by Format
              </h3>
              <div className="space-y-3">
                {Object.entries(analytics.exportsByFormat).map(([format, count]) => (
                  <div key={format} className="flex items-center justify-between">
                    <span className="text-slate-700 dark:text-slate-300 font-medium uppercase">
                      {format}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{
                            width: `${(count / analytics.totalExports) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-lg font-semibold text-slate-800 dark:text-slate-200 w-12 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {analytics.recentExports.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">
              Recent Exports
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-300 dark:border-slate-600">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      Format
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      Size
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      Assets
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentExports.map((exp) => (
                    <tr
                      key={exp.id}
                      className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(
                            exp.export_type
                          )}`}
                        >
                          {exp.export_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 uppercase text-sm font-medium">
                        {exp.export_format}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                        {ExportService.formatFileSize(exp.file_size)}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                        {exp.asset_count}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 text-sm">
                        {new Date(exp.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            exp.status === 'completed'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : exp.status === 'failed'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}
                        >
                          {exp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
