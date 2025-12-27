import { supabase } from '../lib/supabase';

export interface APIIntegration {
  id?: string;
  venture_id: string;
  provider: string;
  name: string;
  credentials?: string;
  config?: Record<string, any>;
  status: 'active' | 'inactive' | 'error';
  last_sync?: string;
  error_log?: any[];
  rate_limit?: Record<string, any>;
}

export async function createIntegration(integration: APIIntegration) {
  const { data, error } = await supabase
    .from('api_integrations')
    .insert(integration)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listIntegrations(ventureId: string) {
  const { data, error } = await supabase
    .from('api_integrations')
    .select('*')
    .eq('venture_id', ventureId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getIntegration(integrationId: string) {
  const { data, error } = await supabase
    .from('api_integrations')
    .select('*')
    .eq('id', integrationId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateIntegration(integrationId: string, updates: Partial<APIIntegration>) {
  const { data, error } = await supabase
    .from('api_integrations')
    .update(updates)
    .eq('id', integrationId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteIntegration(integrationId: string) {
  const { error } = await supabase
    .from('api_integrations')
    .delete()
    .eq('id', integrationId);

  if (error) throw error;
}

export async function testConnection(integrationId: string): Promise<boolean> {
  const integration = await getIntegration(integrationId);

  try {
    switch (integration.provider) {
      case 'shopify':
        return await testShopifyConnection(integration);
      case 'stripe':
        return await testStripeConnection(integration);
      default:
        return false;
    }
  } catch (error) {
    await logError(integrationId, error);
    return false;
  }
}

async function testShopifyConnection(integration: APIIntegration): Promise<boolean> {
  const config = integration.config;
  const url = `https://${config?.shop}/admin/api/2024-01/shop.json`;

  const response = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': integration.credentials || '',
    },
  });

  return response.ok;
}

async function testStripeConnection(integration: APIIntegration): Promise<boolean> {
  const response = await fetch('https://api.stripe.com/v1/balance', {
    headers: {
      Authorization: `Bearer ${integration.credentials}`,
    },
  });

  return response.ok;
}

async function logError(integrationId: string, error: any) {
  const integration = await getIntegration(integrationId);
  const errorLog = integration.error_log || [];

  errorLog.push({
    timestamp: new Date().toISOString(),
    error: error.message || String(error),
  });

  await updateIntegration(integrationId, {
    status: 'error',
    error_log: errorLog.slice(-10),
  });
}

export async function syncIntegration(integrationId: string) {
  const integration = await getIntegration(integrationId);

  try {
    switch (integration.provider) {
      case 'shopify':
        await syncShopifyProducts(integration);
        break;
      default:
        throw new Error(`Sync not implemented for ${integration.provider}`);
    }

    await updateIntegration(integrationId, {
      last_sync: new Date().toISOString(),
      status: 'active',
    });
  } catch (error) {
    await logError(integrationId, error);
    throw error;
  }
}

async function syncShopifyProducts(integration: APIIntegration) {
  const config = integration.config;
  const url = `https://${config?.shop}/admin/api/2024-01/products.json`;

  const response = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': integration.credentials || '',
    },
  });

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.statusText}`);
  }

  const data = await response.json();
  const products = data.products || [];

  for (const shopifyProduct of products) {
    await supabase.from('products').upsert({
      venture_id: integration.venture_id,
      name: shopifyProduct.title,
      description: shopifyProduct.body_html,
      price: parseFloat(shopifyProduct.variants[0]?.price || '0'),
      inventory_count: shopifyProduct.variants[0]?.inventory_quantity || 0,
      images: shopifyProduct.images?.map((img: any) => img.src) || [],
      metadata: { shopify_id: shopifyProduct.id },
    });
  }
}

export const availableProviders = [
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Sync products, orders, and inventory with your Shopify store',
    requiredFields: ['shop', 'accessToken'],
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Process payments and manage subscriptions',
    requiredFields: ['apiKey'],
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Email marketing and automation',
    requiredFields: ['apiKey', 'listId'],
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Track website analytics and user behavior',
    requiredFields: ['trackingId'],
  },
];
