import { supabase } from '../lib/supabase';

export interface Product {
  id?: string;
  venture_id: string;
  name: string;
  description?: string;
  sku?: string;
  price: number;
  cost: number;
  inventory_count: number;
  category?: string;
  tags?: string[];
  images?: string[];
  specifications?: Record<string, any>;
  supplier_info?: Record<string, any>;
  status: 'active' | 'inactive' | 'discontinued';
  metadata?: Record<string, any>;
}

export async function createProduct(product: Product) {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listProducts(ventureId: string, filters?: {
  status?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  let query = supabase
    .from('products')
    .select('*')
    .eq('venture_id', ventureId);

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  if (filters?.minPrice) {
    query = query.gte('price', filters.minPrice);
  }
  if (filters?.maxPrice) {
    query = query.lte('price', filters.maxPrice);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getProduct(productId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProduct(productId: string, updates: Partial<Product>) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', productId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProduct(productId: string) {
  const { error } = await supabase.from('products').delete().eq('id', productId);

  if (error) throw error;
}

export async function bulkCreateProducts(products: Product[]) {
  const { data, error } = await supabase
    .from('products')
    .insert(products)
    .select();

  if (error) throw error;
  return data;
}

export async function updateInventory(productId: string, quantity: number) {
  const { data: product } = await supabase
    .from('products')
    .select('inventory_count')
    .eq('id', productId)
    .single();

  const newCount = (product?.inventory_count || 0) + quantity;

  const { data, error } = await supabase
    .from('products')
    .update({ inventory_count: newCount })
    .eq('id', productId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getProductAnalytics(ventureId: string) {
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('venture_id', ventureId);

  if (!products) return null;

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === 'active').length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.inventory_count), 0);
  const totalCost = products.reduce((sum, p) => sum + (p.cost * p.inventory_count), 0);
  const potentialProfit = totalValue - totalCost;
  const lowStock = products.filter((p) => p.inventory_count < 10).length;

  const categories = products.reduce((acc, p) => {
    const cat = p.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalProducts,
    activeProducts,
    totalValue,
    totalCost,
    potentialProfit,
    lowStock,
    categories,
  };
}

export function generateSKU(prefix: string = 'PRD'): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function calculateMargin(price: number, cost: number): number {
  if (price === 0) return 0;
  return ((price - cost) / price) * 100;
}

export function calculateMarkup(price: number, cost: number): number {
  if (cost === 0) return 0;
  return ((price - cost) / cost) * 100;
}
