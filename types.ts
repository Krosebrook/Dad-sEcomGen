// FIX: Replaced component code with proper type definitions.
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

export type RegenerateableSection = 'description' | 'variants' | 'tags';

export interface GroundingSource {
    uri: string;
    title: string;
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

export interface FinancialAssumptions {
    costOfGoodsSoldCents: number;
    monthlyMarketingBudgetCents: number;
}

export interface FinancialProjections {
    sellingPriceCents: number;
    costOfGoodsSoldCents: number;
    estimatedMonthlySales: number;
    monthlyMarketingBudgetCents: number;
}

export interface NextStepItem {
    text: string;
    completed: boolean;
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

export interface SavedVenture {
    id: string;
    name: string;
    lastModified: string;
    data: {
        plan: ProductPlan;
        brandVoice: string;
        logoImageUrl: string | null;
        analysis: CompetitiveAnalysis | null;
        marketingPlan: MarketingKickstart | null;
        financials: FinancialProjections | null;
        nextSteps: NextStepItem[] | null;
        chatHistory: ChatMessage[] | null;
    }
}