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
    SeoStrategy,
    GroundingSource,
    LaunchEmail,
    AdCampaign,
    InfluencerMarketingPlan,
    CustomerSupportPlaybook,
    PackagingExperience,
    LegalChecklist,
    SupplierSuggestion,
    SocialMediaCalendar,
    ProductPhotographyPlan,
    ABTestPlan,
    EmailFunnel,
    PressRelease
} from '../types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey || apiKey === 'your-gemini-api-key-here') {
  console.warn('Gemini API key is not configured. AI features will not work until you add your API key to the .env file.');
}

const ai = apiKey && apiKey !== 'your-gemini-api-key-here' ? new GoogleGenAI({ apiKey }) : null;

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
        materials: { type: Type.ARRAY, items: { type: Type.STRING } },
        dimensions: { type: Type.STRING },
        weightGrams: { type: Type.INTEGER },
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
    if (!ai) {
        throw new Error('Gemini API key is not configured. Please add your API key to the .env file as VITE_GEMINI_API_KEY');
    }

    const model = 'gemini-2.5-pro';
    const systemInstruction = `You are an e-commerce expert creating a detailed product plan. The brand voice is "${brandVoice}". Your entire response must be a single JSON object matching the provided schema, and nothing else.`;

    let prompt = `Create a comprehensive product plan for: "${productIdea}". Include a compelling product title, slug, a detailed and engaging product description that focuses on the benefits for its target audience, a base price in cents (USD), a base SKU, total stock, at least 3 relevant product variants, marketing tags, a list of primary materials, product dimensions (e.g., "15cm x 10cm x 5cm"), and weight in grams.`;
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
    if (!ai) {
        throw new Error('Gemini API key is not configured. Please add your API key to the .env file as VITE_GEMINI_API_KEY');
    }

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
            prompt = `For the product "${productIdea}", regenerate the "description" section. Make the new description more engaging and benefit-oriented for the target audience. Current description for context: "${currentPlan.description}"`;
            responseSchema = { type: Type.OBJECT, properties: { description: { type: Type.STRING }}};
            break;
        case 'variants':
            responseSchema = { type: Type.OBJECT, properties: { variants: { type: Type.ARRAY, items: productVariantSchema }}};
            break;
        case 'tags':
            responseSchema = { type: Type.OBJECT, properties: { tags: { type: Type.ARRAY, items: { type: Type.STRING }}}};
            break;
        case 'materials':
            responseSchema = { type: Type.OBJECT, properties: { materials: { type: Type.ARRAY, items: { type: Type.STRING }}}};
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

export async function generateMarketingPlan(plan: ProductPlan, brandVoice: string, customerPersona: CustomerPersona): Promise<MarketingKickstart> {
    const model = 'gemini-2.5-pro';
    const systemInstruction = `You are a digital marketing specialist with a ${brandVoice} tone. Your response must be a JSON object.`;
    const prompt = `Create a marketing kickstart plan for "${plan.productTitle}".
Description: "${plan.description}".
The target customer persona is:
- Name: ${customerPersona.name}, Age: ${customerPersona.age}, Occupation: ${customerPersona.occupation}
- Motivations: ${customerPersona.motivations.join(', ')}
- Goals: ${customerPersona.goals.join(', ')}
- Pain Points: ${customerPersona.painPoints.join(', ')}

Generate social media posts for platforms like Instagram, Facebook, and X (formerly Twitter). For each platform, provide 3 distinct post text variations. Each post should also include relevant hashtags and a creative visual prompt.
Also, generate ad copy for Google Ads. Provide 3 distinct ad variations. Each ad variation must have 3 headlines and 2 descriptions. Include detailed audience targeting suggestions (demographics, interests, keywords) based on the customer persona.
Finally, create a product launch email.`;
    
    const adVariationSchema = {
        type: Type.OBJECT,
        properties: {
            headlines: { type: Type.ARRAY, items: { type: Type.STRING } },
            descriptions: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['headlines', 'descriptions'],
    };
    
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
                                postTextVariations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 3 distinct post text variations." },
                                hashtags: { type: Type.ARRAY, items: { type: Type.STRING }},
                                visualPrompt: { type: Type.STRING },
                            },
                             required: ['platform', 'postTextVariations', 'hashtags', 'visualPrompt'],
                        }
                    },
                    adCopy: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                platform: { type: Type.STRING },
                                variations: { type: Type.ARRAY, items: adVariationSchema, description: "An array of 3 distinct ad variations." },
                                audienceTargeting: {
                                    type: Type.OBJECT,
                                    properties: {
                                        demographics: { type: Type.ARRAY, items: { type: Type.STRING }, description: "e.g., Age: 25-35, Location: Urban areas" },
                                        interests: { type: Type.ARRAY, items: { type: Type.STRING }, description: "e.g., 'Tech gadgets', 'Productivity hacks', 'Parenting blogs'" },
                                        keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "e.g., 'best backpack for dads', 'tech-friendly work bag'" },
                                    },
                                    required: ['demographics', 'interests', 'keywords'],
                                }
                            },
                             required: ['platform', 'variations', 'audienceTargeting'],
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
    const prompt = `Generate ${scenario} financial projections for "${plan.productTitle}" which sells for ${plan.priceCents / 100} USD. 
- Estimate the cost of goods sold (COGS) per unit.
- Estimate monthly sales in units.
- Suggest a suitable monthly marketing budget.
- Provide at least two common shipping options (e.g., 'Standard Shipping', 'Express Shipping') with their estimated costs per unit and delivery times.
- Include a standard transaction fee percentage (e.g., 2.9 for credit cards).
- Estimate any other typical monthly fixed costs (like platform fees).
Provide all monetary values in cents.`;

    const shippingOptionSchema = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            costCents: { type: Type.INTEGER },
            deliveryTime: { type: Type.STRING },
        },
        required: ['name', 'costCents', 'deliveryTime'],
    };
    
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
                    shippingOptions: { type: Type.ARRAY, items: shippingOptionSchema },
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
        shippingOptions: parsed.shippingOptions || [],
    };
}

export async function generateNextSteps(plan: ProductPlan, brandVoice: string): Promise<NextStepItem[]> {
    const model = 'gemini-2.5-pro';
    const systemInstruction = `You are a business mentor with a ${brandVoice} tone. Create a checklist as a JSON array of objects.`;
    const prompt = `You are creating a launch checklist for an e-commerce entrepreneur. It is absolutely critical that every step is specific, actionable, and directly helpful. Avoid generic advice. The steps MUST be tailored specifically to this product and its unique characteristics.

Product Information for Context:
- Product Name: "${plan.productTitle}"
- Description: "${plan.description}"
- Key Materials: "${plan.materials.join(', ')}"

Based on this product, generate a prioritized checklist of 10-12 highly specific and actionable next steps for a successful launch.

Instructions:
1.  **Prioritization is Key:** The final list must be ordered from highest to lowest priority.
2.  **Be Specific:** Each step must be a concrete task. Do not use vague verbs. Every step must start with a strong action verb (e.g., 'Research', 'File', 'Design', 'Purchase').
3.  **Examples of Good vs. Bad Steps:**
    - BAD: "Look into legal requirements."
    - GOOD: "File for a DBA ('Doing Business As') with your local county clerk's office."
    - BAD: "Source materials."
    - GOOD: "Request quotes from 3 potential suppliers for '${plan.materials[0] || 'your primary material'}' found on Alibaba or ThomasNet."
    - BAD: "Do marketing."
    - GOOD: "Draft 5 announcement posts for Instagram showcasing the product's unique features, and schedule them to go live on launch day."
4.  **Categorize and Prioritize Each Step:** For each step, you must assign:
    - A 'priority' ('High', 'Medium', 'Low').
    - A 'category' from this exact list: "Legal & Compliance", "Sourcing & Production", "Marketing & Sales", or "Launch Prep".

Generate the response as a JSON array of objects, ordered by priority.`;
    
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction,
            temperature: 0.7,
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        text: { type: Type.STRING },
                        completed: { type: Type.BOOLEAN, description: "Default to false." },
                        category: { type: Type.STRING, description: "Category: 'Legal & Compliance', 'Sourcing & Production', 'Marketing & Sales', or 'Launch Prep'" },
                        priority: { type: Type.STRING, description: "Priority: 'High', 'Medium', or 'Low'" },
                    },
                    required: ['text', 'completed', 'category', 'priority']
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

export async function generateSeoStrategy(plan: ProductPlan, persona: CustomerPersona, brandVoice: string): Promise<SeoStrategy> {
    const model = 'gemini-2.5-pro';
    const systemInstruction = `You are a world-class SEO strategist and content marketing expert with a ${brandVoice} tone. Your response must be a single JSON object. Use Google Search to get current data on keyword competition and search volume.`;
    const prompt = `Create an advanced SEO and content strategy for the product "${plan.productTitle}", targeting the customer persona "${persona.name}".
    
    1.  **Keyword Analysis**: Generate a list of at least 10 relevant keywords. For each, provide an estimated monthly search volume (as a string range, e.g., "1k-10k"), competition level ('Low', 'Medium', 'High'), and relevance ('High', 'Medium', 'Low').
    2.  **Strategy Summary**: Write a brief, actionable summary of the overall SEO strategy.
    3.  **Content Angle Ideas**: Propose 3 distinct content angle ideas that target the most promising keywords. Provide a compelling title and a short description for each.
    4.  **Content Calendar**: Create a 4-week content calendar with a theme for each week and 2-3 post ideas per week for relevant platforms (e.g., Blog, Instagram, Facebook).`;
    
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction,
            tools: [{ googleSearch: {} }]
        }
    });
    
    const parsed = parseJson<SeoStrategy>(response.text);
    if (!parsed) throw new Error("Failed to generate SEO strategy");

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
        parsed.sources = groundingChunks
            .map((chunk: any) => chunk.web)
            .filter((web: any) => web)
            .map((web: any) => ({ uri: web.uri, title: web.title })) as GroundingSource[];
    }

    return parsed;
}

export async function generateAdCampaigns(plan: ProductPlan, persona: CustomerPersona, marketingPlan: MarketingKickstart): Promise<AdCampaign[]> {
    const model = 'gemini-2.5-pro';
    const systemInstruction = `You are a digital advertising strategist. Your response must be a JSON array of AdCampaign objects.`;
    const prompt = `Based on the product "${plan.productTitle}", the customer persona "${persona.name}", and the initial ad copy, create a structured ad campaign plan. Generate one campaign for Facebook Ads and one for Google Ads.
    For each campaign:
    - Define a clear objective (e.g., 'Brand Awareness', 'Conversions').
    - Create two distinct ad sets with different targeting approaches based on the persona.
    - For each ad set, provide a targeting summary, a suggested daily budget in cents (USD), and 2-3 creative notes that build on the existing ad copy.
    Initial Ad Copy for context: ${JSON.stringify(marketingPlan.adCopy)}`;

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
                        platform: { type: Type.STRING },
                        campaignName: { type: Type.STRING },
                        objective: { type: Type.STRING },
                        adSets: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    adSetName: { type: Type.STRING },
                                    targetingSummary: { type: Type.STRING },
                                    dailyBudgetCents: { type: Type.INTEGER },
                                    adCreativeNotes: { type: Type.ARRAY, items: { type: Type.STRING } },
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    const parsed = parseJson<AdCampaign[]>(response.text);
    if (!parsed) throw new Error("Failed to generate ad campaigns");
    return parsed;
}

export async function generateInfluencerPlan(plan: ProductPlan, persona: CustomerPersona, brandVoice: string): Promise<InfluencerMarketingPlan> {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are an influencer marketing expert with a ${brandVoice} tone. Your response must be a single JSON object.`;
    const prompt = `Create an influencer marketing plan for "${plan.productTitle}" targeting the persona "${persona.name}".
    - Suggest which influencer tiers to target (e.g., Nano, Micro).
    - Write a friendly, concise outreach email template.
    - Propose 2 creative campaign ideas (e.g., unboxing, 'day in the life').
    - List 3-4 key KPIs to track for success.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    influencerTiers: { type: Type.ARRAY, items: { type: Type.STRING } },
                    outreachTemplate: { type: Type.STRING },
                    campaignIdeas: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                ideaName: { type: Type.STRING },
                                description: { type: Type.STRING },
                            },
                        },
                    },
                    kpiToTrack: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
            },
        },
    });

    const parsed = parseJson<InfluencerMarketingPlan>(response.text);
    if (!parsed) throw new Error("Failed to generate influencer plan");
    return parsed;
}

export async function generateCustomerSupportPlaybook(plan: ProductPlan, brandVoice: string): Promise<CustomerSupportPlaybook> {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are a customer experience manager with a ${brandVoice} tone. Your response must be a single JSON object.`;
    const prompt = `Create a customer support playbook for the product "${plan.productTitle}".
    - Define the support tone of voice.
    - Write a customer-friendly return policy summary (3-4 sentences).
    - Generate 4 common FAQs with answers.
    - Provide sample responses for two scenarios: 'Order has not arrived' and 'Customer is unhappy with the product'.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    faq: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                question: { type: Type.STRING },
                                answer: { type: Type.STRING },
                            },
                        },
                    },
                    returnPolicySummary: { type: Type.STRING },
                    toneOfVoice: { type: Type.STRING },
                    sampleResponses: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                scenario: { type: Type.STRING },
                                response: { type: Type.STRING },
                            },
                        },
                    },
                },
            },
        },
    });

    const parsed = parseJson<CustomerSupportPlaybook>(response.text);
    if (!parsed) throw new Error("Failed to generate customer support playbook");
    return parsed;
}

export async function generatePackagingExperience(plan: ProductPlan, brandVoice: string): Promise<PackagingExperience> {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are a branding and packaging designer with a ${brandVoice} tone. Your response must be a single JSON object.`;
    const prompt = `Design a memorable packaging and unboxing experience for "${plan.productTitle}".
    - Suggest a creative theme.
    - Describe the shipping box (material, color, branding).
    - List 3-4 key elements to include inside the box (e.g., branded tissue paper, a thank you card with a dad joke, a sticker).
    - Add a brief note on potential sustainability improvements.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    theme: { type: Type.STRING },
                    boxDescription: { type: Type.STRING },
                    insideBoxElements: { type: Type.ARRAY, items: { type: Type.STRING } },
                    sustainabilityNotes: { type: Type.STRING },
                },
            },
        },
    });

    const parsed = parseJson<PackagingExperience>(response.text);
    if (!parsed) throw new Error("Failed to generate packaging experience plan");
    return parsed;
}

export async function generateLegalChecklist(plan: ProductPlan): Promise<LegalChecklist> {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are a helpful AI assistant providing a general information checklist for e-commerce. Your response must be a single JSON object.`;
    const prompt = `For a new e-commerce business selling a product like "${plan.productTitle}", generate a general legal and compliance checklist.
    - Include a clear disclaimer that this is for informational purposes only and not legal advice.
    - List 5-7 key checklist items (e.g., Business Registration, Privacy Policy, Terms of Service, Cookie Consent).
    - For each item, provide a brief description of what it is.
    - Mark items that are generally considered critical as true.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    disclaimer: { type: Type.STRING },
                    checklistItems: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                item: { type: Type.STRING },
                                description: { type: Type.STRING },
                                isCritical: { type: Type.BOOLEAN },
                            },
                        },
                    },
                },
            },
        },
    });

    const parsed = parseJson<LegalChecklist>(response.text);
    if (!parsed) throw new Error("Failed to generate legal checklist");
    return parsed;
}

export async function generateSupplierSuggestions(plan: ProductPlan, persona: CustomerPersona): Promise<SupplierSuggestion[]> {
    const model = 'gemini-2.5-pro';
    const systemInstruction = `You are a sourcing and supply chain expert for e-commerce businesses. Your response must be a JSON array of potential suppliers.`;
    const prompt = `You are a world-class sourcing expert. Your goal is to provide a strategically diverse set of supplier options for a new e-commerce product.

Based on the following product, suggest 3 **distinct and strategically different types** of potential suppliers. This should give the entrepreneur a diverse range of sourcing options to consider, for example: a bulk overseas manufacturer, a local high-quality artisan, and a specialist in sustainable/niche materials.

Product Information:
- Product Title: "${plan.productTitle}"
- Primary Materials: "${plan.materials.join(', ')}"
- Target Audience Background: "${persona.background}"

For each of the 3 suggested suppliers, you MUST provide all of the following fields:
    - A plausible supplier name.
    - A general location (e.g., 'Vietnam', 'USA - West Coast').
    - A contact website (a link to a major sourcing platform or a manufacturer's domain).
    - Their specialty.
    - An estimated Minimum Order Quantity (MOQ) as an integer.
    - A plausible contact email (e.g., sales@suppliername.com). This field is mandatory.
    - A plausible contact phone number in a standard format. This field is mandatory.
    - Brief notes on why they represent a distinct strategic option for this product.

Your response must be a valid JSON array. All fields listed above are required for each supplier object. Do not omit any fields.`;

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
                        supplierName: { type: Type.STRING },
                        location: { type: Type.STRING },
                        contactWebsite: { type: Type.STRING },
                        specialty: { type: Type.STRING },
                        notes: { type: Type.STRING },
                        email: { type: Type.STRING, description: "A plausible contact email for the supplier. This is a required field." },
                        phone: { type: Type.STRING, description: "A plausible contact phone number for the supplier. This is a required field." },
                        moq: { type: Type.INTEGER, description: "Estimated Minimum Order Quantity. This is a required field." },
                    },
                    required: ['supplierName', 'location', 'contactWebsite', 'specialty', 'notes', 'email', 'phone', 'moq'],
                },
            },
        },
    });

    const parsed = parseJson<SupplierSuggestion[]>(response.text);
    if (!parsed) throw new Error("Failed to generate supplier suggestions");
    return parsed;
}

// NEW FEATURES
export async function generateSocialMediaCalendar(plan: ProductPlan, persona: CustomerPersona, brandVoice: string): Promise<SocialMediaCalendar> {
    const model = 'gemini-2.5-pro';
    const systemInstruction = `You are a social media manager with a ${brandVoice} tone. Your response must be a single JSON object.`;
    const prompt = `Create a 4-week social media calendar for the launch of "${plan.productTitle}". Target the persona "${persona.name}".
    For each week, define a theme (e.g., "Teaser Week", "Launch Week", "User-Generated Content").
    For each week, provide 3-4 daily post ideas, specifying the platform (Instagram, Facebook, X), a creative idea, and a visual prompt.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    weeks: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                weekNumber: { type: Type.INTEGER },
                                theme: { type: Type.STRING },
                                posts: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            day: { type: Type.STRING },
                                            platform: { type: Type.STRING },
                                            idea: { type: Type.STRING },
                                            visualPrompt: { type: Type.STRING },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    const parsed = parseJson<SocialMediaCalendar>(response.text);
    if (!parsed) throw new Error("Failed to generate social media calendar");
    return parsed;
}

export async function generatePhotographyPlan(plan: ProductPlan, brandVoice: string): Promise<ProductPhotographyPlan> {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are a professional product photographer and art director with a ${brandVoice} tone. Your response must be a single JSON object.`;
    const prompt = `Create a product photography shot list for "${plan.productTitle}". Provide 5-7 distinct shots covering 'Studio', 'Lifestyle', and 'Detail' types. For each shot, give a clear description and creative direction.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    shotList: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING, description: "Enum: 'Studio', 'Lifestyle', 'Detail'" },
                                description: { type: Type.STRING },
                                creativeDirection: { type: Type.STRING },
                            },
                        },
                    },
                },
            },
        },
    });

    const parsed = parseJson<ProductPhotographyPlan>(response.text);
    if (!parsed) throw new Error("Failed to generate photography plan");
    return parsed;
}

export async function generateABTestingIdeas(plan: ProductPlan, persona: CustomerPersona): Promise<ABTestPlan> {
    const model = 'gemini-2.5-pro';
    const systemInstruction = `You are a conversion rate optimization (CRO) expert. Your response must be a single JSON object.`;
    const prompt = `Generate 3 high-impact A/B testing ideas for the product page of "${plan.productTitle}", targeting the persona "${persona.name}". For each test, specify the element to test, a clear hypothesis, and two variations (A and B).`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    tests: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                element: { type: Type.STRING },
                                hypothesis: { type: Type.STRING },
                                variations: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            name: { type: Type.STRING },
                                            description: { type: Type.STRING },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    const parsed = parseJson<ABTestPlan>(response.text);
    if (!parsed) throw new Error("Failed to generate A/B testing ideas");
    return parsed;
}

export async function generateEmailFunnel(plan: ProductPlan, persona: CustomerPersona, brandVoice: string): Promise<EmailFunnel> {
    const model = 'gemini-2.5-pro';
    const systemInstruction = `You are an expert email marketer with a ${brandVoice} tone. Your response must be a single JSON object.`;
    const prompt = `Create an automated email marketing funnel for "${plan.productTitle}" targeting "${persona.name}". The funnel should include:
1. A Welcome Email for new subscribers.
2. An Abandoned Cart recovery email.
3. A Post-Purchase Follow-up email.
For each email, provide a catchy subject line, the full email body, and the optimal timing for it to be sent.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    emails: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING, description: "Enum: 'Welcome Email', 'Abandoned Cart', 'Post-Purchase Follow-up'" },
                                subject: { type: Type.STRING },
                                body: { type: Type.STRING },
                                timing: { type: Type.STRING },
                            },
                        },
                    },
                },
            },
        },
    });

    const parsed = parseJson<EmailFunnel>(response.text);
    if (!parsed) throw new Error("Failed to generate email funnel");
    return parsed;
}

export async function generatePressRelease(plan: ProductPlan, brandVoice: string): Promise<PressRelease> {
    const model = 'gemini-2.5-pro';
    const systemInstruction = `You are a public relations professional with a ${brandVoice} tone, but ensure the final output is professional and adheres to standard press release format. Your response must be a single JSON object.`;
    const prompt = `Write a press release for the launch of a new product: "${plan.productTitle}".
Product description for context: "${plan.description}".
The press release needs to include:
- A compelling headline.
- An informative subheadline.
- A dateline (use placeholders for city, state, date).
- A concise introduction (paragraph 1).
- A detailed body (2-3 paragraphs) highlighting the product's features, benefits, and target audience.
- A company boilerplate (a short "About Us" section).
- Contact information (use placeholders).`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    headline: { type: Type.STRING },
                    subheadline: { type: Type.STRING },
                    dateline: { type: Type.STRING },
                    introduction: { type: Type.STRING },
                    body: { type: Type.STRING },
                    boilerplate: { type: Type.STRING },
                    contactInfo: { type: Type.STRING },
                },
            },
        },
    });

    const parsed = parseJson<PressRelease>(response.text);
    if (!parsed) throw new Error("Failed to generate press release");
    return parsed;
}