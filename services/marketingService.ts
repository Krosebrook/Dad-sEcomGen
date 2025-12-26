import { supabase } from '../lib/supabase';

export type CampaignPlatform = 'facebook' | 'instagram' | 'google' | 'tiktok' | 'pinterest' | 'email' | 'other';
export type CampaignType = 'awareness' | 'consideration' | 'conversion' | 'retention';
export type CampaignStatus = 'planned' | 'active' | 'paused' | 'completed' | 'cancelled';
export type ContentType = 'post' | 'story' | 'video' | 'blog' | 'email' | 'ad';
export type ContentStatus = 'draft' | 'scheduled' | 'published' | 'cancelled';

export interface MarketingCampaign {
  id: string;
  venture_id: string;
  user_id: string;
  campaign_name: string;
  platform: CampaignPlatform;
  campaign_type: CampaignType;
  budget: number;
  spent: number;
  start_date: string;
  end_date?: string;
  status: CampaignStatus;
  goals?: string;
  target_audience: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ContentCalendarItem {
  id: string;
  venture_id: string;
  user_id: string;
  campaign_id?: string;
  content_type: ContentType;
  title: string;
  description?: string;
  platform: string;
  scheduled_date: string;
  published_date?: string;
  status: ContentStatus;
  content_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AdPerformance {
  id: string;
  campaign_id: string;
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spent: number;
  revenue: number;
  ctr: number;
  cpc: number;
  roi: number;
  created_at: string;
}

export const marketingService = {
  async getCampaigns(ventureId: string): Promise<MarketingCampaign[]> {
    const { data, error } = await supabase
      .from('marketing_campaigns')
      .select('*')
      .eq('venture_id', ventureId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createCampaign(
    campaign: Omit<MarketingCampaign, 'id' | 'created_at' | 'updated_at'>
  ): Promise<MarketingCampaign> {
    const { data, error } = await supabase
      .from('marketing_campaigns')
      .insert(campaign)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCampaign(id: string, updates: Partial<MarketingCampaign>): Promise<MarketingCampaign> {
    const { data, error } = await supabase
      .from('marketing_campaigns')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCampaign(id: string): Promise<void> {
    const { error } = await supabase
      .from('marketing_campaigns')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getContentCalendar(ventureId: string, startDate?: string, endDate?: string): Promise<ContentCalendarItem[]> {
    let query = supabase
      .from('content_calendar')
      .select('*')
      .eq('venture_id', ventureId);

    if (startDate) {
      query = query.gte('scheduled_date', startDate);
    }
    if (endDate) {
      query = query.lte('scheduled_date', endDate);
    }

    const { data, error } = await query.order('scheduled_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createContentItem(
    item: Omit<ContentCalendarItem, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ContentCalendarItem> {
    const { data, error } = await supabase
      .from('content_calendar')
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateContentItem(id: string, updates: Partial<ContentCalendarItem>): Promise<ContentCalendarItem> {
    const { data, error } = await supabase
      .from('content_calendar')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteContentItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('content_calendar')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getAdPerformance(campaignId: string): Promise<AdPerformance[]> {
    const { data, error } = await supabase
      .from('ad_performance')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createAdPerformance(
    performance: Omit<AdPerformance, 'id' | 'created_at' | 'ctr' | 'cpc' | 'roi'>
  ): Promise<AdPerformance> {
    const { data, error } = await supabase
      .from('ad_performance')
      .insert(performance)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateAdPerformance(id: string, updates: Partial<AdPerformance>): Promise<AdPerformance> {
    const { data, error } = await supabase
      .from('ad_performance')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getCampaignPerformanceSummary(campaignId: string) {
    const performance = await this.getAdPerformance(campaignId);

    if (performance.length === 0) {
      return {
        totalImpressions: 0,
        totalClicks: 0,
        totalConversions: 0,
        totalSpent: 0,
        totalRevenue: 0,
        avgCTR: 0,
        avgCPC: 0,
        avgROI: 0,
      };
    }

    const totals = performance.reduce(
      (acc, day) => ({
        impressions: acc.impressions + day.impressions,
        clicks: acc.clicks + day.clicks,
        conversions: acc.conversions + day.conversions,
        spent: acc.spent + day.spent,
        revenue: acc.revenue + day.revenue,
      }),
      { impressions: 0, clicks: 0, conversions: 0, spent: 0, revenue: 0 }
    );

    return {
      totalImpressions: totals.impressions,
      totalClicks: totals.clicks,
      totalConversions: totals.conversions,
      totalSpent: totals.spent,
      totalRevenue: totals.revenue,
      avgCTR: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
      avgCPC: totals.clicks > 0 ? totals.spent / totals.clicks : 0,
      avgROI: totals.spent > 0 ? ((totals.revenue - totals.spent) / totals.spent) * 100 : 0,
    };
  },
};
