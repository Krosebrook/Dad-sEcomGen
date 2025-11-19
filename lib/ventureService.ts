import { supabase } from './safeSupabase';
import { AppData, SavedVenture } from '../types';

export interface VentureWithData extends SavedVenture {
  user_id: string;
  is_archived: boolean;
  last_accessed_at: string;
}

export const ventureService = {
  async createVenture(name: string, productIdea: string, brandVoice: string, data: AppData): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: venture, error: ventureError } = await supabase
      .from('ventures')
      .insert({
        user_id: user.id,
        name,
        product_idea: productIdea,
        brand_voice: brandVoice,
      })
      .select()
      .single();

    if (ventureError) throw ventureError;

    await this.saveVentureData(venture.id, data);

    await supabase.from('activity_log').insert({
      venture_id: venture.id,
      user_id: user.id,
      action: 'created',
      details: { name, product_idea: productIdea },
    });

    return venture.id;
  },

  async updateVenture(ventureId: string, name: string, data: AppData): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error: ventureError } = await supabase
      .from('ventures')
      .update({
        name,
        last_accessed_at: new Date().toISOString(),
      })
      .eq('id', ventureId);

    if (ventureError) throw ventureError;

    await this.saveVentureData(ventureId, data);

    await supabase.from('activity_log').insert({
      venture_id: ventureId,
      user_id: user.id,
      action: 'updated',
      details: { name },
    });
  },

  async saveVentureData(ventureId: string, data: AppData): Promise<void> {
    const dataTypes = [
      { type: 'smart_goals', data: data.smartGoals },
      { type: 'product_plan', data: data.plan },
      { type: 'logo', data: { url: data.logoImageUrl } },
      { type: 'brand_kit', data: data.brandKit },
      { type: 'competitive_analysis', data: data.analysis },
      { type: 'swot_analysis', data: data.swotAnalysis },
      { type: 'customer_persona', data: { ...data.customerPersona, avatarUrl: data.personaAvatarUrl } },
      { type: 'marketing_plan', data: data.marketingPlan },
      { type: 'financials', data: data.financials },
      { type: 'next_steps', data: data.nextSteps },
      { type: 'chat_history', data: data.chatHistory },
      { type: 'storefront_mockup', data: { url: data.storefrontMockupUrl } },
      { type: 'seo_strategy', data: data.seoStrategy },
      { type: 'shopify_integration', data: data.shopifyIntegration },
      { type: 'supplier_data', data: { quotes: data.supplierQuotes, suggestions: data.supplierSuggestions } },
      { type: 'price_history', data: data.priceHistory },
      { type: 'ad_campaigns', data: data.adCampaigns },
      { type: 'influencer_marketing', data: data.influencerMarketingPlan },
      { type: 'customer_support', data: data.customerSupportPlaybook },
      { type: 'packaging', data: data.packagingExperience },
      { type: 'legal_checklist', data: data.legalChecklist },
      { type: 'social_media_calendar', data: data.socialMediaCalendar },
      { type: 'photography_plan', data: data.photographyPlan },
      { type: 'ab_test_plan', data: data.abTestPlan },
      { type: 'email_funnel', data: data.emailFunnel },
      { type: 'press_release', data: data.pressRelease },
    ];

    for (const { type, data: itemData } of dataTypes) {
      if (itemData !== null && itemData !== undefined) {
        const { data: existingData } = await supabase
          .from('venture_data')
          .select('id, version')
          .eq('venture_id', ventureId)
          .eq('data_type', type)
          .order('version', { ascending: false })
          .limit(1)
          .maybeSingle();

        const newVersion = existingData ? existingData.version + 1 : 1;

        await supabase.from('venture_data').insert({
          venture_id: ventureId,
          data_type: type,
          data: itemData,
          version: newVersion,
        });
      }
    }
  },

  async getVenture(ventureId: string): Promise<SavedVenture | null> {
    const { data: venture, error: ventureError } = await supabase
      .from('ventures')
      .select('*')
      .eq('id', ventureId)
      .single();

    if (ventureError || !venture) return null;

    await supabase
      .from('ventures')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', ventureId);

    const { data: ventureDataRecords } = await supabase
      .from('venture_data')
      .select('*')
      .eq('venture_id', ventureId)
      .order('version', { ascending: false });

    const latestData: Record<string, any> = {};
    if (ventureDataRecords) {
      for (const record of ventureDataRecords) {
        if (!latestData[record.data_type]) {
          latestData[record.data_type] = record.data;
        }
      }
    }

    const appData: AppData = {
      productIdea: venture.product_idea,
      brandVoice: venture.brand_voice,
      smartGoals: latestData.smart_goals || null,
      plan: latestData.product_plan || null,
      logoImageUrl: latestData.logo?.url || null,
      brandKit: latestData.brand_kit || null,
      analysis: latestData.competitive_analysis || null,
      swotAnalysis: latestData.swot_analysis || null,
      customerPersona: latestData.customer_persona || null,
      personaAvatarUrl: latestData.customer_persona?.avatarUrl || null,
      marketingPlan: latestData.marketing_plan || null,
      financials: latestData.financials || null,
      nextSteps: latestData.next_steps || [],
      chatHistory: latestData.chat_history || [],
      storefrontMockupUrl: latestData.storefront_mockup?.url || null,
      seoStrategy: latestData.seo_strategy || null,
      shopifyIntegration: latestData.shopify_integration || null,
      supplierQuotes: latestData.supplier_data?.quotes || [],
      supplierSuggestions: latestData.supplier_data?.suggestions || null,
      priceHistory: latestData.price_history || [],
      adCampaigns: latestData.ad_campaigns,
      influencerMarketingPlan: latestData.influencer_marketing,
      customerSupportPlaybook: latestData.customer_support,
      packagingExperience: latestData.packaging,
      legalChecklist: latestData.legal_checklist,
      socialMediaCalendar: latestData.social_media_calendar,
      photographyPlan: latestData.photography_plan,
      abTestPlan: latestData.ab_test_plan,
      emailFunnel: latestData.email_funnel,
      pressRelease: latestData.press_release,
    };

    return {
      id: venture.id,
      name: venture.name,
      lastModified: venture.updated_at,
      data: appData,
    };
  },

  async getAllVentures(): Promise<SavedVenture[]> {
    const { data: ventures, error } = await supabase
      .from('ventures')
      .select('*')
      .eq('is_archived', false)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    if (!ventures) return [];

    const venturesWithData: SavedVenture[] = [];
    for (const venture of ventures) {
      const fullVenture = await this.getVenture(venture.id);
      if (fullVenture) {
        venturesWithData.push(fullVenture);
      }
    }

    return venturesWithData;
  },

  async deleteVenture(ventureId: string): Promise<void> {
    const { error } = await supabase
      .from('ventures')
      .delete()
      .eq('id', ventureId);

    if (error) throw error;
  },

  async archiveVenture(ventureId: string): Promise<void> {
    const { error } = await supabase
      .from('ventures')
      .update({ is_archived: true })
      .eq('id', ventureId);

    if (error) throw error;
  },

  async renameVenture(ventureId: string, newName: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('ventures')
      .update({ name: newName })
      .eq('id', ventureId);

    if (error) throw error;

    await supabase.from('activity_log').insert({
      venture_id: ventureId,
      user_id: user.id,
      action: 'renamed',
      details: { new_name: newName },
    });
  },

  async getActivityLog(ventureId: string, limit: number = 20) {
    const { data, error } = await supabase
      .from('activity_log')
      .select(`
        *,
        profiles:user_id (
          full_name,
          email
        )
      `)
      .eq('venture_id', ventureId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  subscribeToVenture(ventureId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`venture:${ventureId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ventures',
          filter: `id=eq.${ventureId}`,
        },
        callback
      )
      .subscribe();
  },
};
