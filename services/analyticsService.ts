import { supabase } from '../lib/safeSupabase';
import { AnalyticsEvent, EventCategory } from '../types/analytics.types';

export type MetricCategory = 'general' | 'financial' | 'marketing' | 'inventory' | 'customer';
export type ReportType = 'financial' | 'marketing' | 'inventory' | 'comprehensive' | 'custom';

export interface PerformanceMetric {
  id: string;
  venture_id: string;
  user_id: string;
  metric_type: string;
  metric_category: MetricCategory;
  metric_value: number;
  metric_unit?: string;
  date: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface CustomReport {
  id: string;
  venture_id: string;
  user_id: string;
  report_name: string;
  report_type: ReportType;
  report_config: {
    metrics?: string[];
    dateRange?: { start: string; end: string };
    filters?: Record<string, any>;
    chartType?: string;
  };
  is_favorite: boolean;
  last_generated_at?: string;
  created_at: string;
  updated_at: string;
}

export const analyticsService = {
  async trackEvent(
    eventType: string,
    category: EventCategory,
    metadata?: Record<string, any>,
    ventureId?: string
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const event: Omit<AnalyticsEvent, 'id' | 'created_at'> = {
        user_id: user?.id,
        venture_id: ventureId,
        event_type: eventType,
        event_category: category,
        metadata,
        session_id: this.getSessionId(),
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
        user_agent: navigator.userAgent,
      };

      await supabase.from('feature_analytics').insert(event);
    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }
  },

  getSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');

    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }

    return sessionId;
  },

  trackNavigation(from: string, to: string, ventureId?: string): void {
    this.trackEvent('page_navigation', 'navigation', { from, to }, ventureId);
  },

  trackFeatureUsage(featureName: string, metadata?: Record<string, any>, ventureId?: string): void {
    this.trackEvent(featureName, 'feature_usage', metadata, ventureId);
  },

  trackInteraction(element: string, action: string, metadata?: Record<string, any>): void {
    this.trackEvent(`${element}_${action}`, 'interaction', metadata);
  },

  trackError(errorMessage: string, metadata?: Record<string, any>): void {
    this.trackEvent('error', 'error', { message: errorMessage, ...metadata });
  },

  trackPerformance(metric: string, value: number, metadata?: Record<string, any>): void {
    this.trackEvent(metric, 'performance', { value, ...metadata });
  },

  async recordMetric(
    metric: Omit<PerformanceMetric, 'id' | 'created_at'>
  ): Promise<PerformanceMetric> {
    const { data, error } = await supabase
      .from('performance_metrics')
      .insert(metric)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getMetrics(
    ventureId: string,
    metricType?: string,
    startDate?: string,
    endDate?: string
  ): Promise<PerformanceMetric[]> {
    let query = supabase
      .from('performance_metrics')
      .select('*')
      .eq('venture_id', ventureId);

    if (metricType) {
      query = query.eq('metric_type', metricType);
    }

    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query.order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getMetricSummary(ventureId: string, metricType: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const metrics = await this.getMetrics(
      ventureId,
      metricType,
      startDate.toISOString().split('T')[0]
    );

    if (metrics.length === 0) {
      return {
        average: 0,
        total: 0,
        min: 0,
        max: 0,
        trend: 'neutral' as 'up' | 'down' | 'neutral',
      };
    }

    const values = metrics.map((m) => m.metric_value);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const total = values.reduce((sum, val) => sum + val, 0);
    const min = Math.min(...values);
    const max = Math.max(...values);

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / (firstHalf.length || 1);
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / (secondHalf.length || 1);

    let trend: 'up' | 'down' | 'neutral' = 'neutral';
    if (secondAvg > firstAvg * 1.05) trend = 'up';
    else if (secondAvg < firstAvg * 0.95) trend = 'down';

    return { average, total, min, max, trend };
  },

  async getCustomReports(ventureId: string): Promise<CustomReport[]> {
    const { data, error } = await supabase
      .from('custom_reports')
      .select('*')
      .eq('venture_id', ventureId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createCustomReport(
    report: Omit<CustomReport, 'id' | 'created_at' | 'updated_at'>
  ): Promise<CustomReport> {
    const { data, error } = await supabase
      .from('custom_reports')
      .insert(report)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCustomReport(id: string, updates: Partial<CustomReport>): Promise<CustomReport> {
    const { data, error } = await supabase
      .from('custom_reports')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCustomReport(id: string): Promise<void> {
    const { error } = await supabase
      .from('custom_reports')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async toggleFavoriteReport(id: string, isFavorite: boolean): Promise<CustomReport> {
    return this.updateCustomReport(id, { is_favorite: !isFavorite });
  },

  async getVentureDashboardData(ventureId: string) {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const dateStr = last30Days.toISOString().split('T')[0];

    const allMetrics = await this.getMetrics(ventureId, undefined, dateStr);

    const metricsByCategory = allMetrics.reduce((acc, metric) => {
      if (!acc[metric.metric_category]) {
        acc[metric.metric_category] = [];
      }
      acc[metric.metric_category].push(metric);
      return acc;
    }, {} as Record<string, PerformanceMetric[]>);

    const summaries: Record<string, any> = {};
    for (const [category, metrics] of Object.entries(metricsByCategory)) {
      const values = metrics.map((m) => m.metric_value);
      if (values.length > 0) {
        summaries[category] = {
          count: metrics.length,
          total: values.reduce((sum, val) => sum + val, 0),
          average: values.reduce((sum, val) => sum + val, 0) / values.length,
          latest: metrics[metrics.length - 1]?.metric_value || 0,
        };
      }
    }

    return {
      metrics: metricsByCategory,
      summaries,
      dateRange: { start: dateStr, end: new Date().toISOString().split('T')[0] },
    };
  },
};
