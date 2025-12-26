import { supabase } from '../lib/supabase';

export interface PerformanceMetric {
  id?: string;
  venture_id?: string;
  user_id?: string;
  metric_type: string;
  metric_category: string;
  metric_value: number;
  metric_unit?: string;
  date: string;
  metadata?: Record<string, any>;
}

export interface PerformanceReport {
  avgLoadTime: number;
  avgRenderTime: number;
  slowestPages: Array<{ page: string; time: number }>;
  errorRate: number;
  totalMetrics: number;
}

export const performanceService = {
  async trackMetric(metric: Omit<PerformanceMetric, 'id'>) {
    try {
      const { data, error } = await supabase
        .from('performance_metrics')
        .insert({
          ...metric,
          date: new Date().toISOString().split('T')[0]
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to track performance metric:', error);
      return null;
    }
  },

  async getMetrics(userId: string, filters?: {
    startDate?: string;
    endDate?: string;
    metricType?: string;
    metricCategory?: string;
  }) {
    let query = supabase
      .from('performance_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (filters?.startDate) {
      query = query.gte('date', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('date', filters.endDate);
    }

    if (filters?.metricType) {
      query = query.eq('metric_type', filters.metricType);
    }

    if (filters?.metricCategory) {
      query = query.eq('metric_category', filters.metricCategory);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async getPerformanceReport(userId: string, days = 7): Promise<PerformanceReport> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const metrics = await this.getMetrics(userId, {
      startDate: startDate.toISOString().split('T')[0]
    });

    const loadTimeMetrics = metrics.filter(m => m.metric_type === 'page_load');
    const renderTimeMetrics = metrics.filter(m => m.metric_type === 'render_time');
    const errorMetrics = metrics.filter(m => m.metric_type === 'error');

    const avgLoadTime = loadTimeMetrics.length > 0
      ? loadTimeMetrics.reduce((sum, m) => sum + m.metric_value, 0) / loadTimeMetrics.length
      : 0;

    const avgRenderTime = renderTimeMetrics.length > 0
      ? renderTimeMetrics.reduce((sum, m) => sum + m.metric_value, 0) / renderTimeMetrics.length
      : 0;

    const pageLoadTimes = loadTimeMetrics.reduce((acc, m) => {
      const page = m.metadata?.page || 'unknown';
      if (!acc[page]) acc[page] = [];
      acc[page].push(m.metric_value);
      return acc;
    }, {} as Record<string, number[]>);

    const slowestPages = Object.entries(pageLoadTimes)
      .map(([page, times]) => ({
        page,
        time: times.reduce((sum, t) => sum + t, 0) / times.length
      }))
      .sort((a, b) => b.time - a.time)
      .slice(0, 5);

    const errorRate = metrics.length > 0
      ? (errorMetrics.length / metrics.length) * 100
      : 0;

    return {
      avgLoadTime,
      avgRenderTime,
      slowestPages,
      errorRate,
      totalMetrics: metrics.length
    };
  },

  measurePageLoad() {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

      if (perfData) {
        const loadTime = perfData.loadEventEnd - perfData.fetchStart;
        const renderTime = perfData.domContentLoadedEventEnd - perfData.fetchStart;

        this.trackMetric({
          metric_type: 'page_load',
          metric_category: 'general',
          metric_value: loadTime,
          metric_unit: 'ms',
          metadata: {
            page: window.location.pathname,
            renderTime
          }
        });
      }
    });
  },

  measureComponentRender(componentName: string, renderTime: number) {
    this.trackMetric({
      metric_type: 'component_render',
      metric_category: 'general',
      metric_value: renderTime,
      metric_unit: 'ms',
      metadata: {
        component: componentName
      }
    });
  },

  trackError(error: Error, context?: Record<string, any>) {
    this.trackMetric({
      metric_type: 'error',
      metric_category: 'general',
      metric_value: 1,
      metadata: {
        message: error.message,
        stack: error.stack,
        ...context
      }
    });
  },

  async getAverageMetric(userId: string, metricType: string, days = 7): Promise<number> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const metrics = await this.getMetrics(userId, {
      startDate: startDate.toISOString().split('T')[0],
      metricType
    });

    if (metrics.length === 0) return 0;

    return metrics.reduce((sum, m) => sum + m.metric_value, 0) / metrics.length;
  }
};

export function usePerformanceTracking(componentName: string) {
  const trackRender = () => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      performanceService.measureComponentRender(componentName, renderTime);
    };
  };

  return { trackRender };
}
