// FIX: Add necessary imports from @google/genai and other modules.
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { 
    ProductPlan, 
    ProductVariant, 
    RegenerateableSection, 
    SMARTGoals,
    CompetitiveAnalysis,
    SWOTAnalysis,
    CustomerPersona,
    BrandIdentityKit,
    MarketingKickstart,
    FinancialProjections,
    FinancialScenario,
    NextStepItem,
    ProductScoutResult,
    ContentStrategy,
    GroundingSource,
    LaunchEmail,
} from '../types';

// FIX: Initialize the GoogleGenAI client.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// Helper to safely parse JSON from model response
const parseJson = <T>(jsonString: string): T | null => {
    try {
        const cleanedString = jsonString.replace(/^```json\s*|```\s*$/g, '');
        return JSON.parse(cleanedString) as T;
    } catch (e) {
        console.error("Failed to parse JSON:", e, "Original string:", jsonString);
        // Fallback for malformed JSON
        try {
            const startIndex = jsonString.indexOf('{');
            const endIndex = jsonString.lastIndexOf('}');
            const arrayStartIndex = jsonString.indexOf('[');
            const arrayEndIndex = jsonString.lastIndexOf(']');

            let finalJsonString = '';

            if (startIndex !== -1 && endIndex !== -1 && (arrayStartIndex === -1 || startIndex < arrayStartIndex)) {
                finalJsonString = jsonString.substring(startIndex, endIndex + 1);
            } else if (arrayStartIndex !== -1 && arrayEndIndex !== -1) {
                finalJsonString = jsonString.substring(arrayStartIndex, arrayEndIndex + 1);
            }
            if (finalJsonString) {
                return JSON.parse(finalJsonString) as T;
            }
        } catch (e2) {
            console.error("Fallback JSON parsing failed:", e2);
        }
        return null;
    }
};


// Schemas for consistent JSON output
const productVariantSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        sku: { type: Type.STRING },
        priceCents: { type: Type.INTEGER },
        stock: { type: Type.INTEGER },
    },
    required: ['title', 'sku', 'priceCents', 'stock'],
};

const productPlanSchema = {
    type: Type.OBJECT,
    properties: {
        productTitle: { type: Type.STRING },
        slug: { type: Type.STRING },
        description: { type: Type.STRING },
        priceCents: { type: Type.INTEGER },
        currency: { type: Type.STRING },
        sku: { type: Type.STRING },
        stock: { type: Type.INTEGER },
        variants: { type: Type.ARRAY, items: productVariantSchema },
        tags: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
};

const smartGoalDetailSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
    },
    required: ['title', 'description'],
};

const smartGoalsSchema = {
    type: Type.OBJECT,
    properties: {
        specific: smartGoalDetailSchema,
        measurable: smartGoalDetailSchema,
        achievable: smartGoalDetailSchema,
        relevant: smartGoalDetailSchema,
        timeBound: smartGoalDetailSchema,
    },
};


export async function generateProductPlan(productIdea: string, brandVoice: string, existingVariants: ProductVariant[]): Promise<{ plan: ProductPlan, smartGoals: SMARTGoals }> {
    const model = 'gemini-2.5-pro';
    const systemInstruction = `You are an e-commerce expert creating a detailed product plan. The brand voice is "${brandVoice}". Your entire response must be a single JSON object matching the provided schema, and nothing else.`;
    
    let prompt = `Create a comprehensive product plan for: "${productIdea}". Include a compelling product title, slug, a detailed description (including target audience), a base price in cents (USD), a base SKU, total stock, at least 3 relevant product variants, and marketing tags.`;
    if (existingVariants.length > 0) {
        prompt += `\n\nThe user has updated the variants. Please regenerate the plan based on these new variants, updating the total stock and average price accordingly: ${JSON.stringify(existingVariants)}`;
    }

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    plan: productPlanSchema,
                    smartGoals: smartGoalsSchema
                }
            }
        }
    });

    const parsed = parseJson<{ plan: ProductPlan, smartGoals: SMARTGoals }>(response.text);
    if (!parsed) throw new Error("Failed to generate product plan");
    
    // Ensure calculated fields are correct
    if(parsed.plan.variants && parsed.plan.variants.length > 0) {
        parsed.plan.stock = parsed.plan.variants.reduce((acc, v) => acc + v.stock, 0);
        parsed.plan.priceCents = Math.round(parsed.plan.variants.reduce((acc, v) => acc + v.priceCents, 0) / parsed.plan.variants.length);
    }
    
    return parsed;
}

export async function generateSmartGoals(productIdea: string, brandVoice: string): Promise<SMARTGoals> {
    const model = 'gemini-2.5-pro';
    const systemInstruction = `You are a business strategist creating S.M.A.R.T. goals for a new e-commerce venture. The brand voice is "${brandVoice}". Your response must be a JSON object and nothing else.`;
    const prompt = `Generate S.M.A.R.T. goals for a new e-commerce business selling "${productIdea}". The goals should cover the first 6 months of operation. Focus on launch, initial sales, and brand awareness.`;
    
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: smartGoalsSchema,
        }
    });
    
    const parsed = parseJson<SMARTGoals>(response.text);
    if (!parsed) throw new Error("Failed to generate SMART goals");
    return parsed;
}


export async function regeneratePlanSection(productIdea: string, currentPlan: ProductPlan, section: RegenerateableSection, brandVoice: string): Promise<Partial<ProductPlan>> {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are an e-commerce copywriter. The brand voice is "${brandVoice}". Your response must be a JSON object containing only the regenerated section, and nothing else.`;
    
    let prompt = `For the product "${productIdea}", regenerate the "${section}" section. Current plan for context: ${JSON.stringify(currentPlan)}`;
    let responseSchema = {};

    switch(section) {
        case 'description':
            responseSchema = { type: Type.OBJECT, properties: { description: { type: Type.STRING }}};
            break;
        case 'variants':
            responseSchema = { type: Type.OBJECT, properties: { variants: { type: Type.ARRAY, items: productVariantSchema }}};
            break;
        case 'tags':
            responseSchema = { type: Type.OBJECT, properties: { tags: { type: Type.ARRAY, items: { type: Type.STRING }}}};
            break;
    }

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema,
        }
    });

    const parsed = parseJson<Partial<ProductPlan>>(response.text);
    if (!parsed) throw new Error(`Failed to regenerate ${section}`);
    return parsed;
}

export async function generateLogo(productTitle: string, style: string, color: string): Promise<string> {
    const model = 'imagen-4.0-generate-001';
    const prompt = `A ${style} logo for a product called "${productTitle}". The logo should be simple, clean, and memorable. ${color !== 'Default' ? `Use a ${color} color palette.` : ''} The logo must be on a white background.`;
    
    const response = await ai.models.generateImages({
        model,
        prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio: '1:1',
        },
    });

    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/png;base64,${base64ImageBytes}`;
}

export async function generateBrandIdentity(plan: ProductPlan, brandVoice: string): Promise<BrandIdentityKit> {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are a brand strategist creating a brand identity kit. The brand voice is "${brandVoice}". Your response must be a single JSON object.`;
    const prompt = `Create a brand identity kit for the product: "${plan.productTitle}". Description: "${plan.description}". Generate a color palette (primary, secondary, accent hex codes), typography pairing (heading and body font names from Google Fonts), and a concise mission statement.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    colorPalette: { type: Type.OBJECT, properties: { primary: { type: Type.STRING }, secondary: { type: Type.STRING }, accent: { type: Type.STRING }}},
                    typography: { type: Type.OBJECT, properties: { headingFont: { type: Type.STRING }, bodyFont: { type: Type.STRING }}},
                    missionStatement: { type: Type.STRING },
                }
            }
        }
    });
    
    const parsed = parseJson<BrandIdentityKit>(response.text);
    if (!parsed) throw new Error("Failed to generate brand identity");
    return parsed;
}

export async function generateCompetitiveAnalysis(productIdea: string, brandVoice: string): Promise<CompetitiveAnalysis> {
    const model = 'gemini-2.5-pro';
    const systemInstruction = `You are a market research analyst with a ${brandVoice} tone. Your response must be a JSON object. Use Google Search to find current information.`;
    const prompt = `Conduct a competitive analysis for a new e-commerce product: "${productIdea}". Provide an opportunity score (1-10), a market summary, details on 3 main competitors (name, price range, strengths, weaknesses), and 3-4 key differentiation strategies.`;
    
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction,
            tools: [{googleSearch: {}}]
        }
    });

    const parsed = parseJson<CompetitiveAnalysis>(response.text);
    if (!parsed) throw new Error("Failed to generate competitive analysis");

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
        parsed.sources = groundingChunks
            .map((chunk: any) => chunk.web)
            .filter((web: any) => web)
            .map((web: any) => ({ uri: web.uri, title: web.title })) as GroundingSource[];
    }
    
    return parsed;
}

export async function generateSWOTAnalysis(productIdea: string, brandVoice: string): Promise<SWOTAnalysis> {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are a business consultant with a ${brandVoice} tone. Your response must be a JSON object.`;
    const prompt = `Create a SWOT analysis for a new e-commerce product: "${productIdea}". Identify 3-4 key points for each category: Strengths, Weaknesses, Opportunities, and Threats.`;
    
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    strengths: { type: Type.ARRAY, items: { type: Type.STRING }},
                    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }},
                    opportunities: { type: Type.ARRAY, items: { type: Type.STRING }},
                    threats: { type: Type.ARRAY, items: { type: Type.STRING }},
                }
            }
        }
    });

    const parsed = parseJson<SWOTAnalysis>(response.text);
    if (!parsed) throw new Error("Failed to generate SWOT analysis");
    return parsed;
}

export async function generateCustomerPersona(productIdea: string, targetAudience: string, brandVoice: string): Promise<CustomerPersona> {
    const model = 'gemini-2.5-pro';
    const systemInstruction = `You are a marketing expert with a ${brandVoice} tone, specializing in creating customer personas. Your response must be a JSON object.`;
    const prompt = `Create a detailed customer persona for the target audience of "${productIdea}". The target audience is described as: "${targetAudience}". Include a name, age, occupation, a direct quote, background story, demographics, motivations, goals, pain points, and a visual prompt for an avatar image.`;
    
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    age: { type: Type.INTEGER },
                    occupation: { type: Type.STRING },
                    quote: { type: Type.STRING },
                    background: { type: Type.STRING },
                    demographics: { type: Type.ARRAY, items: { type: Type.STRING }},
                    motivations: { type: Type.ARRAY, items: { type: Type.STRING }},
                    goals: { type: Type.ARRAY, items: { type: Type.STRING }},
                    painPoints: { type: Type.ARRAY, items: { type: Type.STRING }},
                    avatarPrompt: { type: Type.STRING },
                }
            }
        }
    });

    const parsed = parseJson<CustomerPersona>(response.text);
    if (!parsed) throw new Error("Failed to generate customer persona");
    return parsed;
}

export async function generatePersonaAvatar(prompt: string): Promise<string> {
    const model = 'imagen-4.0-generate-001';
    
    const response = await ai.models.generateImages({
        model,
        prompt: `${prompt}, realistic photo, headshot, plain background`,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio: '1:1',
        },
    });

    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/png;base64,${base64ImageBytes}`;
}

export async function generateMarketingPlan(plan: ProductPlan, brandVoice: string): Promise<MarketingKickstart> {
    const model = 'gemini-2.5-pro';
    const systemInstruction = `You are a digital marketing specialist with a ${brandVoice} tone. Your response must be a JSON object.`;
    const prompt = `Create a marketing kickstart plan for "${plan.productTitle}". Description: "${plan.description}". Generate 2 social media posts (one for Instagram, one for Facebook), ad copy for Google Ads (3 headlines, 2 descriptions), and a product launch email (subject and body). The email should be engaging and include a special launch offer.`;
    
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    socialMediaPosts: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                platform: { type: Type.STRING },
                                postText: { type: Type.STRING },
                                hashtags: { type: Type.ARRAY, items: { type: Type.STRING }},
                                visualPrompt: { type: Type.STRING },
                            },
                             required: ['platform', 'postText', 'hashtags', 'visualPrompt'],
                        }
                    },
                    adCopy: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                platform: { type: Type.STRING },
                                headlines: { type: Type.ARRAY, items: { type: Type.STRING }},
                                descriptions: { type: Type.ARRAY, items: { type: Type.STRING }},
                            },
                             required: ['platform', 'headlines', 'descriptions'],
                        }
                    },
                    launchEmail: {
                        type: Type.OBJECT,
                        properties: {
                            subject: { type: Type.STRING },
                            body: { type: Type.STRING },
                        },
                         required: ['subject', 'body'],
                    }
                },
                required: ['socialMediaPosts', 'adCopy', 'launchEmail'],
            }
        }
    });

    const parsed = parseJson<MarketingKickstart>(response.text);
    if (!parsed) throw new Error("Failed to generate marketing plan");
    return parsed;
}

export async function regenerateLaunchEmail(plan: ProductPlan, brandVoice: string): Promise<LaunchEmail> {
    const model = 'gemini-2.5-pro';
    const systemInstruction = `You are an expert email marketer with a ${brandVoice} tone. Your response must be a single JSON object with 'subject' and 'body' keys.`;
    const prompt = `Compose a new, engaging launch email for the product "${plan.productTitle}".
    Product Description for context: "${plan.description}".
    The email must clearly state the product's key benefits and create excitement for the launch.
    Crucially, invent a compelling and specific launch day offer (e.g., a 20% discount code like LAUNCH20, free shipping for the first 24 hours, or a small bonus gift for the first 100 orders).
    Generate a catchy, high-conversion subject line and a full email body.`;
    
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    subject: { type: Type.STRING },
                    body: { type: Type.STRING },
                },
                required: ['subject', 'body']
            }
        }
    });

    const parsed = parseJson<LaunchEmail>(response.text);
    if (!parsed) throw new Error("Failed to generate launch email");
    return parsed;
}


export async function generateFinancialProjections(plan: ProductPlan, scenario: FinancialScenario): Promise<FinancialProjections> {
    const model = 'gemini-2.5-pro';
    const systemInstruction = `You are a financial analyst for e-commerce startups. Provide a JSON response based on the scenario.`;
    const prompt = `Generate ${scenario} financial projections for "${plan.productTitle}" which sells for ${plan.priceCents / 100} USD. Estimate the cost of goods sold (COGS) per unit, estimated monthly sales in units, a suitable monthly marketing budget, an estimated shipping cost per unit, a standard transaction fee percentage (e.g., 2.9 for credit cards), and any other typical monthly fixed costs (like platform fees). Provide all monetary values in cents.`;
    
     const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    costOfGoodsSoldCents: { type: Type.INTEGER },
                    estimatedMonthlySales: { type: Type.INTEGER },
                    monthlyMarketingBudgetCents: { type: Type.INTEGER },
                    shippingCostPerUnitCents: { type: Type.INTEGER },
                    transactionFeePercent: { type: Type.NUMBER },
                    monthlyFixedCostsCents: { type: Type.INTEGER },
                }
            }
        }
    });

    const parsed = parseJson<Omit<FinancialProjections, 'sellingPriceCents' | 'scenario'>>(response.text);
    if (!parsed) throw new Error("Failed to generate financial projections");

    return {
        ...parsed,
        scenario,
        sellingPriceCents: plan.priceCents,
    };
}

export async function generateNextSteps(plan: ProductPlan, brandVoice: string): Promise<NextStepItem[]> {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are a business mentor with a ${brandVoice} tone. Create a checklist as a JSON array of objects.`;
    const prompt = `Create a checklist of 10-12 actionable next steps for launching the e-commerce product "${plan.productTitle}". Cover areas like legal, sourcing, marketing setup, and launch day tasks.`;
    
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        text: { type: Type.STRING },
                        completed: { type: Type.BOOLEAN },
                    }
                }
            }
        }
    });

    const parsed = parseJson<NextStepItem[]>(response.text);
    if (!parsed) throw new Error("Failed to generate next steps");
    return parsed;
}

export async function scoutTrendingProducts(category: string): Promise<ProductScoutResult[]> {
    const model = 'gemini-2.5-pro';
    const systemInstruction = 'You are an Amazon market research expert. Your response must be a JSON array of product scout results.';
    const prompt = `Find 3 trending, high-potential products in the "${category}" category on Amazon. For each product, provide its name, a short description, a trend score (1-10), a brief sales forecast, 2 potential supplier ideas (e.g., Alibaba, ThomasNet) with notes, and an Amazon selling strategy (key services like FBA/FBM, shipping recommendations, and a compliance checklist).`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction,
            tools: [{googleSearch: {}}]
        }
    });

    const parsed = parseJson<ProductScoutResult[]>(response.text);
    if (!parsed) throw new Error("Failed to scout products");
    return parsed;
}

export async function generateStorefrontMockup(plan: ProductPlan, logoUrl: string): Promise<string> {
    const model = 'gemini-2.5-flash-image';
    const prompt = `Generate a realistic e-commerce product page mockup for "${plan.productTitle}". The page should feature a prominent product photo area, the product title, price (${(plan.priceCents / 100).toFixed(2)} ${plan.currency}), an "Add to Cart" button, and a snippet of the product description. The design should be clean, modern, and professional. The brand logo is provided as an image.`;

    const response = await ai.models.generateContent({
        model,
        contents: {
            parts: [
                { text: prompt },
                { inlineData: { mimeType: 'image/png', data: logoUrl.split(',')[1] } }
            ]
        },
        config: {
            responseModalities: [Modality.IMAGE],
        }
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:image/png;base64,${base64ImageBytes}`;
        }
    }
    throw new Error("Failed to generate storefront mockup");
}

export async function generateContentStrategy(plan: ProductPlan, persona: CustomerPersona, brandVoice: string): Promise<ContentStrategy> {
    const model = 'gemini-2.5-pro';
    const systemInstruction = `You are a content marketing strategist with a ${brandVoice} tone. Your response must be a JSON object.`;
    const prompt = `Create a content strategy for "${plan.productTitle}" targeting the customer persona "${persona.name}". Provide an SEO keyword pack of 10-15 keywords, 5 blog post ideas, and a 30-day content calendar (4 weeks, with a theme for each week and 2-3 daily post ideas per week for platforms like Instagram, Facebook, or a blog).`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    seoKeywordPack: { type: Type.ARRAY, items: { type: Type.STRING }},
                    blogPostIdeas: { type: Type.ARRAY, items: { type: Type.STRING }},
                    contentCalendar: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                week: { type: Type.INTEGER },
                                theme: { type: Type.STRING },
                                dailyPosts: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            platform: { type: Type.STRING },
                                            idea: { type: Type.STRING },
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    const parsed = parseJson<ContentStrategy>(response.text);
    if (!parsed) throw new Error("Failed to generate content strategy");
    return parsed;
}

export async function generateBlogPost(title: string, plan: ProductPlan, brandVoice: string): Promise<string> {
    const model = 'gemini-2.5-pro';
    const systemInstruction = `You are a skilled blog writer with a ${brandVoice} tone. Write a well-structured blog post in Markdown format.`;
    const prompt = `Write a blog post titled "${title}" for the product "${plan.productTitle}". The post should be engaging, informative, and around 500-700 words. Incorporate keywords related to the product and its benefits. Use Markdown for formatting (headings, lists, bold text).`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { systemInstruction },
    });
    
    return response.text;
}