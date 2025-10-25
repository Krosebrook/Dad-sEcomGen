import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ProductPlan, ProductVariant } from '../types';

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


export const generateProductPlan = async (productIdea: string, variants?: ProductVariant[]): Promise<ProductPlan> => {
    const systemInstruction = `You are an expert e-commerce business consultant. A user wants to start a new online store. Based on their input, generate a comprehensive and realistic product plan. The product should be something a dad might be interested in selling or buying. For the 'description' field, ensure it is detailed and well-structured. It must include a main product description (2-3 paragraphs), a section for "Unique Selling Propositions (USPs)", and a section for "Target Audience". If specific variants are provided by the user, you MUST use their exact price and stock levels, and ensure the rest of the plan is consistent with these details. Your response MUST be a single, valid JSON object that conforms to the provided schema. Do not include any text, explanation, or markdown formatting before or after the JSON object.`;
    
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