import { GoogleGenAI, Type, Modality, Content } from "@google/genai";
import { ProductPlan, ProductVariant, RegenerateableSection, MarketingKickstart, CompetitiveAnalysis, GroundingSource, FinancialAssumptions, ChatMessage } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const TEXT_MODEL_NAME = "gemini-2.5-flash";
const IMAGE_MODEL_NAME = "gemini-2.5-flash-image";

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
    },
    required: ['costOfGoodsSoldCents', 'monthlyMarketingBudgetCents']
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

export const generateProductPlan = async (productIdea: string, brandVoice: string, variants?: ProductVariant[]): Promise<ProductPlan> => {
    const systemInstruction = `You are an expert e-commerce business consultant. A user wants to start a new online store. Based on their input, generate a comprehensive and realistic product plan. The product should be something a dad might be interested in selling or buying. For the 'description' field, ensure it is detailed and well-structured. It must include a main product description (2-3 paragraphs), a section for "Unique Selling Propositions (USPs)", and a section for "Target Audience". If specific variants are provided by the user, you MUST use their exact price and stock levels, and ensure the rest of the plan is consistent with these details. Your writing style should embody the following brand voice: '${brandVoice}'. Your response MUST be a single, valid JSON object that conforms to the provided schema. Do not include any text, explanation, or markdown formatting before or after the JSON object.`;
    
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
            responseSchema: productPlanSchema,
        },
    });
    
    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("Received an empty response from the API.");
    }

    try {
        const parsedJson = JSON.parse(jsonText);
        return parsedJson as ProductPlan;
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

export const generateFinancialAssumptions = async (productPlan: ProductPlan): Promise<FinancialAssumptions> => {
    const systemInstruction = `You are a financial analyst for e-commerce businesses. Based on the provided product plan, generate realistic financial assumptions for a starting business. Your response MUST be a single, valid JSON object that conforms to the provided schema. Do not include any text, explanation, or markdown formatting before or after the JSON object.`;
    
    const userContent = `Generate financial assumptions for the following product:\n
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