import { z } from 'zod';

export const productVariantSchema = z.object({
  title: z.string().min(1, 'Variant title is required').max(100, 'Variant title too long'),
  sku: z.string().min(1, 'SKU is required').max(50, 'SKU too long'),
  priceCents: z.number()
    .int('Price must be a whole number')
    .min(0, 'Price cannot be negative')
    .max(100000000, 'Price too high')
    .finite('Price must be a valid number'),
  stock: z.number()
    .int('Stock must be a whole number')
    .min(0, 'Stock cannot be negative')
    .max(1000000, 'Stock value too high')
    .finite('Stock must be a valid number'),
});

export const productPlanSchema = z.object({
  productTitle: z.string()
    .min(1, 'Product title is required')
    .max(200, 'Product title too long')
    .trim(),
  slug: z.string()
    .min(1, 'Slug is required')
    .max(200, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description too long'),
  priceCents: z.number()
    .int('Price must be a whole number')
    .min(0, 'Price cannot be negative')
    .max(100000000, 'Price too high')
    .finite('Price must be a valid number'),
  currency: z.string().length(3, 'Currency code must be 3 characters').default('USD'),
  sku: z.string().min(1, 'SKU is required').max(50, 'SKU too long'),
  stock: z.number()
    .int('Stock must be a whole number')
    .min(0, 'Stock cannot be negative')
    .max(1000000, 'Stock value too high')
    .finite('Stock must be a valid number'),
  variants: z.array(productVariantSchema).default([]),
  tags: z.array(z.string().max(50, 'Tag too long')).default([]),
  materials: z.array(z.string().max(100, 'Material description too long')).default([]),
  dimensions: z.string().max(200, 'Dimensions too long').default(''),
  weightGrams: z.number()
    .int('Weight must be a whole number')
    .min(0, 'Weight cannot be negative')
    .max(1000000, 'Weight too high')
    .finite('Weight must be a valid number')
    .default(0),
});

export const emailSchema = z.string()
  .email('Invalid email format')
  .max(255, 'Email too long')
  .trim()
  .toLowerCase();

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and numbers');

export const urlSchema = z.string()
  .url('Invalid URL format')
  .max(2000, 'URL too long')
  .trim();

export const productIdeaSchema = z.string()
  .min(3, 'Product idea must be at least 3 characters')
  .max(500, 'Product idea must be less than 500 characters')
  .regex(/^[a-zA-Z0-9\s\-',&.!()]+$/, 'Product idea contains invalid characters')
  .trim();

export const ventureNameSchema = z.string()
  .min(1, 'Venture name is required')
  .max(100, 'Venture name must be less than 100 characters')
  .regex(/^[a-zA-Z0-9\s\-'&.]+$/, 'Venture name contains invalid characters')
  .trim();

export const financialProjectionsSchema = z.object({
  scenario: z.enum(['Pessimistic', 'Realistic', 'Optimistic']),
  sellingPriceCents: z.number()
    .int('Selling price must be a whole number')
    .min(1, 'Selling price must be greater than 0')
    .max(100000000, 'Selling price too high')
    .finite('Selling price must be a valid number'),
  costOfGoodsSoldCents: z.number()
    .int('COGS must be a whole number')
    .min(0, 'COGS cannot be negative')
    .max(100000000, 'COGS too high')
    .finite('COGS must be a valid number'),
  estimatedMonthlySales: z.number()
    .int('Monthly sales must be a whole number')
    .min(0, 'Monthly sales cannot be negative')
    .max(10000000, 'Monthly sales too high')
    .finite('Monthly sales must be a valid number'),
  monthlyMarketingBudgetCents: z.number()
    .int('Marketing budget must be a whole number')
    .min(0, 'Marketing budget cannot be negative')
    .max(100000000, 'Marketing budget too high')
    .finite('Marketing budget must be a valid number'),
  shippingCostPerUnitCents: z.number()
    .int('Shipping cost must be a whole number')
    .min(0, 'Shipping cost cannot be negative')
    .max(100000000, 'Shipping cost too high')
    .finite('Shipping cost must be a valid number')
    .optional(),
  shippingOptions: z.array(z.object({
    name: z.string().min(1, 'Shipping name required').max(100, 'Shipping name too long'),
    costCents: z.number()
      .int('Shipping cost must be a whole number')
      .min(0, 'Shipping cost cannot be negative')
      .finite('Shipping cost must be a valid number'),
    deliveryTime: z.string().max(100, 'Delivery time description too long'),
  })).default([]),
  transactionFeePercent: z.number()
    .min(0, 'Transaction fee cannot be negative')
    .max(100, 'Transaction fee cannot exceed 100%')
    .finite('Transaction fee must be a valid number'),
  monthlyFixedCostsCents: z.number()
    .int('Fixed costs must be a whole number')
    .min(0, 'Fixed costs cannot be negative')
    .max(100000000, 'Fixed costs too high')
    .finite('Fixed costs must be a valid number'),
}).refine(
  (data) => data.sellingPriceCents > data.costOfGoodsSoldCents,
  { message: 'Selling price must be greater than cost of goods sold', path: ['sellingPriceCents'] }
);

export const supplierQuoteSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Supplier name required').max(200, 'Name too long'),
  pricePerUnitCents: z.number()
    .int('Price must be a whole number')
    .min(1, 'Price must be greater than 0')
    .finite('Price must be a valid number'),
  moq: z.number()
    .int('MOQ must be a whole number')
    .min(1, 'MOQ must be at least 1')
    .max(1000000, 'MOQ too high')
    .finite('MOQ must be a valid number'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().max(50, 'Phone too long').optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  notes: z.string().max(1000, 'Notes too long').optional(),
});

export const priceHistoryPointSchema = z.object({
  date: z.string().datetime('Invalid date format'),
  priceCents: z.number()
    .int('Price must be a whole number')
    .min(0, 'Price cannot be negative')
    .finite('Price must be a valid number'),
});

export const shopifyIntegrationSchema = z.object({
  storeUrl: z.string()
    .url('Invalid store URL')
    .regex(/\.myshopify\.com/, 'Must be a valid Shopify store URL'),
  apiToken: z.string().min(20, 'Invalid API token'),
  lastPushStatus: z.enum(['success', 'failed']).nullable(),
  lastPushDate: z.string().datetime().nullable(),
  lastPushedProductId: z.string().nullable(),
});

export const contentStrategyItemSchema = z.object({
  title: z.string().min(1, 'Title required').max(200, 'Title too long'),
  type: z.enum(['Blog Post', 'Video', 'Infographic', 'Social Media', 'Email Campaign']),
  targetKeywords: z.array(z.string().max(100, 'Keyword too long')),
  description: z.string().max(1000, 'Description too long'),
  publishDate: z.string().datetime('Invalid date format'),
  platform: z.string().max(100, 'Platform name too long'),
  status: z.enum(['Draft', 'Scheduled', 'Published']),
});

export const safeParseWithDefaults = <T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  defaults?: Partial<T>
): { success: true; data: T } | { success: false; errors: string[] } => {
  try {
    const result = schema.safeParse(data);

    if (result.success) {
      return { success: true, data: result.data };
    }

    const errors = result.error.errors.map(err =>
      err.path.length > 0 ? `${err.path.join('.')}: ${err.message}` : err.message
    );

    return { success: false, errors };
  } catch (error) {
    return {
      success: false,
      errors: ['Validation failed: ' + (error instanceof Error ? error.message : 'Unknown error')]
    };
  }
};

export const validateField = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { isValid: boolean; error?: string; data?: T } => {
  const result = safeParseWithDefaults(schema, data);

  if (result.success) {
    return { isValid: true, data: result.data };
  }

  return { isValid: false, error: result.errors[0] };
};
