import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ScrapeRequest {
  url: string;
  ventureId: string;
  sourceType: 'competitor' | 'market' | 'product' | 'pricing' | 'trends';
  selectors?: Record<string, string>;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { url, ventureId, sourceType, selectors }: ScrapeRequest = await req.json();

    if (!url || !ventureId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const html = await response.text();

    // Basic parsing (extract meta tags, title, description)
    const titleMatch = html.match(/<title>([^<]*)<\/title>/);
    const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/);
    const ogTitleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"/);
    const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"/);
    const priceMatch = html.match(/\$(\d+(?:\.\d{2})?)/);

    const scrapedData = {
      url,
      title: titleMatch?.[1] || ogTitleMatch?.[1] || '',
      description: descMatch?.[1] || '',
      ogImage: ogImageMatch?.[1] || '',
      price: priceMatch?.[1] || null,
      scrapedAt: new Date().toISOString(),
      htmlLength: html.length,
    };

    // Custom selector parsing if provided
    const parsedData: Record<string, string> = {};
    if (selectors) {
      for (const [key, selector] of Object.entries(selectors)) {
        const regex = new RegExp(selector);
        const match = html.match(regex);
        parsedData[key] = match?.[1] || '';
      }
    }

    // Save to database
    const { data, error } = await supabase
      .from('scraped_data')
      .insert({
        venture_id: ventureId,
        source_url: url,
        source_type: sourceType,
        data: scrapedData,
        parsed_data: parsedData,
        status: 'success',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Scraping error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});