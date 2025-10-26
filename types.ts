export interface ProductVariant {
  title: string;
  sku: string;
  priceCents: number;
  stock: number;
}

export interface ProductPlan {
  productTitle: string;
  slug: string;
  description: string;
  priceCents: number;
  currency: string;
  sku: string;
  stock: number;
  tags: string[];
  variants: ProductVariant[];
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface CompetitorProfile {
  name: string;
  strengths: string[];
  weaknesses: string[];
  estimatedPriceRange: string;
}

export interface CompetitiveAnalysis {
  opportunityScore: number;
  marketSummary: string;
  competitors: CompetitorProfile[];
  differentiationStrategies: string[];
  sources: GroundingSource[];
}

export type RegenerateableSection = 'description' | 'variants' | 'tags';

export interface SocialMediaPost {
  platform: 'Instagram' | 'Facebook' | 'X';
  postText: string;
  hashtags: string[];
  visualPrompt: string;
}

export interface AdCopy {
  platform: 'Google Ads' | 'Facebook Ads';
  headlines: string[];
  descriptions: string[];
}

export interface LaunchEmail {
  subject: string;
  body: string;
}

export interface MarketingKickstart {
  socialMediaPosts: SocialMediaPost[];
  adCopy: AdCopy[];
  launchEmail: LaunchEmail;
}

export interface FinancialAssumptions {
  costOfGoodsSoldCents: number;
  monthlyMarketingBudgetCents: number;
}

export interface FinancialProjections extends FinancialAssumptions {
  sellingPriceCents: number;
  estimatedMonthlySales: number;
}
