import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface CrawlRequest {
  startUrl: string;
  ventureId: string;
  jobId?: string;
  maxDepth?: number;
  maxPages?: number;
  domainOnly?: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const {
      startUrl,
      ventureId,
      jobId,
      maxDepth = 2,
      maxPages = 50,
      domainOnly = true,
    }: CrawlRequest = await req.json();

    if (!startUrl || !ventureId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const startDomain = new URL(startUrl).hostname;
    const visited = new Set<string>();
    const queue: Array<{ url: string; depth: number }> = [{ url: startUrl, depth: 0 }];
    const results: Array<any> = [];

    // Update or create job
    let currentJobId = jobId;
    if (!currentJobId) {
      const { data: job } = await supabase
        .from('crawl_jobs')
        .insert({
          venture_id: ventureId,
          name: `Crawl ${startDomain}`,
          start_url: startUrl,
          crawl_config: { maxDepth, maxPages, domainOnly },
          status: 'running',
          started_at: new Date().toISOString(),
        })
        .select()
        .single();
      currentJobId = job?.id;
    } else {
      await supabase
        .from('crawl_jobs')
        .update({ status: 'running', started_at: new Date().toISOString() })
        .eq('id', currentJobId);
    }

    // Crawl loop
    while (queue.length > 0 && visited.size < maxPages) {
      const { url, depth } = queue.shift()!;

      if (visited.has(url) || depth > maxDepth) continue;
      visited.add(url);

      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });

        if (!response.ok) continue;

        const html = await response.text();
        const titleMatch = html.match(/<title>([^<]*)<\/title>/);
        const linkMatches = html.matchAll(/<a[^>]*href="([^"]*)"[^>]*>/g);

        // Save page data
        const pageData = {
          url,
          title: titleMatch?.[1] || '',
          depth,
          scrapedAt: new Date().toISOString(),
        };
        results.push(pageData);

        // Save to scraped_data table
        await supabase.from('scraped_data').insert({
          venture_id: ventureId,
          source_url: url,
          source_type: 'other',
          data: pageData,
          status: 'success',
        });

        // Extract and queue links
        for (const match of linkMatches) {
          let link = match[1];
          if (!link || link.startsWith('#') || link.startsWith('javascript:')) continue;

          // Resolve relative URLs
          if (link.startsWith('/')) {
            link = new URL(link, url).href;
          } else if (!link.startsWith('http')) {
            link = new URL(link, url).href;
          }

          // Check domain restriction
          if (domainOnly) {
            const linkDomain = new URL(link).hostname;
            if (linkDomain !== startDomain) continue;
          }

          if (!visited.has(link)) {
            queue.push({ url: link, depth: depth + 1 });
          }
        }

        // Update job progress
        await supabase
          .from('crawl_jobs')
          .update({
            progress: { visited: visited.size, queued: queue.length },
            results_count: results.length,
          })
          .eq('id', currentJobId);

        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error crawling ${url}:`, error);
      }
    }

    // Mark job as completed
    await supabase
      .from('crawl_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        results_count: results.length,
      })
      .eq('id', currentJobId);

    return new Response(
      JSON.stringify({
        success: true,
        jobId: currentJobId,
        results,
        totalPages: results.length,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Crawling error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});