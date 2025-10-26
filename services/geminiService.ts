import { GoogleGenAI, Type, Modality, Content } from "@google/genai";
import { ProductPlan, ProductVariant, RegenerateableSection, MarketingKickstart, CompetitiveAnalysis, GroundingSource, FinancialAssumptions, ChatMessage, ProductScoutResult, SMARTGoals, SWOTAnalysis, CustomerPersona, BrandIdentityKit, ContentStrategy, FinancialScenario } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const TEXT_MODEL_NAME = "gemini-2.5-flash";
const IMAGE_MODEL_NAME = "gemini-2.5-flash-image";
const ADVANCED_TEXT_MODEL_NAME = "gemini-2.5-pro";

const productPlanSchema = {
    type: Type.OBJECT,
    properties: {
        productTitle: { type: Type.STRING, description: 'Creative and marketable product title.' },
        slug: { type: Type.STRING, description: 'URL-friendly slug based on the title.' },
        description: { type: Type.STRING, description: 'Compelling product description (2-3 paragraphs) that also includes a section on Unique Selling Propositions (USPs) and a section detailing the Target Audience.' },
        priceCents: { type: Type.INTEGER, description: 'Suggested retail price in cents (e.g., 4999 for $49.99). This should be an average or base price if variants have different prices.' },
        currency: { type: Type.STRING, description: 'Currency code, e.g., "USD".' },
        sku: { type: Type.STRING, description: 'Base Stock Keeping Unit (SKU) for the main product.' },
        stock: { type: Type.INTEGER, description: 'Initial stock quantity for the base product. This should be the sum of all variant stock if variants exist.' },
        tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'List of relevant marketing tags or keywords.'
        },
        variants: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: 'Title for the variant (e.g., "Red", "Large").' },
                    sku: { type: Type.STRING, description: 'Unique SKU for this variant.' },
                    priceCents: { type: Type.INTEGER, description: 'Price in cents for this variant.' },
                    stock: { type: Type.INTEGER, description: 'Initial stock for this variant.' },
                },
                required: ['title', 'sku', 'priceCents', 'stock']
            },
            description: 'List of product variants (e.g., different colors, sizes).'
        },
    },
    required: ['productTitle', 'slug', 'description', 'priceCents', 'currency', 'sku', 'stock', 'tags', 'variants']
};

const smartGoalSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: 'A concise title for the goal.' },
        description: { type: Type.STRING, description: 'A detailed description of the goal, explaining how it fits the criterion.' }
    },
    required: ['title', 'description']
};

const smartGoalsSchema = {
    type: Type.OBJECT,
    properties: {
        specific: { ...smartGoalSchema, description: 'A Specific goal for the business.' },
        measurable: { ...smartGoalSchema, description: 'A Measurable goal for the business.' },
        achievable: { ...smartGoalSchema, description: 'An Achievable goal for the business.' },
        relevant: { ...smartGoalSchema, description: 'A Relevant goal for the business.' },
        timeBound: { ...smartGoalSchema, description: 'A Time-bound goal for the business.' }
    },
    required: ['specific', 'measurable', 'achievable', 'relevant', 'timeBound']
};

const planAndGoalsSchema = {
    type: Type.OBJECT,
    properties: {
        plan: productPlanSchema,
        goals: smartGoalsSchema
    },
    required: ['plan', 'goals']
};

const brandIdentitySchema = {
    type: Type.OBJECT,
    properties: {
        colorPalette: {
            type: Type.OBJECT,
            properties: {
                primary: { type: Type.STRING, description: "A primary hex color code (e.g., '#1A2B3C')." },
                secondary: { type: Type.STRING, description: "A secondary, complementary hex color code." },
                accent: { type: Type.STRING, description: "An accent hex color code for call-to-actions." }
            },
            required: ['primary', 'secondary', 'accent']
        },
        typography: {
            type: Type.OBJECT,
            properties: {
                headingFont: { type: Type.STRING, description: "The name of a professional, legible heading font (e.g., 'Montserrat', 'Playfair Display')." },
                bodyFont: { type: Type.STRING, description: "The name of a clean, readable body font that pairs well with the heading font (e.g., 'Lato', 'Open Sans')." }
            },
            required: ['headingFont', 'bodyFont']
        },
        missionStatement: { type: Type.STRING, description: "A concise, one-sentence mission statement that captures the brand's essence." }
    },
    required: ['colorPalette', 'typography', 'missionStatement']
};


const competitiveAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        opportunityScore: { type: Type.INTEGER, description: 'A score from 1-10 indicating the market opportunity (1=low, 10=high).' },
        marketSummary: { type: Type.STRING, description: 'A 2-3 sentence summary of the market landscape, target audience, and potential.' },
        competitors: {
            type: Type.ARRAY,
            description: 'A list of 3-5 potential real-world competitors.',
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The competitor's brand or product name." },
                    strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of their key strengths.' },
                    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of their key weaknesses.' },
                    estimatedPriceRange: { type: Type.STRING, description: 'Their typical price range (e.g., "$50-$75").' }
                },
                required: ['name', 'strengths', 'weaknesses', 'estimatedPriceRange']
            }
        },
        differentiationStrategies: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'A list of actionable strategies to differentiate this product from the competition.'
        }
    },
    required: ['opportunityScore', 'marketSummary', 'competitors', 'differentiationStrategies']
};

const swotAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        strengths: {
            type: Type.ARRAY,
            description: "A list of 3-4 key internal strengths for this product/venture.",
            items: { type: Type.STRING }
        },
        weaknesses: {
            type: Type.ARRAY,
            description: "A list of 3-4 key internal weaknesses for this product/venture.",
            items: { type: Type.STRING }
        },
        opportunities: {
            type: Type.ARRAY,
            description: "A list of 3-4 key external market opportunities to capitalize on.",
            items: { type: Type.STRING }
        },
        threats: {
            type: Type.ARRAY,
            description: "A list of 3-4 key external market threats to be aware of.",
            items: { type: Type.STRING }
        }
    },
    required: ['strengths', 'weaknesses', 'opportunities', 'threats']
};

const customerPersonaSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "A creative, alliterative name for the persona (e.g., 'Creative Carla', 'Tech-Savvy Tom')." },
        age: { type: Type.INTEGER, description: "The persona's age." },
        occupation: { type: Type.STRING, description: "The persona's job title or occupation." },
        quote: { type: Type.STRING, description: "A short, memorable quote that encapsulates the persona's mindset." },
        background: { type: Type.STRING, description: "A 2-3 sentence background story for the persona." },
        demographics: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3-4 key demographic points (e.g., 'Location: Urban', 'Income: $75k+', 'Family: Married with 2 kids')." },
        motivations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3-4 key motivations or drivers for the persona." },
        goals: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3-4 goals the persona is trying to achieve, relevant to the product." },
        painPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3-4 frustrations or 'pain points' the persona experiences that the product can solve." },
        avatarPrompt: { type: Type.STRING, description: "A detailed prompt for an image generation model to create a photorealistic headshot of this persona. Describe their appearance, expression, and background setting. Example: 'Photorealistic headshot of a friendly 42-year-old male architect with short brown hair and glasses, smiling in a well-lit, modern office setting.'" }
    },
    required: ['name', 'age', 'occupation', 'quote', 'background', 'demographics', 'motivations', 'goals', 'painPoints', 'avatarPrompt']
};


const marketingKickstartSchema = {
    type: Type.OBJECT,
    properties: {
        socialMediaPosts: {
            type: Type.ARRAY,
            description: '3-5 engaging social media posts tailored to different platforms.',
            items: {
                type: Type.OBJECT,
                properties: {
                    platform: { type: Type.STRING, enum: ['Instagram', 'Facebook', 'X'], description: 'The target social media platform.' },
                    postText: { type: Type.STRING, description: 'The full text content of the post.' },
                    hashtags: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of relevant hashtags.' },
                    visualPrompt: { type: Type.STRING, description: 'A brief description of a suggested visual (photo or video).' },
                },
                required: ['platform', 'postText', 'hashtags', 'visualPrompt']
            }
        },
        adCopy: {
            type: Type.ARRAY,
            description: 'Compelling ad copy for major platforms.',
            items: {
                type: Type.OBJECT,
                properties: {
                    platform: { type: Type.STRING, enum: ['Google Ads', 'Facebook Ads'], description: 'The advertising platform.' },
                    headlines: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of short, punchy headlines.' },
                    descriptions: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of longer-form ad descriptions.' },
                },
                required: ['platform', 'headlines', 'descriptions']
            }
        },
        launchEmail: {
            type: Type.OBJECT,
            description: 'A template for a product launch announcement email.',
            properties: {
                subject: { type: Type.STRING, description: 'An engaging email subject line.' },
                body: { type: Type.STRING, description: 'The full body of the launch email, written in a friendly and persuasive tone.' },
            },
            required: ['subject', 'body']
        }
    },
    required: ['socialMediaPosts', 'adCopy', 'launchEmail']
};

const financialAssumptionsSchema = {
    type: Type.OBJECT,
    properties: {
        costOfGoodsSoldCents: { type: Type.INTEGER, description: 'A realistic estimated Cost of Goods Sold (COGS) per unit in cents.' },
        monthlyMarketingBudgetCents: { type: Type.INTEGER, description: 'A reasonable starting monthly marketing budget in cents.' },
        estimatedMonthlySales: { type: Type.INTEGER, description: 'A realistic estimate for the number of units sold per month in the first 6 months.' },
        scenario: { type: Type.STRING, enum: ['Realistic', 'Pessimistic', 'Optimistic'], description: "The financial scenario this data represents." }
    },
    required: ['costOfGoodsSoldCents', 'monthlyMarketingBudgetCents', 'estimatedMonthlySales', 'scenario']
};

const nextStepsSchema = {
    type: Type.OBJECT,
    properties: {
        checklist: {
            type: Type.ARRAY,
            description: 'A list of 5-7 short, actionable next steps for the user to take.',
            items: { type: Type.STRING },
        },
    },
    required: ['checklist']
};

const productScoutSchema = {
    type: Type.ARRAY,
    description: "A list of 3 to 5 trending product ideas based on the user's category.",
    items: {
        type: Type.OBJECT,
        properties: {
            productName: { type: Type.STRING, description: "The name of the trending product." },
            description: { type: Type.STRING, description: "A brief (2-3 sentences) description of the product and why it's trending on Amazon." },
            trendScore: { type: Type.INTEGER, description: "A score from 1-10 indicating the current trend strength (1=low, 10=high)." },
            salesForecast: { type: Type.STRING, description: "A short forecast of sales potential (e.g., 'Strong seasonal demand in Q4', 'Steady year-round sales potential')." },
            potentialSuppliers: {
                type: Type.ARRAY,
                description: "A list of 2-3 platforms or types of suppliers for bulk ordering inventory.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        platform: { type: Type.STRING, description: "The name of the supplier platform or type (e.g., 'Alibaba', 'ThomasNet', 'Direct from Manufacturer')." },
                        notes: { type: Type.STRING, description: "Brief notes on sourcing from this platform (e.g., 'Good for low-cost, high-volume orders')." },
                    },
                    required: ['platform', 'notes']
                }
            },
            amazonSellingStrategy: {
                type: Type.OBJECT,
                description: "Key considerations for selling this product on Amazon.",
                properties: {
                    keyServices: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "Recommended Amazon services (e.g., 'Fulfillment by Amazon (FBA)', 'Amazon Advertising (PPC)', 'A+ Content')."
                    },
                    shippingRecommendation: { type: Type.STRING, description: "A recommendation for shipping, comparing FBA and FBM (Fulfilled by Merchant)." },
                    complianceChecklist: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "A short list of critical Amazon marketplace guidelines or requirements for this product category to avoid rejection."
                    },
                },
                required: ['keyServices', 'shippingRecommendation', 'complianceChecklist']
            }
        },
        required: ['productName', 'description', 'trendScore', 'salesForecast', 'potentialSuppliers', 'amazonSellingStrategy']
    }
};

const contentStrategySchema = {
    type: Type.OBJECT,
    properties: {
        seoKeywordPack: {
            type: Type.ARRAY,
            description: "A list of 15-20 primary and long-tail SEO keywords relevant to the product.",
            items: { type: Type.STRING }
        },
        contentCalendar: {
            type: Type.ARRAY,
            description: "A 4-week content calendar with a theme for each week and daily post ideas for social media.",
            items: {
                type: Type.OBJECT,
                properties: {
                    week: { type: Type.INTEGER },
                    theme: { type: Type.STRING, description: "The overarching theme for the week's content." },
                    dailyPosts: {
                        type: Type.ARRAY,
                        description: "A list of 5-7 daily post ideas for the week.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                platform: { type: Type.STRING, enum: ['Instagram', 'Facebook', 'X', 'Blog'], description: "The suggested platform for the post." },
                                idea: { type: Type.STRING, description: "A concise idea for the daily content." }
                            },
                            required: ['platform', 'idea']
                        }
                    }
                },
                required: ['week', 'theme', 'dailyPosts']
            }
        },
        blogPostIdeas: {
            type: Type.ARRAY,
            description: "A list of 2-3 engaging blog post titles based on the SEO keywords and target audience.",
            items: { type: Type.STRING }
        }
    },
    required: ['seoKeywordPack', 'contentCalendar', 'blogPostIdeas']
};

export const generateProductPlan = async (productIdea: string, brandVoice: string, variants?: ProductVariant[]): Promise<{ plan: ProductPlan; goals: SMARTGoals; }> => {
    const systemInstruction = `You are an expert e-commerce business consultant. A user wants to start a new online store. Based on their input, generate a comprehensive and realistic product plan. For the 'description' field, ensure it is detailed and well-structured. It must include a main product description (2-3 paragraphs), a section for "Unique Selling Propositions (USPs)", and a section for "Target Audience". If specific variants are provided by the user, you MUST use their exact price and stock levels, and ensure the rest of the plan is consistent with these details. Alongside the product plan, you MUST ALSO generate a set of SMART (Specific, Measurable, Achievable, Relevant, Time-bound) business goals for the first 6 months of the venture. These goals should be directly related to the product idea. Your writing style should embody the following brand voice: '${brandVoice}'. Your response MUST be a single, valid JSON object that conforms to the provided schema containing both the 'plan' and 'goals' keys. Do not include any text, explanation, or markdown formatting before or after the JSON object.`;
    
    let userContent = productIdea;
    if (variants && variants.length > 0) {
      userContent += `\n\nPlease regenerate the plan using these specific product variants, ensuring their price and stock levels match exactly. Adjust the main product's price and stock to reflect these variants:\n${JSON.stringify(variants, null, 2)}`;
    }

    const response = await ai.models.generateContent({
        model: TEXT_MODEL_NAME,
        contents: userContent,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: planAndGoalsSchema,
        },
    });
    
    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("Received an empty response from the API.");
    }

    try {
        const parsedJson = JSON.parse(jsonText);
        return parsedJson as { plan: ProductPlan; goals: SMARTGoals; };
    } catch (e) {
        console.error("Failed to parse Gemini response:", jsonText, e);
        throw new Error("Received invalid JSON from the API.");
    }
};

export const regeneratePlanSection = async (
    productIdea: string,
    currentPlan: ProductPlan,
    section: RegenerateableSection,
    brandVoice: string
): Promise<Partial<ProductPlan>> => {
    let systemInstruction: string;
    let responseSchema: any;
    let userContent = `The current product is "${currentPlan.productTitle}". The original idea was: "${productIdea}".`;
    const voiceInstruction = `Your writing style should embody the following brand voice: '${brandVoice}'.`;

    switch (section) {
        case 'description':
            systemInstruction = `You are an e-commerce consultant. Regenerate ONLY the 'description' field for the product "${currentPlan.productTitle}". The new description must be compelling and include sections for 'Unique Selling Propositions (USPs)' and 'Target Audience'. ${voiceInstruction} Your response MUST be a single valid JSON object with ONLY a 'description' key.`;
            responseSchema = { type: Type.OBJECT, properties: { description: productPlanSchema.properties.description }, required: ['description'] };
            break;
        case 'variants':
            systemInstruction = `You are an e-commerce consultant. For the product "${currentPlan.productTitle}", generate a new, creative set of product variants (e.g., different colors, sizes, styles). ${voiceInstruction} Your response MUST be a single valid JSON object with ONLY a 'variants' key.`;
            responseSchema = { type: Type.OBJECT, properties: { variants: productPlanSchema.properties.variants }, required: ['variants'] };
            break;
        case 'tags':
            systemInstruction = `You are an e-commerce consultant. For the product "${currentPlan.productTitle}", generate a new set of relevant marketing tags or keywords. ${voiceInstruction} Your response MUST be a single valid JSON object with ONLY a 'tags' key.`;
            responseSchema = { type: Type.OBJECT, properties: { tags: productPlanSchema.properties.tags }, required: ['tags'] };
            break;
        default:
            throw new Error("Invalid section for regeneration");
    }

    const response = await ai.models.generateContent({
        model: TEXT_MODEL_NAME,
        contents: userContent,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema,
        },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("Received an empty response from the API.");
    }

    try {
        const parsedJson = JSON.parse(jsonText);
        return parsedJson as Partial<ProductPlan>;
    } catch (e) {
        console.error("Failed to parse Gemini response for section regeneration:", jsonText, e);
        throw new Error("Received invalid JSON from the API for section regeneration.");
    }
};


export const generateCompetitiveAnalysis = async (productIdea: string, brandVoice: string): Promise<CompetitiveAnalysis> => {
    const systemInstruction = `You are an expert market research analyst specializing in e-commerce. A user has a product idea. Your task is to perform a competitive analysis using real-time Google Search data. Provide a concise, actionable "Competitive Intelligence" report. Your writing style should embody the following brand voice: '${brandVoice}'. Your response MUST be a single, valid JSON object that conforms to the provided schema, wrapped in a markdown code block ('''json ... '''). Do not include any text, explanation, or markdown formatting before or after the JSON code block.`;

    const response = await ai.models.generateContent({
        model: TEXT_MODEL_NAME,
        contents: `Provide a competitive intelligence report for this product idea: ${productIdea}. The JSON response should conform to this schema: ${JSON.stringify(competitiveAnalysisSchema)}`,
        config: {
            systemInstruction: systemInstruction,
            tools: [{googleSearch: {}}],
        },
    });
    
    // The model is not configured to return JSON with search grounding, so we must parse the markdown
    const text = response.text;
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (!jsonMatch || !jsonMatch[1]) {
        console.error("No JSON block found in response:", text);
        // Fallback: try to parse the whole text as JSON
        try {
            const parsedJson = JSON.parse(text);
            const sources: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
                ?.map(chunk => ({
                    uri: chunk.web?.uri || '',
                    title: chunk.web?.title || 'Untitled Source'
                }))
                .filter(source => source.uri) ?? [];
            return { ...parsedJson, sources } as CompetitiveAnalysis;
        } catch (e) {
             throw new Error("Could not find a JSON block in the API response and the response is not valid JSON.");
        }
    }
    const jsonText = jsonMatch[1];
    
    const sources: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map(chunk => ({
            uri: chunk.web?.uri || '',
            title: chunk.web?.title || 'Untitled Source'
        }))
        .filter(source => source.uri) ?? [];
    
    if (!jsonText) {
        throw new Error("Received an empty response from the API.");
    }

    try {
        const parsedJson = JSON.parse(jsonText);
        return { ...parsedJson, sources } as CompetitiveAnalysis;
    } catch (e) {
        console.error("Failed to parse Gemini response:", jsonText, e);
        throw new Error("Received invalid JSON from the API.");
    }
};

export const generateSWOTAnalysis = async (productIdea: string, brandVoice: string): Promise<SWOTAnalysis> => {
    const systemInstruction = `You are a senior business strategist. Based on the user's product idea, generate a concise and insightful SWOT (Strengths, Weaknesses, Opportunities, Threats) analysis. The analysis should be realistic and provide actionable insights. Your writing style should embody the following brand voice: '${brandVoice}'. Your response MUST be a single, valid JSON object that conforms to the provided schema. Do not include any text, explanation, or markdown formatting before or after the JSON object.`;

    const response = await ai.models.generateContent({
        model: TEXT_MODEL_NAME,
        contents: `Generate a SWOT analysis for this product idea: ${productIdea}.`,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: swotAnalysisSchema,
        },
    });
    
    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("Received an empty response from the API for SWOT analysis.");
    }

    try {
        const parsedJson = JSON.parse(jsonText);
        return parsedJson as SWOTAnalysis;
    } catch (e) {
        console.error("Failed to parse Gemini response for SWOT analysis:", jsonText, e);
        throw new Error("Received invalid JSON from the API for SWOT analysis.");
    }
};

export const generateCustomerPersona = async (productIdea: string, targetAudience: string, brandVoice: string): Promise<CustomerPersona> => {
    const systemInstruction = `You are a senior marketing strategist and consumer psychologist. Based on the user's product idea and a description of their target audience, create a single, detailed, and realistic customer persona. This persona should bring the ideal customer to life. Your writing style should embody the following brand voice: '${brandVoice}'. Your response MUST be a single, valid JSON object that conforms to the provided schema. Do not include any text, explanation, or markdown formatting before or after the JSON object.`;
    
    const userContent = `Product Idea: "${productIdea}"\nTarget Audience Description: "${targetAudience}"\n\nGenerate a customer persona based on this information.`;

    const response = await ai.models.generateContent({
        model: TEXT_MODEL_NAME,
        contents: userContent,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: customerPersonaSchema,
        },
    });
    
    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("Received an empty response from the API for customer persona.");
    }

    try {
        const parsedJson = JSON.parse(jsonText);
        return parsedJson as CustomerPersona;
    } catch (e) {
        console.error("Failed to parse Gemini response for customer persona:", jsonText, e);
        throw new Error("Received invalid JSON from the API for customer persona.");
    }
};

export const generatePersonaAvatar = async (avatarPrompt: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: IMAGE_MODEL_NAME,
        contents: {
            parts: [{ text: avatarPrompt }],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:image/png;base64,${base64ImageBytes}`;
        }
    }

    throw new Error("No avatar image was generated by the API.");
};


export const generateMarketingKickstart = async (productPlan: ProductPlan, brandVoice: string): Promise<MarketingKickstart> => {
    const systemInstruction = `You are a senior digital marketing strategist specializing in e-commerce launches. Based on the provided product plan, generate a "Marketing Kickstart" package. The tone should be engaging and targeted towards the product's audience. Your writing style should embody the following brand voice: '${brandVoice}'. Your response MUST be a single, valid JSON object that conforms to the provided schema. Do not include any text, explanation, or markdown formatting before or after the JSON object.`;
    
    const userContent = `Generate a marketing kickstart plan for the following product:\n
    Product Title: ${productPlan.productTitle}\n
    Description: ${productPlan.description}\n
    Tags: ${productPlan.tags.join(', ')}`;

    const response = await ai.models.generateContent({
        model: TEXT_MODEL_NAME,
        contents: userContent,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: marketingKickstartSchema,
        },
    });
    
    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("Received an empty response from the API.");
    }

    try {
        const parsedJson = JSON.parse(jsonText);
        return parsedJson as MarketingKickstart;
    } catch (e) {
        console.error("Failed to parse Gemini response for marketing plan:", jsonText, e);
        throw new Error("Received invalid JSON from the API.");
    }
};

export const generateFinancialAssumptions = async (productPlan: ProductPlan, scenario: FinancialScenario): Promise<FinancialAssumptions> => {
    let systemInstruction = `You are a financial analyst for e-commerce businesses. Based on the provided product plan, generate financial assumptions for a starting business. Your response MUST be a single, valid JSON object that conforms to the provided schema. Do not include any text, explanation, or markdown formatting before or after the JSON object.`;

    if (scenario === 'Pessimistic') {
        systemInstruction += ` The user has selected a 'Pessimistic' scenario. You MUST provide more conservative estimates: assume a higher Cost of Goods Sold, lower monthly sales, and perhaps a less efficient marketing budget.`;
    } else if (scenario === 'Optimistic') {
        systemInstruction += ` The user has selected an 'Optimistic' scenario. You MUST provide more aggressive estimates: assume a lower Cost of Goods Sold (e.g., due to better supplier negotiation), higher monthly sales, and a more efficient marketing budget.`;
    } else {
        systemInstruction += ` The user has selected a 'Realistic' scenario. You MUST provide balanced and achievable estimates.`;
    }
    
    const userContent = `Generate financial assumptions for the following product under a '${scenario}' scenario:\n
    Product Title: ${productPlan.productTitle}\n
    Description: ${productPlan.description}\n
    Price: ${productPlan.priceCents / 100} ${productPlan.currency}`;

    const response = await ai.models.generateContent({
        model: TEXT_MODEL_NAME,
        contents: userContent,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: financialAssumptionsSchema,
        },
    });
    
    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("Received an empty response from the API.");
    }

    try {
        const parsedJson = JSON.parse(jsonText);
        // Ensure the returned scenario matches the requested one
        parsedJson.scenario = scenario;
        return parsedJson as FinancialAssumptions;
    } catch (e) {
        console.error("Failed to parse Gemini response for financial assumptions:", jsonText, e);
        throw new Error("Received invalid JSON from the API.");
    }
};

export const generateNextSteps = async (productPlan: ProductPlan, brandVoice: string): Promise<string[]> => {
    const systemInstruction = `You are a startup mentor and e-commerce expert. Based on the provided product plan, generate a checklist of the immediate next steps an entrepreneur should take to bring their product to life. The steps should be concise, actionable, and tangible. Your writing style should embody the following brand voice: '${brandVoice}'. Your response MUST be a single, valid JSON object that conforms to the provided schema.`;
    
    const userContent = `Generate a next steps checklist for the following product:\n
    Product Title: ${productPlan.productTitle}\n
    Description: ${productPlan.description}`;

    const response = await ai.models.generateContent({
        model: TEXT_MODEL_NAME,
        contents: userContent,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: nextStepsSchema,
        },
    });
    
    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("Received an empty response from the API for next steps.");
    }

    try {
        const parsedJson = JSON.parse(jsonText);
        return parsedJson.checklist as string[];
    } catch (e) {
        console.error("Failed to parse Gemini response for next steps:", jsonText, e);
        throw new Error("Received invalid JSON from the API for next steps.");
    }
};

export const generateBrandIdentity = async (productPlan: ProductPlan, brandVoice: string): Promise<BrandIdentityKit> => {
    const systemInstruction = `You are a professional brand strategist and designer. Based on the user's product plan, generate a complete "Brand Identity Kit". This should include a cohesive color palette, appropriate typography pairings, and a strong mission statement. Your writing style should embody the following brand voice: '${brandVoice}'. Your response MUST be a single, valid JSON object that conforms to the provided schema. Do not include any text, explanation, or markdown formatting before or after the JSON object.`;
    
    const userContent = `Generate a brand identity kit for the following product:\n
    Product Title: ${productPlan.productTitle}\n
    Description: ${productPlan.description}`;

    const response = await ai.models.generateContent({
        model: TEXT_MODEL_NAME,
        contents: userContent,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: brandIdentitySchema,
        },
    });
    
    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("Received an empty response from the API for brand identity.");
    }

    try {
        const parsedJson = JSON.parse(jsonText);
        return parsedJson as BrandIdentityKit;
    } catch (e) {
        console.error("Failed to parse Gemini response for brand identity:", jsonText, e);
        throw new Error("Received invalid JSON from the API for brand identity.");
    }
};


export const continueChat = async (productPlan: ProductPlan, history: ChatMessage[], brandVoice: string): Promise<string> => {
    const systemInstruction = `You are an expert e-commerce business consultant acting as an AI sounding board. The user has generated the following business plan and wants to discuss it with you. Your task is to provide helpful, concise, and actionable advice based on their questions. Always refer to the context of their specific plan. Your writing style should embody the following brand voice: '${brandVoice}'.

    THEIR PLAN:
    Title: ${productPlan.productTitle}
    Description: ${productPlan.description}
    Price: ${(productPlan.priceCents / 100).toFixed(2)} ${productPlan.currency}
    `;

    // Map the simple ChatMessage array to the format the API expects
    const contents: Content[] = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
    }));

    const response = await ai.models.generateContent({
        model: TEXT_MODEL_NAME,
        contents: contents,
        config: {
            systemInstruction: systemInstruction,
        },
    });

    return response.text;
};


export const generateLogo = async (productTitle: string, style: string, color: string): Promise<string> => {
    const styleDescription = style.toLowerCase();
    let colorInstruction = '';
    if (color !== 'Default') {
        colorInstruction = ` The color palette should feature ${color.toLowerCase().replace('-', ' ')}.`;
    }

    const prompt = `A ${styleDescription}, modern logo for a product called '${productTitle}'.${colorInstruction} The logo should be clean, professional, and suitable for an e-commerce brand. It should be on a simple, light-colored background.`;

    const response = await ai.models.generateContent({
        model: IMAGE_MODEL_NAME,
        contents: {
            parts: [{ text: prompt }],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:image/png;base64,${base64ImageBytes}`;
        }
    }

    throw new Error("No image was generated by the API.");
};

export const scoutTrendingProducts = async (category: string): Promise<ProductScoutResult[]> => {
    const systemInstruction = `You are a world-class e-commerce trend analyst specializing in the Amazon marketplace. Based on the user's provided category, use real-time Google Search data to identify 3-5 specific, trending products. For each product, provide a comprehensive analysis covering sales forecasting, supplier sourcing, and a detailed Amazon selling strategy, including services, shipping, and compliance. Your response MUST be a single, valid JSON object that conforms to the provided schema, wrapped in a markdown code block ('''json ... '''). Do not include any text, explanation, or markdown formatting before or after the JSON code block.`;

    const response = await ai.models.generateContent({
        model: ADVANCED_TEXT_MODEL_NAME,
        contents: `Find trending Amazon products in the category: "${category}". The JSON response should conform to this schema: ${JSON.stringify(productScoutSchema)}`,
        config: {
            systemInstruction: systemInstruction,
            tools: [{googleSearch: {}}],
        },
    });
    
    const text = response.text;
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (!jsonMatch || !jsonMatch[1]) {
        console.error("No JSON block found in scout response:", text);
        try {
            const parsedJson = JSON.parse(text);
             const sources: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
                ?.map(chunk => ({
                    uri: chunk.web?.uri || '',
                    title: chunk.web?.title || 'Untitled Source'
                }))
                .filter(source => source.uri) ?? [];

            if (Array.isArray(parsedJson)) {
                return parsedJson.map(item => ({ ...item, sources }));
            }
            return parsedJson as ProductScoutResult[];

        } catch (e) {
             throw new Error("Could not find a JSON block in the scout API response and the response is not valid JSON.");
        }
    }
    const jsonText = jsonMatch[1];
    
    const sources: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map(chunk => ({
            uri: chunk.web?.uri || '',
            title: chunk.web?.title || 'Untitled Source'
        }))
        .filter(source => source.uri) ?? [];
    
    if (!jsonText) {
        throw new Error("Received an empty response from the scout API.");
    }

    try {
        const parsedJson = JSON.parse(jsonText) as ProductScoutResult[];
        return parsedJson.map(item => ({ ...item, sources }));
    } catch (e) {
        console.error("Failed to parse Gemini response for scout:", jsonText, e);
        throw new Error("Received invalid JSON from the scout API.");
    }
};

export const generateStorefrontMockup = async (productPlan: ProductPlan, brandKit: BrandIdentityKit): Promise<string> => {
    const prompt = `Create a visually appealing, clean, and modern e-commerce product page mockup for a product called '${productPlan.productTitle}'. The style should be professional and trustworthy, suitable for a direct-to-consumer brand.

    **Layout:**
    - A clean header with a placeholder for a logo and navigation links.
    - The main content area should have a large product image on the left.
    - On the right, display the product title in a large, clear font, followed by the price, a short product description snippet, a quantity selector, and a prominent 'Add to Cart' button.

    **Branding & Style:**
    - The primary color for the 'Add to Cart' button and other key highlights must be '${brandKit.colorPalette.primary}'.
    - Use '${brandKit.colorPalette.secondary}' for background elements or secondary accents.
    - The overall color scheme should be light and airy, using plenty of white space.
    - The font for headings should be a clean, sans-serif font similar to '${brandKit.typography.headingFont}'.
    - The font for body text should be a highly legible sans-serif font like '${brandKit.typography.bodyFont}'.

    **Content Details:**
    - Product Title: "${productPlan.productTitle}"
    - Price: Display a price around ${(productPlan.priceCents / 100).toFixed(2)} ${productPlan.currency}.
    - Description Snippet: Include a short piece of text like "${productPlan.description.split('.')[0]}."
    - Product Image: The main image should be a high-quality, professional photograph of the product, presented as if for a real online store. The product is: ${productPlan.description.substring(0, 200)}.

    The final output should be a single, complete image of the website mockup.
    `;

    const response = await ai.models.generateContent({
        model: IMAGE_MODEL_NAME,
        contents: {
            parts: [{ text: prompt }],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:image/png;base64,${base64ImageBytes}`;
        }
    }

    throw new Error("No storefront mockup image was generated by the API.");
};

export const generateContentStrategy = async (productPlan: ProductPlan, customerPersona: CustomerPersona, brandVoice: string): Promise<ContentStrategy> => {
    const systemInstruction = `You are a senior content marketer and SEO specialist for e-commerce brands. Based on the provided product plan and customer persona, generate a comprehensive "Content Strategy Hub". This includes a relevant SEO keyword pack, a 4-week content calendar, and compelling blog post ideas. Your writing style should embody the following brand voice: '${brandVoice}'. Your response MUST be a single, valid JSON object that conforms to the provided schema. Do not include any text, explanation, or markdown formatting before or after the JSON object.`;

    const userContent = `Generate a Content Strategy for the following product and persona:\n
    Product Title: ${productPlan.productTitle}\n
    Description: ${productPlan.description}\n
    Target Audience: ${productPlan.description.match(/Target Audience:\s*([\s\S]+)/i)?.[1].trim()}\n
    Customer Persona Name: ${customerPersona.name}, Age: ${customerPersona.age}\n
    Persona Goals: ${customerPersona.goals.join(', ')}\n
    Persona Pain Points: ${customerPersona.painPoints.join(', ')}`;

    const response = await ai.models.generateContent({
        model: ADVANCED_TEXT_MODEL_NAME,
        contents: userContent,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: contentStrategySchema,
        },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("Received an empty response from the API for content strategy.");
    }

    try {
        const parsedJson = JSON.parse(jsonText);
        return parsedJson as ContentStrategy;
    } catch (e) {
        console.error("Failed to parse Gemini response for content strategy:", jsonText, e);
        throw new Error("Received invalid JSON from the API for content strategy.");
    }
};

export const generateBlogPost = async (blogTitle: string, productPlan: ProductPlan, brandVoice: string): Promise<string> => {
    const systemInstruction = `You are an expert content writer and SEO specialist. Your task is to write a complete, engaging, and SEO-friendly blog post based on the provided title and product context. The blog post should be well-structured with headings (using markdown #), paragraphs, and a call-to-action at the end that subtly promotes the product. Your writing style should embody the following brand voice: '${brandVoice}'. The response should be only the markdown text of the blog post.`;
    
    const userContent = `Write a blog post with the title: "${blogTitle}"\n
    The blog post is for a brand selling this product:\n
    Product Title: ${productPlan.productTitle}\n
    Product Description: ${productPlan.description}`;

    const response = await ai.models.generateContent({
        model: TEXT_MODEL_NAME,
        contents: userContent,
        config: {
            systemInstruction: systemInstruction,
        },
    });

    return response.text;
};