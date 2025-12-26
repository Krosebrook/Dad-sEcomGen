import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ShopifyProduct {
  title: string;
  body_html: string;
  vendor?: string;
  product_type?: string;
  variants: Array<{
    price: string;
    option1?: string;
    inventory_quantity?: number;
    sku?: string;
  }>;
  images?: Array<{
    src: string;
    alt?: string;
  }>;
  tags?: string;
  status: 'active' | 'draft';
}

interface RequestBody {
  action: 'create_product' | 'get_product' | 'update_product';
  storeUrl: string;
  apiToken: string;
  product?: ShopifyProduct;
  productId?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { action, storeUrl, apiToken, product, productId }: RequestBody = await req.json();

    if (!storeUrl || !apiToken) {
      return new Response(
        JSON.stringify({ error: "Missing storeUrl or apiToken" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const cleanStoreUrl = storeUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const apiVersion = '2024-01';

    let endpoint = '';
    let method = 'GET';
    let body: string | undefined;

    switch (action) {
      case 'create_product':
        if (!product) {
          return new Response(
            JSON.stringify({ error: "Product data required for create_product action" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        endpoint = `https://${cleanStoreUrl}/admin/api/${apiVersion}/products.json`;
        method = 'POST';
        body = JSON.stringify({ product });
        break;

      case 'get_product':
        if (!productId) {
          return new Response(
            JSON.stringify({ error: "Product ID required for get_product action" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        endpoint = `https://${cleanStoreUrl}/admin/api/${apiVersion}/products/${productId}.json`;
        method = 'GET';
        break;

      case 'update_product':
        if (!productId || !product) {
          return new Response(
            JSON.stringify({ error: "Product ID and data required for update_product action" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        endpoint = `https://${cleanStoreUrl}/admin/api/${apiVersion}/products/${productId}.json`;
        method = 'PUT';
        body = JSON.stringify({ product });
        break;

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }

    const shopifyResponse = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': apiToken,
      },
      body,
    });

    const responseData = await shopifyResponse.json();

    if (!shopifyResponse.ok) {
      return new Response(
        JSON.stringify({
          error: "Shopify API error",
          details: responseData,
          status: shopifyResponse.status,
        }),
        {
          status: shopifyResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error('Shopify proxy error:', error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
