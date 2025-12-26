import React, { useState, useEffect } from 'react';
import { performanceService, PerformanceReport } from '../../services/performanceService';
import { useAuth } from '../../contexts/AuthContext';
import { LineChart } from '../charts/LineChart';

export const PerformanceDashboard: React.FC = () => {
  const { user } = useAuth();
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(7);

  useEffect(() => {
    if (user) {
      loadReport();
    }
  }, [user, timeRange]);

  const loadReport = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await performanceService.getPerformanceReport(user.id, timeRange);
      setReport(data);
    } catch (error) {
      console.error('Failed to load performance report:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-600">Sign in to view performance metrics</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance Dashboard</h1>
          <p className="text-gray-600">Monitor and optimize your app performance</p>
        </div>

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={1}>Last 24 hours</option>
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {report && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Avg Load Time</h3>
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {report.avgLoadTime.toFixed(0)}ms
              </div>
              <div className={`text-sm ${report.avgLoadTime < 1000 ? 'text-green-600' : 'text-orange-600'}`}>
                {report.avgLoadTime < 1000 ? 'Excellent' : 'Needs improvement'}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Avg Render Time</h3>
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {report.avgRenderTime.toFixed(0)}ms
              </div>
              <div className={`text-sm ${report.avgRenderTime < 500 ? 'text-green-600' : 'text-orange-600'}`}>
                {report.avgRenderTime < 500 ? 'Fast' : 'Could be faster'}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Error Rate</h3>
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {report.errorRate.toFixed(1)}%
              </div>
              <div className={`text-sm ${report.errorRate < 1 ? 'text-green-600' : 'text-red-600'}`}>
                {report.errorRate < 1 ? 'Stable' : 'Action needed'}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Slowest Pages</h3>
            <div className="space-y-3">
              {report.slowestPages.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No data available</p>
              ) : (
                report.slowestPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                        {index + 1}
                      </div>
                      <span className="text-gray-700">{page.page}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{page.time.toFixed(0)}ms</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Insights</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Total Metrics Collected</h4>
                  <p className="text-gray-600 text-sm">{report.totalMetrics} performance measurements</p>
                </div>
              </div>

              {report.avgLoadTime > 3000 && (
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">High Load Times Detected</h4>
                    <p className="text-gray-600 text-sm">Consider implementing code splitting and lazy loading</p>
                  </div>
                </div>
              )}

              {report.errorRate > 1 && (
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Elevated Error Rate</h4>
                    <p className="text-gray-600 text-sm">Review error logs and implement error boundaries</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
