import { supabase } from '../lib/supabase';

export interface VentureTemplate {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  template_data: any;
  preview_image_url: string;
  price: number;
  is_featured: boolean;
  is_published: boolean;
  downloads_count: number;
  rating_average: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export interface TemplateRating {
  id: string;
  template_id: string;
  user_id: string;
  rating: number;
  review_text: string;
  created_at: string;
  updated_at: string;
}

export interface TemplatePurchase {
  id: string;
  template_id: string;
  user_id: string;
  price_paid: number;
  purchased_at: string;
}

export interface TemplateFilters {
  category?: string;
  minRating?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  searchQuery?: string;
  tags?: string[];
}

export const templateService = {
  async getTemplates(filters?: TemplateFilters) {
    let query = supabase
      .from('venture_templates')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    if (filters?.minRating) {
      query = query.gte('rating_average', filters.minRating);
    }

    if (filters?.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }

    if (filters?.isFeatured) {
      query = query.eq('is_featured', true);
    }

    if (filters?.searchQuery) {
      query = query.textSearch('title', filters.searchQuery);
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async getFeaturedTemplates(limit = 6) {
    const { data, error } = await supabase
      .from('venture_templates')
      .select('*')
      .eq('is_published', true)
      .eq('is_featured', true)
      .order('downloads_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getTemplate(id: string) {
    const { data, error } = await supabase
      .from('venture_templates')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getMyTemplates(userId: string) {
    const { data, error } = await supabase
      .from('venture_templates')
      .select('*')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createTemplate(template: Partial<VentureTemplate>) {
    const { data, error } = await supabase
      .from('venture_templates')
      .insert(template)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateTemplate(id: string, updates: Partial<VentureTemplate>) {
    const { data, error } = await supabase
      .from('venture_templates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async deleteTemplate(id: string) {
    const { error } = await supabase
      .from('venture_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async publishTemplate(id: string) {
    return this.updateTemplate(id, { is_published: true });
  },

  async unpublishTemplate(id: string) {
    return this.updateTemplate(id, { is_published: false });
  },

  async purchaseTemplate(templateId: string, userId: string, pricePaid: number) {
    const { data, error } = await supabase
      .from('template_purchases')
      .insert({
        template_id: templateId,
        user_id: userId,
        price_paid: pricePaid
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async hasPurchased(templateId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('template_purchases')
      .select('id')
      .eq('template_id', templateId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) return false;
    return !!data;
  },

  async getMyPurchases(userId: string) {
    const { data, error } = await supabase
      .from('template_purchases')
      .select(`
        *,
        template:venture_templates(*)
      `)
      .eq('user_id', userId)
      .order('purchased_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async rateTemplate(templateId: string, userId: string, rating: number, reviewText = '') {
    const { data, error } = await supabase
      .from('template_ratings')
      .upsert({
        template_id: templateId,
        user_id: userId,
        rating,
        review_text: reviewText,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'template_id,user_id'
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getTemplateRatings(templateId: string) {
    const { data, error } = await supabase
      .from('template_ratings')
      .select('*')
      .eq('template_id', templateId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getUserRating(templateId: string, userId: string) {
    const { data, error } = await supabase
      .from('template_ratings')
      .select('*')
      .eq('template_id', templateId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) return null;
    return data;
  },

  async getCategories() {
    const { data, error } = await supabase
      .from('template_categories')
      .select('*')
      .order('sort_order');

    if (error) throw error;
    return data || [];
  },

  async searchTemplates(query: string) {
    const { data, error } = await supabase
      .from('venture_templates')
      .select('*')
      .eq('is_published', true)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('downloads_count', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  }
};
