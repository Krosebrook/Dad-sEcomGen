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
  materials: string[];
  dimensions: string;
  weightGrams: number;
}

export type RegenerateableSection = 'description' | 'variants' | 'tags' | 'materials';

export interface SocialMediaPost {
  platform: string;
  postTextVariations: string[];
  hashtags: string[];
  visualPrompt: string;
}

export interface AdVariation {
  headlines: string[];
  descriptions: string[];
}

export interface AdCopy {
  platform: string;
  variations: AdVariation[];
  audienceTargeting: {
    demographics: string[];
    interests: string[];
    keywords: string[];
  };
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

export interface ShippingOption {
  name: string;
  costCents: number;
  deliveryTime: string; // e.g., "5-7 business days"
}

export interface FinancialProjections {
  scenario: FinancialScenario;
  sellingPriceCents: number;
  costOfGoodsSoldCents: number;
  estimatedMonthlySales: number;
  monthlyMarketingBudgetCents: number;
  shippingCostPerUnitCents?: number; // Kept for backward compatibility
  shippingOptions: ShippingOption[];
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
  category: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface AdSet {
    adSetName: string;
    targetingSummary: string;
    dailyBudgetCents: number;
    adCreativeNotes: string[];
}

export interface AdCampaign {
    platform: string;
    campaignName: string;
    objective: string;
    adSets: AdSet[];
}

export interface InfluencerMarketingPlan {
    influencerTiers: string[];
    outreachTemplate: string;
    campaignIdeas: {
        ideaName: string;
        description: string;
    }[];
    kpiToTrack: string[];
}

export interface CustomerSupportPlaybook {
    faq: {
        question: string;
        answer: string;
    }[];
    returnPolicySummary: string;
    toneOfVoice: string;
    sampleResponses: {
        scenario: string;
        response: string;
    }[];
}

export interface PackagingExperience {
    theme: string;
    boxDescription: string;
    insideBoxElements: string[];
    sustainabilityNotes: string;
}

export interface LegalChecklistItem {
    item: string;
    description: string;
    isCritical: boolean;
}

export interface LegalChecklist {
    disclaimer: string;
    checklistItems: LegalChecklistItem[];
}

export interface SupplierSuggestion {
  supplierName: string;
  location: string;
  contactWebsite: string;
  specialty: string;
  notes: string;
  email?: string;
  phone?: string;
  moq?: number;
}

export interface KeywordAnalysis {
  keyword: string;
  competition: 'Low' | 'Medium' | 'High';
  monthlySearches: string; // e.g., "1k-10k"
  relevance: 'High' | 'Medium' | 'Low';
}

export interface SeoStrategy {
    strategySummary: string;
    keywordAnalysis: KeywordAnalysis[];
    contentAngleIdeas: {
        title: string;
        description: string;
    }[];
    contentCalendar: {
        week: number;
        theme: string;
        dailyPosts: {
            platform: string;
            idea: string;
        }[];
    }[];
    sources?: GroundingSource[];
}

// Feature 1: Social Media Calendar
export interface SocialMediaCalendarPost {
    day: string; // e.g., "Monday"
    platform: string;
    idea: string;
    visualPrompt: string;
}
export interface SocialMediaCalendar {
    weeks: {
        weekNumber: number;
        theme: string;
        posts: SocialMediaCalendarPost[];
    }[];
}

// Feature 2: Product Photography Plan
export interface PhotographyShot {
    type: 'Studio' | 'Lifestyle' | 'Detail';
    description: string;
    creativeDirection: string;
}
export interface ProductPhotographyPlan {
    shotList: PhotographyShot[];
}

// Feature 3: A/B Testing Ideas
export interface ABTest {
    element: string; // e.g., "Add to Cart Button"
    hypothesis: string;
    variations: {
        name: string; // e.g., "Variation A: Green Button"
        description: string;
    }[];
}
export interface ABTestPlan {
    tests: ABTest[];
}

// Feature 4: Email Marketing Funnel
export interface EmailFunnelItem {
    name: 'Welcome Email' | 'Abandoned Cart' | 'Post-Purchase Follow-up';
    subject: string;
    body: string;
    timing: string; // e.g., "1 hour after cart abandonment"
}
export interface EmailFunnel {
    emails: EmailFunnelItem[];
}

// Feature 5: Press Release
export interface PressRelease {
    headline: string;
    subheadline: string;
    dateline: string; // e.g., "YOUR CITY, STATE – [Date]"
    introduction: string;
    body: string;
    boilerplate: string; // About the company
    contactInfo: string;
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
    seoStrategy: SeoStrategy | null;
    shopifyIntegration: ShopifyIntegration | null;
    supplierQuotes: SupplierQuote[];
    supplierSuggestions?: SupplierSuggestion[] | null;
    priceHistory: PriceHistoryPoint[];
    adCampaigns?: AdCampaign[];
    influencerMarketingPlan?: InfluencerMarketingPlan;
    customerSupportPlaybook?: CustomerSupportPlaybook;
    packagingExperience?: PackagingExperience;
    legalChecklist?: LegalChecklist;
    socialMediaCalendar?: SocialMediaCalendar;
    photographyPlan?: ProductPhotographyPlan;
    abTestPlan?: ABTestPlan;
    emailFunnel?: EmailFunnel;
    pressRelease?: PressRelease;
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
    email?: string;
    phone?: string;
    website?: string;
    notes?: string;
}

export interface PriceHistoryPoint {
    date: string; // ISO date string
    priceCents: number;
}