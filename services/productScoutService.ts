import { supabase } from '../lib/supabase';

export interface SavedSearch {
  id: string;
  user_id: string;
  venture_id?: string;
  search_name: string;
  filters: {
    keywords?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    marketplace?: string;
  };
  last_used_at: string;
  created_at: string;
  updated_at: string;
}

export interface PriceHistory {
  id: string;
  product_asin: string;
  product_title?: string;
  price: number;
  currency: string;
  marketplace: string;
  recorded_at: string;
  metadata: Record<string, any>;
}

export interface PriceAlert {
  id: string;
  user_id: string;
  venture_id?: string;
  product_asin: string;
  product_title?: string;
  target_price: number;
  current_price?: number;
  is_active: boolean;
  alert_triggered_at?: string;
  created_at: string;
  updated_at: string;
}

export const productScoutService = {
  async getSavedSearches(userId: string): Promise<SavedSearch[]> {
    const { data, error } = await supabase
      .from('saved_product_searches')
      .select('*')
      .eq('user_id', userId)
      .order('last_used_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createSavedSearch(search: Omit<SavedSearch, 'id' | 'created_at' | 'updated_at' | 'last_used_at'>): Promise<SavedSearch> {
    const { data, error } = await supabase
      .from('saved_product_searches')
      .insert(search)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateSavedSearch(id: string, updates: Partial<SavedSearch>): Promise<SavedSearch> {
    const { data, error } = await supabase
      .from('saved_product_searches')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteSavedSearch(id: string): Promise<void> {
    const { error } = await supabase
      .from('saved_product_searches')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async useSavedSearch(id: string): Promise<void> {
    const { error } = await supabase
      .from('saved_product_searches')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  },

  async getPriceHistory(productAsin: string, days: number = 30): Promise<PriceHistory[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('product_price_history')
      .select('*')
      .eq('product_asin', productAsin)
      .gte('recorded_at', startDate.toISOString())
      .order('recorded_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async recordPrice(priceData: Omit<PriceHistory, 'id' | 'recorded_at'>): Promise<PriceHistory> {
    const { data, error } = await supabase
      .from('product_price_history')
      .insert(priceData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getPriceAlerts(userId: string, activeOnly: boolean = true): Promise<PriceAlert[]> {
    let query = supabase
      .from('price_alerts')
      .select('*')
      .eq('user_id', userId);

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createPriceAlert(alert: Omit<PriceAlert, 'id' | 'created_at' | 'updated_at' | 'alert_triggered_at'>): Promise<PriceAlert> {
    const { data, error } = await supabase
      .from('price_alerts')
      .insert(alert)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePriceAlert(id: string, updates: Partial<PriceAlert>): Promise<PriceAlert> {
    const { data, error } = await supabase
      .from('price_alerts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePriceAlert(id: string): Promise<void> {
    const { error } = await supabase
      .from('price_alerts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async checkPriceAlerts(userId: string): Promise<PriceAlert[]> {
    const alerts = await this.getPriceAlerts(userId, true);
    const triggeredAlerts: PriceAlert[] = [];

    for (const alert of alerts) {
      if (alert.current_price && alert.current_price <= alert.target_price) {
        const updated = await this.updatePriceAlert(alert.id, {
          alert_triggered_at: new Date().toISOString(),
        });
        triggeredAlerts.push(updated);
      }
    }

    return triggeredAlerts;
  },
};
