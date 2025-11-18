import { supabase } from '../lib/supabase';
import { AnalyticsEvent, EventCategory } from '../types/analytics.types';

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
};
