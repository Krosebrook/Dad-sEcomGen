// FIX: Replaced component code with proper type definitions.
export interface ProductVariant {
    title: string;
    sku: string;
    priceCents: number;
    stock: number;
}

export interface PriceHistoryPoint {
    date: string;
    priceCents: number;
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

export type RegenerateableSection = 'description' | 'variants' | 'tags';

export interface GroundingSource {
    uri: string;
    title: string;
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

export interface CompetitiveAnalysis {
    opportunityScore: number;
    marketSummary: string;
    competitors: {
        name: string;
        strengths: string[];
        weaknesses: string[];
        estimatedPriceRange: string;
    }[];
    differentiationStrategies: string[];
    sources?: GroundingSource[];
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

export interface MarketingKickstart {
    socialMediaPosts: {
        platform: string;
        postText: string;
        hashtags: string[];
        visualPrompt: string;
    }[];
    adCopy: {
        platform: string;
        headlines: string[];
        descriptions: string[];
    }[];
    launchEmail: {
        subject: string;
        body: string;
    };
}

export type FinancialScenario = 'Realistic' | 'Pessimistic' | 'Optimistic';

export interface FinancialAssumptions {
    costOfGoodsSoldCents: number;
    monthlyMarketingBudgetCents: number;
    estimatedMonthlySales: number;
    scenario: FinancialScenario;
}

export interface FinancialProjections {
    sellingPriceCents: number;
    costOfGoodsSoldCents: number;
    estimatedMonthlySales: number;
    monthlyMarketingBudgetCents: number;
    scenario: FinancialScenario;
}

export interface NextStepItem {
    text: string;
    completed: boolean;
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

export interface SMARTGoal {
    title: string;
    description: string;
}

export interface SMARTGoals {
    specific: SMARTGoal;
    measurable: SMARTGoal;
    achievable: SMARTGoal;
    relevant: SMARTGoal;
    timeBound: SMARTGoal;
}

export interface ShopifyIntegration {
    storeUrl: string;
    apiToken: string;
    lastPushStatus: 'success' | 'failed' | null;
    lastPushDate: string | null;
    lastPushedProductId: string | null;
}

export interface DailyPostIdea {
    platform: string;
    idea: string;
}

export interface WeeklyTheme {
    week: number;
    theme: string;
    dailyPosts: DailyPostIdea[];
}

export interface ContentStrategy {
    seoKeywordPack: string[];
    contentCalendar: WeeklyTheme[];
    blogPostIdeas: string[];
}

export interface SupplierQuote {
    id: string;
    name: string;
    pricePerUnitCents: number;
    moq: number;
}

export interface SavedVenture {
    id: string;
    name: string;
    lastModified: string;
    data: {
        plan: ProductPlan;
        brandVoice: string;
        goals: SMARTGoals | null;
        logoImageUrl: string | null;
        brandKit: BrandIdentityKit | null;
        analysis: CompetitiveAnalysis | null;
        swotAnalysis: SWOTAnalysis | null;
        customerPersona: CustomerPersona | null;
        personaAvatarUrl: string | null;
        marketingPlan: MarketingKickstart | null;
        financials: FinancialProjections | null;
        supplierQuotes: SupplierQuote[] | null;
        nextSteps: NextStepItem[] | null;
        chatHistory: ChatMessage[] | null;
        storefrontMockupUrl: string | null;
        priceHistory: PriceHistoryPoint[] | null;
        shopifyIntegration: ShopifyIntegration | null;
        contentStrategy: ContentStrategy | null;
    }
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
    sources?: GroundingSource[];
}