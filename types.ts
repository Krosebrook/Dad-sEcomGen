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

export interface ProductScorecard {
  estimatedMonthlySales: string;
  averageBSR: string;
  competingFBASellers: number;
  salesVelocity: string;
  opportunitySummary: string;
}

export type RegenerateableSection = 'description' | 'variants' | 'tags';
