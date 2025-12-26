import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import {
  analyticsService,
  PerformanceMetric,
  CustomReport,
  MetricCategory,
  ReportType,
} from '../services/analyticsService';
import { useAuth } from '../contexts/AuthContext';

interface AnalyticsDashboardCardProps {
  ventureId: string;
}

export function AnalyticsDashboardCard({ ventureId }: AnalyticsDashboardCardProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'metrics' | 'reports'>('dashboard');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [reports, setReports] = useState<CustomReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [metricForm, setMetricForm] = useState({
    type: '',
    category: 'general' as MetricCategory,
    value: '',
    unit: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [reportForm, setReportForm] = useState({
    name: '',
    type: 'comprehensive' as ReportType,
    metrics: [] as string[],
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (ventureId && user) {
      loadData();
    }
  }, [ventureId, user]);

  const loadData = async () => {
    if (!ventureId || !user) return;

    try {
      setLoading(true);
      const [dashboard, reportsData] = await Promise.all([
        analyticsService.getVentureDashboardData(ventureId),
        analyticsService.getCustomReports(ventureId),
      ]);
      setDashboardData(dashboard);
      setReports(reportsData);

      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);
      const allMetrics = await analyticsService.getMetrics(
        ventureId,
        undefined,
        last30Days.toISOString().split('T')[0]
      );
      setMetrics(allMetrics);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordMetric = async () => {
    if (!user || !metricForm.type || !metricForm.value) {
      setError('Please fill in metric type and value');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await analyticsService.recordMetric({
        venture_id: ventureId,
        user_id: user.id,
        metric_type: metricForm.type,
        metric_category: metricForm.category,
        metric_value: parseFloat(metricForm.value),
        metric_unit: metricForm.unit || undefined,
        date: metricForm.date,
        metadata: {},
      });

      setMetricForm({
        type: '',
        category: 'general',
        value: '',
        unit: '',
        date: new Date().toISOString().split('T')[0],
      });

      await loadData();
    } catch (err) {
      setError('Failed to record metric');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async () => {
    if (!user || !reportForm.name) {
      setError('Please provide report name');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await analyticsService.createCustomReport({
        venture_id: ventureId,
        user_id: user.id,
        report_name: reportForm.name,
        report_type: reportForm.type,
        report_config: {
          metrics: reportForm.metrics.length > 0 ? reportForm.metrics : undefined,
          dateRange:
            reportForm.startDate && reportForm.endDate
              ? { start: reportForm.startDate, end: reportForm.endDate }
              : undefined,
        },
        is_favorite: false,
      });

      setReportForm({
        name: '',
        type: 'comprehensive',
        metrics: [],
        startDate: '',
        endDate: '',
      });

      await loadData();
    } catch (err) {
      setError('Failed to create report');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (id: string) => {
    try {
      setLoading(true);
      await analyticsService.deleteCustomReport(id);
      await loadData();
    } catch (err) {
      setError('Failed to delete report');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    try {
      await analyticsService.toggleFavoriteReport(id, isFavorite);
      await loadData();
    } catch (err) {
      setError('Failed to update report');
      console.error(err);
    }
  };

  if (!user) {
    return (
      <Card className="p-6">
        <p className="text-gray-600">Please sign in to view Analytics Dashboard</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Analytics & Reporting</h2>
      </div>

      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'dashboard'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'metrics'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Metrics ({metrics.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'reports'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Custom Reports ({reports.length})
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading dashboard...</p>
          ) : dashboardData ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(dashboardData.summaries).map(([category, summary]: [string, any]) => (
                  <div key={category} className="p-4 border border-gray-200 rounded-lg bg-gradient-to-br from-blue-50 to-white">
                    <h3 className="text-sm font-medium text-gray-600 capitalize mb-2">
                      {category}
                    </h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {summary.latest?.toFixed(2) || '0.00'}
                    </p>
                    <div className="mt-2 text-xs text-gray-600">
                      <p>Avg: {summary.average?.toFixed(2) || '0.00'}</p>
                      <p>Total: {summary.total?.toFixed(2) || '0.00'}</p>
                      <p>Records: {summary.count}</p>
                    </div>
                  </div>
                ))}
              </div>

              {Object.keys(dashboardData.summaries).length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-4">No metrics recorded yet</p>
                  <Button onClick={() => setActiveTab('metrics')} size="sm">
                    Add Your First Metric
                  </Button>
                </div>
              )}

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-3">Date Range</h3>
                <p className="text-sm text-gray-600">
                  {dashboardData.dateRange.start} to {dashboardData.dateRange.end}
                </p>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>
      )}

      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold mb-4">Record New Metric</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="metricType">Metric Type*</Label>
                <Input
                  id="metricType"
                  value={metricForm.type}
                  onChange={(e) => setMetricForm({ ...metricForm, type: e.target.value })}
                  placeholder="e.g., revenue, conversion_rate, customer_count"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="metricCategory">Category*</Label>
                  <select
                    id="metricCategory"
                    value={metricForm.category}
                    onChange={(e) =>
                      setMetricForm({ ...metricForm, category: e.target.value as MetricCategory })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">General</option>
                    <option value="financial">Financial</option>
                    <option value="marketing">Marketing</option>
                    <option value="inventory">Inventory</option>
                    <option value="customer">Customer</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="metricValue">Value*</Label>
                  <Input
                    id="metricValue"
                    type="number"
                    step="0.01"
                    value={metricForm.value}
                    onChange={(e) => setMetricForm({ ...metricForm, value: e.target.value })}
                    placeholder="100.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="metricUnit">Unit</Label>
                  <Input
                    id="metricUnit"
                    value={metricForm.unit}
                    onChange={(e) => setMetricForm({ ...metricForm, unit: e.target.value })}
                    placeholder="e.g., USD, percent, units"
                  />
                </div>

                <div>
                  <Label htmlFor="metricDate">Date*</Label>
                  <Input
                    id="metricDate"
                    type="date"
                    value={metricForm.date}
                    onChange={(e) => setMetricForm({ ...metricForm, date: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={handleRecordMetric} disabled={loading} className="w-full">
                {loading ? 'Recording...' : 'Record Metric'}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Recent Metrics</h3>
            {metrics.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No metrics recorded</p>
            ) : (
              <div className="space-y-2">
                {metrics.slice(0, 20).map((metric) => (
                  <div key={metric.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{metric.metric_type}</h4>
                        <p className="text-sm text-gray-600 capitalize">{metric.metric_category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">
                          {metric.metric_value.toFixed(2)}
                          {metric.metric_unit && (
                            <span className="text-sm font-normal text-gray-600 ml-1">
                              {metric.metric_unit}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(metric.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="font-semibold mb-4">Create Custom Report</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="reportName">Report Name*</Label>
                <Input
                  id="reportName"
                  value={reportForm.name}
                  onChange={(e) => setReportForm({ ...reportForm, name: e.target.value })}
                  placeholder="e.g., Q1 Financial Summary"
                />
              </div>

              <div>
                <Label htmlFor="reportType">Report Type*</Label>
                <select
                  id="reportType"
                  value={reportForm.type}
                  onChange={(e) =>
                    setReportForm({ ...reportForm, type: e.target.value as ReportType })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="comprehensive">Comprehensive</option>
                  <option value="financial">Financial</option>
                  <option value="marketing">Marketing</option>
                  <option value="inventory">Inventory</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="reportStart">Start Date</Label>
                  <Input
                    id="reportStart"
                    type="date"
                    value={reportForm.startDate}
                    onChange={(e) => setReportForm({ ...reportForm, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="reportEnd">End Date</Label>
                  <Input
                    id="reportEnd"
                    type="date"
                    value={reportForm.endDate}
                    onChange={(e) => setReportForm({ ...reportForm, endDate: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={handleCreateReport} disabled={loading} className="w-full">
                {loading ? 'Creating...' : 'Create Report'}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Saved Reports</h3>
            {reports.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No reports created</p>
            ) : (
              reports.map((report) => (
                <div key={report.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-lg">{report.report_name}</h4>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full capitalize">
                          {report.report_type}
                        </span>
                        {report.is_favorite && (
                          <span className="text-yellow-500">★</span>
                        )}
                      </div>
                      {report.report_config.dateRange && (
                        <p className="text-sm text-gray-600">
                          {report.report_config.dateRange.start} to{' '}
                          {report.report_config.dateRange.end}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Created: {new Date(report.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleToggleFavorite(report.id, report.is_favorite)}
                        variant="outline"
                        size="sm"
                      >
                        {report.is_favorite ? 'Unfavorite' : 'Favorite'}
                      </Button>
                      <Button
                        onClick={() => handleDeleteReport(report.id)}
                        variant="outline"
                        size="sm"
                        disabled={loading}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
