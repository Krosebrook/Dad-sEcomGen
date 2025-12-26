import { supabase } from '../lib/supabase';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: string;
}

export interface FeatureTour {
  featureName: string;
  steps: OnboardingStep[];
  category: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Venture Builder!',
    description: 'Let\'s take a quick tour to help you get started with building your e-commerce venture.',
    action: 'Start Tour'
  },
  {
    id: 'create-venture',
    title: 'Create Your First Venture',
    description: 'Start by describing your product idea. Our AI will help you build a complete business plan.',
    target: '[data-tour="create-venture"]',
    position: 'bottom'
  },
  {
    id: 'explore-steps',
    title: 'Follow the 4-Step Process',
    description: 'Navigate through Idea, Blueprint, Market, and Launchpad to complete your venture.',
    target: '[data-tour="steps"]',
    position: 'right'
  },
  {
    id: 'use-cards',
    title: 'Interactive Feature Cards',
    description: 'Click on any card to generate insights, plans, and strategies powered by AI.',
    target: '[data-tour="cards"]',
    position: 'top'
  },
  {
    id: 'export',
    title: 'Export Your Work',
    description: 'Download your complete business plan, storyboards, and assets when ready.',
    target: '[data-tour="export"]',
    position: 'left'
  }
];

export const FEATURE_TOURS: Record<string, FeatureTour> = {
  productScout: {
    featureName: 'Product Scout',
    category: 'market-research',
    steps: [
      {
        id: 'product-scout-intro',
        title: 'Product Scout',
        description: 'Search and analyze products from Amazon to find profitable opportunities.',
      },
      {
        id: 'product-search',
        title: 'Search Products',
        description: 'Enter keywords, categories, or ASINs to find products.',
        target: '[data-tour="product-search"]',
        position: 'bottom'
      },
      {
        id: 'product-analysis',
        title: 'Analyze Metrics',
        description: 'View pricing, ratings, and profitability metrics to evaluate opportunities.',
        target: '[data-tour="product-metrics"]',
        position: 'top'
      }
    ]
  },
  financialPlanning: {
    featureName: 'Financial Planning',
    category: 'financial',
    steps: [
      {
        id: 'financial-intro',
        title: 'Financial Planning Suite',
        description: 'Create projections, track cash flow, and analyze your venture\'s financial health.',
      },
      {
        id: 'projections',
        title: 'Revenue Projections',
        description: 'Build detailed revenue and expense forecasts for your venture.',
        target: '[data-tour="projections"]',
        position: 'bottom'
      },
      {
        id: 'break-even',
        title: 'Break-Even Analysis',
        description: 'Calculate how many units you need to sell to become profitable.',
        target: '[data-tour="break-even"]',
        position: 'top'
      }
    ]
  },
  collaboration: {
    featureName: 'Team Collaboration',
    category: 'collaboration',
    steps: [
      {
        id: 'collab-intro',
        title: 'Collaborate with Your Team',
        description: 'Invite team members, share ventures, and work together in real-time.',
      },
      {
        id: 'invite',
        title: 'Invite Team Members',
        description: 'Share your venture with collaborators via email.',
        target: '[data-tour="invite"]',
        position: 'bottom'
      },
      {
        id: 'presence',
        title: 'Real-Time Presence',
        description: 'See who\'s viewing your venture in real-time.',
        target: '[data-tour="presence"]',
        position: 'top'
      }
    ]
  }
};

export const onboardingService = {
  async getProgress(userId: string) {
    const { data, error } = await supabase
      .from('user_onboarding_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  },

  async updateProgress(userId: string, stepId: string, completed: boolean, skipped = false) {
    const { data, error } = await supabase
      .from('user_onboarding_progress')
      .upsert({
        user_id: userId,
        step_id: stepId,
        completed,
        skipped,
        completed_at: completed ? new Date().toISOString() : null
      }, {
        onConflict: 'user_id,step_id'
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async completeStep(userId: string, stepId: string) {
    return this.updateProgress(userId, stepId, true, false);
  },

  async skipStep(userId: string, stepId: string) {
    return this.updateProgress(userId, stepId, false, true);
  },

  async isOnboardingComplete(userId: string) {
    const progress = await this.getProgress(userId);
    const completedSteps = progress.filter(p => p.completed).length;
    return completedSteps >= ONBOARDING_STEPS.length - 1;
  },

  async getFeatureTourStatus(userId: string, featureName: string) {
    const { data, error } = await supabase
      .from('feature_tours')
      .select('*')
      .eq('user_id', userId)
      .eq('feature_name', featureName)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async markFeatureTourComplete(userId: string, featureName: string) {
    const { data, error } = await supabase
      .from('feature_tours')
      .upsert({
        user_id: userId,
        feature_name: featureName,
        tour_completed: true,
        last_seen_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,feature_name'
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async dismissFeatureTour(userId: string, featureName: string) {
    const { data, error } = await supabase
      .from('feature_tours')
      .upsert({
        user_id: userId,
        feature_name: featureName,
        dismissed: true,
        last_seen_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,feature_name'
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async shouldShowFeatureTour(userId: string, featureName: string): Promise<boolean> {
    const status = await this.getFeatureTourStatus(userId, featureName);
    if (!status) return true;
    return !status.tour_completed && !status.dismissed;
  }
};
