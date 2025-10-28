
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
  variants: ProductVariant[];
  tags: string[];
}

export type RegenerateableSection = 'description' | 'variants' | 'tags';

export interface SocialMediaPost {
  platform: string;
  postText: string;
  hashtags: string[];
  visualPrompt: string;
}

export interface AdCopy {
  platform: string;
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

export interface Competitor {
  name: string;
  estimatedPriceRange: string;
  strengths: string[];
  weaknesses: string[];
}

export interface GroundingSource {
    uri: string;
    title: string;
}

export interface CompetitiveAnalysis {
  opportunityScore: number;
  marketSummary: string;
  competitors: Competitor[];
  differentiationStrategies: string[];
  sources: GroundingSource[];
}

export type FinancialScenario = 'Pessimistic' | 'Realistic' | 'Optimistic';

export interface FinancialProjections {
  scenario: FinancialScenario;
  sellingPriceCents: number;
  costOfGoodsSoldCents: number;
  estimatedMonthlySales: number;
  monthlyMarketingBudgetCents: number;
  shippingCostPerUnitCents: number;
  transactionFeePercent: number;
  monthlyFixedCostsCents: number;
}

export interface SMARTGoalDetail {
    title: string;
    description: string;
}

export interface SMARTGoals {
    specific: SMARTGoalDetail;
    measurable: SMARTGoalDetail;
    achievable: SMARTGoalDetail;
    relevant: SMARTGoalDetail;
    timeBound: SMARTGoalDetail;
}

export interface BrandIdentityKit {
    colorPalette: {
        primary: string;
        secondary: string;
        accent: string;
    };
    typography: {
        headingFont: string;
        bodyFont: string;
    };
    missionStatement: string;
}

export interface SWOTAnalysis {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
}

export interface CustomerPersona {
    name: string;
    age: number;
    occupation: string;
    quote: string;
    background: string;
    demographics: string[];
    motivations: string[];
    goals: string[];
    painPoints: string[];
    avatarPrompt: string;
}

export interface NextStepItem {
  text: string;
  completed: boolean;
}

export interface AppData {
    productIdea: string;
    brandVoice: string;
    smartGoals: SMARTGoals | null;
    plan: ProductPlan;
    logoImageUrl: string | null;
    brandKit: BrandIdentityKit | null;
    analysis: CompetitiveAnalysis | null;
    swotAnalysis: SWOTAnalysis | null;
    customerPersona: CustomerPersona | null;
    personaAvatarUrl: string | null;
    marketingPlan: MarketingKickstart | null;
    financials: FinancialProjections | null;
    nextSteps: NextStepItem[];
    chatHistory: ChatMessage[];
    storefrontMockupUrl: string | null;
    contentStrategy: ContentStrategy | null;
    shopifyIntegration: ShopifyIntegration | null;
    supplierQuotes: SupplierQuote[];
    priceHistory: PriceHistoryPoint[];
}

export interface SavedVenture {
    id: string; // timestamp
    name: string;
    lastModified: string; // ISO string
    data: AppData;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ProductScoutResult {
    productName: string;
    description: string;
    trendScore: number;
    salesForecast: string;
    potentialSuppliers: {
        platform: string;
        notes: string;
    }[];
    amazonSellingStrategy: {
        keyServices: string[];
        shippingRecommendation: string;
        complianceChecklist: string[];
    };
}

export interface ShopifyIntegration {
    storeUrl: string;
    apiToken: string;
    lastPushStatus: 'success' | 'failed' | null;
    lastPushDate: string | null;
    lastPushedProductId: string | null;
}

export interface SupplierQuote {
    id: string;
    name: string;
    pricePerUnitCents: number;
    moq: number;
}

export interface ContentStrategy {
    seoKeywordPack: string[];
    blogPostIdeas: string[];
    contentCalendar: {
        week: number;
        theme: string;
        dailyPosts: {
            platform: string;
            idea: string;
        }[];
    }[];
}

export interface PriceHistoryPoint {
    date: string; // ISO date string
    priceCents: number;
}
